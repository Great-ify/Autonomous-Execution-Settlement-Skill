import * as dotenv from "dotenv";
dotenv.config();

import { createAgreement } from "../services/agreement.service.js";
import { submitWork } from "../services/execution.service.js";
import { processSubmission } from "../services/verification.service.js";
import { orchestrateSettlement } from "../settlement/orchestrator.js";
import { FileEscrowRepository } from "../repositories/escrow.repository.js";
import { FileAgreementRepository } from "../repositories/agreement.repository.js";
import { AgreementState } from "../state-machine/agreementState.js";
import { EscrowStatus } from "../types/escrow.types.js";
import { DecisionOutcome } from "../types/risk.types.js";
import { generateIntegrityHash } from "../utils/crypto.js";

// Helpers

const dim = (s: string) => `\x1b[2m${s}\x1b[0m`;
const bold = (s: string) => `\x1b[1m${s}\x1b[0m`;
const green = (s: string) => `\x1b[32m${s}\x1b[0m`;
const blue = (s: string) => `\x1b[34m${s}\x1b[0m`;
const yellow = (s: string) => `\x1b[33m${s}\x1b[0m`;
const red = (s: string) => `\x1b[31m${s}\x1b[0m`;

function log(icon: string, label: string, detail?: string) {
  const ts = new Date().toISOString().slice(11, 19);
  const detailStr = detail ? `  ${dim(detail)}` : "";
  console.log(`  ${dim(ts)}  ${icon}  ${label}${detailStr}`);
}

function section(title: string) {
  console.log("");
  console.log(
    `  ${bold(blue(`── ${title}`))} ${dim(
      "─".repeat(Math.max(0, 46 - title.length)),
    )}`,
  );
}

function divider() {
  console.log(`  ${dim("─".repeat(52))}`);
}

// ─── Demo scenario data ──────────────────────────────────────────────────────

const SCENARIO = {
  payerAgent: "agent:payer:acme-corp",
  workerAgent: "agent:worker:devbot-v2",
  taskDescription:
    "Integrate the payment gateway API and deliver working TypeScript SDK with tests",
  paymentAmount: 0.5,
  requirements: [
    { id: "req-001", description: "TypeScript SDK with full type definitions" },
    { id: "req-002", description: "Unit tests with ≥80% coverage" },
    {
      id: "req-003",
      description: "API integration verified against staging environment",
    },
  ],
};

// Evidence manifest — one artifact per requirement
const EVIDENCE_PAYLOAD = {
  items: [
    {
      requirementId: "req-001",
      evidenceType: "source_code",
      artifactReference: "https://github.com/devbot/payment-sdk/tree/main/src",
      description:
        "Full TypeScript SDK with branded types, generic response wrappers, and JSDoc coverage",
      hash: generateIntegrityHash({ ref: "src", ts: Date.now() }),
    },
    {
      requirementId: "req-002",
      evidenceType: "test_report",
      artifactReference:
        "https://github.com/devbot/payment-sdk/actions/runs/1234/artifacts",
      description: "Vitest run — 47 tests, 94% statement coverage, 0 failures",
      hash: generateIntegrityHash({ ref: "tests", ts: Date.now() }),
    },
    {
      requirementId: "req-003",
      evidenceType: "verification_log",
      artifactReference: "https://staging.acme.com/api/verify/session-8a7b2c",
      description:
        "Staging run log: all 12 payment endpoints returning 200, latency p99 < 220 ms",
      hash: generateIntegrityHash({ ref: "staging", ts: Date.now() }),
    },
  ],
};

// ─── Main

async function runDemo() {
  console.log("");
  console.log(bold("  AESS — Autonomous Escrow Settlement System"));
  console.log(dim("  End-to-end demonstration"));
  divider();

  // ── Step 1: Create agreement
  section("1 / 5  Agreement creation");

  const agreement = await createAgreement({
    payerAgent: SCENARIO.payerAgent,
    workerAgent: SCENARIO.workerAgent,
    taskDescription: SCENARIO.taskDescription,
    paymentAmount: SCENARIO.paymentAmount,
  });

  // Patch in requirements (the service doesn't accept them directly)
  const agreementRepo = new FileAgreementRepository();
  const withReqs = { ...agreement, requirements: SCENARIO.requirements };
  await agreementRepo.update(agreement.id, withReqs);

  log("✅", green("Agreement created"), `id: ${agreement.id}`);
  log("📋", "Task", SCENARIO.taskDescription);
  log("💰", `Payment locked`, `${SCENARIO.paymentAmount} ETH`);
  log("📌", `Requirements`, `${SCENARIO.requirements.length} defined`);

  // ── Step 2: Seed escrow record AND create on-chain ───────────────────────────────
  section("2 / 5  Escrow funding");

  const escrowRepo = new FileEscrowRepository();
  const escrow = {
    escrowId: `escrow-${agreement.id}`,
    agreementId: agreement.id,
    amount: SCENARIO.paymentAmount,
    payerAgent: SCENARIO.payerAgent,
    workerAgent: SCENARIO.workerAgent,
    fundedAt: new Date(),
    status: EscrowStatus.FUNDED,
  };

  // Create in local database
  await escrowRepo.create(escrow);

  // 🔥 NEW: Create escrow on-chain
  try {
    const { PharosSettlementProvider } = await import(
      "../blockchain/pharosSettlementProvider.js"
    );
    const settlementProvider = new PharosSettlementProvider();

    const WORKER_ADDRESS = "0x8586C9978C176a61816754038dE7B7C4Edda39b5";

    log("⏳", yellow("Creating escrow on Pharos blockchain..."));
    log("   ", dim(`Worker address: ${WORKER_ADDRESS}`));
    log("   ", dim(`Amount: ${SCENARIO.paymentAmount} ETH`));

    await settlementProvider.createEscrow(
      agreement.id,
      WORKER_ADDRESS,
      SCENARIO.paymentAmount,
    );
    log("✅", green("Escrow created on-chain"));
  } catch (err: any) {
    log("❌", red(`On-chain escrow creation failed: ${err.message}`));
    throw err;
  }

  log("✅", green("Escrow funded"), `escrowId: ${escrow.escrowId}`);
  log("🔒", "Funds locked in AESSEscrow contract");

  // ── Step 3: Submit evidence
  section("3 / 5  Evidence submission");

  // Move agreement to ACTIVE so submission is valid
  await agreementRepo.update(agreement.id, { status: AgreementState.ACTIVE });

  const submission = await submitWork({
    agreementId: agreement.id,
    submittedBy: SCENARIO.workerAgent,
    payload: EVIDENCE_PAYLOAD,
  });

  log("✅", green("Work submitted"), `submissionId: ${submission.id}`);
  log(
    "📦",
    `Artifacts`,
    `${EVIDENCE_PAYLOAD.items.length} items, all requirements covered`,
  );
  EVIDENCE_PAYLOAD.items.forEach((item) =>
    log("   ·", dim(`${item.requirementId} → ${item.evidenceType}`)),
  );

  // ── Step 4: Full verification pipeline
  section("4 / 5  Verification pipeline");
  log("⏳", yellow("Running verification — calling Gemini AI judge..."));

  const verificationResult = await processSubmission(agreement.id);

  if (!verificationResult) {
    log(
      "❌",
      red("Verification returned null — check agreement/submission data"),
    );
    process.exit(1);
  }

  divider();
  log(
    verificationResult.approved ? "✅" : "❌",
    verificationResult.approved
      ? green("Verification PASSED")
      : red("Verification FAILED"),
  );
  log("🔍", `Rule score`, `${verificationResult.ruleScore.toFixed(1)}`);
  log("🤖", `AI judge score`, `${verificationResult.aiScore.toFixed(1)}`);
  log(
    "📊",
    `Evidence quality`,
    `${verificationResult.evidenceScore.toFixed(1)}`,
  );
  log("🛡️", `Coverage`, `${verificationResult.evidenceCoverage.toFixed(1)}%`);
  log(
    "🎯",
    `Confidence`,
    `${(verificationResult.confidenceScore * 100).toFixed(1)}%`,
  );
  log(
    "🔑",
    `Integrity hash`,
    verificationResult.integrityHash.slice(0, 20) + "…",
  );
  divider();

  if (!verificationResult.approved) {
    log("⚠️", yellow("Decision: REJECTED — settlement not triggered"));
    log("   ", "Escrow will be refunded to payer");
    console.log("");
    return;
  }

  // ── Step 5: Settlement
  section("5 / 5  On-chain settlement");
  log("⏳", yellow("Calling Pharos settlement contract..."));

  try {
    await orchestrateSettlement(agreement.id, DecisionOutcome.APPROVED);
    log("✅", green("Settlement confirmed on-chain"));
    log("💸", `Funds released to`, SCENARIO.workerAgent);
    log("🌐", `Network`, "Pharos Atlantic Testnet (chain 688689)");
    log("📜", `Contract`, process.env.PHAROS_ESCROW_CONTRACT ?? "(see .env)");
  } catch (err: any) {
    if (
      err?.message?.includes("Missing Pharos") ||
      err?.message?.includes("PRIVATE_KEY")
    ) {
      log("⚠️", yellow("Blockchain env vars not set — skipping on-chain step"));
      log(
        "   ",
        dim(
          "Add PHAROS_RPC_URL / PHAROS_CHAIN_ID / PHAROS_PRIVATE_KEY / PHAROS_ESCROW_CONTRACT to .env",
        ),
      );
      log(
        "   ",
        dim(
          "Verification result above is real. Settlement would execute once env is configured.",
        ),
      );
    } else {
      log("❌", red(`Settlement failed: ${err.message}`));
      throw err;
    }
  }

  // ── Summary
  section("Summary");
  divider();
  console.log("");
  console.log(`  ${bold("Agreement ID")}   ${agreement.id}`);
  console.log(`  ${bold("Decision")}       ${green("APPROVED")}`);
  console.log(
    `  ${bold("Rule score")}     ${verificationResult.ruleScore.toFixed(1)}`,
  );
  console.log(
    `  ${bold("AI score")}       ${verificationResult.aiScore.toFixed(1)}`,
  );
  console.log(
    `  ${bold("Confidence")}     ${(
      verificationResult.confidenceScore * 100
    ).toFixed(1)}%`,
  );
  console.log(
    `  ${bold("Integrity")}      ${verificationResult.integrityHash.slice(
      0,
      32,
    )}…`,
  );
  divider();
  console.log("");
  log("🎉", bold(green("End-to-end demo complete")));
  console.log("");
}

runDemo().catch((err) => {
  console.error(red(`\n  ✖ Demo failed: ${err.message}`));
  console.error(dim(err.stack ?? ""));
  process.exit(1);
});

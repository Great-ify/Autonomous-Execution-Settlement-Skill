# AESS — Autonomous Escrow Settlement Skill

## Overview

The Autonomous Execution and Settlement Skill (AESS) is a blockchain-powered escrow and verification system that enables AI agents to autonomously manage agreements, verify work completion, and execute settlements on-chain.

## What This Skill Does

1. **Agreement Creation** — create verifiable work agreements with requirements
2. **Escrow Management** — lock funds on-chain in secure escrow contracts
3. **Work Verification** — AI-powered verification using Gemini with rule-based fallback
4. **Automated Settlement** — release or refund funds based on verification results
5. **Audit Trail** — complete cryptographic integrity tracking

---

## Installation

### Method 1: NPX (Recommended)

```bash
npx skills add https://github.com/Great-ify/Autonomous-Execution-Settlement-Skill
```

### Method 2: Manual Install

```bash
# Clone the repository
git clone https://github.com/Great-ify/Autonomous-Execution-Settlement-Skill.git
cd Autonomous-Execution-Settlement-Skill

# Install dependencies
npm install

# Build the project
npm run build
```

---

## System Architecture

```
[Payer Agent] ──creates──► Agreement
                              │
                         [Escrow Contract]  ◄── 0.5 ETH locked
                              │
              [Worker Agent] ──submits──► Evidence Manifest
                                                │
                              ┌─────────────────┼─────────────────┐
                         Rule Engine       AI Judge          Risk Engine
                         (coverage)     (Gemini 1.5)       (risk factors)
                              └─────────────────┼─────────────────┘
                                           Decision Engine
                                    APPROVED / REJECTED / ESCALATED
                                                │
                                     Settlement Orchestrator
                                     (idempotency key guard)
                                                │
                                   Pharos Contract (chain 688689)
                              releaseFunds / refundFunds / freezeEscrow
```

---

## Setup

### Required Environment Variables

Create a `.env` file in the project root:

```bash
# Gemini AI Configuration
GEMINI_API_KEY=your_gemini_api_key_here

# Pharos Blockchain Configuration
PHAROS_RPC_URL=https://atlantic.dplabs-internal.com
PHAROS_CHAIN_ID=688689
PHAROS_PRIVATE_KEY=0x_your_private_key_here
PHAROS_ESCROW_CONTRACT=0x3cEb0760C7F2bd58B1D2A60813112CFC42E9D9e4

# Optional: specify a different worker wallet
WORKER_WALLET_ADDRESS=0x_worker_address_here
```

### Install and Run

```bash
npm install
npm run dev    # API server on port 3000
npm run test   # Run test suite
npm run demo   # Full E2E demo (requires .env)
```

---

## Key Source Files

| File | Responsibility |
|---|---|
| `src/settlement/orchestrator.ts` | Top-level settlement coordinator. Idempotency guard lives here. |
| `src/verification/verificationEngine.ts` | Runs all verification stages in sequence |
| `src/verification/aiJudge.ts` | Calls Gemini with structured output schema, multi-model fallback, and a rule-based judge if all models fail |
| `src/verification/ruleEngine.ts` | Deterministic requirement coverage check |
| `src/verification/riskEngine.ts` | Aggregates signals → LOW/MEDIUM/HIGH/CRITICAL |
| `src/verification/decisionEngine.ts` | Threshold strategy: 80% coverage + 80 confidence = APPROVED |
| `src/verification/decisionPolicy.ts` | Maps verification + risk into final outcome |
| `src/blockchain/pharosSettlementProvider.ts` | ethers.js → Pharos contract calls |
| `src/contracts/AESSEscrow.sol` | On-chain escrow with ReentrancyGuard |
| `src/utils/demoRunner.ts` | Full E2E demo script |

---

## Common Agent Tasks

### Modifying the AI Judge

Edit `src/verification/aiJudge.ts`. Key constraints:
- Model priority list should stay within real Gemini model names (e.g. `gemini-1.5-pro`, `gemini-1.5-flash`) — never invent a model name
- Always use `responseMimeType: 'application/json'` with a `responseSchema` — the codebase depends on structured output
- Keep the timeout and retry/backoff logic intact
- Preserve the rule-based fallback (`ruleBasedJudge`) so the pipeline degrades gracefully if every model attempt fails
- Return type must satisfy `StructuredAIAnalysis`: `{ score, confidence, findings, strengths, weaknesses }`

### Modifying the Settlement Orchestrator

Edit `src/settlement/orchestrator.ts`. Critical rules:
- `idempotency.markProcessed` must only be called **after** a successful blockchain call — never in the catch block
- `settlementId` must use `crypto.randomUUID()`, not `Math.random()` — this is a financial record
- Always validate escrow with `validateEscrow` before any contract call
- Maintain the `publishEvent` calls — other services subscribe to `settlement.completed` and `settlement.failed`

### Adding a New Verification Rule

1. Add the rule logic to `src/verification/ruleEngine.ts`
2. Update the `RuleVerificationResult` shape in `src/types/verification.types.ts` if needed
3. Update the `ThresholdDecisionStrategy` in `src/verification/decisionEngine.ts` if scoring weights change
4. Run `npm run test` — the verification test in `src/verification/verification.test.ts` must still pass

### Updating the Solidity Contract

```bash
npx hardhat compile
```

Then update `scripts/deploy.ts` with any constructor or ABI changes. The ABI embedded in `pharosSettlementProvider.ts` must stay in sync with the compiled contract.

### Adding a New Settlement Action

1. Add the action to the `SettlementAction` enum in `src/types/settlement.types.ts`
2. Add the case to `StandardSettlementPolicy.getAction()` in `src/settlement/policyEngine.ts`
3. Add the contract call in `PharosSettlementProvider` in `src/blockchain/pharosSettlementProvider.ts`
4. Add the matching function to `AESSEscrow.sol` and recompile

---

## Verification Pipeline — Decision Thresholds

The `ThresholdDecisionStrategy` in `decisionEngine.ts` uses this formula:

```
confidenceScore = (ruleScore × 0.3) + (evidenceScore × 0.3) + (aiScore × 0.4)
approved        = coverage >= 80% AND confidenceScore >= 80
```

The `StandardDecisionPolicy` in `decisionPolicy.ts` then maps:

| Condition | Outcome |
|---|---|
| `approved AND riskScore < 20` | APPROVED → `releaseFunds` |
| `riskScore > 70` | REJECTED → `refundFunds` |
| `riskScore > 40` | ESCALATED → `holdFunds` |
| Otherwise | REQUIRES_REVIEW |

---

## Testing

### Automated Tests

```bash
# Unit tests
npm run test

# Contract tests
npm run test:contracts
```

### Manual Testing

```bash
# 1. Check wallet
npm run check:wallet

# 2. Check balance
npm run check:balance

# 3. Run the demo
npm run demo

# 4. Check escrow (use the agreement ID printed by the demo)
npm run check:escrow <agreementId>
```

### Verification Checklist

```bash
npm run test    # Must pass before any PR
npm run build   # Must succeed for all backend changes
npm run demo    # Must complete without errors
```

---

## Deployed Contract

| Field | Value |
|---|---|
| Network | Pharos Atlantic Testnet |
| Chain ID | 688689 |
| Address | `0x3cEb0760C7F2bd58B1D2A60813112CFC42E9D9e4` |
| Authorized caller | Settlement engine wallet (set at deploy time) |
| Functions | `createEscrow`, `releaseFunds`, `refundFunds`, `freezeEscrow` |

---

## Reusability and Composability

`runVerification` in `verificationEngine.ts` is a convenience orchestrator over five independent stages — it is not the only way to use AESS's verification logic. Most stages can be imported and called on their own, without pulling in the rest of the pipeline:

| Standalone module | Function | Needs |
|---|---|---|
| `ruleEngine.ts` | `evaluateRequirements` | An agreement + submission shape |
| `evidenceQualityEngine.ts` | `assessEvidenceQuality` | A submission payload |
| `coverageAnalyzer.ts` | `analyzeCoverage` | Requirements list + submission |
| `aiJudge.ts` | `judgeWithAI` | An agreement + submission (calls Gemini) |
| `verification/quickRiskCheck.ts` | `quickRiskCheck` | Three numbers — no AESS objects at all |

`quickRiskCheck` is the clearest example: the existing `assessRisk` in `riskEngine.ts` requires a full `VerificationResult`, `EvidenceQualityReport`, and `ArbitrationReport` — objects only the AESS pipeline produces. `quickRiskCheck` exposes the same scoring logic with a decoupled signature, so a completely different agent pipeline — one with its own evidence model, its own judge, or no AI judge at all — can still get a risk score:

```typescript
import { quickRiskCheck } from 'aess-skill/verification/quickRiskCheck';

const risk = quickRiskCheck({
  evidenceCoveragePercent: 65,
  evidenceQualityScore: 80,
});
// → { overallRiskScore: 25, riskLevel: 'LOW', riskFactors: ['LOW_COVERAGE'], ... }
```

This is the model for composing other stages out of AESS: keep the rich, pipeline-aware version for agents already inside AESS, and expose a primitive-input version alongside it for agents that only need one piece of the logic.
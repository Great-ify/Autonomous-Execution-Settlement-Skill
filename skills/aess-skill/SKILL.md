# AESS — Autonomous Escrow Settlement Skill

**What this system does:** AESS enables two AI agents to agree on a task, lock payment in a smart contract, verify work using Gemini AI, and settle funds on-chain — all without a human approving anything.

---

## System architecture

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

### Environment variables

```env
GEMINI_API_KEY=your_key_here
PHAROS_RPC_URL=https://rpc.pharos.network
PHAROS_CHAIN_ID=688689
PHAROS_PRIVATE_KEY=0x...
PHAROS_ESCROW_CONTRACT=0x3cEb0760C7F2bd58B1D2A60813112CFC42E9D9e4
```

### Install and run

```bash
npm install
npm run dev           # API server on port 3000
npm run test          # Run test suite
npx tsx src/utils/demoRunner.ts   # Full E2E demo (requires .env)
```

---

## Running the demo

`demoRunner.ts` executes the full real pipeline in sequence:

1. Creates an agreement via `agreement.service.ts`
2. Seeds a funded escrow record into the file store
3. Submits a 3-artifact evidence manifest
4. Calls `processSubmission` — triggers rule engine + Gemini AI judge + risk engine
5. Calls `orchestrateSettlement` — broadcasts to Pharos if env is configured

If blockchain env vars are missing, the demo still runs the full verification pipeline and skips only the on-chain step, logging a clear warning.

---

## Key source files

| File | Responsibility |
|---|---|
| `src/settlement/orchestrator.ts` | Top-level settlement coordinator. Idempotency guard lives here. |
| `src/verification/verificationEngine.ts` | Runs all verification stages in sequence |
| `src/verification/aiJudge.ts` | Calls Gemini with structured output schema |
| `src/verification/ruleEngine.ts` | Deterministic requirement coverage check |
| `src/verification/riskEngine.ts` | Aggregates signals → LOW/MEDIUM/HIGH/CRITICAL |
| `src/verification/decisionEngine.ts` | Threshold strategy: 80% coverage + 80 confidence = APPROVED |
| `src/verification/decisionPolicy.ts` | Maps verification + risk into final outcome |
| `src/blockchain/pharosSettlementProvider.ts` | ethers.js → Pharos contract calls |
| `src/contracts/AESSEscrow.sol` | On-chain escrow with ReentrancyGuard |
| `src/utils/demoRunner.ts` | Full E2E demo script |

---

## Common agent tasks

### Modifying the AI judge

Edit `src/verification/aiJudge.ts`. Key constraints:
- Model must be `gemini-1.5-flash` or `gemini-2.0-flash` (not `gemini-3.5-flash` — doesn't exist)
- Always use `responseMimeType: 'application/json'` with a `responseSchema` — the codebase depends on structured output
- Keep the timeout (15 seconds) and retry logic (up to 2 retries) intact
- Return type must satisfy `StructuredAIAnalysis`: `{ score, confidence, findings, strengths, weaknesses }`

### Modifying the settlement orchestrator

Edit `src/settlement/orchestrator.ts`. Critical rules:
- `idempotency.markProcessed` must only be called **after** a successful blockchain call — not in the catch block
- `settlementId` should use `crypto.randomUUID()` not `Math.random()` — this is a financial record
- Always validate escrow with `validateEscrow` before any contract call
- Maintain the `publishEvent` calls — other services subscribe to `settlement.completed` and `settlement.failed`

### Adding a new verification rule

1. Add the rule logic to `src/verification/ruleEngine.ts`
2. Update the `RuleVerificationResult` shape in `src/types/verification.types.ts` if needed
3. Update the `ThresholdDecisionStrategy` in `src/verification/decisionEngine.ts` if scoring weights change
4. Run `npm run test` — the verification test in `src/verification/verification.test.ts` must still pass

### Updating the Solidity contract

```bash
npx hardhat compile
```

Then update `scripts/deploy.ts` with any constructor or ABI changes. The ABI embedded in `pharosSettlementProvider.ts` must stay in sync with the compiled contract.

### Adding a new settlement action

1. Add the action to `SettlementAction` enum in `src/types/settlement.types.ts`
2. Add the case to `StandardSettlementPolicy.getAction()` in `src/settlement/policyEngine.ts`
3. Add the contract call in `PharosSettlementProvider` in `src/blockchain/pharosSettlementProvider.ts`
4. Add the matching function to `AESSEscrow.sol` and recompile

---

## Verification pipeline — decision thresholds

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

## Verification

```bash
npm run test          # Must pass before any PR
npm run build         # Must succeed for all backend changes
npx tsx src/utils/demoRunner.ts   # Must complete without errors
```

---

## Deployed contract

- Network: Pharos Atlantic Testnet
- Chain ID: 688689
- Address: `0x3cEb0760C7F2bd58B1D2A60813112CFC42E9D9e4`
- Authorized caller: Settlement engine wallet (set at deploy time)
- Functions: `createEscrow`, `releaseFunds`, `refundFunds`, `freezeEscrow`




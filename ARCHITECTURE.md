# AESS Architecture

## System Objective

Provide autonomous verification and trustless settlement for digital agreements.

---

## System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    AESS Architecture                     │
└─────────────────────────────────────────────────────────┘

┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  Agreement   │────▶│   Escrow     │────▶│  Settlement  │
│   Service    │     │   Service    │     │ Orchestrator │
└──────────────┘     └──────────────┘     └──────────────┘
        │                    │                     │
        ▼                    ▼                     ▼
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  Execution   │────▶│ Verification │────▶│  Blockchain  │
│   Service    │     │   Engine     │     │   Provider   │
└──────────────┘     └──────────────┘     └──────────────┘
                            │
                  ┌─────────┴─────────┐
                  ▼                   ▼
          ┌──────────────┐    ┌──────────────┐
          │   AI Judge   │    │  Rule Engine │
          │ (Gemini AI)  │    │  (Fallback)  │
          └──────────────┘    └──────────────┘
```

---

## Core Components

### Agreement Service

Stores agreement requirements, obligations, and settlement conditions.

### Evidence Verification Engine

Validates submitted evidence against agreement requirements.

Outputs:
- Coverage analysis
- Missing evidence detection
- Artifact validation

### Rule Engine

Performs deterministic requirement validation.

Outputs:
- Pass/fail status
- Requirement-level scoring

### AI Judge

Performs contextual assessment of submissions.

Responsibilities:
- Quality assessment
- Compliance reasoning
- Risk observations
- Structured scoring

### Risk Engine

Aggregates verification signals and calculates execution risk.

Outputs:
- LOW
- MEDIUM
- HIGH

### Decision Engine

Combines:
- Rule results
- Evidence results
- AI analysis
- Risk score

Generates the final settlement decision.

### Settlement Engine

Coordinates the settlement lifecycle.

Responsibilities:
- Settlement authorization
- Idempotency protection
- Transaction tracking
- Failure recovery

### Pharos Settlement Provider

Interfaces directly with the blockchain.

Responsibilities:
- Transaction broadcasting
- Confirmation monitoring
- Retry handling
- Reorg protection

### AESSEscrow Smart Contract

Provides on-chain settlement guarantees.

Features:
- Escrow creation
- Fund release
- Refund handling
- Reentrancy protection
- Authorized settlement execution

---

## Security Features

### 1. Cryptographic Integrity

- **SHA-256 Hashing** — all evidence is cryptographically hashed
- **Tamper Detection** — any modification invalidates hashes
- **Audit Trail** — complete verification history preserved

### 2. Smart Contract Security

- **OpenZeppelin Standards** — built on battle-tested libraries
- **Reentrancy Guards** — prevents reentrancy attacks
- **Access Control** — only the authorized settlement engine can release funds
- **State Validation** — a strict FSM prevents invalid transitions

### 3. Multi-Layer Verification

```
Rule-Based Check ────┐
                      │
AI Verification ──────┼──▶ Arbitration ──▶ Final Decision
                      │
Coverage Analysis ────┘
```

### 4. Fail-Safe Mechanisms

- **AI Fallback** — if Gemini fails, automatic rule-based verification takes over
- **Idempotency** — prevents double-settlements
- **Time-locks** — optional delay for dispute windows
- **Multi-sig** — support for multi-party authorization

---

## How It Works: Deep Dive

### State Machine Flow

```
CREATED ──fund──▶ FUNDED ──activate──▶ ACTIVE
                                          │
                                    submit│
                                          ▼
                                     SUBMITTED
                                          │
                                    review│
                                          ▼
                                    UNDER_REVIEW
                                    ┌─────┴─────┐
                              verify│           │dispute
                                    ▼           ▼
                               COMPLETED    DISPUTED
                                              │
                                    ┌─────────┴─────────┐
                              resolve│                cancel│
                                    ▼                     ▼
                               COMPLETED             CANCELLED
```

### Verification Algorithm

```javascript
// Pseudocode
function verify(agreement, submission) {
  // Step 1: Rule-based checks
  const ruleScore = evaluateRequirements(agreement, submission);

  // Step 2: Evidence quality
  const evidenceScore = assessEvidenceQuality(submission);

  // Step 3: Coverage analysis
  const coverage = analyzeCoverage(agreement.requirements, submission);

  // Step 4: AI judgment (with fallback)
  let aiScore;
  try {
    aiScore = await judgeWithGemini(agreement, submission);
  } catch (error) {
    aiScore = ruleBasedJudge(agreement, submission); // Fallback
  }

  // Step 5: Arbitration
  const finalScore = arbitrate(ruleScore, evidenceScore, aiScore, coverage);

  // Step 6: Decision
  return decide(finalScore, THRESHOLD = 70);
}
```

### Settlement Process

```typescript
// Simplified settlement flow
async function settle(agreementId, decision) {
  // 1. Load escrow
  const escrow = await getEscrow(agreementId);

  // 2. Validate state
  if (escrow.status !== 'FUNDED') throw new Error('Not fundable');

  // 3. Convert agreement ID to blockchain format
  const agreementIdHash = keccak256(agreementId);

  // 4. Call smart contract
  if (decision === 'APPROVED') {
    await contract.releaseFunds(agreementIdHash);
  } else {
    await contract.refundFunds(agreementIdHash);
  }

  // 5. Record settlement
  await recordSettlement(agreementId, txHash);
}
```

---

## Blockchain Deployment

| Field | Value |
|---|---|
| Network | Pharos Atlantic Testnet |
| Chain ID | 688689 |
| Contract | `0x3cEb0760C7F2bd58B1D2A60813112CFC42E9D9e4` |
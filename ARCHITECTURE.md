# AESS Architecture

## System Objective

Provide autonomous verification and trustless settlement for digital agreements.

---

## Core Components

### Agreement Service

Stores agreement requirements, obligations, and settlement conditions.

### Evidence Verification Engine

Validates submitted evidence against agreement requirements.

Outputs:

* Coverage analysis
* Missing evidence detection
* Artifact validation

### Rule Engine

Performs deterministic requirement validation.

Outputs:

* Pass/fail status
* Requirement-level scoring

### Gemini AI Judge

Performs contextual assessment of submissions.

Responsibilities:

* Quality assessment
* Compliance reasoning
* Risk observations
* Structured scoring

### Risk Engine

Aggregates verification signals and calculates execution risk.

Outputs:

* LOW
* MEDIUM
* HIGH

### Decision Engine

Combines:

* Rule results
* Evidence results
* AI analysis
* Risk score

Generates final settlement decision.

### Settlement Engine

Coordinates settlement lifecycle.

Responsibilities:

* Settlement authorization
* Idempotency protection
* Transaction tracking
* Failure recovery

### Pharos Settlement Provider

Interfaces directly with the blockchain.

Responsibilities:

* Transaction broadcasting
* Confirmation monitoring
* Retry handling
* Reorg protection

### AESSEscrow Smart Contract

Provides on-chain settlement guarantees.

Features:

* Escrow creation
* Fund release
* Refund handling
* Reentrancy protection
* Authorized settlement execution

---

## End-to-End Flow

Agreement Created
↓
Evidence Submitted
↓
Rule Verification
↓
Evidence Verification
↓
Gemini Evaluation
↓
Risk Assessment
↓
Decision Generation
↓
Settlement Authorization
↓
Pharos Transaction
↓
Confirmation
↓
Settlement Complete

---

## Security Measures

* ReentrancyGuard
* Transaction confirmation thresholds
* Retry mechanisms
* Timeout protection
* Structured AI outputs
* Environment-based secret management

---

## Blockchain Deployment

Network:
Pharos Atlantic Testnet

Chain ID:
688689

Contract:
0x3cEb0760C7F2bd58B1D2A60813112CFC42E9D9e4


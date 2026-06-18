# ESCROW Contract

The `AESSEscrow.sol` contract serves as the on-chain settlement layer for AESS.

## Purpose
- Holds funds in escrow during the verification phase.
- Executes automated settlement upon successful verification from the Settlement Engine.
- Enforces strict withdrawal constraints based on established agreement rules.

## Interaction
This contract is designed to be interacted with via the `SettlementEngine` (`/src/settlement/orchestrator.ts`).

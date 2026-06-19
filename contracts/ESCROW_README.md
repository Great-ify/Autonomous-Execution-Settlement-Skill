# ESCROW Contract

The `AESSEscrow.sol` contract serves as the on-chain settlement layer for AESS.

## Purpose
- Holds funds in escrow during the verification phase.
- Executes automated settlement upon successful verification from the Settlement Engine.
- Enforces strict withdrawal constraints based on established agreement rules.

## Interaction
This contract is designed to be interacted with via the `SettlementEngine` (`/src/settlement/orchestrator.ts`).


## Check On-Chain Data

# View transaction on explorer
https://atlantic.pharosscan.xyz/tx/0x<your_tx_hash>


# Check contract
https://atlantic.pharosscan.xyz/address/0x3ceb0760c7f2bd58b1d2a60813112cfc42e9d9e4

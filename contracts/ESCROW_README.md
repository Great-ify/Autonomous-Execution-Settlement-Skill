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
https://explorer.pharos.network/tx/0x<your_tx_hash>

# Check contract
https://explorer.pharos.network/address/0x3cEb0760C7F2bd58B1D2A60813112CFC42E9D9e4

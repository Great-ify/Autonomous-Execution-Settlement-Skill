
# AESS (Autonomous Escrow Settlement System) Skill

This skill provides instructions for developers and AI agents to work with the AESS codebase, which combines off-chain AI reasoning (Gemini) with on-chain cryptographic settlement (Pharos).

## Setup & Configuration

1. ## Install as a Skill

 Skill Engine installation:
npx skills add https://github.com/Great-ify/Autonomous-Execution-Settlement-Skill

Compatible with:
Claude Code
OpenClaw
Codex
Other MCP-compatible agent environments


  
2. Environment Variables: The system requires a `.env` file at the root.
    *   `GEMINI_API_KEY`: Required for the AI Judge (`/src/utils/gemini.ts`).
    *   `PHAROS_RPC_URL`: Required for blockchain deployment/interaction.
    *   `PHAROS_CHAIN_ID`: Chain ID for Pharos network.
    *   `PHAROS_PRIVATE_KEY`: Private key for transaction signing.


## Common Agent Tasks

### 1. Interacting with the Settlement Engine
Task the agent with modifying or debugging the orchestration logic in `/src/settlement/orchestrator.ts`. Ensure any changes maintain idempotency for settlement.

### 2. Contract Updates
If modifying `/contracts/AESSEscrow.sol`, the agent must:
1. Compile the contract using `npx hardhat compile`.
2. Update the deployment script in `/scripts/deploy.ts`.

### 3. Verification Engine
When adding rules or AI analysis, modify:
*   `/src/verification/ruleEngine.ts` (for constraint checks)
*   `/src/verification/aiJudge.ts` (for Gemini-specific logic)

## Verification
*   Tests: Always run `npm run test` before proposing changes.
*   Building: Ensure `npm run build` succeeds for backend modifications.

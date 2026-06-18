# AESS: Autonomous Escrow Settlement System

## Overview

AESS is escrow and settlement infrastructure that enables autonomous verification and on-chain settlement of digital agreements. By combining Gemini-powered evaluation with Pharos smart contracts, AESS creates a trust layer for agent-to-agent and human-to-agent transactions.

AI agents can complete tasks, but they can't independently verify work quality or settle payments in a trustless manner. Current workflows require manual review, arbitration, and payment execution. AESS automates all of it:

- Agreement verification
- Evidence validation
- Risk assessment
- Settlement authorization
- On-chain escrow release

## High-Level Workflow

1. **Agreement Initiation** — Parties define task requirements and lock payment in escrow.
2. **Evidence Submission** — The worker submits artifacts (logs, files, text) against each requirement.
3. **Verification Engine** — Multi-stage validation:
   - **Rule Engine** — checks artifacts against agreement requirements
   - **AI Judge** — Gemini validates artifact quality and intent, with automatic fallback to a deterministic rule-based judge if all models fail
   - **Risk Engine** — heuristic risk scoring
4. **Settlement** — Idempotent smart contract execution triggered by the verification outcome.

## Quick Start

1. Ensure Node.js v20+ is installed.
2. `npm install`
3. `npm run dev` — API server on port 3000
4. `npm run test` — run the test suite
5. `npm run demo` — trigger the end-to-end flow

## How It Works

```
┌─────────────┐
│  Agreement  │  1. Create work agreement
└──────┬──────┘
       │
┌──────▼──────┐
│   Escrow    │  2. Lock funds on-chain
└──────┬──────┘
       │
┌──────▼──────┐
│  Execution  │  3. Submit work evidence
└──────┬──────┘
       │
┌──────▼──────┐
│   AI Judge  │  4. Verify with Gemini AI
└──────┬──────┘
       │
┌──────▼──────┐
│ Settlement  │  5. Release or refund funds
└─────────────┘
```

## Use Cases

- **Freelance work** — automated escrow for development tasks
- **API integration** — verify SDK delivery and quality
- **Code review** — AI assessment of code submissions
- **Bug bounties** — automated verification and payment
- **Agent-to-agent commerce** — autonomous B2B transactions

## Documentation Reference

- [Architecture](ARCHITECTURE.md)
- [Deployment Guide](DEPLOYMENT_GUIDE.md)
- [Demo Guide](DEMO_GUIDE.md)
- [Contract Information](contracts/ESCROW_README.md)

See the [AESS Skill](/skills/aess-skill/SKILL.md) doc for detailed configuration and task-specific workflows. Make sure your environment has all required API keys configured as described in the deployment guide.
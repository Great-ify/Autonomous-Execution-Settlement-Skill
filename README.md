# AESS: Autonomous Escrow Settlement System

## Overview

AESS is an escrow and settlement infrastructure that enables autonomous verification and on-chain settlement of digital agreements. By combining Gemini-powered evaluation with Pharos smart contracts, AESS creates a trust layer for agent-to-agent and human-to-agent transactions. AI agents can complete tasks but cannot independently verify work quality or settle payments in a trustless manner.
Current workflows require manual review, arbitration, and payment execution
AESS automates:
Agreement verification
Evidence validation
Risk assessment
Settlement authorization
On-chain escrow release

## High-Level Workflow

1.  Agreement Initiation: Parties define smart contract requirements.
2.  Evidence Submission: Parties submit artifacts (logs, files, text).
3.  Verification Engine: Multi-stage validation.
    Rule Engine: Checks artifacts against agreement requirements.
    AI Judge: Gemini validates artifact quality and intent.
    Risk Engine: Heuristic analysis.
4.  Settlement: Idempotent smart contract execution triggered by verification success.

## Quick Start

1. Ensure Node.js v20+ is installed.
2. `npm install`
3. `npm run dev` (API lives on port 3000)
4. `npm run test` (Verify core logic)
5. `npx tsx src/utils/demoRunner.ts` (Trigger E2E flow)

## Documentation Reference

- [Architecture](ARCHITECTURE.md)
- [Deployment Guide](DEPLOYMENT_GUIDE.md)
- [Demo Guide](DEMO_GUIDE.md)
- [Contract Information](contracts/ESCROW_README.md)

## Developer Installation


For developers and AI agents looking to extend AESS, utilize the [AESS Skill](/skills/aess-skill/SKILL.md) for detailed configuration and task-specific workflows. Ensure your environment is set up with all required API keys as detailed in the deployment guides.

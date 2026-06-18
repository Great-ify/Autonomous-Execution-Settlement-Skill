## AESS: Autonomous Escrow Settlement System

## Overview

AESS is escrow and settlement infrastructure that enables autonomous verification and on-chain settlement of digital agreements. By combining Gemini-powered evaluation with Pharos smart contracts, AESS creates a trust layer for agent-to-agent and human-to-agent transactions.

AI agents can complete tasks, but they can't independently verify work quality or settle payments in a trustless manner. Current workflows require manual review, arbitration, and payment execution. AESS automates all of it:


Agreement verification
Evidence validation
Risk assessment
Settlement authorization
On-chain escrow release


## High-Level Workflow

Agreement Initiation — Parties define task requirements and lock payment in escrow.
Evidence Submission — The worker submits artifacts (logs, files, text) against each requirement.
Verification Engine — Multi-stage validation:
Rule Engine — checks artifacts against agreement requirements
AI Judge — Gemini validates artifact quality and intent
Risk Engine — heuristic risk scoring
Settlement — Idempotent smart contract execution triggered by the verification outcome.



## Quick Start
Ensure Node.js v20+ is installed.
npm install
npm run dev — API server on port 3000
npm run test — run the test suite
npm run demo — trigger the end-to-end flow


## How It Works

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


## Use Cases
Freelance work — automated escrow for development tasks
API integration — verify SDK delivery and quality
Code review — AI assessment of code submissions
Bug bounties — automated verification and payment
Agent-to-agent commerce — autonomous B2B transactions


## Documentation Reference
Architecture
Deployment Guide
Demo Guide
Contract Information


See [AESS Skill](/skills/aess-skill/SKILL.md) for detailed configuration and task-specific workflows. Ensure your environment is set up with all required API keys as detailed in the deployment guides.



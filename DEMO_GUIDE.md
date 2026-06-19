# AESS Demo Guide

This guide describes how to run and interpret the AESS system demonstration.

---

## Running the Demo

```bash
npm run demo
```

This executes a complete end-to-end flow:

```
┌─────────────────────────┐
│ 1. Agreement Creation   │  Create task with requirements
└────────┬────────────────┘
         │
┌────────▼────────────────┐
│ 2. Escrow Funding        │  Lock 0.5 PHRS on-chain
└────────┬────────────────┘
         │
┌────────▼────────────────┐
│ 3. Evidence Submission   │  Submit work artifacts
└────────┬────────────────┘
         │
         ▼
┌───────────────────────────────────────────┐
│        4. Verification (multi-layer)      │
│                                            │
│   ┌─────────────┐     ┌─────────────┐     │
│   │ Rule Engine │     │  AI Judge   │     │
│   │ (coverage)  │     │  (Gemini)   │     │
│   └──────┬──────┘     └──────┬──────┘     │
│          │                   │            │
│          │   if Gemini fails:│            │
│          │   rule-based judge│            │
│          │   takes over      │            │
│          └─────────┬─────────┘            │
│                     ▼                     │
│            ┌──────────────┐               │
│            │  Risk Engine │               │
│            └──────┬───────┘               │
└───────────────────┼────────────────────────┘
                    │
           ┌────────▼────────────────┐
           │ 5. On-Chain Settlement  │  Release funds to worker
           └─────────────────────────┘
```

---

## Demo Flow Explained

1. **Agreement Initiation** — The runner generates a sample agreement with predefined rules.
2. **Evidence Submission** — Pre-configured evidence is submitted for analysis.
3. **AI-Powered Analysis** — The `AIJudge` service invokes Gemini to perform constraint verification.
4. **Risk Heuristic** — The `RiskEngine` calculates reliability and quality scores.
5. **Settlement** — Upon successful verification, the `SettlementEngine` calls the deployed smart contract.
6. **Blockchain Confirmation** — The demo verifies the on-chain transaction receipt.

---

*Ensure your `.env` contains a valid `GEMINI_API_KEY` to run the AI components.*
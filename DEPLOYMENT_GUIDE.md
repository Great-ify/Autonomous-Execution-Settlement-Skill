# AESS Deployment Guide

## Prerequisites
- **Node.js**: v20+ 
- **Pharos**: Private key and test tokens.
- **Environment**: `.env` file populated with `PHAROS_RPC_URL`, `PHAROS_CHAIN_ID`, and `PHAROS_PRIVATE_KEY`.

## Steps

### 1. Environment Setup
Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
# Edit .env with your Pharos credentials
```

### 2. Smart Contract Deployment
Deploy the escrow contract:
```bash
npx hardhat run scripts/deploy.ts --network pharos
```
*Note the contract address output and update `src/config/contract.ts` if necessary.*

### 3. Backend Deployment
Deploy the backend server (e.g., to a containerized service):
```bash
npm run build
npm start
```
Ensure the `GEMINI_API_KEY` is configured in your production environment.

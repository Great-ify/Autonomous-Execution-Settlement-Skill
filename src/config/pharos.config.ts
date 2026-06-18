import 'dotenv/config';

export const PHAROS_CONFIG = {
  RPC_URL: process.env.PHAROS_RPC_URL || '',
  CHAIN_ID: process.env.PHAROS_CHAIN_ID || '',
  PRIVATE_KEY: process.env.PHAROS_PRIVATE_KEY || '',
  ESCROW_CONTRACT: process.env.PHAROS_ESCROW_CONTRACT || '',
};

if (!PHAROS_CONFIG.RPC_URL || !PHAROS_CONFIG.CHAIN_ID || !PHAROS_CONFIG.PRIVATE_KEY) {
  throw new Error('Missing Pharos environment configuration (RPC, CHAIN_ID, or PRIVATE_KEY)');
}

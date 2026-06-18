import { ethers } from 'ethers';
import { TransactionMetadata } from './types';
import { TransactionTimeoutError } from './errors';

const TIMEOUT_MS = parseInt(process.env.PHAROS_TX_TIMEOUT_MS || '60000');
const CONFIRMATIONS = parseInt(process.env.PHAROS_CONFIRMATIONS_REQUIRED || '3');

export const waitAndGetMetadata = async (tx: ethers.TransactionResponse): Promise<TransactionMetadata> => {
  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new TransactionTimeoutError()), TIMEOUT_MS)
  );

  const receipt = await Promise.race([
    tx.wait(CONFIRMATIONS),
    timeoutPromise
  ]);

  if (!receipt) throw new Error('Transaction failed');
  const r = receipt as ethers.TransactionReceipt;
  return {
    transactionHash: r.hash,
    blockNumber: r.blockNumber,
    network: 'pharos-atlantic',
    status: 'CONFIRMED',
    confirmedAt: new Date(),
  };
};

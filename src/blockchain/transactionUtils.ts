import { ethers } from 'ethers';
import { TransactionMetadata } from '../types/settlement.types';

/**
 * Wait for transaction confirmation and extract metadata
 */
export async function waitAndGetMetadata(
  tx: ethers.ContractTransactionResponse
): Promise<TransactionMetadata> {
  console.log(`⏳ Waiting for transaction ${tx.hash}...`);
  
  const receipt = await tx.wait();
  
  if (!receipt) {
    throw new Error('Transaction receipt is null');
  }

  console.log(`✅ Transaction confirmed in block ${receipt.blockNumber}`);

  return {
    transactionHash: receipt.hash,
    blockNumber: receipt.blockNumber,
    gasUsed: receipt.gasUsed,
    timestamp: new Date(),
    status: receipt.status === 1 ? 'success' : 'failed'
  };
}

/**
 * Wait for multiple confirmations
 */
export async function waitForConfirmations(
  tx: ethers.ContractTransactionResponse,
  confirmations: number = 1
): Promise<ethers.TransactionReceipt | null> {
  console.log(`⏳ Waiting for ${confirmations} confirmations...`);
  return await tx.wait(confirmations);
}

/**
 * Estimate gas for a transaction
 */
export async function estimateGas(
  contract: ethers.Contract,
  method: string,
  args: any[]
): Promise<bigint> {
  return await contract[method].estimateGas(...args);
}

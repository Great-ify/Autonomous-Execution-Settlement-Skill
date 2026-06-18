import { ethers } from 'ethers';
import { SettlementProvider } from '../contracts/settlementProvider.contract';
import { TransactionMetadata } from './types';
import { getProvider } from './provider';
import { getWallet } from './wallet';
import { waitAndGetMetadata } from './transaction';
import { PHAROS_CONFIG } from '../config/pharos.config';
import { executeRetry } from './retry';

// Import ABI just for the interface, we'll embed minimal ABI
const ESCROW_ABI = [
  "function releaseFunds(uint256 agreementId) external",
  "function refundFunds(uint256 agreementId) external",
  "function freezeEscrow(uint256 agreementId) external"
];

export class PharosSettlementProvider implements SettlementProvider {
  private contract: ethers.Contract;

  constructor() {
    const provider = getProvider();
    const wallet = getWallet(provider);
    this.contract = new ethers.Contract(PHAROS_CONFIG.ESCROW_CONTRACT, ESCROW_ABI, wallet);
  }

  async releaseFunds(agreementId: string, amount: number): Promise<TransactionMetadata> {
    return await executeRetry(async () => {
      const tx = await this.contract.releaseFunds(ethers.toBigInt(agreementId));
      return await waitAndGetMetadata(tx);
    });
  }

  async refundFunds(agreementId: string, amount: number): Promise<TransactionMetadata> {
    return await executeRetry(async () => {
      const tx = await this.contract.refundFunds(ethers.toBigInt(agreementId));
      return await waitAndGetMetadata(tx);
    });
  }

  async freezeFunds(agreementId: string): Promise<TransactionMetadata> {
    return await executeRetry(async () => {
      const tx = await this.contract.freezeEscrow(ethers.toBigInt(agreementId));
      return await waitAndGetMetadata(tx);
    });
  }
}

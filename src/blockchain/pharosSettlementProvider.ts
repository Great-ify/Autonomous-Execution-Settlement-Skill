import { ethers } from 'ethers';
import { PHAROS_CONFIG } from '../config/pharos.config';
import { getProvider } from './provider';
import { getWallet } from './wallet';
import { executeRetry } from './retry';
import { waitAndGetMetadata } from './transactionUtils';
import { TransactionMetadata } from '../types/settlement.types';

const ESCROW_ABI = [
  "function createEscrow(uint256 _agreementId, address _worker) external payable",
  "function releaseFunds(uint256 _agreementId) external",
  "function refundFunds(uint256 _agreementId) external",
  "function freezeEscrow(uint256 _agreementId) external",
  "event EscrowCreated(uint256 agreementId, uint256 amount)",
  "event FundsReleased(uint256 agreementId, uint256 amount)",
  "event FundsRefunded(uint256 agreementId, uint256 amount)",
  "event EscrowFrozen(uint256 agreementId)"
];

export class PharosSettlementProvider {
  private contract: ethers.Contract;

  constructor() {
    const provider = getProvider();
    const wallet = getWallet(provider);
    this.contract = new ethers.Contract(
      PHAROS_CONFIG.ESCROW_CONTRACT,
      ESCROW_ABI,
      wallet
    );
  }

  /**
   * Convert string agreementId to uint256 by hashing
   */
  private agreementIdToUint256(agreementId: string): bigint {
    const hash = ethers.keccak256(ethers.toUtf8Bytes(agreementId));
    return BigInt(hash);
  }

  async releaseFunds(agreementId: string, amount: number): Promise<TransactionMetadata> {
    return await executeRetry(async () => {
      const agreementIdNum = this.agreementIdToUint256(agreementId);
      
      console.log(`📤 Releasing funds for agreement ${agreementId} (uint256: ${agreementIdNum})`);
      
      const tx = await this.contract.releaseFunds(agreementIdNum);
      return await waitAndGetMetadata(tx);
    });
  }

  async refundFunds(agreementId: string, amount: number): Promise<TransactionMetadata> {
    return await executeRetry(async () => {
      const agreementIdNum = this.agreementIdToUint256(agreementId);
      
      console.log(`💸 Refunding funds for agreement ${agreementId} (uint256: ${agreementIdNum})`);
      
      const tx = await this.contract.refundFunds(agreementIdNum);
      return await waitAndGetMetadata(tx);
    });
  }

  async freezeFunds(agreementId: string): Promise<TransactionMetadata> {
    return await executeRetry(async () => {
      const agreementIdNum = this.agreementIdToUint256(agreementId);
      
      console.log(`🧊 Freezing funds for agreement ${agreementId} (uint256: ${agreementIdNum})`);
      
      const tx = await this.contract.freezeEscrow(agreementIdNum);
      return await waitAndGetMetadata(tx);
    });
  }

  /**
   * Helper to create escrow on-chain (if needed for demo)
   */
  async createEscrow(agreementId: string, workerAddress: string, amountInEth: number): Promise<TransactionMetadata> {
    return await executeRetry(async () => {
      const agreementIdNum = this.agreementIdToUint256(agreementId);
      const amountInWei = ethers.parseEther(amountInEth.toString());
      
      console.log(`💰 Creating escrow for agreement ${agreementId} (uint256: ${agreementIdNum})`);
      
      const tx = await this.contract.createEscrow(agreementIdNum, workerAddress, {
        value: amountInWei
      });
      return await waitAndGetMetadata(tx);
    });
  }
}
export interface TransactionMetadata {
  transactionHash: string;
  blockNumber: number;
  network: string;
  status: string;
  confirmedAt: Date;
}

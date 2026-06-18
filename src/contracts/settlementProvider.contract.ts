import { TransactionMetadata } from '../blockchain/types';

export interface SettlementProvider {
  releaseFunds(agreementId: string, amount: number): Promise<TransactionMetadata>;
  refundFunds(agreementId: string, amount: number): Promise<TransactionMetadata>;
  freezeFunds(agreementId: string): Promise<TransactionMetadata>;
}

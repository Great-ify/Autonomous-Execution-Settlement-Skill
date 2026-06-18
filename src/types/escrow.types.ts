export enum EscrowStatus {
  CREATED = 'CREATED',
  FUNDED = 'FUNDED',
  HELD = 'HELD',
  RELEASED = 'RELEASED',
  REFUNDED = 'REFUNDED',
  FROZEN = 'FROZEN',
}

export interface EscrowAccount {
  escrowId: string;
  agreementId: string;
  amount: number;
  payerAgent: string;
  workerAgent: string;
  fundedAt?: Date;
  status: EscrowStatus;
}

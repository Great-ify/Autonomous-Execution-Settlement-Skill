export enum SettlementStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  SETTLED = 'SETTLED',
  REFUNDED = 'REFUNDED',
  FROZEN = 'FROZEN',
  FAILED = 'FAILED',
  SETTLEMENT_PENDING_CONFIRMATION = 'SETTLEMENT_PENDING_CONFIRMATION',
  SETTLEMENT_TIMEOUT = 'SETTLEMENT_TIMEOUT',
  SETTLEMENT_RETRYING = 'SETTLEMENT_RETRYING',
  SETTLEMENT_FAILED = 'SETTLEMENT_FAILED',
}

export enum SettlementAction {
  RELEASE_FUNDS = 'RELEASE_FUNDS',
  REFUND_FUNDS = 'REFUND_FUNDS',
  HOLD_FUNDS = 'HOLD_FUNDS',
  FREEZE_FUNDS = 'FREEZE_FUNDS',
}

export interface SettlementRecord {
  settlementId: string;
  agreementId: string;
  decisionOutcome: string;
  settlementAction: SettlementAction;
  amount: number;
  beneficiary: string;
  status: SettlementStatus;
  referenceId: string;
  initiatedAt: Date;
  completedAt?: Date;
  metadata: Record<string, any>;
  integrityHash: string;
  transactionHash?: string;
  blockNumber?: number;
  network?: string;
  confirmedAt?: Date;
  contractAddress?: string;
  // Recovery Metadata
  retryCount?: number;
  lastAttemptAt?: Date;
  failureReason?: string;
  confirmationCount?: number;
  processingDurationMs?: number;
}

export interface SettlementAuditRecord {
  settlementId: string;
  agreementId: string;
  action: SettlementAction;
  actor: string;
  previousState: SettlementStatus;
  newState: SettlementStatus;
  timestamp: Date;
  integrityHash: string;
  previousHash?: string;
}

export interface SettlementFailure {
  settlementId: string;
  reason: string;
  failedAt: Date;
}

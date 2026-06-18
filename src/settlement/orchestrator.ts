import { StandardSettlementPolicy } from './policyEngine';
import { FileSettlementRepository } from '../repositories/settlement.repository';
import { FileEscrowRepository } from '../repositories/escrow.repository';
import { publishEvent } from '../events/eventBus';
import { SettlementStatus } from '../types/settlement.types';
import { SettlementIdempotencyService } from '../services/settlementIdempotency.service';
import { validateEscrow } from '../verification/escrowValidator';
import { generateIntegrityHash } from '../utils/crypto';
import { PharosSettlementProvider } from '../blockchain/pharosSettlementProvider';
import { PHAROS_CONFIG } from '../config/pharos.config';

const settlementRepo = new FileSettlementRepository();
const escrowRepo = new FileEscrowRepository();
const idempotency = new SettlementIdempotencyService();
const policy = StandardSettlementPolicy;
const settlementProvider = new PharosSettlementProvider();

export const orchestrateSettlement = async (agreementId: string, outcome: any) => {
  const action = policy.getAction(outcome);
  const idempotencyKey = `${agreementId}:${action}`;
  
  if (await idempotency.isProcessed(idempotencyKey)) {
    console.warn(`Duplicate settlement attempt for ${idempotencyKey}`);
    return;
  }

  const escrow = await escrowRepo.findByAgreementId(agreementId);
  const validation = validateEscrow(escrow!);
  
  if(!validation.valid) throw new Error(`Escrow validation failed: ${validation.reason}`);

  let txMetadata;
  let status = SettlementStatus.SETTLED;
  let failureReason;
  let retries = 0;

  try {
    if (action === 'RELEASE_FUNDS') {
      txMetadata = await settlementProvider.releaseFunds(agreementId, escrow!.amount);
    } else if (action === 'REFUND_FUNDS') {
      txMetadata = await settlementProvider.refundFunds(agreementId, escrow!.amount);
    } else if (action === 'FREEZE_FUNDS') {
      txMetadata = await settlementProvider.freezeFunds(agreementId);
    } else {
      throw new Error('Unsupported settlement action');
    }
  } catch (error: any) {
    status = SettlementStatus.SETTLEMENT_FAILED;
    failureReason = error.message;
    publishEvent('settlement.failed', { agreementId, reason: failureReason });
  }

  const settlementId = Math.random().toString(36).substring(7);
  const settlement: any = {
    settlementId,
    agreementId,
    decisionOutcome: outcome,
    settlementAction: action,
    amount: escrow!.amount,
    beneficiary: escrow!.workerAgent,
    status: status,
    referenceId: escrow!.escrowId,
    initiatedAt: new Date(),
    completedAt: txMetadata?.confirmedAt,
    metadata: {},
    integrityHash: '',
    transactionHash: txMetadata?.transactionHash,
    blockNumber: txMetadata?.blockNumber,
    network: txMetadata?.network,
    confirmedAt: txMetadata?.confirmedAt,
    contractAddress: PHAROS_CONFIG.ESCROW_CONTRACT,
    retryCount: retries,
    failureReason
  };
  
  settlement.integrityHash = generateIntegrityHash(settlement);

  await settlementRepo.create(settlement);
  await idempotency.markProcessed(idempotencyKey);
  
  if (status === SettlementStatus.SETTLED) {
      publishEvent('settlement.completed', settlement);
  }
};

import { randomUUID } from 'crypto';
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

const settlementRepo     = new FileSettlementRepository();
const escrowRepo         = new FileEscrowRepository();
const idempotency        = new SettlementIdempotencyService();
const policy             = StandardSettlementPolicy;
const settlementProvider = new PharosSettlementProvider();

export const orchestrateSettlement = async (agreementId: string, outcome: any): Promise<void> => {
  const action        = policy.getAction(outcome);
  const idempotencyKey = `${agreementId}:${action}`;

  // Guard: reject duplicate settlement attempts before touching the chain
  if (await idempotency.isProcessed(idempotencyKey)) {
    console.warn(`[orchestrator] Duplicate settlement attempt blocked — key: ${idempotencyKey}`);
    return;
  }

  const escrow     = await escrowRepo.findByAgreementId(agreementId);
  const validation = validateEscrow(escrow!);

  if (!validation.valid) {
    throw new Error(`Escrow validation failed: ${validation.reason}`);
  }

  // Use a cryptographically random ID — this is a financial record
  const settlementId = randomUUID();

  let txMetadata:    Awaited<ReturnType<typeof settlementProvider.releaseFunds>> | undefined;
  let status         = SettlementStatus.SETTLED;
  let failureReason: string | undefined;
  let retries        = 0;

  try {
    if (action === 'RELEASE_FUNDS') {
      txMetadata = await settlementProvider.releaseFunds(agreementId, escrow!.amount);
    } else if (action === 'REFUND_FUNDS') {
      txMetadata = await settlementProvider.refundFunds(agreementId, escrow!.amount);
    } else if (action === 'FREEZE_FUNDS') {
      txMetadata = await settlementProvider.freezeFunds(agreementId);
    } else {
      throw new Error(`Unsupported settlement action: ${action}`);
    }
  } catch (error: any) {
    status        = SettlementStatus.SETTLEMENT_FAILED;
    failureReason = error.message;

    // Publish failure event so subscribers can react (e.g. alert, retry queue)
    publishEvent('settlement.failed', { agreementId, reason: failureReason });

    // Build and persist the failure record so there is an audit trail
    const failedRecord: any = {
      settlementId,
      agreementId,
      decisionOutcome: outcome,
      settlementAction: action,
      amount:           escrow!.amount,
      beneficiary:      escrow!.workerAgent,
      status,
      referenceId:      escrow!.escrowId,
      initiatedAt:      new Date(),
      completedAt:      undefined,
      metadata:         {},
      integrityHash:    '',
      transactionHash:  undefined,
      blockNumber:      undefined,
      network:          undefined,
      confirmedAt:      undefined,
      contractAddress:  PHAROS_CONFIG.ESCROW_CONTRACT,
      retryCount:       retries,
      failureReason,
    };
    failedRecord.integrityHash = generateIntegrityHash(failedRecord);
    await settlementRepo.create(failedRecord);

    // Do NOT mark as processed — a failed tx should be retryable
    throw error;
  }

  //  Success path 
  const settlement: any = {
    settlementId,
    agreementId,
    decisionOutcome:  outcome,
    settlementAction: action,
    amount:           escrow!.amount,
    beneficiary:      escrow!.workerAgent,
    status,
    referenceId:      escrow!.escrowId,
    initiatedAt:      new Date(),
    completedAt:      txMetadata?.confirmedAt,
    metadata:         {},
    integrityHash:    '',
    transactionHash:  txMetadata?.transactionHash,
    blockNumber:      txMetadata?.blockNumber,
    network:          txMetadata?.network,
    confirmedAt:      txMetadata?.confirmedAt,
    contractAddress:  PHAROS_CONFIG.ESCROW_CONTRACT,
    retryCount:       retries,
    failureReason:    undefined,
  };

  settlement.integrityHash = generateIntegrityHash(settlement);

  await settlementRepo.create(settlement);

  // Only mark idempotency AFTER the record is safely persisted
  await idempotency.markProcessed(idempotencyKey);

  publishEvent('settlement.completed', settlement);
};
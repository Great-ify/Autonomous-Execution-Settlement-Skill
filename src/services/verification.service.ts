import { VerificationResult } from '../types/verification.types';
import { runVerification } from '../verification/verificationEngine';
import { FileVerificationRepository } from '../repositories/verification.repository';
import { FileAgreementRepository } from '../repositories/agreement.repository';
import { FileSubmissionRepository } from '../repositories/submission.repository';
import { updateAgreementState } from './agreement.service';
import { AgreementState } from '../state-machine/agreementState';
import { publishEvent } from '../events/eventBus';
import { randomUUID } from 'crypto';

// additional imports 
import { assessRisk } from '../verification/riskEngine';
import { analyzeReliability } from '../verification/reliabilityAnalyzer';
import { StandardDecisionPolicy } from '../verification/decisionPolicy';
import { FileDecisionRecordRepository } from '../repositories/decisionRecord.repository';
import { DecisionOutcome } from '../types/risk.types';
import { assessEvidenceQuality } from '../verification/evidenceQualityEngine';
import { arbitrate } from '../verification/arbitrator';

const verificationRepo = new FileVerificationRepository();
const agreementRepo = new FileAgreementRepository();
const submissionRepo = new FileSubmissionRepository();
const decisionRepo = new FileDecisionRecordRepository();

export const processSubmission = async (agreementId: string): Promise<VerificationResult | null> => {
  const agreement = await agreementRepo.findById(agreementId);
  const submission = await submissionRepo.findByAgreementId(agreementId);
  
  if (!agreement || !submission) return null;

  // Transition to UNDER_REVIEW automatically 
  await updateAgreementState(agreementId, AgreementState.UNDER_REVIEW, 'system');

  const result = await runVerification(agreement, submission.payload);
  await verificationRepo.create(result);

  // Logic
  const evidenceQuality = await assessEvidenceQuality(submission.payload);
  const arbitration = arbitrate(100, evidenceQuality.qualityScore, result.aiScore, 'NONE');
  const riskAssessment = await assessRisk(result, evidenceQuality, arbitration, agreement);
  
  // Emit event
  publishEvent('risk.assessed', { agreementId, ...riskAssessment } as any);

  const decision = StandardDecisionPolicy.decide(result, riskAssessment);
  
  await decisionRepo.create({
    decisionId: randomUUID(),
    verificationId: result.verificationId,
    riskAssessment,
    decisionOutcome: decision,
    rationale: `Decision made based on StandardDecisionPolicy: ${decision}`,
    timestamp: new Date(),
    integrityHash: '',
  });

  // Emit final events
  publishEvent(`decision.${decision.toLowerCase()}`, { agreementId, decision } as any);

  const nextState = decision === DecisionOutcome.APPROVED ? AgreementState.COMPLETED : AgreementState.FAILED;
  await updateAgreementState(agreementId, nextState, 'system');

  return result;
};
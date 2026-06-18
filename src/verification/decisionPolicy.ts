import { RiskAssessment, DecisionOutcome } from '../types/risk.types';
import { VerificationResult } from '../types/verification.types';

export interface DecisionPolicy {
  decide(verification: VerificationResult, risk: RiskAssessment): DecisionOutcome;
}

export const StandardDecisionPolicy: DecisionPolicy = {
  decide: (verification, risk) => {
    if (verification.approved && risk.overallRiskScore < 20) return DecisionOutcome.APPROVED;
    if (risk.overallRiskScore > 70) return DecisionOutcome.REJECTED;
    if (risk.overallRiskScore > 40) return DecisionOutcome.ESCALATED;
    return DecisionOutcome.REQUIRES_REVIEW;
  }
};

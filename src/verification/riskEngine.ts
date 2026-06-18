import { RiskAssessment, RiskLevel, RiskFactor } from '../types/risk.types';
import { VerificationResult, ArbitrationReport, EvidenceQualityReport } from '../types/verification.types';

export const assessRisk = async (
  verificationResult: VerificationResult,
  evidenceQuality: EvidenceQualityReport,
  arbitration: ArbitrationReport,
  agreement: any
): Promise<RiskAssessment> => {
  const factors: RiskFactor[] = [];
  
  if (verificationResult.evidenceCoverage < 80) factors.push(RiskFactor.LOW_COVERAGE);
  if (evidenceQuality.qualityScore < 70) factors.push(RiskFactor.LOW_EVIDENCE);
  
  const score = Math.max(0, Math.min(100, (factors.length * 25)));
  
  let riskLevel = RiskLevel.LOW;
  if (score > 75) riskLevel = RiskLevel.CRITICAL;
  else if (score > 50) riskLevel = RiskLevel.HIGH;
  else if (score > 25) riskLevel = RiskLevel.MEDIUM;

  return {
    overallRiskScore: score,
    riskLevel,
    riskFactors: factors,
    confidenceAdjustment: -0.1 * factors.length,
    recommendation: factors.length > 0 ? 'Review required' : 'Proceed',
  };
};

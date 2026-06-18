import { VerificationResult, VerificationMethod, RiskFlag } from '../types/verification.types';
import { evaluateRequirements } from './requirementEvaluator';
import { assessEvidenceQuality } from './evidenceQualityEngine';
import { analyzeCoverage } from './coverageAnalyzer';
import { judgeWithAI } from './aiJudge';
import { challengeSubmission } from './aiChallenger';
import { arbitrate } from './verificationArbitrator';
import { generateRiskFlags } from './riskFlagGenerator';
import { decide, ThresholdDecisionStrategy } from './decisionEngine';
import { analyzeConsistency } from './consistencyAnalyzer';

export const runVerification = async (agreement: any, submission: any): Promise<VerificationResult> => {
  const requirements = agreement.requirements || [];
  
  const requirementResults = await evaluateRequirements(agreement, submission);
  const evidenceQuality = await assessEvidenceQuality(submission);
  const coverageReport = analyzeCoverage(requirements, submission);
  const aiAnalysis = await judgeWithAI(agreement, submission);
  const challengeReport = await challengeSubmission(agreement, submission);
  const arbitration = arbitrate(100, evidenceQuality.qualityScore, aiAnalysis.confidence * 100, 'NONE');
  
  const coverage = coverageReport.coveragePercentage / 100;
  
  const strategy = ThresholdDecisionStrategy;
  const { approved, confidenceScore } = decide(strategy, 100, evidenceQuality.qualityScore, aiAnalysis.confidence * 100, coverage);
  
  const consistencyRating = analyzeConsistency(100, evidenceQuality.qualityScore, aiAnalysis.confidence * 100);
  
  const riskFlags = generateRiskFlags({ coverage: coverageReport.coveragePercentage });

  return {
    verificationId: Math.random().toString(36).substring(7),
    agreementId: agreement.id,
    approved,
    confidenceScore,
    verificationMethod: VerificationMethod.HYBRID,
    providerId: 'AESS-ENGINE-V1',
    ruleScore: 100,
    evidenceScore: evidenceQuality.qualityScore,
    aiScore: aiAnalysis.confidence * 100,
    evidenceCoverage: coverageReport.coveragePercentage,
    findings: [],
    verifiedAt: new Date(),
    consistencyRating,
    requirementCoverage: coverageReport.coveragePercentage,
    verifiedRequirements: requirementResults.map(r => r.requirementId),
    failedRequirements: [],
    decisionStrategyUsed: 'ThresholdDecisionStrategy',
    integrityHash: '',
  };
};

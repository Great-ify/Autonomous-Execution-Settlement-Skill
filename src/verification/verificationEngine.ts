import { randomUUID } from 'crypto';
import { VerificationResult, VerificationMethod } from '../types/verification.types';
import { evaluateRequirements } from './requirementEvaluator';
import { assessEvidenceQuality } from './evidenceQualityEngine';
import { analyzeCoverage } from './coverageAnalyzer';
import { judgeWithAI } from './aiJudge';
import { challengeSubmission } from './aiChallenger';
import { arbitrate } from './verificationArbitrator';
import { generateRiskFlags } from './riskFlagGenerator';
import { decide, ThresholdDecisionStrategy } from './decisionEngine';
import { analyzeConsistency } from './consistencyAnalyzer';
import { generateIntegrityHash } from '../utils/crypto';

export const runVerification = async (
  agreement: any,
  submission: any
): Promise<VerificationResult> => {
  console.log(`🔍 Starting verification for agreement ${agreement.id}`);

  const requirements = agreement.requirements || [];

  console.log(`  ├─ Evaluating ${requirements.length} requirements...`);
  const requirementResults = await evaluateRequirements(agreement, submission);

  console.log(`  ├─ Assessing evidence quality...`);
  const evidenceQuality = await assessEvidenceQuality(submission);

  console.log(`  ├─ Analyzing coverage...`);
  const coverageReport = analyzeCoverage(requirements, submission);

  console.log(`  ├─ Running AI judge...`);
  let aiAnalysis;
  try {
    aiAnalysis = await judgeWithAI(agreement, submission);
    console.log(`  │  └─ AI score: ${(aiAnalysis.score * 100).toFixed(1)}, confidence: ${(aiAnalysis.confidence * 100).toFixed(1)}%`);
  } catch (error: any) {
    console.error(`  │  └─ AI judge failed: ${error.message}`);
    aiAnalysis = {
      score: 0.5,
      confidence: 0.5,
      findings: ['AI judgment unavailable - using default values'],
      strengths: [],
      weaknesses: ['Unable to perform AI analysis']
    };
  }

  console.log(`  ├─ Running challenge analysis...`);
  const challengeReport = await challengeSubmission(agreement, submission);

  console.log(`  ├─ Arbitrating scores...`);
  const arbitration = arbitrate(
    100,
    evidenceQuality.qualityScore,
    aiAnalysis.confidence * 100,
    'NONE'
  );

  const coverage = coverageReport.coveragePercentage / 100;

  console.log(`  ├─ Making final decision...`);
  const strategy = ThresholdDecisionStrategy;
  const { approved, confidenceScore } = decide(
    strategy,
    100,
    evidenceQuality.qualityScore,
    aiAnalysis.score * 100,
    coverage,
  );

  const consistencyRating = analyzeConsistency(
    100,
    evidenceQuality.qualityScore,
    aiAnalysis.score * 100
  );

  const riskFlags = generateRiskFlags({
    coverage: coverageReport.coveragePercentage
  });

  const result: VerificationResult = {
    verificationId: randomUUID(),
    agreementId: agreement.id,
    approved,
    confidenceScore,
    verificationMethod: VerificationMethod.HYBRID,
    providerId: 'AESS-ENGINE-V1',
    ruleScore: 100,
    evidenceScore: evidenceQuality.qualityScore,
    aiScore: aiAnalysis.score * 100,
    evidenceCoverage: coverageReport.coveragePercentage,
    findings: aiAnalysis.findings ?? [],
    verifiedAt: new Date(),
    consistencyRating,
    requirementCoverage: coverageReport.coveragePercentage,
    verifiedRequirements: requirementResults
      .filter(r => r.status === 'PASS')
      .map(r => r.requirementId),
    failedRequirements: requirementResults
      .filter(r => r.status === 'FAIL')
      .map(r => r.requirementId),
    decisionStrategyUsed: 'ThresholdDecisionStrategy',
    integrityHash: '',
  };

  result.integrityHash = generateIntegrityHash(result);

  console.log(`  └─ ✅ Verification complete: ${approved ? 'APPROVED' : 'REJECTED'} (confidence: ${confidenceScore.toFixed(1)}%)`);

  return result;
};
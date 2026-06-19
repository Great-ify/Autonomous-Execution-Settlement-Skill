import { RiskAssessment, RiskLevel, RiskFactor } from '../types/risk.types';

/**
 * Minimal, decoupled input for a standalone risk check.
 *
 * Unlike `assessRisk` in riskEngine.ts — which requires a full
 * VerificationResult + EvidenceQualityReport + ArbitrationReport produced by
 * the AESS pipeline — this takes only primitive values. Any agent can call
 * this with numbers it already has, without first running AESS's agreement,
 * evidence, or AI-judge stages.
 */
export interface QuickRiskInput {
  /** Percentage (0-100) of agreement requirements covered by submitted evidence */
  evidenceCoveragePercent: number;
  /** Quality score (0-100) of the submitted evidence, however the caller derives it */
  evidenceQualityScore: number;
  /** Optional: an external reputation/trust score (0-100) for the counterparty, if the caller has one */
  counterpartyTrustScore?: number;
}

/**
 * Standalone risk check — usable by any agent pipeline, not just AESS.
 *
 * This is the same scoring logic as `assessRisk` in riskEngine.ts, exposed
 * with a decoupled signature so it can be reused as an independent Skill
 * primitive. A different agent's pipeline (one that has its own evidence
 * model, its own AI judge, or none at all) can still call this directly:
 *
 *   import { quickRiskCheck } from 'aess-skill/verification/quickRiskCheck';
 *
 *   const risk = quickRiskCheck({
 *     evidenceCoveragePercent: 65,
 *     evidenceQualityScore: 80,
 *   });
 *   // → { overallRiskScore: 25, riskLevel: 'MEDIUM', ... }
 *
 * If you're already inside the full AESS pipeline (you have a
 * VerificationResult, EvidenceQualityReport, and ArbitrationReport), use
 * `assessRisk` in riskEngine.ts instead — it factors in arbitration and
 * agreement context that this standalone version intentionally omits to stay
 * dependency-free.
 */
export const quickRiskCheck = (input: QuickRiskInput): RiskAssessment => {
  const factors: RiskFactor[] = [];

  if (input.evidenceCoveragePercent < 80) factors.push(RiskFactor.LOW_COVERAGE);
  if (input.evidenceQualityScore < 70) factors.push(RiskFactor.LOW_EVIDENCE);
  if (input.counterpartyTrustScore !== undefined && input.counterpartyTrustScore < 50) {
    factors.push(RiskFactor.LOW_REPUTATION);
  }

  const score = Math.max(0, Math.min(100, factors.length * 25));

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

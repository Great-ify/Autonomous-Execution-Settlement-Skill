import { describe, it, expect } from 'vitest';
import { quickRiskCheck } from './quickRiskCheck';

describe('quickRiskCheck (standalone reusable primitive)', () => {
  it('returns LOW risk with high coverage and quality, no other AESS objects required', () => {
    const result = quickRiskCheck({ evidenceCoveragePercent: 95, evidenceQualityScore: 90 });
    expect(result.riskLevel).toBe('LOW');
    expect(result.riskFactors).toHaveLength(0);
    expect(result.recommendation).toBe('Proceed');
  });

  it('flags LOW_COVERAGE when coverage is below 80%, independent of any pipeline object', () => {
    const result = quickRiskCheck({ evidenceCoveragePercent: 50, evidenceQualityScore: 90 });
    expect(result.riskFactors).toContain('LOW_COVERAGE');
    // one risk factor -> score 25, which is at (not above) the MEDIUM threshold
    expect(result.riskLevel).toBe('LOW');
  });

  it('flags LOW_EVIDENCE when quality is below 70', () => {
    const result = quickRiskCheck({ evidenceCoveragePercent: 95, evidenceQualityScore: 50 });
    expect(result.riskFactors).toContain('LOW_EVIDENCE');
  });

  it('escalates to MEDIUM risk when two factors are present', () => {
    const result = quickRiskCheck({ evidenceCoveragePercent: 50, evidenceQualityScore: 50 });
    expect(result.riskFactors).toHaveLength(2);
    expect(result.riskLevel).toBe('MEDIUM');
  });

  it('factors in an optional counterparty trust score from an external reputation source', () => {
    const result = quickRiskCheck({
      evidenceCoveragePercent: 95,
      evidenceQualityScore: 90,
      counterpartyTrustScore: 30,
    });
    expect(result.riskFactors).toContain('LOW_REPUTATION');
  });

  it('omits LOW_REPUTATION entirely when no trust score is supplied', () => {
    const result = quickRiskCheck({ evidenceCoveragePercent: 95, evidenceQualityScore: 90 });
    expect(result.riskFactors).not.toContain('LOW_REPUTATION');
  });
});

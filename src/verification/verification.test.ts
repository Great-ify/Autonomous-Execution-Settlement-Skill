import { describe, it, expect } from 'vitest';
import { verifyRules } from './ruleEngine';
import { verifyEvidence } from './evidenceVerifier';
import { Agreement } from '../types/agreement.types';
import { EvidenceManifest } from '../types/evidence.types';

const mockAgreement: Agreement = {
  id: 'a1',
  payerAgent: 'p1',
  workerAgent: 'w1',
  taskDescription: 'task 1',
  paymentAmount: 100,
  status: 'ACTIVE' as any,
  paymentStatus: 'pending',
  createdAt: new Date(),
  updatedAt: new Date(),
  requirements: [
    { id: 'r1', description: 'Complete subtask 1' },
    { id: 'r2', description: 'Complete subtask 2' },
  ],
};

describe('Verification Engines', () => {
  it('should pass if all requirements are covered', async () => {
    const manifest: EvidenceManifest = {
      items: [
        { requirementId: 'r1', evidenceType: 'text', artifactReference: 'a1', hash: '87440375a065537554900a89d7fa668e1694f4848039e6a0d4239853a5c102a9' },
        { requirementId: 'r2', evidenceType: 'text', artifactReference: 'a2', hash: '87440375a065537554900a89d7fa668e1694f4848039e6a0d4239853a5c102a9' },
      ],
    };

    const ruleResult = await verifyRules(mockAgreement, manifest);
    const evidenceResult = await verifyEvidence(mockAgreement, manifest);

    expect(ruleResult.passed).toBe(true);
    expect(ruleResult.score).toBe(100);
    expect(evidenceResult.evidenceScore).toBe(100);
  });

  it('should fail if requirement is missing', async () => {
    const manifest: EvidenceManifest = {
      items: [
        { requirementId: 'r1', evidenceType: 'text', artifactReference: 'a1', hash: '87440375a065537554900a89d7fa668e1694f4848039e6a0d4239853a5c102a9' },
      ],
    };

    const ruleResult = await verifyRules(mockAgreement, manifest);
    const evidenceResult = await verifyEvidence(mockAgreement, manifest);

    expect(ruleResult.passed).toBe(false);
    expect(ruleResult.score).toBe(50);
    expect(evidenceResult.evidenceScore).toBe(50);
    expect(evidenceResult.missingEvidence).toContain('r2');
  });

  it('should flag orphaned evidence', async () => {
    const manifest: EvidenceManifest = {
      items: [
        { requirementId: 'r1', evidenceType: 'text', artifactReference: 'a1', hash: '87440375a065537554900a89d7fa668e1694f4848039e6a0d4239853a5c102a9' },
        { requirementId: 'r2', evidenceType: 'text', artifactReference: 'a2', hash: '87440375a065537554900a89d7fa668e1694f4848039e6a0d4239853a5c102a9' },
        { requirementId: 'r3', evidenceType: 'text', artifactReference: 'a3', hash: '87440375a065537554900a89d7fa668e1694f4848039e6a0d4239853a5c102a9' },
      ],
    };

    const evidenceResult = await verifyEvidence(mockAgreement, manifest);

    expect(evidenceResult.findings.some(f => f.includes('Orphaned'))).toBe(true);
    expect(evidenceResult.orphanedEvidence).toContain('a3');
  });
  
  it('should handle duplicate evidence / invalid artifacts', async () => {
    const manifest: EvidenceManifest = {
        items: [
          { requirementId: 'r1', evidenceType: 'text', artifactReference: 'a1', hash: '87440375a065537554900a89d7fa668e1694f4848039e6a0d4239853a5c102a9' },
          { requirementId: 'r1', evidenceType: 'text', artifactReference: 'a1', hash: '87440375a065537554900a89d7fa668e1694f4848039e6a0d4239853a5c102a9' },
          { requirementId: 'r2', evidenceType: 'text', artifactReference: '', hash: '87440375a065537554900a89d7fa668e1694f4848039e6a0d4239853a5c102a9' }
        ],
      };
      
      const evidenceResult = await verifyEvidence(mockAgreement, manifest);
      expect(evidenceResult.findings.some(f => f.includes('Invalid evidence'))).toBe(true);
  });

  it('should invalidate incorrect hash', async () => {
    const manifest: EvidenceManifest = {
        items: [
          { requirementId: 'r1', evidenceType: 'text', artifactReference: 'a1', hash: 'invalid-hash' },
          { requirementId: 'r2', evidenceType: 'text', artifactReference: 'a2', hash: '87440375a065537554900a89d7fa668e1694f4848039e6a0d4239853a5c102a9' },
        ],
      };
      
      const evidenceResult = await verifyEvidence(mockAgreement, manifest);
      expect(evidenceResult.findings.some(f => f.includes('Invalid hash'))).toBe(true);
      expect(evidenceResult.verifiedArtifacts).not.toContain('a1');
      expect(evidenceResult.verifiedArtifacts).toContain('a2');
  });
});
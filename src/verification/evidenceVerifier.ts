import { Agreement } from '../types/agreement.types';
import { EvidenceManifest } from '../types/evidence.types';
import { EvidenceVerificationResult } from '../types/verification.types';
import { isValidHash } from '../utils/crypto';

export const verifyEvidence = async (agreement: Agreement, manifest: EvidenceManifest): Promise<EvidenceVerificationResult> => {
  const requirementIds = new Set(agreement.requirements.map(r => r.id));
  const findings: string[] = [];
  const missingEvidence: string[] = [];
  const verifiedArtifacts: string[] = [];
  const orphanedEvidence: string[] = [];

  // Validate items
  for (const item of manifest.items) {
    // 1. Verify existence in agreement
    if (!requirementIds.has(item.requirementId)) {
        findings.push(`Orphaned evidence item found for requirement: ${item.requirementId}`);
        orphanedEvidence.push(item.artifactReference);
        continue;
    }

    // 2. Validate metadata / artifact
    if (!item.artifactReference) {
        findings.push(`Invalid evidence: missing artifact reference for ${item.requirementId}`);
        continue;
    }

    // Check hash
    if (!isValidHash(item.hash)) { 
        findings.push(`Invalid hash format for ${item.requirementId}`); 
        continue; 
    }

    verifiedArtifacts.push(item.artifactReference);
  }

  // Check for missing evidence
  for (const req of agreement.requirements) {
    const hasEvidence = manifest.items.some(item => item.requirementId === req.id);
    if (!hasEvidence) {
      missingEvidence.push(req.id);
      findings.push(`Requirement ${req.id} is missing evidence`);
    }
  }

  const coverage = agreement.requirements.length > 0 
    ? ((agreement.requirements.length - missingEvidence.length) / agreement.requirements.length) * 100 
    : 100;
  
  // Quality score based on coverage + completeness
  const evidenceScore = coverage;

  return {
    evidenceScore,
    coveragePercentage: coverage,
    missingEvidence,
    findings,
    verifiedArtifacts,
    orphanedEvidence
  };
};

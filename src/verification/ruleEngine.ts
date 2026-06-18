import { Agreement } from '../types/agreement.types';
import { EvidenceManifest } from '../types/evidence.types';
import { RuleVerificationResult, RequirementEvaluationResult } from '../types/verification.types';

export const verifyRules = async (agreement: Agreement, evidence: EvidenceManifest): Promise<RuleVerificationResult> => {
  const requirements = agreement.requirements;
  const coveredRequirementIds = new Set(evidence.items.map(i => i.requirementId));
  
  const requirementResults: RequirementEvaluationResult[] = [];
  const passedRequirements: string[] = [];
  const failedRequirements: string[] = [];
  const findings: string[] = [];
  
  for (const req of requirements) {
    const isCovered = coveredRequirementIds.has(req.id);
    const status = isCovered ? 'PASS' : 'FAIL';
    
    if (isCovered) {
      passedRequirements.push(req.id);
    } else {
      failedRequirements.push(req.id);
      findings.push(`Requirement ${req.id} ("${req.description}") not satisfied`);
    }
    
    requirementResults.push({
      requirementId: req.id,
      status,
      score: isCovered ? 100 : 0,
      findings: isCovered ? [] : [`No evidence found for ${req.id}`],
      missingElements: isCovered ? [] : [req.id],
    });
  }
  
  const score = requirements.length > 0 ? (passedRequirements.length / requirements.length) * 100 : 0;
  const passed = passedRequirements.length === requirements.length;
  
  return {
    passed,
    score,
    findings,
    requirementResults,
    passedRequirements,
    failedRequirements,
  };
};
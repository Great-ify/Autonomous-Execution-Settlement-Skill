import { AgreementState } from '../state-machine/agreementState';

export enum VerificationMethod {
  RULE_BASED = 'RULE_BASED',
  AI_JUDGE = 'AI_JUDGE',
  HYBRID = 'HYBRID',
}

export interface RuleVerificationResult {
  passed: boolean;
  score: number;
  findings: string[];
  requirementResults: RequirementEvaluationResult[];
  passedRequirements: string[];
  failedRequirements: string[];
}

export interface EvidenceVerificationResult {
  evidenceScore: number;
  coveragePercentage: number;
  missingEvidence: string[];
  findings: string[];
  verifiedArtifacts: string[];
  orphanedEvidence: string[];
}

export interface AIVerificationResult {
  approved: boolean;
  confidenceScore: number;
  reasoning: string;
  providerId: string;
  verificationMethod: VerificationMethod;
}

export interface VerificationResult {
  verificationId: string;
  agreementId: string;
  approved: boolean;
  confidenceScore: number;
  verificationMethod: VerificationMethod;
  providerId: string;
  ruleScore: number;
  evidenceScore: number;
  aiScore: number;
  evidenceCoverage: number;
  findings: string[];
  verifiedAt: Date;
  
  // Hardening fields
  consistencyRating: number;
  requirementCoverage: number;
  verifiedRequirements: string[];
  failedRequirements: string[];
  decisionStrategyUsed: string;
  integrityHash: string;
}

export interface DecisionStrategy {
  decide(ruleScore: number, evidenceScore: number, aiScore: number, coverage: number): { approved: boolean; confidenceScore: number };
}

export interface RequirementEvaluationResult {
  requirementId: string;
  status: 'PASS' | 'FAIL' | 'PARTIAL';
  score: number;
  findings: string[];
  missingElements: string[];
}

export interface EvidenceQualityReport {
  qualityScore: number;
  missingEvidence: string[];
  invalidEvidence: string[];
  findings: string[];
}

export interface CoverageReport {
  coveragePercentage: number;
}

export interface StructuredAIAnalysis {
  score: number;
  findings: string[];
  confidence: number;
  weaknesses: string[];
  strengths: string[];
}

export interface ChallengeReport {
  missingRequirements: string[];
  contradictions: string[];
  weakEvidence: string[];
  unsupportedClaims: string[];
}

export interface ArbitrationReport {
  agreementLevel: string;
  disagreementLevel: string;
  challengeSeverity: string;
  arbitrationScore: number;
}

export enum RiskFlag {
  LOW_EVIDENCE = 'LOW_EVIDENCE',
  LOW_COVERAGE = 'LOW_COVERAGE',
  MISSING_REQUIREMENT = 'MISSING_REQUIREMENT',
  AI_DISAGREEMENT = 'AI_DISAGREEMENT',
  INCONSISTENT_RESULTS = 'INCONSISTENT_RESULTS',
  SUSPICIOUS_SUBMISSION = 'SUSPICIOUS_SUBMISSION',
}

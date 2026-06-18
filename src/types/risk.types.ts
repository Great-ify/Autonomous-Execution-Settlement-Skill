export enum RiskLevel {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export enum RiskFactor {
  LOW_EVIDENCE = 'LOW_EVIDENCE',
  LOW_COVERAGE = 'LOW_COVERAGE',
  MISSING_REQUIREMENTS = 'MISSING_REQUIREMENTS',
  AI_DISAGREEMENT = 'AI_DISAGREEMENT',
  HIGH_CHALLENGE_SCORE = 'HIGH_CHALLENGE_SCORE',
  INCONSISTENT_RESULTS = 'INCONSISTENT_RESULTS',
  LOW_REPUTATION = 'LOW_REPUTATION',
  HIGH_VALUE_AGREEMENT = 'HIGH_VALUE_AGREEMENT',
  FREQUENT_DISPUTES = 'FREQUENT_DISPUTES',
  SUSPICIOUS_PATTERN = 'SUSPICIOUS_PATTERN',
}

export interface RiskAssessment {
  overallRiskScore: number;
  riskLevel: RiskLevel;
  riskFactors: RiskFactor[];
  confidenceAdjustment: number;
  recommendation: string;
}

export interface AgentReputation {
  completedAgreements: number;
  failedAgreements: number;
  disputedAgreements: number;
  escalatedAgreements: number;
  successRate: number;
  trustScore: number;
}

export enum DecisionOutcome {
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  ESCALATED = 'ESCALATED',
  REQUIRES_REVIEW = 'REQUIRES_REVIEW',
}

export interface DecisionRecord {
  decisionId: string;
  verificationId: string;
  riskAssessment: RiskAssessment;
  decisionOutcome: DecisionOutcome;
  rationale: string;
  timestamp: Date;
  integrityHash: string;
}

export interface EvidenceItem {
  requirementId: string;
  evidenceType: string;
  artifactReference: string;
  hash: string;
}

export interface EvidenceManifest {
  items: EvidenceItem[];
}

export interface EvidenceCoverageReport {
  totalRequirements: number;
  coveredRequirements: number;
  coveragePercentage: number;
}

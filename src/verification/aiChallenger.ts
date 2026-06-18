import { ChallengeReport } from '../types/verification.types';

export const challengeSubmission = async (agreement: any, submission: any): Promise<ChallengeReport> => {
  return {
    missingRequirements: [],
    contradictions: [],
    weakEvidence: [],
    unsupportedClaims: [],
  };
};

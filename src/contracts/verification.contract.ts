import { VerificationResult } from '../types/verification.types';

export interface VerificationProvider {
  verifySubmission(agreementId: string, submissionData: any): Promise<VerificationResult>;
}

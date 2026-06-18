import { ArbitrationReport } from '../types/verification.types';

export const arbitrate = (
  ruleScore: number,
  evidenceScore: number,
  aiScore: number,
  challengeSeverity: string
): ArbitrationReport => {
  return {
    agreementLevel: 'HIGH',
    disagreementLevel: 'LOW',
    challengeSeverity,
    arbitrationScore: 90,
  };
};

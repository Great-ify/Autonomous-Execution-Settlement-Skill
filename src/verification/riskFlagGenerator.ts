import { RiskFlag } from '../types/verification.types';

export const generateRiskFlags = (results: any): RiskFlag[] => {
  const flags: RiskFlag[] = [];
  // Example logic
  if (results.coverage < 80) flags.push(RiskFlag.LOW_COVERAGE);
  return flags;
};

import { DecisionStrategy } from '../types/verification.types';

export const ThresholdDecisionStrategy: DecisionStrategy = {
  decide: (ruleScore, evidenceScore, aiScore, coverage) => {
    const confidenceScore = (ruleScore * 0.3) + (evidenceScore * 0.3) + (aiScore * 0.4);
    const approved = coverage >= 0.8 && confidenceScore >= 80;
    return { approved, confidenceScore: confidenceScore / 100 };
  }
};

export const decide = (
  strategy: DecisionStrategy,
  ruleScore: number,
  evidenceScore: number,
  aiScore: number,
  coverage: number
) => {
  return strategy.decide(ruleScore, evidenceScore, aiScore, coverage);
};

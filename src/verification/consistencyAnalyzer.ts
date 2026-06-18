export const analyzeConsistency = (ruleScore: number, evidenceScore: number, aiScore: number): number => {
  const scores = [ruleScore, evidenceScore, aiScore];
  const max = Math.max(...scores);
  const min = Math.min(...scores);
  const variance = max - min;
  
  // Rating 0 to 1, where 1 is perfectly consistent
  return Math.max(0, 1 - (variance / 100));
};

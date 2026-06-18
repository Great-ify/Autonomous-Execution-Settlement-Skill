

export async function judgeWithAI() {
  console.log("Using mock AI judge (always approves)");
  return {
    score: 95,
    confidence: 0.9,
    decision: 'APPROVED',
    reasoning: 'Mock approval for testing',
    requirementsMet: true
  };
}
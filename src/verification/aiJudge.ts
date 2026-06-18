import { StructuredAIAnalysis } from '../types/verification.types';
import { ai } from '../utils/gemini';
import { Type } from '@google/genai';

export const judgeWithAI = async (agreement: any, submission: any): Promise<StructuredAIAnalysis> => {
  const prompt = `Analyze this agreement and submission and provide a risk assessment:
Agreement: ${JSON.stringify(agreement)}
Submission: ${JSON.stringify(submission)}`;

  const response = await ai.models.generateContent({
    model: "gemini-3.5-flash",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          score: { type: Type.NUMBER, description: "A score from 0 to 1 representing the quality/validity." },
          findings: { type: Type.ARRAY, items: { type: Type.STRING } },
          confidence: { type: Type.NUMBER, description: "A score from 0 to 1 representing confidence." },
          weaknesses: { type: Type.ARRAY, items: { type: Type.STRING } },
          strengths: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
        required: ["score", "findings", "confidence", "weaknesses", "strengths"],
      },
    },
  });

  if (!response.text) {
      throw new Error("No response from AI Judge");
  }

  return JSON.parse(response.text) as StructuredAIAnalysis;
};

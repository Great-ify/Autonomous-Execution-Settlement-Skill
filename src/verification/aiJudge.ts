import { StructuredAIAnalysis } from "../types/verification.types";
import { ai } from "../utils/gemini";
import { Type } from "@google/genai";

// Rotate through these available free models to handle intermittent 503s
// const MODELS = ["gemini-flash-latest", "gemini-1.5-flash", "gemini-1.5-pro"];
// Use only models supported in your environment
const MODELS = ["gemini-flash-latest"];
const TIMEOUT_MS = 60_000;
// Increased retries to allow for more rotation attempts
const MAX_RETRIES = 5;

/**
 * Judges a work submission against an agreement using Gemini.
 */
export const judgeWithAI = async (
  agreement: any,
  submission: any,
): Promise<StructuredAIAnalysis> => {
  const requirements: { id: string; description: string }[] = Array.isArray(
    agreement.requirements,
  )
    ? agreement.requirements
    : [];

  const requirementBlock =
    requirements.length > 0
      ? requirements.map((r) => `  - [${r.id}] ${r.description}`).join("\n")
      : "  (no explicit requirements defined)";

  const evidenceBlock = (() => {
    const items = submission?.items ?? submission?.payload?.items ?? [];
    if (!Array.isArray(items) || items.length === 0)
      return "  (no evidence items submitted)";
    return items
      .map(
        (item: any) =>
          `  - req: ${item.requirementId ?? "unknown"} | type: ${
            item.evidenceType ?? "unknown"
          } | desc: ${item.description ?? item.artifactReference ?? "—"}`,
      )
      .join("\n");
  })();

  const prompt = `You are an autonomous verification judge in the AESS (Autonomous Escrow Settlement System). Your role is to assess whether a worker agent has genuinely fulfilled the terms of a digital agreement.

## Agreement
Task: ${agreement.taskDescription ?? "N/A"}
Payment: ${agreement.paymentAmount ?? "N/A"} ETH
Payer agent: ${agreement.payerAgent ?? "N/A"}
Worker agent: ${agreement.workerAgent ?? "N/A"}

## Requirements
${requirementBlock}

## Submitted Evidence
${evidenceBlock}

## Your job
1. Evaluate whether the submitted evidence plausibly satisfies each requirement.
2. Identify specific strengths in the submission.
3. Identify specific weaknesses or gaps.
4. Produce a quality score (0.0 = completely unacceptable, 1.0 = fully satisfies all requirements).
5. Express your confidence in this score (0.0 = very uncertain, 1.0 = completely certain).

Be concise. Each finding should be one sentence. Return ONLY the JSON object — no markdown, no preamble.`;

  let lastError: Error | undefined;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      // Cycle to the next model in the array based on attempt number
      const modelToUse = MODELS[attempt % MODELS.length];

      console.log(`Attempt ${attempt + 1}: Using model ${modelToUse}`);

      const response = await withTimeout(
        ai.models.generateContent({
          model: modelToUse,
          contents: prompt,
          config: {
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                score: {
                  type: Type.NUMBER,
                  description: "Overall quality score 0.0 – 1.0",
                },
                confidence: {
                  type: Type.NUMBER,
                  description: "Confidence in the score 0.0 – 1.0",
                },
                findings: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description:
                    "Per-requirement assessment findings (one sentence each)",
                },
                strengths: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "Specific strengths observed in the submission",
                },
                weaknesses: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "Specific gaps or weaknesses in the submission",
                },
              },
              required: [
                "score",
                "confidence",
                "findings",
                "strengths",
                "weaknesses",
              ],
            },
          },
        }),
        TIMEOUT_MS,
      );

      if (!response.text) {
        throw new Error("Gemini returned an empty response");
      }

      const parsed = JSON.parse(response.text) as StructuredAIAnalysis;

      // Clamp values to valid range
      parsed.score = clamp(parsed.score, 0, 1);
      parsed.confidence = clamp(parsed.confidence, 0, 1);

      return parsed;
    } catch (err: any) {
      lastError = err;

      const isRetryable =
        err?.message?.includes("503") ||
        err?.message?.includes("timeout") ||
        err?.message?.includes("overloaded") ||
        err?.name === "AbortError";

      if (!isRetryable || attempt === MAX_RETRIES) break;

      // Exponential backoff with jitter
      const baseDelay = 2000;
      const delay = Math.min(
        Math.pow(2, attempt) * baseDelay + Math.random() * 1000,
        15000,
      );

      console.warn(
        `Gemini API Error. Retrying in ${Math.round(delay)}ms... (Attempt ${
          attempt + 1
        }/${MAX_RETRIES})`,
      );
      await sleep(delay);
    }
  }

  throw new Error(
    `AI Judge failed after ${MAX_RETRIES + 1} attempt(s): ${
      lastError?.message
    }`,
  );
};

// ─── Internal helpers ─────────────────────────────────────────────────────────

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(
        () => reject(new Error(`AI Judge timed out after ${ms}ms`)),
        ms,
      ),
    ),
  ]);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

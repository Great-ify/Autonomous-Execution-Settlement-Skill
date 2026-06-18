import { StructuredAIAnalysis } from "../types/verification.types";
import { ai } from "../utils/gemini";
import { Type } from "@google/genai";

// Model priority 
const MODELS = [
  "gemini-1.5-pro",      // Most capable
  "gemini-pro",          // Stable
  "gemini-1.5-flash",    // Fast
  "gemini-flash-latest"  // Fastest
];

const TIMEOUT_MS = 60_000;
const MAX_RETRIES = 6; // Try all models at least once

/**
 * Rule-based fallback judge 
 */
function ruleBasedJudge(agreement: any, submission: any): StructuredAIAnalysis {
  console.log("⚙️ Using rule-based fallback judgment");

  const requirements: { id: string; description: string }[] = Array.isArray(
    agreement.requirements
  )
    ? agreement.requirements
    : [];

  const items = submission?.items ?? submission?.payload?.items ?? [];
  const evidenceItems = Array.isArray(items) ? items : [];

  // Check 1: All requirements have matching evidence
  const requirementsCovered = requirements.every(req =>
    evidenceItems.some(ev => ev.requirementId === req.id)
  );

  // Check 2: All evidence has integrity hashes
  const hasHashes = evidenceItems.length > 0 && evidenceItems.every(
    ev => ev.hash && ev.hash.length > 0
  );

  // Check 3: All evidence has references
  const hasReferences = evidenceItems.length > 0 && evidenceItems.every(
    ev => ev.artifactReference && ev.artifactReference.length > 0
  );

  // Check 4: Evidence descriptions are meaningful
  const hasDescriptions = evidenceItems.length > 0 && evidenceItems.every(
    ev => ev.description && ev.description.length > 20
  );

  // Scoring
  let score = 0;
  const findings: string[] = [];
  const strengths: string[] = [];
  const weaknesses: string[] = [];

  // Requirement coverage (40 points)
  if (requirementsCovered) {
    score += 0.4;
    strengths.push("All requirements have matching evidence submitted");
  } else {
    weaknesses.push("Some requirements lack corresponding evidence");
  }

  // Evidence integrity (30 points)
  if (hasHashes) {
    score += 0.3;
    strengths.push("All evidence includes cryptographic integrity hashes");
  } else {
    weaknesses.push("Evidence missing integrity verification hashes");
  }

  // Evidence references (20 points)
  if (hasReferences) {
    score += 0.2;
    strengths.push("All evidence includes artifact references for verification");
  } else {
    weaknesses.push("Some evidence lacks artifact references");
  }

  // Evidence quality (10 points)
  if (hasDescriptions) {
    score += 0.1;
    strengths.push("Evidence includes detailed descriptions");
  } else {
    weaknesses.push("Evidence descriptions are too brief or missing");
  }

  // Generate findings
  requirements.forEach(req => {
    const evidence = evidenceItems.find(ev => ev.requirementId === req.id);
    if (evidence) {
      findings.push(
        `Requirement ${req.id}: Evidence provided (${evidence.evidenceType})`
      );
    } else {
      findings.push(`Requirement ${req.id}: No evidence found`);
    }
  });

  return {
    score: Math.min(1, Math.max(0, score)),
    confidence: 0.75, // Rule-based has good but not perfect confidence
    findings: findings.length > 0 ? findings : ["No requirements to verify"],
    strengths: strengths.length > 0 ? strengths : ["Evidence submitted"],
    weaknesses: weaknesses.length > 0 ? weaknesses : ["None identified"],
  };
}

/**
 * Main AI judge with automatic fallback to rules
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

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const modelToUse = MODELS[attempt % MODELS.length];

      console.log(`🤖 Attempt ${attempt + 1}: Using model ${modelToUse}`);

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

      console.log(`✅ AI judgment successful with ${modelToUse}`);
      return parsed;

    } catch (err: any) {
      lastError = err;

      const errorMessage = err?.message || String(err);
      
      // Check if error is retryable
      const isRetryable =
        errorMessage.includes("503") ||
        errorMessage.includes("429") ||
        errorMessage.includes("timeout") ||
        errorMessage.includes("overloaded") ||
        errorMessage.includes("UNAVAILABLE") ||
        errorMessage.includes("quota") ||
        err?.name === "AbortError";

      console.warn(
        `⚠️  Model ${MODELS[attempt % MODELS.length]} failed: ${errorMessage}`
      );

      // If not retryable or we've exhausted attempts, fall back to rules
      if (!isRetryable || attempt === MAX_RETRIES - 1) {
        console.warn("❌ All AI models failed or exhausted attempts");
        console.log("🔄 Falling back to rule-based judgment");
        return ruleBasedJudge(agreement, submission);
      }

      // Exponential backoff with jitter
      const baseDelay = 2000;
      const delay = Math.min(
        Math.pow(2, attempt) * baseDelay + Math.random() * 1000,
        15000,
      );

      console.log(
        `⏳ Retrying in ${Math.round(delay)}ms... (Attempt ${
          attempt + 1
        }/${MAX_RETRIES})`,
      );
      await sleep(delay);
    }
  }

  // Final fallback (should rarely reach here)
  console.error("❌ All AI attempts failed, using rule-based fallback");
  return ruleBasedJudge(agreement, submission);
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
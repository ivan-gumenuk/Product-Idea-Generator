import type { IdeaFromLLM } from "@/types/idea";
import {
  IDEA_GENERATION_SYSTEM,
  IDEA_GENERATION_USER,
  LLM_CONFIG,
} from "@/config/prompts";
import OpenAI from "openai";
import { z } from "zod";

const ideaSchema = z.object({
  title: z.string(),
  pitch: z.string(),
  pain_insight: z.string(),
  target_audience: z.string(),
  score: z.number().min(0).max(100),
});

const responseSchema = z.array(ideaSchema);

export async function generateIdeasFromRawText(rawText: string): Promise<IdeaFromLLM[]> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not set");
  }

  const openai = new OpenAI({ apiKey });
  const userPrompt = IDEA_GENERATION_USER(rawText);

  const completion = await openai.chat.completions.create({
    model: LLM_CONFIG.model,
    temperature: LLM_CONFIG.temperature,
    max_tokens: LLM_CONFIG.maxTokens,
    messages: [
      { role: "system", content: IDEA_GENERATION_SYSTEM },
      { role: "user", content: userPrompt },
    ],
  });

  const content = completion.choices[0]?.message?.content?.trim();
  if (!content) {
    return [];
  }

  const parsed = parseJsonArray(content);
  const result = responseSchema.safeParse(parsed);
  if (!result.success) {
    throw new Error(`LLM response validation failed: ${result.error.message}`);
  }
  return result.data;
}

function parseJsonArray(raw: string): unknown {
  const trimmed = raw.replace(/^```\w*\n?|\n?```$/g, "").trim();
  const parsed = JSON.parse(trimmed) as unknown;
  if (!Array.isArray(parsed)) {
    throw new Error("Expected JSON array");
  }
  return parsed;
}

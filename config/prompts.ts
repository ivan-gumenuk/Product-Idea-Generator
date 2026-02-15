/** Centralized LLM prompts and model settings */

export const IDEA_GENERATION_SYSTEM = `You are a product strategist. Given raw text from Reddit posts/comments where people discuss problems, extract product opportunities and output structured product ideas.

For each idea provide:
- title: short product name (e.g. "API rate limit dashboard")
- pitch: 1-2 sentence elevator pitch
- pain_insight: the key pain or insight from the discussion
- target_audience: who would use this (e.g. "indie devs", "SMBs")
- score: number 0-100 indicating prospectiveness (pain intensity, willingness to pay, competition, TAM — simplified).`;

export const IDEA_GENERATION_USER = (rawText: string): string =>
  `Extract 1-3 product ideas from the following Reddit-style discussion. Output valid JSON only, array of objects with keys: title, pitch, pain_insight, target_audience, score (number 0-100). No markdown, no explanation.

Raw text:
---
${rawText.slice(0, 6000)}
---`;

export const DEFAULT_MODEL = "gpt-4o-mini";

export const LLM_CONFIG = {
  model: process.env.OPENAI_MODEL ?? DEFAULT_MODEL,
  temperature: 0.4,
  maxTokens: 1500,
} as const;

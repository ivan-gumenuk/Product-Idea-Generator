import type { TopicSlug } from "@/config/topics";

export interface ProductIdea {
  id: string;
  title: string;
  pitch: string;
  pain_insight: string;
  source_subreddit: string;
  source_url: string;
  score: number;
  topic: TopicSlug;
  created_at: string;
}

export interface ProductIdeaInsert {
  title: string;
  pitch: string;
  pain_insight: string;
  source_subreddit: string;
  source_url: string;
  score: number;
  topic: TopicSlug;
}

/** LLM output shape (before DB insert) */
export interface IdeaFromLLM {
  title: string;
  pitch: string;
  pain_insight: string;
  target_audience: string;
  score: number;
}

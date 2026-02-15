import type { ProductIdea, ProductIdeaInsert } from "@/types/idea";
import type { TopicSlug } from "@/config/topics";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

export interface ListIdeasParams {
  topic?: TopicSlug;
  limit?: number;
  offset?: number;
}

export interface ListIdeasResult {
  data: ProductIdea[];
  total: number;
}

export async function listIdeas(params: ListIdeasParams = {}): Promise<ListIdeasResult> {
  const supabase = await createClient();
  const limit = Math.min(params.limit ?? DEFAULT_LIMIT, MAX_LIMIT);
  const offset = params.offset ?? 0;

  let query = supabase
    .from("product_ideas")
    .select("id, title, pitch, pain_insight, source_subreddit, source_url, score, topic, created_at", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (params.topic) {
    query = query.eq("topic", params.topic);
  }

  const { data, error, count } = await query;

  if (error) {
    throw new Error(`Failed to list ideas: ${error.message}`);
  }

  const ideas: ProductIdea[] = (data ?? []).map((row) => ({
    id: row.id,
    title: row.title,
    pitch: row.pitch,
    pain_insight: row.pain_insight,
    source_subreddit: row.source_subreddit,
    source_url: row.source_url,
    score: row.score,
    topic: row.topic as TopicSlug,
    created_at: row.created_at,
  }));

  return { data: ideas, total: count ?? 0 };
}

export async function insertIdeas(ideas: ProductIdeaInsert[]): Promise<void> {
  if (ideas.length === 0) return;
  const supabase = await createClient();
  const { error } = await supabase.from("product_ideas").insert(ideas);
  if (error) {
    throw new Error(`Failed to insert ideas: ${error.message}`);
  }
}

/** Use admin client for server-only inserts (e.g. cron). */
export async function insertIdeasWithAdmin(
  admin: SupabaseClient,
  ideas: ProductIdeaInsert[]
): Promise<void> {
  if (ideas.length === 0) return;
  const { error } = await admin.from("product_ideas").insert(ideas);
  if (error) {
    throw new Error(`Failed to insert ideas: ${error.message}`);
  }
}

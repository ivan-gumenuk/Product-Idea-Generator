import { isTopicSlug, type TopicSlug } from "@/config/topics";
import mockGeneratedIdeas from "@/data/mock-generated-ideas.json";
import mockPosts from "@/data/mock-reddit.json";
import { listIdeas } from "@/lib/repos/ideas";
import type { ProductIdea } from "@/types/idea";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const querySchema = z.object({
  topic: z.string().optional().refine((v) => !v || isTopicSlug(v), { message: "Invalid topic" }),
  limit: z.coerce.number().int().min(1).max(100).optional().default(20),
  offset: z.coerce.number().int().min(0).optional().default(0),
});

interface MockGeneratedIdea {
  topic: string;
  title: string;
  pitch: string;
  pain_insight: string;
  score: number;
}

interface MockPost {
  subreddit: string;
  url: string;
  topic: string;
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const parsed = querySchema.safeParse({
    topic: searchParams.get("topic") ?? undefined,
    limit: searchParams.get("limit") ?? undefined,
    offset: searchParams.get("offset") ?? undefined,
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: { code: "VALIDATION_ERROR", message: "Invalid query", details: parsed.error.flatten() } },
      { status: 400 }
    );
  }

  const { topic, limit, offset } = parsed.data;

  try {
    const result = await listIdeas({
      topic: topic as TopicSlug | undefined,
      limit,
      offset,
    });

    if (result.data.length === 0) {
      console.warn("No ideas found, falling back to mock ideas feed");
      const fallback = buildFallbackIdeas(topic as TopicSlug | undefined, limit, offset);
  
      return NextResponse.json({
        data: fallback.data,
        meta: {
          total: fallback.total,
          limit,
          offset,
          fallback: true,
        },
      });
    }

    return NextResponse.json({
      data: result.data,
      meta: { total: result.total, limit, offset },
    });
  } catch (err) {
    console.warn("Falling back to mock ideas feed:", err);
    const fallback = buildFallbackIdeas(topic as TopicSlug | undefined, limit, offset);

    return NextResponse.json({
      data: fallback.data,
      meta: {
        total: fallback.total,
        limit,
        offset,
        fallback: true,
      },
    });
  }
}

function buildFallbackIdeas(topic: TopicSlug | undefined, limit: number, offset: number): {
  data: ProductIdea[];
  total: number;
} {
  const ideas = mockGeneratedIdeas as MockGeneratedIdea[];
  const posts = mockPosts as MockPost[];

  const normalized = ideas
    .filter((idea) => (topic ? idea.topic === topic : true))
    .map((idea, index) => {
      const source = posts.find((post) => post.topic === idea.topic) ?? posts[0];
      return {
        id: `mock-${idea.topic}-${index}`,
        title: idea.title,
        pitch: idea.pitch,
        pain_insight: idea.pain_insight,
        source_subreddit: source?.subreddit ?? "mock",
        source_url: source?.url ?? "https://reddit.com",
        score: Math.min(100, Math.max(0, idea.score)),
        topic: (isTopicSlug(idea.topic) ? idea.topic : "other") as TopicSlug,
        created_at: new Date().toISOString(),
      } satisfies ProductIdea;
    });

  return {
    data: normalized.slice(offset, offset + limit),
    total: normalized.length,
  };
}

import type { ProductIdeaInsert } from "@/types/idea";
import type { TopicSlug } from "@/config/topics";
import { generateIdeasFromRawText } from "./idea-service";
import { isTopicSlug } from "@/config/topics";
import mockGeneratedIdeas from "@/data/mock-generated-ideas.json";

export interface MockPost {
  subreddit: string;
  title: string;
  body: string;
  url: string;
  topic: string;
}

interface MockGeneratedIdea {
  topic: string;
  title: string;
  pitch: string;
  pain_insight: string;
  score: number;
}

export async function generateIdeasFromMock(mockPosts: MockPost[]): Promise<ProductIdeaInsert[]> {
  const toInsert: ProductIdeaInsert[] = [];
  const useFallbackOnly = !process.env.OPENAI_API_KEY;

  for (const post of mockPosts) {
    const rawText = `${post.title}\n\n${post.body}`;
    const topic: TopicSlug = isTopicSlug(post.topic) ? post.topic : "other";
    const fallbackIdeas = pickFallbackIdeas(topic);

    if (useFallbackOnly) {
      toInsert.push(...mapFallbackToInsert(post, fallbackIdeas));
      continue;
    }

    try {
      const ideas = await generateIdeasFromRawText(rawText);
      if (ideas.length === 0) {
        toInsert.push(...mapFallbackToInsert(post, fallbackIdeas));
        continue;
      }

      for (const idea of ideas) {
        toInsert.push({
          title: idea.title,
          pitch: idea.pitch,
          pain_insight: idea.pain_insight,
          source_subreddit: post.subreddit,
          source_url: post.url,
          score: Math.min(100, Math.max(0, idea.score)),
          topic,
        });
      }
    } catch (err) {
      console.error(`Failed to generate ideas for r/${post.subreddit}:`, err);
      toInsert.push(...mapFallbackToInsert(post, fallbackIdeas));
    }
  }

  return toInsert;
}

function pickFallbackIdeas(topic: TopicSlug): MockGeneratedIdea[] {
  const typedIdeas = mockGeneratedIdeas as MockGeneratedIdea[];
  const byTopic = typedIdeas.filter((idea) => idea.topic === topic);
  if (byTopic.length > 0) {
    return byTopic;
  }
  return typedIdeas.filter((idea) => idea.topic === "other");
}

function mapFallbackToInsert(post: MockPost, ideas: MockGeneratedIdea[]): ProductIdeaInsert[] {
  return ideas.map((idea) => ({
    title: idea.title,
    pitch: idea.pitch,
    pain_insight: idea.pain_insight,
    source_subreddit: post.subreddit,
    source_url: post.url,
    score: Math.min(100, Math.max(0, idea.score)),
    topic: isTopicSlug(idea.topic) ? idea.topic : "other",
  }));
}

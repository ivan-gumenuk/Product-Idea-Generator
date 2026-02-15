import type { ProductIdeaInsert } from "@/types/idea";
import type { TopicSlug } from "@/config/topics";
import { generateIdeasFromRawText } from "./idea-service";
import { isTopicSlug } from "@/config/topics";

export interface MockPost {
  subreddit: string;
  title: string;
  body: string;
  url: string;
  topic: string;
}

export async function generateIdeasFromMock(mockPosts: MockPost[]): Promise<ProductIdeaInsert[]> {
  const toInsert: ProductIdeaInsert[] = [];

  for (const post of mockPosts) {
    const rawText = `${post.title}\n\n${post.body}`;
    const topic: TopicSlug = isTopicSlug(post.topic) ? post.topic : "other";

    try {
      const ideas = await generateIdeasFromRawText(rawText);
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
    }
  }

  return toInsert;
}

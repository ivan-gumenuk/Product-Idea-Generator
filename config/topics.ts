/** Topic slugs used for filters, DB, and UI */
export const TOPICS = [
  "devtools",
  "health",
  "education",
  "productivity",
  "finance",
  "other",
] as const;

export type TopicSlug = (typeof TOPICS)[number];

export const TOPIC_LABELS: Record<TopicSlug, string> = {
  devtools: "Dev Tools",
  health: "Health",
  education: "Education",
  productivity: "Productivity",
  finance: "Finance",
  other: "Other",
};

export function isTopicSlug(s: string): s is TopicSlug {
  return TOPICS.includes(s as TopicSlug);
}

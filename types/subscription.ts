import type { TopicSlug } from "@/config/topics";

export interface EmailSubscription {
  id: string;
  user_id: string;
  email: string;
  topic_filters: readonly TopicSlug[];
  unsubscribe_token: string;
  created_at: string;
  active: boolean;
}

export interface EmailSubscriptionInsert {
  user_id: string;
  email: string;
  topic_filters: readonly TopicSlug[];
  unsubscribe_token: string;
  active: boolean;
}

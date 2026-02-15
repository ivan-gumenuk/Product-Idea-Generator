import type { EmailSubscription, EmailSubscriptionInsert } from "@/types/subscription";
import type { TopicSlug } from "@/config/topics";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { randomUUID } from "crypto";

export async function getSubscriptionByUserId(userId: string): Promise<EmailSubscription | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("email_subscriptions")
    .select("id, user_id, email, topic_filters, unsubscribe_token, created_at, active")
    .eq("user_id", userId)
    .eq("active", true)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to get subscription: ${error.message}`);
  }
  if (!data) return null;

  return {
    id: data.id,
    user_id: data.user_id,
    email: data.email,
    topic_filters: (data.topic_filters ?? []) as readonly TopicSlug[],
    unsubscribe_token: data.unsubscribe_token,
    created_at: data.created_at,
    active: data.active,
  };
}

export async function upsertSubscription(
  userId: string,
  email: string,
  topicFilters: readonly TopicSlug[]
): Promise<EmailSubscription> {
  const supabase = await createClient();
  const existing = await getSubscriptionByUserId(userId);
  const token = existing?.unsubscribe_token ?? randomUUID();

  const row: EmailSubscriptionInsert = {
    user_id: userId,
    email,
    topic_filters: topicFilters,
    unsubscribe_token: token,
    active: true,
  };

  if (existing) {
    const { data, error } = await supabase
      .from("email_subscriptions")
      .update({
        email: row.email,
        topic_filters: [...row.topic_filters],
        active: true,
      })
      .eq("user_id", userId)
      .select("id, user_id, email, topic_filters, unsubscribe_token, created_at, active")
      .single();

    if (error) {
      throw new Error(`Failed to update subscription: ${error.message}`);
    }
    return {
      id: data.id,
      user_id: data.user_id,
      email: data.email,
      topic_filters: (data.topic_filters ?? []) as readonly TopicSlug[],
      unsubscribe_token: data.unsubscribe_token,
      created_at: data.created_at,
      active: data.active,
    };
  }

  const { data, error } = await supabase
    .from("email_subscriptions")
    .insert(row)
    .select("id, user_id, email, topic_filters, unsubscribe_token, created_at, active")
    .single();

  if (error) {
    throw new Error(`Failed to create subscription: ${error.message}`);
  }
  return {
    id: data.id,
    user_id: data.user_id,
    email: data.email,
    topic_filters: (data.topic_filters ?? []) as readonly TopicSlug[],
    unsubscribe_token: data.unsubscribe_token,
    created_at: data.created_at,
    active: data.active,
  };
}

/** Find subscription by unsubscribe token (use with admin client for public unsubscribe). */
export async function getSubscriptionByToken(
  admin: SupabaseClient,
  token: string
): Promise<EmailSubscription | null> {
  const { data, error } = await admin
    .from("email_subscriptions")
    .select("id, user_id, email, topic_filters, unsubscribe_token, created_at, active")
    .eq("unsubscribe_token", token)
    .maybeSingle();

  if (error || !data) return null;
  return {
    id: data.id,
    user_id: data.user_id,
    email: data.email,
    topic_filters: (data.topic_filters ?? []) as readonly TopicSlug[],
    unsubscribe_token: data.unsubscribe_token,
    created_at: data.created_at,
    active: data.active,
  };
}

/** Deactivate subscription by token (use with admin client). */
export async function deactivateByToken(
  admin: SupabaseClient,
  token: string
): Promise<boolean> {
  const { data, error } = await admin
    .from("email_subscriptions")
    .update({ active: false })
    .eq("unsubscribe_token", token)
    .select("id")
    .maybeSingle();

  return !error && data != null;
}

import { TOPIC_LABELS, TOPICS } from "@/config/topics";
import { SubscriptionForm } from "@/components/subscription-form";
import { getSubscriptionByUserId } from "@/lib/repos/subscriptions";
import { createClient } from "@/lib/supabase/server";

export default async function SubscriptionsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const subscription = user ? await getSubscriptionByUserId(user.id) : null;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Email subscriptions</h1>
      <p className="text-slate-600">
        Subscribe to a weekly digest of product ideas filtered by topic.
      </p>
      <SubscriptionForm
        defaultEmail={user?.email ?? ""}
        defaultTopics={subscription?.topic_filters ?? []}
        topics={TOPICS}
        labels={TOPIC_LABELS}
        isSubscribed={subscription != null}
      />
    </div>
  );
}

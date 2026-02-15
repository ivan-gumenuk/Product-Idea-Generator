import { TOPIC_LABELS, TOPICS } from "@/config/topics";
import { IdeasFeed } from "@/components/ideas-feed";
import { TopicFilter } from "@/components/topic-filter";
import { Suspense } from "react";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-slate-900">Recommendations</h1>
        <Suspense fallback={null}>
          <TopicFilter topics={TOPICS} labels={TOPIC_LABELS} />
        </Suspense>
      </div>
      <Suspense fallback={<div className="text-center py-12 text-slate-500">Loading…</div>}>
        <IdeasFeed />
      </Suspense>
    </div>
  );
}

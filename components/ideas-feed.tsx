"use client";

import type { ProductIdea } from "@/types/idea";
import { TOPIC_LABELS } from "@/config/topics";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

const NEW_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

function isNew(createdAt: string): boolean {
  return Date.now() - new Date(createdAt).getTime() < NEW_DAYS_MS;
}

function IdeaCard({ idea }: { idea: ProductIdea }) {
  const newBadge = isNew(idea.created_at);

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="text-lg font-semibold text-slate-900">{idea.title}</h2>
        {newBadge && (
          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800">
            New
          </span>
        )}
        <span className="rounded bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
          {TOPIC_LABELS[idea.topic]}
        </span>
      </div>
      <p className="mt-2 text-slate-600">{idea.pitch}</p>
      <p className="mt-1 text-sm text-slate-500">
        <strong>Pain:</strong> {idea.pain_insight}
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
        <span className="font-medium text-slate-700">Score: {idea.score}/100</span>
        <a
          href={idea.source_url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-slate-600 hover:text-slate-900 hover:underline"
        >
          {idea.source_subreddit}
        </a>
      </div>
    </article>
  );
}

export function IdeasFeed() {
  const searchParams = useSearchParams();
  const topic = searchParams.get("topic") ?? undefined;
  const [ideas, setIdeas] = useState<ProductIdea[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    const params = new URLSearchParams({ limit: "20", offset: "0" });
    if (topic) params.set("topic", topic);
    fetch(`/api/ideas?${params.toString()}`)
      .then(async (res) => {
        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body?.error?.message ?? "Failed to load ideas");
        }
        return res.json();
      })
      .then((json: { data: ProductIdea[]; meta: { total: number } }) => {
        setIdeas(json.data);
        setTotal(json.meta?.total ?? json.data.length);
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Error loading feed"))
      .finally(() => setLoading(false));
  }, [topic]);

  if (loading) {
    return (
      <div className="text-center py-12 text-slate-500">
        Loading recommendations…
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 px-4 py-3 text-red-800" role="alert">
        {error}
      </div>
    );
  }

  if (ideas.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-8 text-center text-slate-600">
        No ideas yet. Run the idea generator to populate the feed.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-slate-500">{total} idea(s)</p>
      <ul className="space-y-4">
        {ideas.map((idea) => (
          <li key={idea.id}>
            <IdeaCard idea={idea} />
          </li>
        ))}
      </ul>
    </div>
  );
}

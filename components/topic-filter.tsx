"use client";

import type { TopicSlug } from "@/config/topics";
import { useRouter, useSearchParams } from "next/navigation";

interface TopicFilterProps {
  topics: readonly TopicSlug[];
  labels: Record<TopicSlug, string>;
}

export function TopicFilter({ topics, labels }: TopicFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const current = searchParams.get("topic") ?? "all";

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const value = e.target.value;
    const params = new URLSearchParams(searchParams.toString());
    if (value === "all") {
      params.delete("topic");
    } else {
      params.set("topic", value);
    }
    router.push(`/dashboard?${params.toString()}`);
  }

  return (
    <label className="flex items-center gap-2 text-sm">
      <span className="text-slate-600">Topic:</span>
      <select
        value={current}
        onChange={handleChange}
        className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
      >
        <option value="all">All</option>
        {topics.map((t) => (
          <option key={t} value={t}>
            {labels[t]}
          </option>
        ))}
      </select>
    </label>
  );
}

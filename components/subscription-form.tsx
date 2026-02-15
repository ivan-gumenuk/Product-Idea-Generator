"use client";

import type { TopicSlug } from "@/config/topics";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface SubscriptionFormProps {
  defaultEmail: string;
  defaultTopics: readonly TopicSlug[];
  topics: readonly TopicSlug[];
  labels: Record<TopicSlug, string>;
  isSubscribed: boolean;
}

export function SubscriptionForm({
  defaultEmail,
  defaultTopics,
  topics,
  labels,
  isSubscribed,
}: SubscriptionFormProps) {
  const [email, setEmail] = useState(defaultEmail);
  const [selected, setSelected] = useState<Set<TopicSlug>>(
    new Set(defaultTopics)
  );
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const router = useRouter();

  function toggleTopic(t: TopicSlug) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(t)) next.delete(t);
      else next.add(t);
      return next;
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    if (selected.size === 0) {
      setMessage({ type: "err", text: "Select at least one topic." });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          topic_filters: Array.from(selected),
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setMessage({
          type: "err",
          text: json?.error?.message ?? "Subscription failed",
        });
        return;
      }
      setMessage({ type: "ok", text: "Subscription saved." });
    } catch {
      setMessage({ type: "err", text: "Request failed." });
    } finally {
      setLoading(false);
    }
  }

  async function handleUnsubscribe() {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/subscriptions/cancel", { method: "POST" });
      if (res.ok) {
        setMessage({ type: "ok", text: "You have been unsubscribed." });
        router.refresh();
      } else {
        const json = await res.json();
        setMessage({ type: "err", text: json?.error?.message ?? "Failed to unsubscribe" });
      }
    } catch {
      setMessage({ type: "err", text: "Request failed." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md space-y-4">
      {message && (
        <div
          className={`rounded-lg px-3 py-2 text-sm ${
            message.type === "ok" ? "bg-emerald-50 text-emerald-800" : "bg-red-50 text-red-800"
          }`}
          role="alert"
        >
          {message.text}
        </div>
      )}
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-slate-700">
          Email
        </label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 block w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500"
        />
      </div>
      <div>
        <span className="block text-sm font-medium text-slate-700">Topics</span>
        <p className="mt-1 text-xs text-slate-500">
          Select topics to include in your digest.
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          {topics.map((t) => (
            <label
              key={t}
              className="inline-flex cursor-pointer items-center rounded-full border border-slate-300 bg-white px-3 py-1.5 text-sm has-[:checked]:border-slate-700 has-[:checked]:bg-slate-100"
            >
              <input
                type="checkbox"
                checked={selected.has(t)}
                onChange={() => toggleTopic(t)}
                className="sr-only"
              />
              {labels[t]}
            </label>
          ))}
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
        >
          {loading ? "Saving…" : isSubscribed ? "Update subscription" : "Subscribe"}
        </button>
        {isSubscribed && (
          <button
            type="button"
            onClick={handleUnsubscribe}
            disabled={loading}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            Unsubscribe from digest
          </button>
        )}
      </div>
    </form>
  );
}

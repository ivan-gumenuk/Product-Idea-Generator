"use client";

import Link from "next/link";
import { useState } from "react";

export function UnsubscribeAction({ token }: { token: string }) {
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");

  async function handleClick() {
    setStatus("loading");
    try {
      const res = await fetch(`/api/unsubscribe?token=${encodeURIComponent(token)}`, {
        method: "POST",
      });
      const json = await res.json();
      if (res.ok && json?.data?.success) {
        setStatus("done");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <div className="space-y-4">
        <p className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          You have been unsubscribed.
        </p>
        <Link
          href="/"
          className="inline-block rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
        >
          Go home
        </Link>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="space-y-4">
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800">
          Something went wrong. The link may have expired.
        </p>
        <Link
          href="/"
          className="inline-block rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
        >
          Go home
        </Link>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={status === "loading"}
      className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
    >
      {status === "loading" ? "Unsubscribing…" : "Unsubscribe"}
    </button>
  );
}

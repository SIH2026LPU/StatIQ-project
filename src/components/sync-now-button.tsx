"use client";

import { useState } from "react";

export function SyncNowButton({ source }: { source?: string }) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function run() {
    setBusy(true);
    setMessage(null);
    try {
      const path = source
        ? `/api/admin/data-sources/${source}/sync`
        : "/api/admin/data-sources/all/sync";
      const response = await fetch(path, { method: "POST" });
      const body = await response.json();
      if (!response.ok) {
        setMessage(body.error?.message ?? "Sync failed. Sign in as admin.");
      } else {
        setMessage("Sync finished. Reload the page to see updated counts.");
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Sync failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={run}
        disabled={busy}
        className="rounded-sm bg-navy px-4 py-2 text-sm text-paper-2 disabled:opacity-50"
      >
        {busy ? "Syncing…" : source ? `Sync ${source}` : "Sync all"}
      </button>
      {message ? <p className="mt-2 text-sm text-ink-soft">{message}</p> : null}
    </div>
  );
}

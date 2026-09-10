"use client";

import { useEffect, useState } from "react";

export function OfflineIndicator() {
  const [online, setOnline] = useState(true);
  useEffect(() => {
    const sync = () => setOnline(navigator.onLine);
    sync();
    window.addEventListener("online", sync);
    window.addEventListener("offline", sync);
    return () => {
      window.removeEventListener("online", sync);
      window.removeEventListener("offline", sync);
    };
  }, []);
  if (online) return null;
  return (
    <p className="bg-amber-100 px-3 py-1 text-center text-xs text-amber-950">
      Offline — learner events queue locally and sync when the connection returns.
    </p>
  );
}

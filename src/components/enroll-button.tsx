"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

interface EnrollButtonProps {
  courseId: string;
  /**
   * Sunbird batchId — when provided, the enrollment request targets a specific
   * batch (courseId + batchId together), matching the real Sunbird API contract.
   * For non-iGOT courses this is omitted and the API falls back to courseId-only.
   */
  batchId?: string;
}

export function EnrollButton({ courseId, batchId }: EnrollButtonProps) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState(false);

  return (
    <button
      disabled={pending || done}
      className="w-full glow-button-secondary inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full font-label-caps text-xs font-bold tracking-widest disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      onClick={async () => {
        setPending(true);
        const response = await fetch("/api/enrollments", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          // Pass batchId alongside courseId so the API can call
          // enrollCourse(userId, courseId, batchId) as the Sunbird contract requires.
          body: JSON.stringify({ courseId, ...(batchId ? { batchId } : {}) }),
        });
        setPending(false);
        if (response.ok) {
          setDone(true);
          router.refresh();
        }
      }}
    >
      {pending && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {!pending && done && (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      )}
      {done ? "ENROLLED" : pending ? "ENROLLING..." : "ENROLL NOW"}
    </button>
  );
}

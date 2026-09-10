"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Check, ArrowRight } from "lucide-react";

interface EnrollButtonProps {
  courseId: string;
  /**
   * Sunbird batchId — when provided, the enrollment request targets a specific
   * batch (courseId + batchId together), matching the real Sunbird API contract.
   * For non-iGOT courses this is omitted and the API falls back to courseId-only.
   */
  batchId?: string;
  isEnrolled?: boolean;
}

export function EnrollButton({ courseId, batchId, isEnrolled = false }: EnrollButtonProps) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState(isEnrolled);

  useEffect(() => {
    if (isEnrolled) {
      setDone(true);
      return;
    }
    // Check localStorage cache to persist state seamlessly across fast reloads
    try {
      if (typeof window !== "undefined" && localStorage.getItem(`statiq_enrolled_${courseId}`) === "true") {
        setDone(true);
      }
    } catch {
      // Ignore localStorage errors
    }
  }, [isEnrolled, courseId]);

  if (done) {
    return (
      <button
        type="button"
        className="w-full bg-primary-container/15 hover:bg-primary-container/25 text-primary-container border border-primary-container/30 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full font-label-caps text-xs font-bold tracking-widest transition-all group"
        onClick={() => {
          router.push(`/learner/courses/${courseId}`);
        }}
        title="Click to access course materials"
      >
        <Check className="w-3.5 h-3.5 text-primary-container shrink-0" />
        <span>ENROLLED & ACTIVE</span>
        <ArrowRight className="w-3 h-3 text-primary-container opacity-0 -ml-1 group-hover:opacity-100 group-hover:ml-0 transition-all" />
      </button>
    );
  }

  return (
    <button
      disabled={pending}
      className="w-full glow-button-secondary inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full font-label-caps text-xs font-bold tracking-widest disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      onClick={async (e) => {
        e.preventDefault();
        e.stopPropagation();
        setPending(true);
        try {
          const response = await fetch("/api/enrollments", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ courseId, ...(batchId ? { batchId } : {}) }),
          });
          setPending(false);
          if (response.ok) {
            setDone(true);
            try {
              localStorage.setItem(`statiq_enrolled_${courseId}`, "true");
            } catch {}
            router.refresh();
          } else {
            console.error("Enrollment failed:", await response.text());
          }
        } catch (err) {
          setPending(false);
          console.error("Enrollment network error:", err);
        }
      }}
    >
      {pending && (
        <svg className="animate-spin -ml-1 mr-2 h-3.5 w-3.5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {pending ? "ENROLLING..." : "ENROLL NOW"}
    </button>
  );
}

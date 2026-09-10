"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ExternalLink, ArrowRight } from "lucide-react";
import type { SessionUser } from "@/types/domain";

interface SmartEnrollButtonProps {
  courseId: string;
  provider: string;
  sourceUrl?: string;
  session: SessionUser | null;
  isEnrolled?: boolean;
}

export function SmartEnrollButton({
  courseId,
  provider,
  sourceUrl,
  session,
  isEnrolled,
}: SmartEnrollButtonProps) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  // 1. Not logged in -> redirect to login with return path
  if (!session) {
    return (
      <button
        className="w-full glow-button text-black font-bold text-sm tracking-widest font-label-caps px-6 py-3.5 rounded-2xl shadow-lg flex items-center justify-center gap-2"
        onClick={() => {
          window.location.href = `/login?redirect=${encodeURIComponent(
            `/courses/${courseId}`
          )}`;
        }}
      >
        Sign in to Enroll
        <ArrowRight className="w-4 h-4" />
      </button>
    );
  }

  // 2. Already enrolled
  if (isEnrolled) {
    return (
      <button
        className="w-full bg-primary-container/20 text-primary-container font-bold text-sm tracking-widest font-label-caps px-6 py-3.5 rounded-2xl flex items-center justify-center gap-2 border border-primary-container/30 transition-all hover:bg-primary-container/30"
        onClick={() => router.push(`/learner/courses/${courseId}`)}
      >
        Continue Learning
        <ArrowRight className="w-4 h-4" />
      </button>
    );
  }

  // 3. Logged in, External Course (iGOT / NSSTA) -> Link out honestly
  if (provider === "igot" || provider === "nssta") {
    const providerName = provider === "igot" ? "iGOT" : "NSSTA";
    return (
      <a
        href={sourceUrl || "#"}
        target="_blank"
        rel="noreferrer"
        className="w-full glow-button-secondary text-primary-container font-bold text-sm tracking-widest font-label-caps px-6 py-3.5 rounded-2xl shadow-lg flex items-center justify-center gap-2"
      >
        Enroll on {providerName}
        <ExternalLink className="w-4 h-4" />
      </a>
    );
  }

  // 4. Logged in, Internal Course -> Real internal enrollment
  return (
    <button
      disabled={pending}
      className="w-full glow-button text-black font-bold text-sm tracking-widest font-label-caps px-6 py-3.5 rounded-2xl shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      onClick={async () => {
        setPending(true);
        const response = await fetch("/api/enrollments", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ courseId }),
        });
        
        if (response.ok) {
          // Navigate to the learner view of the course
          router.push(`/learner/courses/${courseId}`);
        } else {
          setPending(false);
          // Simple error handling for now
          alert("Failed to enroll. Please try again.");
        }
      }}
    >
      {pending ? (
        <>
          <span className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin" />
          ENROLLING...
        </>
      ) : (
        <>
          ENROLL NOW
          <ArrowRight className="w-4 h-4" />
        </>
      )}
    </button>
  );
}

"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Q = { id: string; prompt: string; options: string[]; difficulty: string };

export function QuizRunner({
  assessmentId,
  questions,
}: {
  assessmentId: string;
  questions: Q[];
}) {
  const router = useRouter();
  const ordered = useMemo(() => {
    const rank = { easy: 0, medium: 1, hard: 2 } as Record<string, number>;
    return [...questions].sort(
      (a, b) => (rank[a.difficulty] ?? 1) - (rank[b.difficulty] ?? 1),
    );
  }, [questions]);
  const [index, setIndex] = useState(Math.min(1, ordered.length - 1));
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [result, setResult] = useState<{
    assessmentScore: number;
    oldScore: number;
    newScore: number;
    readiness: number;
    review: Array<{
      prompt: string;
      isCorrect: boolean;
      explanation: string;
      selectedIndex: number;
      correctIndex: number;
      options: string[];
    }>;
  } | null>(null);
  const [pending, setPending] = useState(false);

  const current = ordered[index];

  async function submit() {
    setPending(true);
    const payload = ordered.map((q) => ({
      questionId: q.id,
      selectedIndex: answers[q.id] ?? -1,
    }));
    const response = await fetch(`/api/assessments/${assessmentId}/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answers: payload }),
    });
    const data = await response.json();
    setPending(false);
    setResult(data);
    router.refresh();
  }

  if (result) {
    return (
      <div className="space-y-6 animate-fade-up">
        <div className="rounded-2xl p-6 bg-secondary-container/10 border border-secondary-container/30 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-secondary-container/30 bg-secondary-container/20 font-label-caps text-label-caps text-secondary-fixed-dim mb-4">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
            ASSESSMENT COMPLETE
          </div>
          <h2 className="font-display text-3xl font-bold text-on-surface mb-2">
            Assessment Score: <span className="text-primary-container">{result.assessmentScore.toFixed(0)}%</span>
          </h2>
          <p className="text-on-surface-variant text-lg">
            Competency improved: {result.oldScore.toFixed(0)} → <strong className="text-on-surface">{result.newScore.toFixed(0)}</strong>
          </p>
          <div className="mt-4 pt-4 border-t border-white/10 text-sm text-on-surface-variant">
            Target role readiness updated to <strong className="text-on-surface">{result.readiness.toFixed(0)}%</strong>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="font-display text-xl font-bold text-on-surface px-2">Detailed Review</h3>
          {result.review.map((item, i) => (
            <article key={i} className={`rounded-xl p-5 border ${item.isCorrect ? 'bg-primary-container/5 border-primary-container/20' : 'bg-error/5 border-error/20'}`}>
              <div className="flex gap-4">
                <div className={`mt-0.5 shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${item.isCorrect ? 'bg-primary-container/20 text-primary-container' : 'bg-error/20 text-error'}`}>
                  {item.isCorrect ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  )}
                </div>
                <div>
                  <p className="font-medium text-on-surface leading-relaxed">{item.prompt}</p>
                  <p className="mt-3 text-sm text-on-surface-variant leading-relaxed p-3 bg-surface-container rounded-lg border border-white/5">
                    <strong className="text-on-surface block mb-1">Explanation:</strong>
                    {item.explanation}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
        
        <div className="pt-6 flex justify-center">
          <button onClick={() => router.push('/learner')} className="glow-button-secondary px-8 py-3 rounded-full font-label-caps font-bold tracking-widest text-sm inline-flex items-center gap-2">
            RETURN TO DASHBOARD
          </button>
        </div>
      </div>
    );
  }

  if (!current) return <p className="mt-6">No published questions.</p>;

  return (
    <div className="max-w-3xl mx-auto animate-fade-up">
      <div className="flex items-center justify-between mb-8">
        <div className="flex gap-1">
          {ordered.map((_, i) => (
            <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === index ? 'w-8 bg-primary-container' : i < index ? 'w-4 bg-primary-container/40' : 'w-4 bg-surface-container-highest'}`} />
          ))}
        </div>
        <p className="text-xs font-label-caps tracking-widest text-on-surface-variant">
          QUESTION {index + 1} OF {ordered.length} · <span className="text-primary-container">{current.difficulty.toUpperCase()}</span>
        </p>
      </div>

      <h2 className="font-display text-2xl md:text-3xl text-on-surface font-bold leading-snug mb-8">
        {current.prompt}
      </h2>

      <div className="space-y-3 mb-10">
        {current.options.map((option, optionIndex) => {
          const isSelected = answers[current.id] === optionIndex;
          return (
            <label 
              key={option}
              className={`group flex items-start gap-4 p-4 md:p-5 rounded-2xl cursor-pointer transition-all border ${isSelected ? 'bg-primary-container/10 border-primary-container shadow-[0_0_15px_rgba(var(--primary-container),0.1)]' : 'bg-surface-container hover:bg-surface-container-high border-white/5 hover:border-white/20'}`}
            >
              <div className="pt-0.5 shrink-0">
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${isSelected ? 'border-primary-container' : 'border-on-surface-variant group-hover:border-on-surface'}`}>
                  {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-primary-container animate-in zoom-in" />}
                </div>
              </div>
              <input
                type="radio"
                name={current.id}
                className="hidden"
                checked={isSelected}
                onChange={() =>
                  setAnswers((prev) => ({ ...prev, [current.id]: optionIndex }))
                }
              />
              <span className={`text-sm md:text-base leading-relaxed transition-colors ${isSelected ? 'text-on-surface font-medium' : 'text-on-surface-variant group-hover:text-on-surface'}`}>
                {option}
              </span>
            </label>
          );
        })}
      </div>

      <div className="flex items-center justify-between pt-6 border-t border-white/5">
        <button
          className="glow-button-secondary px-6 py-2.5 rounded-full font-label-caps font-bold tracking-widest text-xs transition-all disabled:opacity-0 disabled:pointer-events-none"
          disabled={index === 0}
          onClick={() => setIndex((v) => Math.max(0, v - 1))}
        >
          PREVIOUS
        </button>

        {index < ordered.length - 1 ? (
          <button
            className="glow-button-secondary px-8 py-2.5 rounded-full font-label-caps font-bold tracking-widest text-xs disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            disabled={answers[current.id] === undefined}
            onClick={() => setIndex((v) => v + 1)}
          >
            NEXT QUESTION
          </button>
        ) : (
          <button
            disabled={pending || answers[current.id] === undefined}
            className="glow-button-secondary px-8 py-2.5 rounded-full font-label-caps font-bold tracking-widest text-xs inline-flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            onClick={submit}
          >
            {pending && (
              <svg className="animate-spin h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            )}
            {pending ? "SCORING..." : "SUBMIT ASSESSMENT"}
          </button>
        )}
      </div>
    </div>
  );
}

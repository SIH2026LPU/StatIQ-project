import { TutorChat } from "@/components/tutor-chat";
import { Sparkles } from "lucide-react";

export default function TutorPage() {
  return (
    <div className="space-y-6 animate-fade-up max-w-7xl mx-auto pb-12 w-full">
      <header className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/10 text-primary font-label-caps text-xs">
          <Sparkles className="w-3.5 h-3.5" />
          AI LEARNING INTELLIGENCE · ZERO FABRICATION
        </div>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-on-surface tracking-tight">
              AI Learning Tutor
            </h1>
            <p className="mt-2 text-base text-on-surface-variant max-w-3xl leading-relaxed">
              Your personalized learning assistant grounded in official MoSPI handbooks. 
              The tutor will retrieve verified excerpts and answer questions based solely on official documents.
            </p>
          </div>
        </div>
      </header>

      <div className="w-full">
        <TutorChat />
      </div>
    </div>
  );
}

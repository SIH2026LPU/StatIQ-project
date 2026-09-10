import { TutorChat } from "@/components/tutor-chat";
import { Bot, Sparkles } from "lucide-react";

export default function TutorPage() {
  return (
    <div className="space-y-8 animate-fade-up max-w-4xl mx-auto pb-12">
      <header className="space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/10 text-primary font-label-caps text-xs">
          <Sparkles className="w-3.5 h-3.5" />
          AI LEARNING INTELLIGENCE · ZERO FABRICATION
        </div>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-on-surface tracking-tight">
              AI Learning Tutor
            </h1>
            <p className="mt-3 text-lg text-on-surface-variant max-w-2xl leading-relaxed">
              Your personalized learning assistant grounded in official MoSPI handbooks. 
              The tutor will retrieve verified excerpts and answer questions based solely on official documents.
            </p>
          </div>
        </div>
      </header>

      <div className="glass-panel rounded-2xl overflow-visible relative border-t-[3px] border-t-primary-container min-h-[500px] flex flex-col">
        <div className="absolute inset-0 bg-gradient-to-b from-primary-container/5 to-transparent pointer-events-none rounded-2xl" />
        <div className="relative z-10 flex-1 flex flex-col">
          <TutorChat />
        </div>
      </div>
    </div>
  );
}

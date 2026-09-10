"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, CheckCircle2, UserCircle, Briefcase, Target, BookOpen, ArrowRight } from "lucide-react";

interface OnboardingClientProps {
  employee: {
    id: string;
    name: string;
    designation: string;
    careerGoal: string;
    preferredLanguage: string;
    jobRoleId: string;
    targetRoleId: string;
  };
  roles: Array<{ id: string; name: string; family: string; description: string }>;
  competencies: Array<{ id: string; name: string; categoryId: string }>;
  categories: Array<{ id: string; name: string }>;
}

const STEPS = [
  { id: 1, label: "Personal Info", icon: UserCircle },
  { id: 2, label: "Job Role", icon: Briefcase },
  { id: 3, label: "Skills (Optional)", icon: CheckCircle2 },
  { id: 4, label: "Career Goal", icon: Target },
  { id: 5, label: "Ready!", icon: BookOpen },
];

export function OnboardingClient({ employee, roles, competencies, categories }: OnboardingClientProps) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: employee.name,
    designation: employee.designation,
    careerGoal: employee.careerGoal,
    preferredLanguage: employee.preferredLanguage || "en",
    targetRoleId: employee.targetRoleId || employee.jobRoleId,
    selfSkills: [] as string[],
  });

  const toggleSkill = (id: string) => {
    setForm((f) => ({
      ...f,
      selfSkills: f.selfSkills.includes(id) ? f.selfSkills.filter((s) => s !== id) : [...f.selfSkills, id],
    }));
  };

  const save = async () => {
    setSaving(true);
    await fetch("/api/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        careerGoal: form.careerGoal,
        targetRoleId: form.targetRoleId,
        preferredLanguage: form.preferredLanguage,
      }),
    });
    setSaving(false);
    router.push("/learner/assessments");
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        {/* Progress bar */}
        <div className="flex items-center gap-2 mb-10">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center gap-2 flex-1">
              <button
                onClick={() => step > s.id && setStep(s.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-label-caps transition-all ${
                  step === s.id
                    ? "bg-primary-container/20 text-primary-container border border-primary-container/30"
                    : step > s.id
                    ? "text-primary-container/70"
                    : "text-on-surface-variant/40"
                }`}
              >
                {step > s.id ? <CheckCircle2 className="w-3.5 h-3.5" /> : null}
                <span className="hidden sm:inline">{s.label}</span>
                <span className="sm:hidden">{s.id}</span>
              </button>
              {i < STEPS.length - 1 && (
                <div className={`h-px flex-1 ${step > s.id ? "bg-primary-container/40" : "bg-white/10"}`} />
              )}
            </div>
          ))}
        </div>

        <div className="glass-panel rounded-3xl p-8 md:p-12 border border-white/5">
          {/* Step 1 — Personal Info */}
          {step === 1 && (
            <div className="space-y-6 animate-fade-up">
              <div>
                <h1 className="font-display text-3xl font-bold text-on-surface mb-2">Welcome, {form.name.split(" ")[0]}!</h1>
                <p className="text-on-surface-variant">Let's confirm your basic information before we get started.</p>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-label-caps text-on-surface-variant mb-2">FULL NAME</label>
                  <input
                    className="w-full bg-surface-container-low border border-white/10 rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:border-primary-container/50"
                    value={form.name}
                    readOnly
                  />
                  <p className="text-xs text-on-surface-variant/60 mt-1">Name is set by your organization admin.</p>
                </div>
                <div>
                  <label className="block text-xs font-label-caps text-on-surface-variant mb-2">DESIGNATION</label>
                  <input
                    className="w-full bg-surface-container-low border border-white/10 rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:border-primary-container/50"
                    value={form.designation}
                    readOnly
                  />
                </div>
                <div>
                  <label className="block text-xs font-label-caps text-on-surface-variant mb-2">PREFERRED LANGUAGE</label>
                  <select
                    className="w-full bg-surface-container-low border border-white/10 rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:border-primary-container/50"
                    value={form.preferredLanguage}
                    onChange={(e) => setForm((f) => ({ ...f, preferredLanguage: e.target.value }))}
                  >
                    <option value="en">English</option>
                    <option value="hi">Hindi</option>
                    <option value="ta">Tamil</option>
                    <option value="te">Telugu</option>
                    <option value="bn">Bengali</option>
                  </select>
                </div>
              </div>
              <button onClick={() => setStep(2)} className="glow-button px-8 py-3 rounded-full font-label-caps tracking-widest text-black flex items-center gap-2 ml-auto">
                Next <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Step 2 — Job Role */}
          {step === 2 && (
            <div className="space-y-6 animate-fade-up">
              <div>
                <h2 className="font-display text-3xl font-bold text-on-surface mb-2">Select your target role</h2>
                <p className="text-on-surface-variant">This determines the competencies and learning path we'll build for you.</p>
              </div>
              <div className="grid gap-3 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                {roles.map((role) => (
                  <button
                    key={role.id}
                    onClick={() => setForm((f) => ({ ...f, targetRoleId: role.id }))}
                    className={`p-4 rounded-2xl text-left border transition-all ${
                      form.targetRoleId === role.id
                        ? "bg-primary-container/10 border-primary-container/40 text-on-surface"
                        : "bg-surface-container-low border-white/5 text-on-surface-variant hover:border-white/15"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {form.targetRoleId === role.id && <CheckCircle2 className="w-4 h-4 text-primary-container shrink-0" />}
                      <div>
                        <p className="font-bold text-sm">{role.name}</p>
                        <p className="text-xs mt-0.5 opacity-70">{role.family} · {role.description}</p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
              <div className="flex gap-3">
                <button onClick={() => setStep(1)} className="glow-button-secondary px-6 py-3 rounded-full font-label-caps tracking-widest">Back</button>
                <button onClick={() => setStep(3)} className="glow-button px-8 py-3 rounded-full font-label-caps tracking-widest text-black flex items-center gap-2 ml-auto">
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Step 3 — Self-assessment */}
          {step === 3 && (
            <div className="space-y-6 animate-fade-up">
              <div>
                <h2 className="font-display text-3xl font-bold text-on-surface mb-2">Your starting skills</h2>
                <p className="text-on-surface-variant">Select areas you already have experience in. This is optional.</p>
                <div className="mt-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs">
                  ⚠ Self-assessment only — unscored. Your real competency profile will be built by your initial assessment, not this selection.
                </div>
              </div>
              <div className="space-y-4 max-h-[380px] overflow-y-auto custom-scrollbar pr-2">
                {categories.map((cat) => (
                  <div key={cat.id}>
                    <p className="text-xs font-label-caps text-on-surface-variant mb-2">{cat.name.toUpperCase()}</p>
                    <div className="flex flex-wrap gap-2">
                      {competencies.filter((c) => c.categoryId === cat.id).map((comp) => (
                        <button
                          key={comp.id}
                          onClick={() => toggleSkill(comp.id)}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                            form.selfSkills.includes(comp.id)
                              ? "bg-primary-container/20 border-primary-container/40 text-primary-container"
                              : "bg-surface-container-low border-white/10 text-on-surface-variant hover:border-white/20"
                          }`}
                        >
                          {comp.name}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex gap-3">
                <button onClick={() => setStep(2)} className="glow-button-secondary px-6 py-3 rounded-full font-label-caps tracking-widest">Back</button>
                <button onClick={() => setStep(4)} className="glow-button px-8 py-3 rounded-full font-label-caps tracking-widest text-black flex items-center gap-2 ml-auto">
                  {form.selfSkills.length > 0 ? `Continue (${form.selfSkills.length} selected)` : "Skip"} <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Step 4 — Career Goal */}
          {step === 4 && (
            <div className="space-y-6 animate-fade-up">
              <div>
                <h2 className="font-display text-3xl font-bold text-on-surface mb-2">Your career goal</h2>
                <p className="text-on-surface-variant">Describe what you want to achieve in your career. This personalizes your learning path.</p>
              </div>
              <div>
                <label className="block text-xs font-label-caps text-on-surface-variant mb-2">CAREER GOAL</label>
                <textarea
                  rows={4}
                  className="w-full bg-surface-container-low border border-white/10 rounded-xl px-4 py-3 text-on-surface focus:outline-none focus:border-primary-container/50 resize-none"
                  placeholder="e.g. Become a Senior Statistical Officer specialising in labour economics and PLFS analysis"
                  value={form.careerGoal}
                  onChange={(e) => setForm((f) => ({ ...f, careerGoal: e.target.value }))}
                />
              </div>
              <div className="flex gap-3">
                <button onClick={() => setStep(3)} className="glow-button-secondary px-6 py-3 rounded-full font-label-caps tracking-widest">Back</button>
                <button onClick={() => setStep(5)} disabled={!form.careerGoal.trim()} className="glow-button px-8 py-3 rounded-full font-label-caps tracking-widest text-black flex items-center gap-2 ml-auto disabled:opacity-50">
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Step 5 — Ready */}
          {step === 5 && (
            <div className="space-y-8 text-center animate-fade-up">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary-container to-secondary-container flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-12 h-12 text-black" />
              </div>
              <div>
                <h2 className="font-display text-3xl font-bold text-on-surface mb-3">You're all set!</h2>
                <p className="text-on-surface-variant max-w-md mx-auto">
                  Next step: complete a short competency assessment to build your scored profile. This takes 10–15 minutes.
                </p>
              </div>
              <div className="glass-panel rounded-2xl p-6 text-left space-y-3 border border-white/5">
                <div className="flex justify-between text-sm">
                  <span className="text-on-surface-variant">Target Role</span>
                  <span className="font-bold text-on-surface">{roles.find((r) => r.id === form.targetRoleId)?.name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-on-surface-variant">Language</span>
                  <span className="font-bold text-on-surface uppercase">{form.preferredLanguage}</span>
                </div>
                <div className="flex flex-col gap-1 text-sm">
                  <span className="text-on-surface-variant">Career Goal</span>
                  <span className="font-medium text-on-surface">{form.careerGoal}</span>
                </div>
              </div>
              <button
                onClick={save}
                disabled={saving}
                className="glow-button px-10 py-4 rounded-full font-label-caps tracking-widest text-black text-base flex items-center gap-3 mx-auto disabled:opacity-50"
              >
                {saving ? "Saving..." : "Start Competency Assessment"} <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>

        <p className="text-center text-xs text-on-surface-variant/50 mt-6">
          Step {step} of {STEPS.length} · StatIQ AI Learner Onboarding
        </p>
      </div>
    </div>
  );
}

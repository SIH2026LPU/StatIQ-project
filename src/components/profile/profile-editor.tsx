"use client";

import { useState, useEffect } from "react";
import { Save, User, Briefcase, GraduationCap, Target, Settings, CheckCircle2, Plus, X } from "lucide-react";

export function ProfileEditor({ currentEmail }: { currentEmail: string }) {
  const [activeTab, setActiveTab] = useState<"personal" | "professional" | "skills" | "goals" | "preferences">("personal");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const [profile, setProfile] = useState<any>({});
  const [skills, setSkills] = useState<any[]>([]);
  const [careerGoal, setCareerGoal] = useState<any>({});
  const [preferences, setPreferences] = useState<any>({});
  
  const [newSkill, setNewSkill] = useState({ name: "", category: "TECHNICAL", rating: "BEGINNER" });

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch("/api/learner/profile");
        const data = await res.json();
        if (data.profile) setProfile(data.profile);
        if (data.skills) setSkills(data.skills);
        if (data.careerGoal) setCareerGoal(data.careerGoal);
        if (data.learningPreferences) setPreferences(data.learningPreferences);
      } catch (err) {
        console.error("Failed to load profile", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await fetch("/api/learner/profile", {
        method: "PUT",
        body: JSON.stringify(profile),
        headers: { "Content-Type": "application/json" }
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveGoal(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await fetch("/api/learner/career-goals", {
        method: "PUT",
        body: JSON.stringify(careerGoal),
        headers: { "Content-Type": "application/json" }
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  async function handleSavePreferences(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      await fetch("/api/learner/preferences", {
        method: "PUT",
        body: JSON.stringify(preferences),
        headers: { "Content-Type": "application/json" }
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  async function handleAddSkill() {
    if (!newSkill.name) return;
    try {
      const res = await fetch("/api/learner/skills", {
        method: "POST",
        body: JSON.stringify({
          skillName: newSkill.name,
          skillCategory: newSkill.category,
          selfRating: newSkill.rating
        }),
        headers: { "Content-Type": "application/json" }
      });
      const data = await res.json();
      if (data.skill) {
        setSkills([...skills, data.skill]);
        setNewSkill({ name: "", category: "TECHNICAL", rating: "BEGINNER" });
      }
    } catch (err) {
      console.error(err);
    }
  }

  async function handleRemoveSkill(id: string) {
    try {
      await fetch(`/api/learner/skills?id=${id}`, { method: "DELETE" });
      setSkills(skills.filter(s => s.id !== id));
    } catch (err) {
      console.error(err);
    }
  }

  if (loading) {
    return <div className="glass-panel rounded-3xl p-8 mt-8 animate-pulse h-96 flex items-center justify-center text-on-surface-variant">Loading profile data...</div>;
  }

  return (
    <div className="glass-panel rounded-3xl p-6 md:p-8 mt-8">
      {success && (
        <div className="bg-primary-container/10 border border-primary-container/30 text-primary-container p-4 rounded-xl flex items-center gap-3 animate-fade-up mb-6">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <p className="text-sm font-medium">Your profile has been successfully updated.</p>
        </div>
      )}

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-8 border-b border-white/10 pb-4">
        {[
          { id: "personal", label: "Personal", icon: User },
          { id: "professional", label: "Professional", icon: Briefcase },
          { id: "skills", label: "Skills", icon: GraduationCap },
          { id: "goals", label: "Career Goals", icon: Target },
          { id: "preferences", label: "Preferences", icon: Settings },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id as any)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
              activeTab === t.id
                ? "bg-primary-container text-on-primary shadow-lg shadow-primary-container/20"
                : "text-on-surface-variant hover:bg-surface-container-highest"
            }`}
          >
            <t.icon className="w-4 h-4" />
            <span className="hidden sm:inline">{t.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="min-h-[300px]">
        
        {/* Personal Info */}
        {activeTab === "personal" && (
          <form onSubmit={handleSaveProfile} className="space-y-6 animate-fade-up">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-label-caps text-on-surface-variant/70 mb-2">Full Name</label>
                <input
                  type="text"
                  className="auth-input w-full rounded-xl px-4 py-3"
                  value={profile.fullName || ""}
                  onChange={(e) => setProfile({...profile, fullName: e.target.value})}
                  placeholder="e.g. Ananya Sharma"
                />
              </div>
              <div>
                <label className="block text-xs font-label-caps text-on-surface-variant/70 mb-2">Email Address</label>
                <input
                  type="email"
                  disabled
                  className="auth-input w-full rounded-xl px-4 py-3 opacity-50 cursor-not-allowed"
                  value={currentEmail}
                />
              </div>
              <div>
                <label className="block text-xs font-label-caps text-on-surface-variant/70 mb-2">Phone Number</label>
                <input
                  type="tel"
                  className="auth-input w-full rounded-xl px-4 py-3"
                  value={profile.phone || ""}
                  onChange={(e) => setProfile({...profile, phone: e.target.value})}
                  placeholder="+91..."
                />
              </div>
              <div>
                <label className="block text-xs font-label-caps text-on-surface-variant/70 mb-2">State / Region</label>
                <input
                  type="text"
                  className="auth-input w-full rounded-xl px-4 py-3"
                  value={profile.state || ""}
                  onChange={(e) => setProfile({...profile, state: e.target.value})}
                  placeholder="e.g. Delhi"
                />
              </div>
            </div>
            <div className="flex justify-end pt-4">
              <button type="submit" disabled={saving} className="glow-button px-6 py-2.5 rounded-full font-label-caps text-xs flex items-center gap-2">
                <Save className="w-4 h-4" /> Save Personal Info
              </button>
            </div>
          </form>
        )}

        {/* Professional Info */}
        {activeTab === "professional" && (
          <form onSubmit={handleSaveProfile} className="space-y-6 animate-fade-up">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-label-caps text-on-surface-variant/70 mb-2">Organization</label>
                <input
                  type="text"
                  className="auth-input w-full rounded-xl px-4 py-3"
                  value={profile.organization || ""}
                  onChange={(e) => setProfile({...profile, organization: e.target.value})}
                  placeholder="e.g. MoSPI"
                />
              </div>
              <div>
                <label className="block text-xs font-label-caps text-on-surface-variant/70 mb-2">Ministry</label>
                <input
                  type="text"
                  className="auth-input w-full rounded-xl px-4 py-3"
                  value={profile.ministry || ""}
                  onChange={(e) => setProfile({...profile, ministry: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-xs font-label-caps text-on-surface-variant/70 mb-2">Designation</label>
                <input
                  type="text"
                  className="auth-input w-full rounded-xl px-4 py-3"
                  value={profile.designation || ""}
                  onChange={(e) => setProfile({...profile, designation: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-xs font-label-caps text-on-surface-variant/70 mb-2">Years of Experience</label>
                <input
                  type="number"
                  className="auth-input w-full rounded-xl px-4 py-3"
                  value={profile.yearsExperience || ""}
                  onChange={(e) => setProfile({...profile, yearsExperience: parseInt(e.target.value) || 0})}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-label-caps text-on-surface-variant/70 mb-2">Current Responsibilities</label>
                <textarea
                  className="auth-input w-full rounded-xl px-4 py-3 min-h-[100px]"
                  value={profile.currentResponsibilities || ""}
                  onChange={(e) => setProfile({...profile, currentResponsibilities: e.target.value})}
                />
              </div>
            </div>
            <div className="flex justify-end pt-4">
              <button type="submit" disabled={saving} className="glow-button px-6 py-2.5 rounded-full font-label-caps text-xs flex items-center gap-2">
                <Save className="w-4 h-4" /> Save Professional Info
              </button>
            </div>
          </form>
        )}

        {/* Skills */}
        {activeTab === "skills" && (
          <div className="space-y-6 animate-fade-up">
            <div className="flex flex-wrap gap-3">
              {skills.map(s => (
                <div key={s.id} className="flex items-center gap-2 bg-surface-container-high border border-white/10 px-3 py-1.5 rounded-full">
                  <span className="text-sm font-medium text-on-surface">{s.skillName}</span>
                  <span className="text-xs text-on-surface-variant bg-surface-container-highest px-2 py-0.5 rounded-full">{s.selfRating}</span>
                  <button onClick={() => handleRemoveSkill(s.id)} className="text-on-surface-variant hover:text-error transition-colors ml-1">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
              {skills.length === 0 && <p className="text-sm text-on-surface-variant">No skills added yet.</p>}
            </div>

            <div className="bg-surface-container-lowest p-6 rounded-2xl border border-white/5 space-y-4">
              <h4 className="text-sm font-medium text-on-surface">Add New Skill</h4>
              <div className="flex flex-col md:flex-row gap-4">
                <input
                  type="text"
                  placeholder="e.g. Python, Survey Design"
                  className="auth-input flex-1 rounded-xl px-4 py-2"
                  value={newSkill.name}
                  onChange={(e) => setNewSkill({...newSkill, name: e.target.value})}
                />
                <select 
                  className="auth-input rounded-xl px-4 py-2"
                  value={newSkill.category}
                  onChange={(e) => setNewSkill({...newSkill, category: e.target.value})}
                >
                  <option value="TECHNICAL">Technical</option>
                  <option value="STATISTICAL">Statistical</option>
                  <option value="BEHAVIOURAL">Behavioural</option>
                </select>
                <select 
                  className="auth-input rounded-xl px-4 py-2"
                  value={newSkill.rating}
                  onChange={(e) => setNewSkill({...newSkill, rating: e.target.value})}
                >
                  <option value="BEGINNER">Beginner</option>
                  <option value="INTERMEDIATE">Intermediate</option>
                  <option value="ADVANCED">Advanced</option>
                  <option value="EXPERT">Expert</option>
                </select>
                <button onClick={handleAddSkill} disabled={!newSkill.name} className="glow-button px-4 py-2 rounded-xl flex items-center justify-center gap-2">
                  <Plus className="w-4 h-4" /> Add
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Goals */}
        {activeTab === "goals" && (
          <form onSubmit={handleSaveGoal} className="space-y-6 animate-fade-up">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-label-caps text-on-surface-variant/70 mb-2">Target Role / Position</label>
                <input
                  type="text"
                  className="auth-input w-full rounded-xl px-4 py-3"
                  value={careerGoal.targetRole || ""}
                  onChange={(e) => setCareerGoal({...careerGoal, targetRole: e.target.value})}
                  placeholder="e.g. Deputy Director (Data Science)"
                />
              </div>
              <div>
                <label className="block text-xs font-label-caps text-on-surface-variant/70 mb-2">Goal Description</label>
                <textarea
                  className="auth-input w-full rounded-xl px-4 py-3 min-h-[120px]"
                  value={careerGoal.goalDescription || ""}
                  onChange={(e) => setCareerGoal({...careerGoal, goalDescription: e.target.value})}
                  placeholder="What are your career aspirations within the statistical system?"
                />
              </div>
            </div>
            <div className="flex justify-end pt-4">
              <button type="submit" disabled={saving} className="glow-button px-6 py-2.5 rounded-full font-label-caps text-xs flex items-center gap-2">
                <Save className="w-4 h-4" /> Save Career Goal
              </button>
            </div>
          </form>
        )}

        {/* Preferences */}
        {activeTab === "preferences" && (
          <form onSubmit={handleSavePreferences} className="space-y-6 animate-fade-up">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-label-caps text-on-surface-variant/70 mb-2">Preferred Language</label>
                <select
                  className="auth-input w-full rounded-xl px-4 py-3"
                  value={preferences.language || "English"}
                  onChange={(e) => setPreferences({...preferences, language: e.target.value})}
                >
                  <option value="English">English</option>
                  <option value="Hindi">Hindi</option>
                  <option value="Regional">Regional (Translate via Bhashini)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-label-caps text-on-surface-variant/70 mb-2">Weekly Learning Commitment (Hours)</label>
                <input
                  type="number"
                  className="auth-input w-full rounded-xl px-4 py-3"
                  value={preferences.weeklyHours || ""}
                  onChange={(e) => setPreferences({...preferences, weeklyHours: parseInt(e.target.value) || 0})}
                />
              </div>
              <div>
                <label className="block text-xs font-label-caps text-on-surface-variant/70 mb-2">Preferred Learning Format</label>
                <select
                  className="auth-input w-full rounded-xl px-4 py-3"
                  value={preferences.learningFormat || "Online Self-paced"}
                  onChange={(e) => setPreferences({...preferences, learningFormat: e.target.value})}
                >
                  <option value="Online Self-paced">Online Self-paced</option>
                  <option value="Instructor-led Virtual">Instructor-led Virtual</option>
                  <option value="In-person Workshop">In-person Workshop</option>
                  <option value="Blended">Blended Learning</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-label-caps text-on-surface-variant/70 mb-2">Difficulty Preference</label>
                <select
                  className="auth-input w-full rounded-xl px-4 py-3"
                  value={preferences.difficulty || "INTERMEDIATE"}
                  onChange={(e) => setPreferences({...preferences, difficulty: e.target.value})}
                >
                  <option value="BEGINNER">Beginner Fundamentals</option>
                  <option value="INTERMEDIATE">Intermediate Applications</option>
                  <option value="ADVANCED">Advanced / Expert</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end pt-4">
              <button type="submit" disabled={saving} className="glow-button px-6 py-2.5 rounded-full font-label-caps text-xs flex items-center gap-2">
                <Save className="w-4 h-4" /> Save Preferences
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
}

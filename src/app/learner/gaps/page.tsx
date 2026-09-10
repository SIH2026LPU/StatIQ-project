import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth/session";
import { backendJson } from "@/lib/backend";
import { db } from "@/db/store";
import { learnerSnapshot } from "@/lib/services/intelligence";
import { LearnerGapsView } from "@/components/learner/learner-gaps-view";

export default async function GapsPage() {
  const session = await getSession();
  if (!session) redirect("/login");
  const employee = db.resolveEmployeeForSession(session);

  const data = await backendJson<any>(`/api/skill-gap?employeeId=${session.employeeId}&jobRoleId=${employee.targetRoleId}`).catch(() => null);

  let gaps = data?.gaps;
  let explanation = data?.explanation;

  if (!gaps || gaps.length === 0) {
    const snap = learnerSnapshot(employee);
    gaps = snap.gaps.map((g: any) => ({
      competencyId: g.competencyId,
      name: g.competencyName,
      domain: g.categoryName || "Official Statistics",
      currentScore: Math.round(g.currentScore),
      targetScore: Math.round(g.requiredScore),
      gap: Math.max(0, Math.round(g.requiredScore - g.currentScore)),
      priority: g.severity === "critical" ? 3 : g.severity === "moderate" ? 2 : 1,
    }));
    const topGaps = snap.gaps.filter((g: any) => g.severity === "critical").map((g: any) => g.competencyName);
    explanation = topGaps.length > 0 
      ? `To advance toward ${snap.targetRole?.name || "your target role"}, prioritize addressing key gaps in: ${topGaps.join(", ")}. Completing accredited MoSPI courses and adaptive benchmark tests will directly elevate your verified role readiness to ${Math.round(snap.readiness)}%+.`
      : `Your verified competency scores demonstrate strong alignment with ${snap.targetRole?.name || "your target role"}. Continue taking advanced microdata validations to maintain subject mastery.`;
  }

  return (
    <LearnerGapsView
      currentRoleName={db.getRole(employee.jobRoleId)?.name || "Statistical Officer"}
      targetRoleId={employee.targetRoleId}
      roles={db.listRoles().slice(0, 8).map((r) => ({ id: r.id, name: r.name }))}
      gaps={gaps}
      explanation={explanation}
    />
  );
}

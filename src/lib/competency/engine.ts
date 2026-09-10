import type { Difficulty, ProficiencyLevel } from "@/types/domain";

export interface ProficiencyBand {
  min: number;
  max: number;
  level: ProficiencyLevel;
}

export const DEFAULT_PROFICIENCY_BANDS: ProficiencyBand[] = [
  { min: 0, max: 29, level: "Beginner" },
  { min: 30, max: 49, level: "Basic" },
  { min: 50, max: 69, level: "Intermediate" },
  { min: 70, max: 84, level: "Advanced" },
  { min: 85, max: 100, level: "Expert" },
];

export function clampScore(score: number): number {
  return Math.max(0, Math.min(100, score));
}

export function proficiencyFromScore(
  score: number,
  bands = DEFAULT_PROFICIENCY_BANDS,
): ProficiencyLevel {
  const s = clampScore(score);
  const match = bands.find((band) => s >= band.min && s <= band.max);
  return match?.level ?? "Beginner";
}

export function skillGap(requiredScore: number, currentScore: number): number {
  return Math.max(requiredScore - currentScore, 0);
}

export function gapPriority(input: {
  gap: number;
  roleWeight: number;
  organizationalPriority: number;
  careerRelevance: number;
}): number {
  const normalizedGap = input.gap / 100;
  return (
    normalizedGap *
    input.roleWeight *
    input.organizationalPriority *
    input.careerRelevance
  );
}

export function roleReadiness(
  items: Array<{ currentScore: number; requiredScore: number; weight: number }>,
): number {
  const weightSum = items.reduce((sum, item) => sum + item.weight, 0);
  if (weightSum <= 0) return 0;

  const weighted = items.reduce((sum, item) => {
    const required = Math.max(item.requiredScore, 1);
    const coverage = Math.min(item.currentScore / required, 1);
    return sum + coverage * item.weight;
  }, 0);

  return (weighted / weightSum) * 100;
}

export function updateCompetencyScore(input: {
  oldScore: number;
  assessmentScore: number;
  assessmentWeight?: number;
}): number {
  const weight = input.assessmentWeight ?? 0.4;
  const retained = 1 - weight;
  return clampScore(input.oldScore * retained + input.assessmentScore * weight);
}

export function nextAdaptiveDifficulty(
  current: Difficulty,
  consecutiveCorrect: number,
  consecutiveIncorrect: number,
): Difficulty {
  if (consecutiveCorrect >= 2) {
    if (current === "easy") return "medium";
    if (current === "medium") return "hard";
    return "hard";
  }
  if (consecutiveIncorrect >= 2) {
    if (current === "hard") return "medium";
    if (current === "medium") return "easy";
    return "easy";
  }
  return current;
}

export function overallCompetencyScore(
  scores: number[],
): number {
  if (scores.length === 0) return 0;
  return scores.reduce((sum, score) => sum + score, 0) / scores.length;
}

import type { NSSTAProvider, TrainingProgramme } from "../types";

/**
 * MockNSSTAProvider — synthetic training programmes modeled on publicly known
 * NSSTA/TPAC programme structure (design.md #4). Replace with a real scraper/
 * adapter once ingestion access to nssta.gov.in's published calendar is confirmed.
 */
const MOCK_PROGRAMMES: TrainingProgramme[] = [
  {
    externalId: "nssta-sampling-methods-2026",
    source: "NSSTA",
    title: "Sampling Methods for Official Surveys",
    description: "Probability sampling, design effects and estimation for large-scale surveys.",
    competencyTags: ["Survey Design", "Sampling", "Statistical Inference"],
    targetDesignation: "Investigator / Assistant Director",
    durationDays: 5,
    venue: "NSSTA, Greater Noida",
    startDate: "2026-10-12",
    endDate: "2026-10-16",
    priority: 1,
    sourceUrl: "https://nssta.gov.in/",
  },
  {
    externalId: "tpac-data-science-officials-2026",
    source: "TPAC",
    title: "Data Science for Government Officials",
    description: "TPAC-recommended programme covering applied statistics with Python/R for policy analysis.",
    competencyTags: ["Python", "R", "Data Visualization", "AI/ML"],
    targetDesignation: "Deputy Director / Director",
    durationDays: 10,
    venue: "IIT Delhi (TPAC empanelled institute)",
    startDate: "2026-11-02",
    endDate: "2026-11-13",
    priority: 1,
    sourceUrl: "https://nssta.gov.in/",
  },
  {
    externalId: "nssta-national-accounts-refresher",
    source: "NSSTA",
    title: "National Accounts Refresher Course",
    description: "Updated SNA 2008 concepts, base-year revision methodology and GDP compilation.",
    competencyTags: ["National Accounts", "Price Statistics"],
    targetDesignation: "Assistant Director / Deputy Director",
    durationDays: 4,
    venue: "NSSTA, Greater Noida",
    startDate: "2026-09-21",
    endDate: "2026-09-24",
    priority: 2,
    sourceUrl: "https://nssta.gov.in/",
  },
  {
    externalId: "tpac-cybersecurity-govt-2026",
    source: "TPAC",
    title: "Cybersecurity & Data Privacy for Government Systems",
    description: "TPAC-recommended programme on secure data handling, DPI and cyber hygiene for officials.",
    competencyTags: ["Cybersecurity", "Data Privacy", "Government Cloud"],
    targetDesignation: "All designations",
    durationDays: 3,
    venue: "NIC Training Centre",
    startDate: "2026-10-05",
    endDate: "2026-10-07",
    priority: 2,
    sourceUrl: "https://nssta.gov.in/",
  },
];

export class MockNSSTAProvider implements NSSTAProvider {
  async listProgrammes(filters?: { competency?: string }): Promise<TrainingProgramme[]> {
    if (!filters?.competency) return MOCK_PROGRAMMES;
    return MOCK_PROGRAMMES.filter((p) =>
      p.competencyTags.some((t) => t.toLowerCase() === filters.competency!.toLowerCase())
    );
  }

  async getProgramme(externalId: string): Promise<TrainingProgramme | null> {
    return MOCK_PROGRAMMES.find((p) => p.externalId === externalId) ?? null;
  }
}

export function getMockProgrammes(): TrainingProgramme[] {
  return MOCK_PROGRAMMES;
}

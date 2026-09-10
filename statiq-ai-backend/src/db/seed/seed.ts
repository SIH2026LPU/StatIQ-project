import "dotenv/config";
import { db } from "@/db";
import {
  organizations,
  departments,
  jobRoles,
  users,
  employees,
  competencyCategories,
  competencies,
  roleCompetencies,
  employeeCompetencies,
  activities,
  activityCompetencies,
  courses,
  courseCompetencies,
  dataSourceRegistry,
} from "@/db/schema";
import bcrypt from "bcryptjs";

const COMPETENCY_TAXONOMY: Record<string, { domain: "STATISTICAL" | "TECHNICAL" | "DIGITAL_GOVERNANCE" | "BEHAVIOURAL_MANAGERIAL"; items: string[] }> = {
  Statistical: {
    domain: "STATISTICAL",
    items: [
      "Survey Design",
      "Sampling",
      "National Accounts",
      "Price Statistics",
      "Labour Statistics",
      "Agricultural Statistics",
      "Industrial Statistics",
      "SDG Indicators",
      "Metadata Standards",
      "Data Quality Frameworks",
    ],
  },
  Technical: {
    domain: "TECHNICAL",
    items: [
      "Python",
      "R",
      "SQL",
      "Stata",
      "SPSS",
      "SAS",
      "GIS",
      "Data Visualization",
      "AI/ML",
      "Cloud Computing",
      "APIs",
      "Open Data",
    ],
  },
  "Digital Governance": {
    domain: "DIGITAL_GOVERNANCE",
    items: ["Cybersecurity", "Data Privacy", "Digital Signatures", "Government Cloud", "Digital Public Infrastructure"],
  },
  "Behavioural & Managerial": {
    domain: "BEHAVIOURAL_MANAGERIAL",
    items: ["Leadership", "Communication", "Project Management", "Ethics", "Decision Making", "Change Management"],
  },
};

const MOCK_COURSES = [
  { title: "Python for Data Analysis", competency: "Python", hours: 12, difficulty: "BEGINNER" as const },
  { title: "SQL for Statisticians", competency: "SQL", hours: 8, difficulty: "BEGINNER" as const },
  { title: "GIS Fundamentals for Survey Data", competency: "GIS", hours: 10, difficulty: "INTERMEDIATE" as const },
  { title: "Machine Learning for Official Statistics", competency: "AI/ML", hours: 16, difficulty: "ADVANCED" as const },
  { title: "Cloud Computing for Government Services", competency: "Cloud Computing", hours: 6, difficulty: "BEGINNER" as const },
  { title: "Data Privacy & Digital Public Infrastructure", competency: "Data Privacy", hours: 5, difficulty: "BEGINNER" as const },
  { title: "Introduction to National Accounts", competency: "National Accounts", hours: 14, difficulty: "INTERMEDIATE" as const },
  { title: "Sampling Theory in Practice", competency: "Sampling", hours: 9, difficulty: "INTERMEDIATE" as const },
];

async function main() {
  console.log("Seeding StatIQ AI — synthetic demo data (not real MoSPI personnel)...");

  const [org] = await db
    .insert(organizations)
    .values({ name: "Ministry of Statistics & Programme Implementation", code: "MOSPI" })
    .onConflictDoNothing()
    .returning();
  const orgId = org?.id ?? (await db.select().from(organizations).limit(1))[0].id;

  const [dept] = await db
    .insert(departments)
    .values({ organizationId: orgId, name: "Data Informatics & Innovation Division", code: "DIID" })
    .returning();

  const [juniorRole] = await db
    .insert(jobRoles)
    .values({
      organizationId: orgId,
      title: "Assistant Director (Statistics)",
      level: "Mid",
      description: "Handles survey data collection, processing and quality checks.",
    })
    .returning();

  const [seniorRole] = await db
    .insert(jobRoles)
    .values({
      organizationId: orgId,
      title: "Deputy Director (Data Science)",
      level: "Senior",
      description: "Leads statistical modelling, AI adoption and workforce data initiatives.",
    })
    .returning();

  // --- Competency taxonomy ---
  const competencyIdByName = new Map<string, string>();
  for (const [categoryName, { domain, items }] of Object.entries(COMPETENCY_TAXONOMY)) {
    const [category] = await db
      .insert(competencyCategories)
      .values({ name: categoryName, domain })
      .returning();

    for (const name of items) {
      const [c] = await db
        .insert(competencies)
        .values({ categoryId: category.id, name, domain, defaultTargetLevel: 70 })
        .onConflictDoNothing()
        .returning();
      if (c) competencyIdByName.set(name, c.id);
    }
  }

  // If competencies already existed from a prior run, backfill the map.
  if (competencyIdByName.size === 0) {
    const existing = await db.select().from(competencies);
    for (const c of existing) competencyIdByName.set(c.name, c.id);
  }

  // --- FRAC: Activities & Requirements ---
  const juniorActivitiesData = [
    {
      name: "Design and pilot a household survey",
      description: "Creates sampling frames and survey instruments.",
      competencies: [
        ["Survey Design", 75, true],
        ["Sampling", 70, true],
        ["Communication", 60, false],
      ] as [string, number, boolean][],
    },
    {
      name: "Analyze and clean survey data",
      description: "Runs data quality checks on collected datasets.",
      competencies: [
        ["SQL", 60, false],
        ["Data Quality Frameworks", 65, false],
      ] as [string, number, boolean][],
    },
  ];

  const seniorActivitiesData = [
    {
      name: "Lead statistical modelling initiatives",
      description: "Directs AI adoption and advanced analytics.",
      competencies: [
        ["AI/ML", 75, true],
        ["Python", 70, false],
        ["Cloud Computing", 65, false],
      ] as [string, number, boolean][],
    },
    {
      name: "Manage digital governance and privacy",
      description: "Ensures compliance with data privacy standards.",
      competencies: [
        ["Leadership", 75, true],
        ["Data Privacy", 60, false],
        ["National Accounts", 65, false],
      ] as [string, number, boolean][],
    },
  ];

  for (const [role, activitiesList] of [
    [juniorRole, juniorActivitiesData],
    [seniorRole, seniorActivitiesData],
  ] as const) {
    for (const act of activitiesList) {
      // 1. Insert Activity
      const [activityRecord] = await db
        .insert(activities)
        .values({
          jobRoleId: role.id,
          name: act.name,
          description: act.description,
        })
        .returning();

      if (!activityRecord) continue;

      // 2. Map competencies to the activity (FRAC)
      for (const [name, level, critical] of act.competencies) {
        const competencyId = competencyIdByName.get(name);
        if (!competencyId) continue;

        await db.insert(activityCompetencies).values({
          activityId: activityRecord.id,
          competencyId,
          requiredLevel: level,
        }).onConflictDoNothing();

        // Keep roleCompetencies populated for backwards compatibility with older gap engines
        // until we fully migrate the gap engine in Phase 3.
        await db.insert(roleCompetencies).values({
          jobRoleId: role.id,
          competencyId,
          requiredLevel: level,
          weight: critical ? "1.000" : "0.700",
          isCritical: critical ? 1 : 0,
        }).onConflictDoNothing();
      }
    }
  }

  // --- Demo users + employees ---
  const passwordHash = await bcrypt.hash("demo123", 10);

  const demoAccounts: { email: string; role: "LEARNER" | "TRAINER" | "ORG_ADMIN"; name: string; roleId: string }[] = [
    { email: "learner@statiq.demo", role: "LEARNER", name: "Ananya Sharma", roleId: juniorRole.id },
    { email: "trainer@statiq.demo", role: "TRAINER", name: "Ravi Menon", roleId: seniorRole.id },
    { email: "admin@statiq.demo", role: "ORG_ADMIN", name: "Kavita Iyer", roleId: seniorRole.id },
  ];

  const employeeIds: string[] = [];
  for (const acc of demoAccounts) {
    const [u] = await db
      .insert(users)
      .values({ email: acc.email, passwordHash, role: acc.role, organizationId: orgId })
      .onConflictDoNothing()
      .returning();
    if (!u) continue;

    const [emp] = await db
      .insert(employees)
      .values({
        userId: u.id,
        organizationId: orgId,
        departmentId: dept.id,
        jobRoleId: acc.roleId,
        fullName: acc.name,
        designation: acc.roleId === juniorRole.id ? juniorRole.title : seniorRole.title,
        isSynthetic: true,
      })
      .returning();
    employeeIds.push(emp.id);

    // seed a few starting competency scores so the gap engine has something to show
    const starterScores: [string, number][] =
      acc.roleId === juniorRole.id
        ? [
            ["Survey Design", 45],
            ["Sampling", 55],
            ["SQL", 30],
          ]
        : [
            ["AI/ML", 40],
            ["Python", 50],
            ["Leadership", 60],
          ];

    for (const [name, score] of starterScores) {
      const competencyId = competencyIdByName.get(name);
      if (!competencyId) continue;
      await db.insert(employeeCompetencies).values({
        employeeId: emp.id,
        competencyId,
        currentScore: score,
        lastAssessedAt: new Date(),
      });
    }
  }

  // --- Internal course catalogue mirroring the iGOT mock catalogue ---
  for (const c of MOCK_COURSES) {
    const [course] = await db
      .insert(courses)
      .values({
        title: c.title,
        provider: "INTERNAL",
        durationHours: String(c.hours),
        difficulty: c.difficulty,
        source: "StatIQ seed",
        retrievedAt: new Date(),
      })
      .returning();

    const competencyId = competencyIdByName.get(c.competency);
    if (competencyId) {
      await db.insert(courseCompetencies).values({
        courseId: course.id,
        competencyId,
        coverageWeight: "1.000",
      });
    }
  }

  // --- Data source registry (mirrors DATA_SOURCE_REGISTRY.csv) ---
  const registry: { source: string; officialUrl: string; purpose: string; access: string; mode: string; notes: string }[] = [
    { source: "MoSPI API Platform", officialUrl: "https://api.mospi.gov.in/", purpose: "Official statistics APIs", access: "Token/API account", mode: "mock", notes: "WPI and other authorized products" },
    { source: "eSankhyiki", officialUrl: "https://esankhyiki.mospi.gov.in/", purpose: "Official statistics catalogue and macro indicators", access: "Public/API where available", mode: "mock", notes: "Catalogue, indicators, metadata" },
    { source: "MoSPI UnitData", officialUrl: "https://microdata.gov.in/", purpose: "Official microdata", access: "API key/authorized access", mode: "live", notes: "Catalog metadata via mospi-unitdata; files respect MoSPI access rules" },
    { source: "NSSTA", officialUrl: "https://nssta.gov.in/", purpose: "Training programmes and TPAC information", access: "Public official material / authorized access", mode: "mock", notes: "Training catalogue and recommendations" },
    { source: "iGOT Karmayogi", officialUrl: "https://www.igotkarmayogi.gov.in/", purpose: "Learning catalogue, enrollment and progress", access: "Authorized credentials", mode: "mock", notes: "Use mock provider until access is granted" },
    { source: "data.gov.in", officialUrl: "https://www.data.gov.in/", purpose: "Government open-data discovery and APIs", access: "Public resources/API keys where required", mode: "live", notes: "Supplementary datasets — genuinely callable today with DATAGOVIN_API_KEY" },
  ];

  for (const r of registry) {
    await db
      .insert(dataSourceRegistry)
      .values({
        source: r.source,
        officialUrl: r.officialUrl,
        purpose: r.purpose,
        access: r.access,
        integrationMode: r.mode,
        notes: r.notes,
      })
      .onConflictDoNothing();
  }

  console.log("Seed complete.");
  console.log(`Organization: ${orgId}`);
  console.log(`Job roles: ${juniorRole.id} (junior), ${seniorRole.id} (senior)`);
  console.log("Demo logins (password: demo123): learner@statiq.demo, trainer@statiq.demo, admin@statiq.demo");
  process.exit(0);
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});

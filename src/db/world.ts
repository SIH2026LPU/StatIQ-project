import { DEMO_PASSWORD_HASH } from "@/lib/auth/password";
import type {
  Assessment,
  Competency,
  CompetencyCategory,
  Course,
  CourseCompetency,
  Department,
  DocumentChunk,
  DocumentRecord,
  Employee,
  EmployeeCompetency,
  Enrollment,
  JobRole,
  Organization,
  Question,
  RoleCompetency,
  TrainingProgramme,
  User,
} from "@/types/domain";

const DEMO_HASH = DEMO_PASSWORD_HASH;

function rng(seed: number) {
  return function next() {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
}

function pick<T>(rand: () => number, items: T[]): T {
  return items[Math.floor(rand() * items.length)]!;
}

export interface World {
  organization: Organization;
  departments: Department[];
  jobRoles: JobRole[];
  users: User[];
  employees: Employee[];
  categories: CompetencyCategory[];
  competencies: Competency[];
  employeeCompetencies: EmployeeCompetency[];
  roleCompetencies: RoleCompetency[];
  courses: Course[];
  courseCompetencies: CourseCompetency[];
  programmes: TrainingProgramme[];
  enrollments: Enrollment[];
  assessments: Assessment[];
  questions: Question[];
  documents: DocumentRecord[];
  chunks: DocumentChunk[];
}

export function generateWorld(scale: "demo" | "full" = "demo"): World {
  const organization: Organization = {
    id: "org-mospi-demo",
    name: "Official Statistical System (Synthetic Demo)",
    code: "OSS-DEMO",
    synthetic: true,
  };

  const deptNames = [
    ["DIID", "Data Informatics & Innovation Division"],
    ["NAD", "National Accounts Division"],
    ["SSD", "Social Statistics Division"],
    ["ESD", "Economic Statistics Division"],
    ["NSSO", "National Sample Survey Office"],
    ["FOD", "Field Operations Division"],
    ["PSD", "Price Statistics Division"],
    ["ISD", "Industrial Statistics Division"],
    ["ASD", "Agricultural Statistics Division"],
    ["TSD", "Training & Capacity Division"],
    ["GIS", "Geospatial Statistics Cell"],
    ["DQD", "Data Quality Division"],
    ["ITD", "IT & Dissemination Division"],
    ["PLFS", "PLFS Production Cell"],
    ["CPI", "CPI Compilation Cell"],
    ["IIP", "IIP Compilation Cell"],
    ["SDG", "SDG Coordination Cell"],
    ["META", "Metadata & Standards Cell"],
    ["API", "Open Data & API Cell"],
    ["SEC", "Microdata Access Lab"],
  ];
  const departments: Department[] = deptNames.map(([code, name], i) => ({
    id: `dept-${i + 1}`,
    organizationId: organization.id,
    name,
    code,
  }));

  const categories: CompetencyCategory[] = [
    { id: "cat-stat", name: "Statistical Competencies", description: "Official statistics methods." },
    { id: "cat-tech", name: "Technical Competencies", description: "Tools and computing." },
    { id: "cat-gov", name: "Digital Governance", description: "Policy and DPI." },
    { id: "cat-beh", name: "Behavioural and Managerial", description: "Leadership and coordination." },
  ];

  const baseComps: Array<[string, string, string, boolean?]> = [
    ["c-survey", "cat-stat", "Survey Design"],
    ["c-sampling", "cat-stat", "Sampling"],
    ["c-na", "cat-stat", "National Accounts"],
    ["c-price", "cat-stat", "Price Statistics"],
    ["c-labour", "cat-stat", "Labour Statistics"],
    ["c-agri", "cat-stat", "Agricultural Statistics"],
    ["c-ind", "cat-stat", "Industrial Statistics"],
    ["c-sdg", "cat-stat", "SDG Indicators"],
    ["c-meta", "cat-stat", "Metadata Standards"],
    ["c-quality", "cat-stat", "Data Quality Frameworks"],
    ["c-inference", "cat-stat", "Statistical Inference"],
    ["c-python", "cat-tech", "Python"],
    ["c-r", "cat-tech", "R"],
    ["c-sql", "cat-tech", "SQL"],
    ["c-stata", "cat-tech", "Stata"],
    ["c-spss", "cat-tech", "SPSS"],
    ["c-gis", "cat-tech", "GIS", true],
    ["c-viz", "cat-tech", "Data Visualization", true],
    ["c-aiml", "cat-tech", "AI/ML", true],
    ["c-cloud", "cat-tech", "Cloud Computing", true],
    ["c-api", "cat-tech", "APIs", true],
    ["c-opendata", "cat-tech", "Open Data"],
    ["c-statcomp", "cat-tech", "Statistical Computing", true],
    ["c-cyber", "cat-tech", "Cybersecurity", true],
    ["c-dgov", "cat-gov", "Digital Public Infrastructure"],
    ["c-privacy", "cat-gov", "Data Protection"],
    ["c-policy", "cat-gov", "Statistical Legislation"],
    ["c-lead", "cat-beh", "Leadership"],
    ["c-comm", "cat-beh", "Communication"],
    ["c-coord", "cat-beh", "Inter-agency Coordination"],
  ];

  const competencies: Competency[] = baseComps.map(([id, categoryId, name, emerging]) => ({
    id,
    categoryId,
    name,
    description: `${name} for official statistics production.`,
    measurementMethod: "mixed evidence",
    defaultTargetLevel: 70,
    emerging: Boolean(emerging),
  }));
  while (competencies.length < 100) {
    const n = competencies.length + 1;
    const cat = categories[n % 4]!;
    competencies.push({
      id: `c-gen-${n}`,
      categoryId: cat.id,
      name: `${cat.name.split(" ")[0]} skill ${n}`,
      description: `Synthetic competency ${n} for demonstration scale.`,
      measurementMethod: "mixed evidence",
      defaultTargetLevel: 70,
      emerging: n % 7 === 0,
    });
  }

  const families = ["Production", "Analytics", "Technology", "Methods", "Leadership"];
  const jobRoles: JobRole[] = [];
  const roleTitles = [
    "Statistical Officer",
    "Senior Statistical Officer",
    "Deputy Director (Statistics)",
    "Data Analyst (Official Statistics)",
    "Data Engineer (Statistical Systems)",
    "Survey Methodologist",
    "Geospatial Statistician",
    "NSSTA Faculty / Trainer",
  ];
  for (let i = 0; i < 50; i += 1) {
    jobRoles.push({
      id: i < 8 ? ["role-so", "role-sso", "role-ds", "role-da", "role-de", "role-survey", "role-gis", "role-trainer"][i]! : `role-${i + 1}`,
      name: i < 8 ? roleTitles[i]! : `Synthetic role ${i + 1}`,
      family: families[i % families.length]!,
      description: "Synthetic job role for capacity-building demonstration.",
    });
  }

  const required = (roleId: string, items: Array<[string, number, number, number]>): RoleCompetency[] =>
    items.map(([competencyId, requiredScore, weight, organizationalPriority]) => ({
      roleId,
      competencyId,
      requiredScore,
      weight,
      organizationalPriority,
    }));

  const roleCompetencies: RoleCompetency[] = [
    ...required("role-so", [
      ["c-survey", 70, 1, 0.9],
      ["c-sampling", 65, 1, 0.9],
      ["c-quality", 70, 0.9, 1],
      ["c-sql", 55, 0.7, 0.8],
      ["c-comm", 60, 0.6, 0.7],
    ]),
    ...required("role-sso", [
      ["c-survey", 75, 1, 0.9],
      ["c-sampling", 75, 1, 1],
      ["c-quality", 80, 1, 1],
      ["c-sql", 70, 0.8, 0.9],
      ["c-python", 60, 0.7, 0.9],
      ["c-lead", 70, 0.8, 0.8],
    ]),
    ...required("role-ds", [
      ["c-na", 80, 1, 1],
      ["c-quality", 85, 1, 1],
      ["c-lead", 80, 1, 0.9],
      ["c-policy", 75, 0.8, 0.9],
      ["c-coord", 80, 0.9, 0.9],
    ]),
    ...required("role-da", [
      ["c-sql", 80, 1, 1],
      ["c-python", 75, 1, 1],
      ["c-viz", 80, 1, 0.9],
      ["c-inference", 75, 0.9, 0.9],
      ["c-quality", 70, 0.8, 0.9],
      ["c-aiml", 60, 0.6, 0.8],
    ]),
    ...required("role-de", [
      ["c-sql", 85, 1, 1],
      ["c-python", 80, 1, 1],
      ["c-api", 80, 1, 1],
      ["c-cloud", 75, 0.9, 0.9],
      ["c-cyber", 75, 0.9, 1],
    ]),
    ...required("role-survey", [
      ["c-survey", 90, 1, 1],
      ["c-sampling", 90, 1, 1],
      ["c-inference", 80, 0.9, 0.9],
      ["c-stata", 70, 0.7, 0.7],
      ["c-quality", 80, 0.8, 1],
    ]),
    ...required("role-gis", [
      ["c-gis", 85, 1, 1],
      ["c-python", 70, 0.8, 0.8],
      ["c-viz", 75, 0.8, 0.8],
      ["c-survey", 65, 0.6, 0.7],
    ]),
  ];
  for (let i = 8; i < 50; i += 1) {
    const comps = competencies.slice(i, i + 5);
    for (const c of comps) {
      roleCompetencies.push({
        roleId: `role-${i + 1}`,
        competencyId: c.id,
        requiredScore: 60 + (i % 20),
        weight: 0.7,
        organizationalPriority: 0.8,
      });
    }
  }
  for (const role of jobRoles) {
    for (let k = 0; k < 10; k += 1) {
      const competency = competencies[(role.id.length + k * 11) % competencies.length]!;
      if (roleCompetencies.some((row) => row.roleId === role.id && row.competencyId === competency.id)) {
        continue;
      }
      roleCompetencies.push({
        roleId: role.id,
        competencyId: competency.id,
        requiredScore: 55 + (k % 25),
        weight: 0.5,
        organizationalPriority: 0.6,
      });
    }
  }

  const first = ["Ananya", "Ravi", "Soham", "Meera", "Arjun", "Leena", "Imran", "Priya", "Kavita", "Neel"];
  const last = ["Sharma", "Menon", "Patel", "Nair", "Bose", "Das", "Khan", "Sen", "Iyer", "Rao"];

  const employeeCount = scale === "full" ? 1000 : 12;
  const userCount = scale === "full" ? 50 : 5;
  const employees: Employee[] = [];
  const users: User[] = [];

  const named = [
    { id: "emp-ananya", userId: "u-learner", dept: "dept-1", job: "role-so", target: "role-da", name: "Ananya Sharma", desig: "Statistical Officer" },
    { id: "emp-ravi", userId: "u-trainer", dept: "dept-10", job: "role-trainer", target: "role-trainer", name: "Ravi Menon", desig: "Faculty, NSSTA" },
    { id: "emp-soham", userId: "u-soham", dept: "dept-5", job: "role-so", target: "role-survey", name: "Soham Patel", desig: "Statistical Officer" },
    { id: "emp-meera", userId: "u-meera", dept: "dept-2", job: "role-sso", target: "role-ds", name: "Meera Nair", desig: "Senior Statistical Officer" },
  ];

  users.push(
    { id: "u-learner", email: "learner@statiq.demo", password: DEMO_HASH, role: "LEARNER", employeeId: "emp-ananya", name: "Ananya Sharma" },
    { id: "u-trainer", email: "trainer@statiq.demo", password: DEMO_HASH, role: "TRAINER", employeeId: "emp-ravi", name: "Ravi Menon" },
    { id: "u-admin", email: "admin@statiq.demo", password: DEMO_HASH, role: "ORG_ADMIN", name: "Kavita Iyer" },
    { id: "u-soham", email: "soham@statiq.demo", password: DEMO_HASH, role: "LEARNER", employeeId: "emp-soham", name: "Soham Patel" },
    { id: "u-meera", email: "meera@statiq.demo", password: DEMO_HASH, role: "LEARNER", employeeId: "emp-meera", name: "Meera Nair" },
  );

  for (const n of named) {
    employees.push({
      id: n.id,
      userId: n.userId,
      organizationId: organization.id,
      departmentId: n.dept,
      jobRoleId: n.job,
      targetRoleId: n.target,
      name: n.name,
      designation: n.desig,
      education: "M.A. / M.Sc. Statistics (synthetic)",
      experienceYears: 6,
      preferredLanguage: "en",
      careerGoal: "Progress against the selected target role (synthetic).",
    });
  }

  const rand = rng(26101);
  for (let i = employees.length; i < employeeCount; i += 1) {
    const name = `${pick(rand, first)} ${pick(rand, last)}`;
    const id = `emp-${i + 1}`;
    const userId = i < userCount ? `u-${i + 1}` : undefined;
    const job = jobRoles[i % 8]!;
    const target = jobRoles[(i + 3) % 8]!;
    employees.push({
      id,
      userId: userId ?? `u-none-${i}`,
      organizationId: organization.id,
      departmentId: departments[i % departments.length]!.id,
      jobRoleId: job.id,
      targetRoleId: target.id,
      name: `${name} (synthetic)`,
      designation: job.name,
      education: "Synthetic qualification",
      experienceYears: 2 + (i % 18),
      preferredLanguage: "en",
      careerGoal: `Prepare for ${target.name}.`,
    });
    if (userId && !users.find((u) => u.id === userId)) {
      users.push({
        id: userId,
        email: `officer${i}@statiq.demo`,
        password: DEMO_HASH,
        role: "LEARNER",
        employeeId: id,
        name: `${name} (synthetic)`,
      });
    }
  }

  const employeeCompetencies: EmployeeCompetency[] = [];
  for (const emp of employees) {
    const reqs = roleCompetencies.filter((r) => r.roleId === emp.targetRoleId);
    const related = reqs.length ? reqs : roleCompetencies.filter((r) => r.roleId === emp.jobRoleId);
    for (const req of related) {
      const score = Math.round(25 + rand() * 60);
      employeeCompetencies.push({
        employeeId: emp.id,
        competencyId: req.competencyId,
        score,
        targetLevel: req.requiredScore,
        confidence: 0.7,
        lastAssessedAt: "2026-07-18",
        evidenceSource: "assessment",
      });
    }
  }

  const courses: Course[] = [];
  const courseCompetencies: CourseCompetency[] = [];
  const providers = ["internal", "igot", "nssta", "tpac"] as const;
  const courseCount = scale === "full" ? 200 : 14;
  const seedCourses: Course[] = [
    c("crs-sql-os", "SQL for Official Statistics", "Query design for survey tables.", "igot", 16, "medium", 0.92, "igot-sql-os"),
    c("crs-python-etl", "Python ETL for Statistical Pipelines", "Ingest and validate statistical datasets.", "igot", 20, "medium", 0.9, "igot-py-etl"),
    c("crs-sampling", "Sampling Methods for Household Surveys", "Stratification and variance estimation.", "nssta", 24, "hard", 0.95),
    c("crs-plfs", "PLFS Concepts and Tabulation", "Labour force concepts and weights.", "nssta", 18, "medium", 0.88),
    c("crs-viz", "Statistical Visualization for Policy Briefs", "Honest charts for official releases.", "internal", 10, "easy", 0.86),
    c("crs-aiml", "Responsible AI for Official Statistics", "Where ML must not invent numbers.", "igot", 14, "medium", 0.84, "igot-aiml-os"),
    c("crs-gis", "GIS for Census and Survey Operations", "Geospatial frames and small-area indicators.", "tpac", 16, "medium", 0.87),
    c("crs-quality", "NQAF and Data Quality Reporting", "Quality assurance frameworks.", "nssta", 12, "medium", 0.91),
    c("crs-api", "Publishing Statistical APIs", "Machine-readable official statistics APIs.", "internal", 12, "medium", 0.83),
    c("crs-cloud", "Cloud Patterns for Statistical Systems", "Auditable cloud processing.", "igot", 15, "hard", 0.8, "igot-cloud"),
    c("crs-lead", "Leading Statistical Production Teams", "Planning and review culture.", "internal", 8, "easy", 0.78),
    c("crs-sdmx", "SDMX and Metadata for Dissemination", "Metadata-driven exchange.", "nssta", 10, "medium", 0.85),
    c("crs-na", "National Accounts Compilation Workshop", "SNA sequence of accounts.", "nssta", 30, "hard", 0.93),
    c("crs-cyber", "Microdata Protection and Cyber Hygiene", "Disclosure control basics.", "igot", 8, "easy", 0.88, "igot-cyber"),
  ];
  courses.push(...seedCourses);
  const maps: Array<[string, string, number]> = [
    ["crs-sql-os", "c-sql", 0.95],
    ["crs-sql-os", "c-quality", 0.3],
    ["crs-python-etl", "c-python", 0.9],
    ["crs-sampling", "c-sampling", 0.95],
    ["crs-sampling", "c-survey", 0.7],
    ["crs-plfs", "c-labour", 0.9],
    ["crs-viz", "c-viz", 0.95],
    ["crs-aiml", "c-aiml", 0.9],
    ["crs-gis", "c-gis", 0.95],
    ["crs-quality", "c-quality", 0.95],
    ["crs-api", "c-api", 0.95],
    ["crs-cloud", "c-cloud", 0.9],
    ["crs-lead", "c-lead", 0.9],
    ["crs-sdmx", "c-meta", 0.95],
    ["crs-na", "c-na", 0.95],
    ["crs-cyber", "c-cyber", 0.95],
  ];
  courseCompetencies.push(
    ...maps.map(([courseId, competencyId, coverage]) => ({ courseId, competencyId, coverage })),
  );
  while (courses.length < courseCount) {
    const n = courses.length + 1;
    const comp = competencies[n % competencies.length]!;
    const id = `crs-gen-${n}`;
    courses.push(
      c(id, `${comp.name} pathway ${n}`, `Synthetic course covering ${comp.name}.`, providers[n % 4]!, 8 + (n % 20), "medium", 0.75),
    );
    courseCompetencies.push({ courseId: id, competencyId: comp.id, coverage: 0.8 });
    courseCompetencies.push({
      courseId: id,
      competencyId: competencies[(n + 3) % competencies.length]!.id,
      coverage: 0.45,
    });
    courseCompetencies.push({
      courseId: id,
      competencyId: competencies[(n + 7) % competencies.length]!.id,
      coverage: 0.3,
    });
  }

  const programmes: TrainingProgramme[] = [];
  const progCount = scale === "full" ? 50 : 3;
  programmes.push(
    {
      id: "nssta-sampling",
      title: "Sampling Methods",
      description: "NSSTA programme on sample design for socio-economic surveys.",
      provider: "nssta",
      topic: "Survey methodology",
      targetDesignation: "Statistical Officer / SSO",
      durationDays: 5,
      deliveryMode: "blended",
      sourceUrl: "https://nssta.gov.in/",
      year: 2026,
    },
    {
      id: "tpac-digital",
      title: "Digital Skills for Official Statisticians (TPAC)",
      description: "Recommended digital pathway covering SQL, Python and APIs.",
      provider: "tpac",
      topic: "Digital competencies",
      targetDesignation: "All statistical cadres",
      durationDays: 10,
      deliveryMode: "online",
      sourceUrl: "https://nssta.gov.in/",
      year: 2026,
    },
    {
      id: "nssta-na",
      title: "National Accounts Workshop",
      description: "Compilation practice aligned to SNA.",
      provider: "nssta",
      topic: "National accounts",
      targetDesignation: "NAD officers",
      durationDays: 7,
      deliveryMode: "in-person",
      sourceUrl: "https://nssta.gov.in/",
      year: 2026,
    },
  );
  while (programmes.length < progCount) {
    const n = programmes.length + 1;
    programmes.push({
      id: `nssta-gen-${n}`,
      title: `NSSTA programme ${n}`,
      description: "Synthetic NSSTA/TPAC catalogue row mapped to StatIQ competencies.",
      provider: n % 2 ? "nssta" : "tpac",
      topic: "Capacity building",
      targetDesignation: "Statistical Officer",
      durationDays: 3 + (n % 7),
      deliveryMode: "online",
      sourceUrl: "https://nssta.gov.in/",
      year: 2026,
    });
  }

  const enrollments: Enrollment[] = [
    {
      id: "enr-1",
      employeeId: "emp-ananya",
      courseId: "crs-viz",
      status: "in_progress",
      progressPercent: 60,
      learningHours: 6,
      enrolledAt: "2026-06-02",
    },
    {
      id: "enr-2",
      employeeId: "emp-ananya",
      courseId: "crs-quality",
      status: "completed",
      progressPercent: 100,
      learningHours: 12,
      enrolledAt: "2026-04-11",
      completedAt: "2026-05-03",
    },
  ];

  const assessments: Assessment[] = [
    { id: "asm-sql", title: "SQL for Official Statistics — Adaptive Check", competencyId: "c-sql", courseId: "crs-sql-os", questionCount: 5, adaptive: true },
    { id: "asm-sampling", title: "Sampling Methods Check", competencyId: "c-sampling", courseId: "crs-sampling", questionCount: 5, adaptive: true },
  ];

  const questions: Question[] = [
    q("q-sql-1", "asm-sql", "c-sql", "easy", "In a household survey microdata table, which SQL clause filters rows before aggregation?", ["GROUP BY", "WHERE", "HAVING", "ORDER BY"], 1, "WHERE filters row-level records before grouping."),
    q("q-sql-2", "asm-sql", "c-sql", "medium", "A weighted employment rate should typically be computed using which approach?", ["Unweighted COUNT of employed / COUNT of persons", "SUM(employed_flag * weight) / SUM(weight) for persons in scope", "AVG of the weight column", "MAX(employed_flag)"], 1, "Official labour indicators use survey weights."),
    q("q-sql-3", "asm-sql", "c-sql", "medium", "Why is a LEFT JOIN often preferred when attaching a small codebook to survey records?", ["It drops unmatched survey records", "It keeps all survey records even if a code is missing", "It always runs faster than INNER JOIN", "It prevents duplicate keys"], 1, "LEFT JOIN preserves the survey universe."),
    q("q-sql-4", "asm-sql", "c-sql", "hard", "Which practice reduces disclosure risk when publishing SQL extracts from microdata?", ["Selecting SELECT * from the unit record table", "Publishing identifiable keys at the lowest geography", "Releasing only aggregated outputs and suppressing small cells", "Sharing unweighted unit records via email"], 2, "Safe dissemination uses aggregation and suppression."),
    q("q-sql-5", "asm-sql", "c-sql", "hard", "An IIP series join fails because month is stored as '04' in one table and 4 in another. What should a production pipeline do first?", ["Cast silently and proceed without a log", "Reject the job, log the type mismatch, and apply an explicit, tested cast", "Drop the month column", "Average the two encodings"], 1, "Type normalization must be explicit and auditable."),
    q("q-sam-1", "asm-sampling", "c-sampling", "easy", "In a stratified sample, primary purpose of stratification is to:", ["Increase interviewer travel", "Improve precision for key domains", "Eliminate the need for weights", "Guarantee a census"], 1, "Stratification groups similar units."),
    q("q-sam-2", "asm-sampling", "c-sampling", "medium", "Design weights typically start from:", ["Equal 1 for every unit", "Inverse of selection probability", "GDP of the state", "Interviewer preference"], 1, "Base weights are inverse inclusion probabilities."),
  ];

  const documents: DocumentRecord[] = [
    { id: "doc-sql-handbook", title: "SQL Handbook for Official Statistics (synthetic excerpt)", courseId: "crs-sql-os", mimeType: "application/pdf", status: "indexed", excerpt: "WHERE filters unit records before aggregation. Weighted indicators use SUM(value * weight) / SUM(weight)." },
    { id: "doc-sampling", title: "NSSTA Sampling Methods notes (synthetic excerpt)", courseId: "crs-sampling", mimeType: "application/pdf", status: "indexed", excerpt: "Stratification improves precision. Design weights are inverse selection probabilities." },
  ];
  const chunks: DocumentChunk[] = [
    { id: "chk-1", documentId: "doc-sql-handbook", index: 0, text: "In official statistics processing, WHERE filters unit records before GROUP BY. Weighted labour indicators use SUM(employed * weight) / SUM(weight).", competencyId: "c-sql" },
    { id: "chk-2", documentId: "doc-sql-handbook", index: 1, text: "Do not publish unit-record extracts. Aggregate first and suppress small cells. LEFT JOIN codebook tables so unmatched survey codes remain for quality review.", competencyId: "c-sql" },
    { id: "chk-3", documentId: "doc-sampling", index: 0, text: "Stratified sampling groups similar units to improve precision. Base weights equal the inverse of selection probability.", competencyId: "c-sampling" },
  ];

  return {
    organization,
    departments,
    jobRoles,
    users,
    employees,
    categories,
    competencies,
    employeeCompetencies,
    roleCompetencies,
    courses,
    courseCompetencies,
    programmes,
    enrollments,
    assessments,
    questions,
    documents,
    chunks,
  };
}

function c(
  id: string,
  title: string,
  description: string,
  provider: Course["provider"],
  durationHours: number,
  difficulty: Course["difficulty"],
  qualityScore: number,
  externalId?: string,
): Course {
  return {
    id,
    title,
    description,
    provider,
    externalId,
    durationHours,
    difficulty,
    language: "en",
    deliveryMode: "online",
    sourceUrl: provider === "igot" ? "https://www.igotkarmayogi.gov.in/" : "https://nssta.gov.in/",
    qualityScore,
    availability: "open",
  };
}

function q(
  id: string,
  assessmentId: string,
  competencyId: string,
  difficulty: Question["difficulty"],
  prompt: string,
  options: string[],
  correctIndex: number,
  explanation: string,
): Question {
  return {
    id,
    assessmentId,
    competencyId,
    difficulty,
    prompt,
    options,
    correctIndex,
    explanation,
    sourceDocumentId: "doc-sql-handbook",
    status: "published",
  };
}

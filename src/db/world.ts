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
    { id: "asm-python-etl", title: "Python ETL for Statistical Pipelines — Assessment", competencyId: "c-python", courseId: "crs-python-etl", questionCount: 5, adaptive: true },
    { id: "asm-sampling", title: "Sampling Methods for Household Surveys — Assessment", competencyId: "c-sampling", courseId: "crs-sampling", questionCount: 5, adaptive: true },
    { id: "asm-plfs", title: "PLFS Concepts and Tabulation Check", competencyId: "c-labour", courseId: "crs-plfs", questionCount: 5, adaptive: true },
    { id: "asm-viz", title: "Statistical Visualization for Policy Briefs Check", competencyId: "c-viz", courseId: "crs-viz", questionCount: 5, adaptive: true },
    { id: "asm-aiml", title: "Responsible AI for Official Statistics Assessment", competencyId: "c-aiml", courseId: "crs-aiml", questionCount: 5, adaptive: true },
    { id: "asm-gis", title: "GIS for Census and Survey Operations Check", competencyId: "c-gis", courseId: "crs-gis", questionCount: 5, adaptive: true },
    { id: "asm-quality", title: "NQAF and Data Quality Reporting Assessment", competencyId: "c-quality", courseId: "crs-quality", questionCount: 5, adaptive: true },
    { id: "asm-api", title: "Publishing Statistical APIs Assessment", competencyId: "c-api", courseId: "crs-api", questionCount: 5, adaptive: true },
    { id: "asm-cloud", title: "Cloud Patterns for Statistical Systems Check", competencyId: "c-cloud", courseId: "crs-cloud", questionCount: 5, adaptive: true },
    { id: "asm-lead", title: "Leading Statistical Production Teams Check", competencyId: "c-lead", courseId: "crs-lead", questionCount: 5, adaptive: true },
    { id: "asm-sdmx", title: "SDMX & Metadata for Dissemination Check", competencyId: "c-meta", courseId: "crs-sdmx", questionCount: 5, adaptive: true },
    { id: "asm-na", title: "National Accounts Compilation Workshop Assessment", competencyId: "c-na", courseId: "crs-na", questionCount: 5, adaptive: true },
    { id: "asm-cyber", title: "Microdata Protection & Cyber Hygiene Check", competencyId: "c-cyber", courseId: "crs-cyber", questionCount: 5, adaptive: true },
  ];

  const questions: Question[] = [
    // SQL for Official Statistics
    q("q-sql-1", "asm-sql", "c-sql", "easy", "In a household survey microdata table, which SQL clause filters rows before aggregation?", ["GROUP BY", "WHERE", "HAVING", "ORDER BY"], 1, "WHERE filters row-level records before grouping."),
    q("q-sql-2", "asm-sql", "c-sql", "medium", "A weighted employment rate should typically be computed using which approach?", ["Unweighted COUNT of employed / COUNT of persons", "SUM(employed_flag * weight) / SUM(weight) for persons in scope", "AVG of the weight column", "MAX(employed_flag)"], 1, "Official labour indicators use survey weights."),
    q("q-sql-3", "asm-sql", "c-sql", "medium", "Why is a LEFT JOIN often preferred when attaching a small codebook to survey records?", ["It drops unmatched survey records", "It keeps all survey records even if a code is missing", "It always runs faster than INNER JOIN", "It prevents duplicate keys"], 1, "LEFT JOIN preserves the survey universe."),
    q("q-sql-4", "asm-sql", "c-sql", "hard", "Which practice reduces disclosure risk when publishing SQL extracts from microdata?", ["Selecting SELECT * from the unit record table", "Publishing identifiable keys at the lowest geography", "Releasing only aggregated outputs and suppressing small cells", "Sharing unweighted unit records via email"], 2, "Safe dissemination uses aggregation and suppression."),
    q("q-sql-5", "asm-sql", "c-sql", "hard", "An IIP series join fails because month is stored as '04' in one table and 4 in another. What should a production pipeline do first?", ["Cast silently and proceed without a log", "Reject the job, log the type mismatch, and apply an explicit, tested cast", "Drop the month column", "Average the two encodings"], 1, "Type normalization must be explicit and auditable."),

    // Python ETL
    q("q-py-1", "asm-python-etl", "c-python", "easy", "Which pandas function is standard for loading large delimited MoSPI microdata files?", ["pd.read_csv()", "pd.parse_table()", "pd.open_data()", "pd.fetch_stream()"], 0, "pd.read_csv() is the standard tabular ingestion function."),
    q("q-py-2", "asm-python-etl", "c-python", "medium", "When validating survey record ranges in an automated pipeline, which library provides declarative schema validation?", ["pydantic / pandera", "matplotlib", "sqlite3", "pickle"], 0, "Pandera and Pydantic provide schema and constraint checks."),
    q("q-py-3", "asm-python-etl", "c-python", "medium", "In an ETL pipeline, how should missing categorical response codes (e.g., '99=Not Reported') be handled?", ["Convert silently to zero", "Map explicitly to NA / Sentinel categories with logging", "Drop the entire column", "Impute with column mean"], 1, "Survey sentinel codes require explicit missingness mapping."),
    q("q-py-4", "asm-python-etl", "c-python", "hard", "To prevent memory exhaustion when processing a 10GB census raw extract, which Python paradigm is recommended?", ["Loading the entire file with df = pd.read_csv()", "Using chunksize iterator or Polars streaming engine", "Converting the file to string first", "Disabling garbage collection"], 1, "Chunked reading and streaming prevents out-of-memory errors."),
    q("q-py-5", "asm-python-etl", "c-python", "hard", "What is the primary advantage of storing processed statistical series in Apache Parquet format vs CSV?", ["Parquet is human readable in plain text", "Columnar compression, schema preservation, and fast predicate pushdown", "Parquet removes all numerical precision", "CSV supports faster binary indexing"], 1, "Parquet provides compressed columnar storage and type safety."),

    // Sampling Methods
    q("q-sam-1", "asm-sampling", "c-sampling", "easy", "In a stratified sample, primary purpose of stratification is to:", ["Increase interviewer travel", "Improve precision for key domains", "Eliminate the need for weights", "Guarantee a census"], 1, "Stratification groups similar units."),
    q("q-sam-2", "asm-sampling", "c-sampling", "medium", "Design weights typically start from:", ["Equal 1 for every unit", "Inverse of selection probability", "GDP of the state", "Interviewer preference"], 1, "Base weights are inverse inclusion probabilities."),
    q("q-sam-3", "asm-sampling", "c-sampling", "medium", "In NSSO surveys, what is the role of First Stage Units (FSUs)?", ["They represent individual citizens", "They are Census villages or Urban Frame Survey (UFS) blocks selected in stage 1", "They are state capital statistical offices", "They are survey questionnaires"], 1, "FSUs are primary geographic sampling units."),
    q("q-sam-4", "asm-sampling", "c-sampling", "hard", "When non-response occurs across strata, which adjustment is standardly applied to sampling weights?", ["Post-stratification or non-response calibration adjustment", "Dividing all weights by 2", "Ignoring the missing units", "Multiplying weights by zero"], 0, "Weight calibration corrects for non-response bias."),
    q("q-sam-5", "asm-sampling", "c-sampling", "hard", "What formula expresses the design effect (Deff) of a cluster sample relative to simple random sampling?", ["Deff = 1 + (m - 1) * rho (where m is cluster size, rho is intra-cluster correlation)", "Deff = m / rho", "Deff = 1 / sqrt(N)", "Deff = Variance(SRS) / Variance(Cluster)"], 0, "Design effect accounts for clustering correlation."),

    // PLFS
    q("q-plfs-1", "asm-plfs", "c-labour", "easy", "Which measure in PLFS captures activity status over a 365-day reference period?", ["Current Daily Status (CDS)", "Usual Principal and Subsidiary Status (UPSS)", "Current Weekly Status (CWS)", "Monthly Activity Status (MAS)"], 1, "UPSS reflects 365-day long-term economic activity."),
    q("q-plfs-2", "asm-plfs", "c-labour", "medium", "Worker Population Ratio (WPR) is calculated as:", ["(Employed Persons / Total Population) * 100", "(Employed Persons / Unemployed Persons) * 100", "(Unemployed Persons / Labour Force) * 100", "(Labour Force / Total Population) * 100"], 0, "WPR is the percentage of employed persons in total population."),
    q("q-plfs-3", "asm-plfs", "c-labour", "hard", "How is Unemployment Rate (UR) defined in official NSSO reports?", ["(Unemployed / Total Population) * 100", "(Unemployed / Labour Force) * 100", "(Unemployed / Employed) * 100", "(Out of Labour Force / Total Population) * 100"], 1, "UR is the percentage of unemployed persons within the labour force."),

    // Visualization
    q("q-viz-1", "asm-viz", "c-viz", "easy", "Which chart type is most appropriate for displaying time-series price indices like monthly CPI?", ["Pie chart", "Line chart", "3D Donut chart", "Radar chart"], 1, "Line charts clearly convey continuous time trends."),
    q("q-viz-2", "asm-viz", "c-viz", "medium", "Why should the y-axis on official bar charts comparison generally start at zero?", ["To save ink", "To prevent visual exaggeration of small differences", "Zero is required by SVG specifications", "Non-zero axes are illegal"], 1, "Truncated axes create misleading visual height ratios."),

    // AI/ML
    q("q-aiml-1", "asm-aiml", "c-aiml", "easy", "In official statistical production, what is the mandatory requirement before deploying an AI model for imputation?", ["Full audit trail, explainability, and methodology peer-review", "Zero human oversight", "Using proprietary closed models exclusively", "Running models without validation"], 0, "Official statistics require transparent, reproducible models."),
    q("q-aiml-2", "asm-aiml", "c-aiml", "medium", "What risk arises when an ungrounded LLM generates economic statistics?", ["Hallucination / fabricating plausible numbers", "Overfitting to true Census tables", "Excessive precision", "Zero latency"], 0, "Generative models can hallucinate false numerical statistics without RAG."),

    // GIS
    q("q-gis-1", "asm-gis", "c-gis", "medium", "What coordinate reference system (CRS) standard is most commonly used for Indian geospatial survey mapping?", ["EPSG:4326 (WGS84)", "EPSG:3857 (Web Mercator) only", "Local planar projection without datum", "Cartesian pixels"], 0, "WGS84 (EPSG:4326) is the standard geographic reference system."),

    // Quality
    q("q-qual-1", "asm-quality", "c-quality", "easy", "What does NQAF stand for in UN and MoSPI statistical governance?", ["National Quality Assurance Framework", "National Quick Accounting Frame", "Networked Quantitative Analysis Format", "Numerical Quality Algorithm Framework"], 0, "NQAF is the UN National Quality Assurance Framework."),

    // APIs
    q("q-api-1", "asm-api", "c-api", "easy", "Which HTTP status code signifies that a statistical query requires authentication?", ["200 OK", "401 Unauthorized", "500 Internal Error", "301 Redirect"], 1, "401 indicates missing or invalid authentication credentials."),

    // National Accounts
    q("q-na-1", "asm-na", "c-na", "medium", "In SNA 2008, Gross Value Added (GVA) at basic prices is derived from GVA at factor cost by:", ["Adding production taxes and subtracting production subsidies", "Subtracting all product taxes", "Adding export duties", "Multiplying by deflator"], 0, "GVA basic = GVA factor cost + (Production taxes - Production subsidies)."),
    q("q-na-2", "asm-na", "c-na", "hard", "How is GDP at market prices linked to GVA at basic prices?", ["GDP at market prices = GVA at basic prices + Product taxes - Product subsidies", "GDP at market prices = GVA at basic prices - Production taxes", "GDP at market prices = GVA at factor cost", "GDP = Gross National Income"], 0, "GDP = GVA basic + Net product taxes."),

    // Microdata Protection
    q("q-cyb-1", "asm-cyber", "c-cyber", "easy", "What is the core objective of Statistical Disclosure Control (SDC)?", ["To maximize file sizes", "To prevent re-identification of surveyed individuals or enterprises in released microdata", "To encrypt private internal emails", "To hide all statistical results from public"], 1, "SDC protects respondent privacy and confidentiality."),
    q("q-cyb-2", "asm-cyber", "c-cyber", "medium", "k-anonymity (k >= 3) ensures that:", ["Every combination of quasi-identifiers matches at least k individuals in the dataset", "The dataset is deleted after 3 days", "Only 3 variables can be downloaded", "Data is encrypted with 3 keys"], 0, "k-anonymity guarantees at least k indistinct records per quasi-identifier."),
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

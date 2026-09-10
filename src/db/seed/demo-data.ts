import type {
  Assessment,
  AssessmentAttempt,
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

export const organization: Organization = {
  id: "org-mospi-demo",
  name: "Official Statistical System (Synthetic Demo)",
  code: "OSS-DEMO",
  synthetic: true,
};

export const departments: Department[] = [
  { id: "dept-diid", organizationId: organization.id, name: "Data Informatics & Innovation Division", code: "DIID" },
  { id: "dept-nad", organizationId: organization.id, name: "National Accounts Division", code: "NAD" },
  { id: "dept-ssd", organizationId: organization.id, name: "Social Statistics Division", code: "SSD" },
  { id: "dept-esd", organizationId: organization.id, name: "Economic Statistics Division", code: "ESD" },
  { id: "dept-nsso", organizationId: organization.id, name: "National Sample Survey Office", code: "NSSO" },
  { id: "dept-field", organizationId: organization.id, name: "Field Operations Division", code: "FOD" },
];

export const categories: CompetencyCategory[] = [
  { id: "cat-stat", name: "Statistical Competencies", description: "Official statistics methods and domains." },
  { id: "cat-tech", name: "Technical Competencies", description: "Tools, computing and data engineering." },
  { id: "cat-gov", name: "Digital Governance", description: "Public digital infrastructure and data policy." },
  { id: "cat-beh", name: "Behavioural and Managerial", description: "Leadership, communication and coordination." },
];

export const competencies: Competency[] = [
  c("c-survey", "cat-stat", "Survey Design", "Design of household and establishment surveys."),
  c("c-sampling", "cat-stat", "Sampling", "Sample design, allocation and estimation."),
  c("c-na", "cat-stat", "National Accounts", "SNA concepts, GDP compilation and bridging."),
  c("c-price", "cat-stat", "Price Statistics", "CPI, WPI and deflators."),
  c("c-labour", "cat-stat", "Labour Statistics", "PLFS concepts, employment and wages."),
  c("c-agri", "cat-stat", "Agricultural Statistics", "Crop statistics, land use and agri surveys."),
  c("c-ind", "cat-stat", "Industrial Statistics", "ASI, IIP and industry classifications."),
  c("c-sdg", "cat-stat", "SDG Indicators", "SDG metadata, disaggregation and reporting."),
  c("c-meta", "cat-stat", "Metadata Standards", "SDMX, DDI and statistical metadata."),
  c("c-quality", "cat-stat", "Data Quality Frameworks", "Accuracy, coherence and quality reporting."),
  c("c-inference", "cat-stat", "Statistical Inference", "Estimation, variance and hypothesis tests."),
  c("c-python", "cat-tech", "Python", "Python for statistical computing and ETL."),
  c("c-r", "cat-tech", "R", "R for official statistics analysis."),
  c("c-sql", "cat-tech", "SQL", "Querying statistical databases and warehouses."),
  c("c-stata", "cat-tech", "Stata", "Survey processing in Stata."),
  c("c-spss", "cat-tech", "SPSS", "Tabulation and analysis in SPSS."),
  c("c-gis", "cat-tech", "GIS", "Geospatial statistics and mapping.", true),
  c("c-viz", "cat-tech", "Data Visualization", "Charts, dashboards and statistical graphics.", true),
  c("c-aiml", "cat-tech", "AI/ML", "Supervised models and responsible AI for statistics.", true),
  c("c-cloud", "cat-tech", "Cloud Computing", "Cloud platforms for data pipelines.", true),
  c("c-api", "cat-tech", "APIs", "Publishing and consuming statistical APIs.", true),
  c("c-opendata", "cat-tech", "Open Data", "Open data standards and dissemination."),
  c("c-statcomp", "cat-tech", "Statistical Computing", "Reproducible computation and notebooks.", true),
  c("c-cyber", "cat-tech", "Cybersecurity", "Secure handling of official microdata.", true),
  c("c-dgov", "cat-gov", "Digital Public Infrastructure", "DPI patterns in government data systems."),
  c("c-privacy", "cat-gov", "Data Protection", "PII minimization and disclosure control."),
  c("c-policy", "cat-gov", "Statistical Legislation", "Collection of Statistics Act and codes of practice."),
  c("c-lead", "cat-beh", "Leadership", "Leading statistical production teams."),
  c("c-comm", "cat-beh", "Communication", "Explaining official statistics to non-specialists."),
  c("c-coord", "cat-beh", "Inter-agency Coordination", "Working across ministries and states."),
];

export const jobRoles: JobRole[] = [
  { id: "role-so", name: "Statistical Officer", family: "Production", description: "Produces official statistical products." },
  { id: "role-sso", name: "Senior Statistical Officer", family: "Production", description: "Leads compilation cells." },
  { id: "role-ds", name: "Deputy Director (Statistics)", family: "Leadership", description: "Owns a statistical domain." },
  { id: "role-da", name: "Data Analyst (Official Statistics)", family: "Analytics", description: "Analysis, visualization and quality." },
  { id: "role-de", name: "Data Engineer (Statistical Systems)", family: "Technology", description: "Pipelines, APIs and warehouses." },
  { id: "role-survey", name: "Survey Methodologist", family: "Methods", description: "Sample design and survey operations." },
  { id: "role-gis", name: "Geospatial Statistician", family: "Specialist", description: "GIS-enabled official statistics." },
  { id: "role-trainer", name: "NSSTA Faculty / Trainer", family: "Capacity Building", description: "Designs and delivers training." },
];

const required = (
  roleId: string,
  items: Array<[string, number, number, number]>,
): RoleCompetency[] =>
  items.map(([competencyId, requiredScore, weight, organizationalPriority]) => ({
    roleId,
    competencyId,
    requiredScore,
    weight,
    organizationalPriority,
  }));

export const roleCompetencies: RoleCompetency[] = [
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
    ["c-meta", 65, 0.6, 0.8],
  ]),
  ...required("role-ds", [
    ["c-na", 80, 1, 1],
    ["c-quality", 85, 1, 1],
    ["c-lead", 80, 1, 0.9],
    ["c-policy", 75, 0.8, 0.9],
    ["c-coord", 80, 0.9, 0.9],
    ["c-sdg", 70, 0.7, 0.8],
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
    ["c-opendata", 70, 0.7, 0.8],
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

export const users: User[] = [
  { id: "u-learner", email: "learner@statiq.demo", password: "demo123", role: "LEARNER", employeeId: "emp-ananya", name: "Ananya Sharma" },
  { id: "u-trainer", email: "trainer@statiq.demo", password: "demo123", role: "TRAINER", employeeId: "emp-ravi", name: "Ravi Menon" },
  { id: "u-admin", email: "admin@statiq.demo", password: "demo123", role: "ORG_ADMIN", name: "Kavita Iyer" },
  { id: "u-soham", email: "soham@statiq.demo", password: "demo123", role: "LEARNER", employeeId: "emp-soham", name: "Soham Patel" },
  { id: "u-meera", email: "meera@statiq.demo", password: "demo123", role: "LEARNER", employeeId: "emp-meera", name: "Meera Nair" },
];

export const employees: Employee[] = [
  emp("emp-ananya", "u-learner", "dept-diid", "role-so", "role-da", "Ananya Sharma", "Statistical Officer", "M.A. Statistics", 6, "Build capability as a data analyst for official statistics."),
  emp("emp-ravi", "u-trainer", "dept-diid", "role-trainer", "role-trainer", "Ravi Menon", "Faculty, NSSTA", "Ph.D. Survey Methodology", 14, "Expand digital training programmes."),
  emp("emp-soham", "u-soham", "dept-nsso", "role-so", "role-survey", "Soham Patel", "Statistical Officer", "M.Sc. Statistics", 5, "Become a survey methodologist."),
  emp("emp-meera", "u-meera", "dept-nad", "role-sso", "role-ds", "Meera Nair", "Senior Statistical Officer", "M.A. Economics", 11, "Prepare for Deputy Director responsibilities."),
  emp("emp-arjun", "u-arjun", "dept-esd", "role-da", "role-de", "Arjun Bose", "Data Analyst", "B.Tech + PG Diploma", 4, "Move into statistical data engineering."),
  emp("emp-leena", "u-leena", "dept-ssd", "role-so", "role-da", "Leena Das", "Statistical Officer", "M.Sc. Demography", 7, "Strengthen labour and SDG analytics."),
  emp("emp-imran", "u-imran", "dept-field", "role-so", "role-gis", "Imran Khan", "Field Statistical Officer", "M.A. Geography", 8, "Specialize in geospatial statistics."),
  emp("emp-priya", "u-priya", "dept-diid", "role-de", "role-de", "Priya Sen", "Data Engineer", "B.Tech Computer Science", 6, "Harden APIs and cloud pipelines."),
];

function emp(
  id: string,
  userId: string,
  departmentId: string,
  jobRoleId: string,
  targetRoleId: string,
  name: string,
  designation: string,
  education: string,
  experienceYears: number,
  careerGoal: string,
): Employee {
  return {
    id,
    userId,
    organizationId: organization.id,
    departmentId,
    jobRoleId,
    targetRoleId,
    name,
    designation,
    education,
    experienceYears,
    preferredLanguage: "en",
    careerGoal,
  };
}

function c(
  id: string,
  categoryId: string,
  name: string,
  description: string,
  emerging = false,
): Competency {
  return {
    id,
    categoryId,
    name,
    description,
    measurementMethod: "mixed evidence",
    defaultTargetLevel: 70,
    emerging,
  };
}

const score = (
  employeeId: string,
  competencyId: string,
  value: number,
  extra?: Partial<EmployeeCompetency>,
): EmployeeCompetency => ({
  employeeId,
  competencyId,
  score: value,
  targetLevel: 70,
  confidence: 0.75,
  lastAssessedAt: "2026-07-18",
  evidenceSource: "assessment",
  ...extra,
});

export const employeeCompetencies: EmployeeCompetency[] = [
  score("emp-ananya", "c-survey", 72),
  score("emp-ananya", "c-sampling", 58),
  score("emp-ananya", "c-quality", 64),
  score("emp-ananya", "c-sql", 46),
  score("emp-ananya", "c-python", 38),
  score("emp-ananya", "c-viz", 52),
  score("emp-ananya", "c-inference", 61),
  score("emp-ananya", "c-comm", 70),
  score("emp-ananya", "c-aiml", 28),
  score("emp-ananya", "c-labour", 55),
  score("emp-soham", "c-survey", 80),
  score("emp-soham", "c-sampling", 62),
  score("emp-soham", "c-inference", 58),
  score("emp-soham", "c-stata", 44),
  score("emp-soham", "c-quality", 66),
  score("emp-meera", "c-na", 78),
  score("emp-meera", "c-quality", 74),
  score("emp-meera", "c-lead", 58),
  score("emp-meera", "c-policy", 60),
  score("emp-meera", "c-coord", 63),
  score("emp-meera", "c-sdg", 52),
  score("emp-arjun", "c-sql", 76),
  score("emp-arjun", "c-python", 71),
  score("emp-arjun", "c-viz", 68),
  score("emp-arjun", "c-api", 48),
  score("emp-arjun", "c-cloud", 42),
  score("emp-arjun", "c-cyber", 50),
  score("emp-leena", "c-labour", 74),
  score("emp-leena", "c-sdg", 61),
  score("emp-leena", "c-sql", 40),
  score("emp-leena", "c-python", 33),
  score("emp-leena", "c-viz", 47),
  score("emp-imran", "c-gis", 62),
  score("emp-imran", "c-survey", 70),
  score("emp-imran", "c-python", 36),
  score("emp-imran", "c-viz", 54),
  score("emp-priya", "c-sql", 88),
  score("emp-priya", "c-python", 82),
  score("emp-priya", "c-api", 77),
  score("emp-priya", "c-cloud", 69),
  score("emp-priya", "c-cyber", 71),
  score("emp-ravi", "c-survey", 90),
  score("emp-ravi", "c-sampling", 88),
  score("emp-ravi", "c-comm", 84),
];

export const courses: Course[] = [
  course("crs-sql-os", "SQL for Official Statistics", "Query design for survey and warehouse tables used in statistical production.", "igot", 16, "medium", "en", 0.92, "igot-sql-os"),
  course("crs-python-etl", "Python ETL for Statistical Pipelines", "Ingest, clean and validate statistical datasets in Python.", "igot", 20, "medium", "en", 0.9, "igot-py-etl"),
  course("crs-sampling", "Sampling Methods for Household Surveys", "Stratification, clustering and variance estimation.", "nssta", 24, "hard", "en", 0.95),
  course("crs-plfs", "PLFS Concepts and Tabulation", "Labour force concepts, weights and standard tables.", "nssta", 18, "medium", "en", 0.88),
  course("crs-viz", "Statistical Visualization for Policy Briefs", "Choosing honest charts for official releases.", "internal", 10, "easy", "en", 0.86),
  course("crs-aiml", "Responsible AI for Official Statistics", "Where ML helps compilation — and where it must not invent numbers.", "igot", 14, "medium", "en", 0.84, "igot-aiml-os"),
  course("crs-gis", "GIS for Census and Survey Operations", "Geospatial frames, maps and small-area indicators.", "tpac", 16, "medium", "en", 0.87),
  course("crs-quality", "NQAF and Data Quality Reporting", "Apply national quality assurance frameworks to products.", "nssta", 12, "medium", "en", 0.91),
  course("crs-api", "Publishing Statistical APIs", "Designing machine-readable official statistics APIs.", "internal", 12, "medium", "en", 0.83),
  course("crs-cloud", "Cloud Patterns for Statistical Systems", "Secure, auditable processing in the cloud.", "igot", 15, "hard", "en", 0.8, "igot-cloud"),
  course("crs-lead", "Leading Statistical Production Teams", "Planning, review culture and inter-agency work.", "internal", 8, "easy", "en", 0.78),
  course("crs-sdmx", "SDMX and Metadata for Dissemination", "Metadata-driven exchange of statistical datasets.", "nssta", 10, "medium", "en", 0.85),
  course("crs-na", "National Accounts Compilation Workshop", "SNA sequence of accounts and bridging.", "nssta", 30, "hard", "en", 0.93),
  course("crs-cyber", "Microdata Protection and Cyber Hygiene", "Disclosure control, access labs and incident basics.", "igot", 8, "easy", "en", 0.88, "igot-cyber"),
];

function course(
  id: string,
  title: string,
  description: string,
  provider: Course["provider"],
  durationHours: number,
  difficulty: Course["difficulty"],
  language: string,
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
    language,
    deliveryMode: "online",
    sourceUrl: provider === "igot" ? "https://www.igotkarmayogi.gov.in/" : "https://nssta.gov.in/",
    qualityScore,
    availability: "open",
  };
}

export const courseCompetencies: CourseCompetency[] = [
  { courseId: "crs-sql-os", competencyId: "c-sql", coverage: 0.95 },
  { courseId: "crs-sql-os", competencyId: "c-quality", coverage: 0.3 },
  { courseId: "crs-python-etl", competencyId: "c-python", coverage: 0.9 },
  { courseId: "crs-python-etl", competencyId: "c-statcomp", coverage: 0.6 },
  { courseId: "crs-sampling", competencyId: "c-sampling", coverage: 0.95 },
  { courseId: "crs-sampling", competencyId: "c-survey", coverage: 0.7 },
  { courseId: "crs-sampling", competencyId: "c-inference", coverage: 0.5 },
  { courseId: "crs-plfs", competencyId: "c-labour", coverage: 0.9 },
  { courseId: "crs-plfs", competencyId: "c-survey", coverage: 0.4 },
  { courseId: "crs-viz", competencyId: "c-viz", coverage: 0.95 },
  { courseId: "crs-viz", competencyId: "c-comm", coverage: 0.4 },
  { courseId: "crs-aiml", competencyId: "c-aiml", coverage: 0.9 },
  { courseId: "crs-aiml", competencyId: "c-python", coverage: 0.3 },
  { courseId: "crs-gis", competencyId: "c-gis", coverage: 0.95 },
  { courseId: "crs-quality", competencyId: "c-quality", coverage: 0.95 },
  { courseId: "crs-quality", competencyId: "c-meta", coverage: 0.4 },
  { courseId: "crs-api", competencyId: "c-api", coverage: 0.95 },
  { courseId: "crs-api", competencyId: "c-opendata", coverage: 0.5 },
  { courseId: "crs-cloud", competencyId: "c-cloud", coverage: 0.9 },
  { courseId: "crs-cloud", competencyId: "c-cyber", coverage: 0.4 },
  { courseId: "crs-lead", competencyId: "c-lead", coverage: 0.9 },
  { courseId: "crs-lead", competencyId: "c-coord", coverage: 0.5 },
  { courseId: "crs-sdmx", competencyId: "c-meta", coverage: 0.95 },
  { courseId: "crs-na", competencyId: "c-na", coverage: 0.95 },
  { courseId: "crs-cyber", competencyId: "c-cyber", coverage: 0.95 },
  { courseId: "crs-cyber", competencyId: "c-privacy", coverage: 0.6 },
];

export const programmes: TrainingProgramme[] = [
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
];

export const enrollments: Enrollment[] = [
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

export const assessments: Assessment[] = [
  {
    id: "asm-sql",
    title: "SQL for Official Statistics — Adaptive Check",
    competencyId: "c-sql",
    courseId: "crs-sql-os",
    questionCount: 5,
    adaptive: true,
  },
  {
    id: "asm-sampling",
    title: "Sampling Methods Check",
    competencyId: "c-sampling",
    courseId: "crs-sampling",
    questionCount: 5,
    adaptive: true,
  },
];

export const questions: Question[] = [
  q("q-sql-1", "asm-sql", "c-sql", "easy", "In a household survey microdata table, which SQL clause filters rows before aggregation?", ["GROUP BY", "WHERE", "HAVING", "ORDER BY"], 1, "WHERE filters row-level records before grouping. HAVING filters aggregated groups."),
  q("q-sql-2", "asm-sql", "c-sql", "medium", "A weighted employment rate should typically be computed using which approach?", ["Unweighted COUNT of employed / COUNT of persons", "SUM(employed_flag * weight) / SUM(weight) for persons in scope", "AVG of the weight column", "MAX(employed_flag)"], 1, "Official labour indicators use survey weights. The ratio of weighted employed to weighted persons in scope is the standard construction."),
  q("q-sql-3", "asm-sql", "c-sql", "medium", "Why is a LEFT JOIN often preferred when attaching a small codebook to survey records?", ["It drops unmatched survey records", "It keeps all survey records even if a code is missing", "It always runs faster than INNER JOIN", "It prevents duplicate keys"], 1, "LEFT JOIN preserves the survey universe. Missing codebook matches remain visible for quality review."),
  q("q-sql-4", "asm-sql", "c-sql", "hard", "Which practice reduces disclosure risk when publishing SQL extracts from microdata?", ["Selecting SELECT * from the unit record table", "Publishing identifiable keys with geography at the lowest level", "Releasing only aggregated outputs and suppressing small cells", "Sharing unweighted unit records internally via email"], 2, "Safe dissemination uses aggregation and small-cell suppression rather than unit-record extracts."),
  q("q-sql-5", "asm-sql", "c-sql", "hard", "An IIP series join fails because month is stored as '04' in one table and 4 in another. What should a production pipeline do first?", ["Cast silently and proceed without a log", "Reject the job, log the type mismatch, and apply an explicit, tested cast/normalization", "Drop the month column", "Average the two month encodings"], 1, "Statistical pipelines must make type normalization explicit and auditable. Silent casts hide quality incidents."),
  q("q-sam-1", "asm-sampling", "c-sampling", "easy", "In a stratified sample, primary purpose of stratification is to:", ["Increase interviewer travel", "Improve precision for key domains", "Eliminate the need for weights", "Guarantee a census"], 1, "Stratification groups similar units so domain estimates have lower variance."),
  q("q-sam-2", "asm-sampling", "c-sampling", "medium", "Design weights typically start from:", ["Equal 1 for every unit", "Inverse of selection probability", "GDP of the state", "Interviewer preference"], 1, "Base weights are the inverse of inclusion probabilities, then adjusted for non-response."),
];

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

export const attempts: AssessmentAttempt[] = [
  {
    id: "att-1",
    assessmentId: "asm-sql",
    employeeId: "emp-ananya",
    score: 60,
    startedAt: "2026-07-18T10:00:00+05:30",
    submittedAt: "2026-07-18T10:18:00+05:30",
  },
];

export const documents: DocumentRecord[] = [
  {
    id: "doc-sql-handbook",
    title: "SQL Handbook for Official Statistics (synthetic excerpt)",
    courseId: "crs-sql-os",
    mimeType: "application/pdf",
    status: "indexed",
    excerpt: "Survey microdata should be filtered with WHERE before aggregation. Weighted indicators use SUM(value * weight) / SUM(weight).",
  },
  {
    id: "doc-sampling",
    title: "NSSTA Sampling Methods notes (synthetic excerpt)",
    courseId: "crs-sampling",
    mimeType: "application/pdf",
    status: "indexed",
    excerpt: "Stratification improves precision for planned domains. Design weights are inverse selection probabilities.",
  },
];

export const chunks: DocumentChunk[] = [
  {
    id: "chk-1",
    documentId: "doc-sql-handbook",
    index: 0,
    text: "In official statistics processing, WHERE filters unit records before GROUP BY. HAVING is applied after aggregation. Weighted labour indicators use SUM(employed * weight) / SUM(weight) for the relevant population.",
    competencyId: "c-sql",
  },
  {
    id: "chk-2",
    documentId: "doc-sql-handbook",
    index: 1,
    text: "Do not publish unit-record extracts. Aggregate first and suppress small cells. LEFT JOIN codebook tables so unmatched survey codes remain for quality review.",
    competencyId: "c-sql",
  },
  {
    id: "chk-3",
    documentId: "doc-sampling",
    index: 0,
    text: "Stratified sampling groups similar units to improve precision. Base weights equal the inverse of selection probability and are then adjusted for non-response.",
    competencyId: "c-sampling",
  },
];

export const SYNTHETIC_NOTICE =
  "All employee, assessment and learning records in this demo are synthetic. They do not represent actual MoSPI personnel.";

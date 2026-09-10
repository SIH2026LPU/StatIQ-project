# StatIQ AI — Full Feature Specification (Learner / Trainer / Admin)

**Grounded in:** PS 26101 (MoSPI/DIID), Mission Karmayogi's FRAC model (Framework
of Roles, Activities, Competencies), NSSTA/TPAC's real training-approval process,
and iGOT Karmayogi's actual competency architecture — researched, not guessed.
**Stack assumed:** Next.js frontend + Node/Express backend + SQLite
(`better-sqlite3`), matching your current `statiq-ai-backend`. Every feature
below is written to be buildable on that stack — no Postgres/pgvector required,
with a callout where you'd eventually outgrow SQLite.

This file replaces "demo website" with "working system": every feature has a
data model, a real algorithm or state machine, and API endpoints — not just a
UI mockup.

---

## 0. What real government platforms taught this design

A few searches turned up detail your original docs didn't have, and it changes
the design in useful ways:

- **FRAC, not just "competencies."** Mission Karmayogi's actual model is
  **Roles → Activities → Competencies**, not competencies floating on their
  own. Every civil service *position* is "FRACed": its activities are listed,
  and each activity requires specific competencies at specific proficiency
  levels. This is more defensible to judges than a flat competency list — it's
  literally the government's own framework. **Adopt it:** add an `activities`
  table between `job_roles` and `competencies`.
- **70:20:10 rule.** iGOT's content model assumes 70% self-paced digital
  learning, 20% on-the-job, 10% classroom/physical. Your recommendation engine
  should be able to tag a recommendation by which bucket it falls into — this
  is a genuine differentiator to mention in your pitch.
- **ASK framework.** Attitude, Skill, Knowledge — the three competency *types*
  Mission Karmayogi actually scores against. Your `competency_domain` enum
  should map onto this, not just Statistical/Technical/Governance/Behavioural.
- **NSSTA training is TPAC-approved, not freely listed.** Real NSSTA/TPAC
  programmes go through a **Training Programme Approval Committee** chaired by
  the DG (Coordination & Administration), NSO. That means, realistically, your
  "trainer creates a training programme" feature should have an
  **approval workflow**, not instant publish — this maps naturally onto your
  existing `review_status` pattern for AI-generated MCQs, just reused for
  programmes too.
- **iGOT already does role-based content routing and analytics dashboards for
  Ministries/Departments (MDOs).** Your Admin side should speak that language
  — "workforce readiness," "department benchmarking" — because that's what a
  DIID/MoSPI evaluator will actually be comparing you against mentally.

---

## 1. Data model additions (SQLite, matches your existing `better-sqlite3` schema)

```sql
-- FRAC layer
CREATE TABLE activities (
  id TEXT PRIMARY KEY,
  job_role_id TEXT NOT NULL REFERENCES job_roles(id),
  name TEXT NOT NULL,              -- e.g. "Design and pilot a household survey"
  description TEXT
);

CREATE TABLE activity_competencies (
  activity_id TEXT NOT NULL REFERENCES activities(id),
  competency_id TEXT NOT NULL REFERENCES competencies(id),
  required_level INTEGER NOT NULL,  -- 0-100
  PRIMARY KEY (activity_id, competency_id)
);

-- competency "type" per ASK model, in addition to your existing domain
ALTER TABLE competencies ADD COLUMN ask_type TEXT
  CHECK (ask_type IN ('ATTITUDE','SKILL','KNOWLEDGE')) DEFAULT 'KNOWLEDGE';

-- 70:20:10 tagging on courses/recommendations
ALTER TABLE courses ADD COLUMN learning_bucket TEXT
  CHECK (learning_bucket IN ('DIGITAL_70','ON_JOB_20','CLASSROOM_10')) DEFAULT 'DIGITAL_70';

-- Training programme approval workflow (TPAC-style)
CREATE TABLE training_programmes (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  created_by_trainer_id TEXT REFERENCES employees(id),
  status TEXT CHECK (status IN ('DRAFT','PENDING_APPROVAL','APPROVED','REJECTED')) DEFAULT 'DRAFT',
  approved_by_admin_id TEXT REFERENCES employees(id),
  approval_notes TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  decided_at TEXT
);

-- Immutable competency-score audit trail (same reasoning as the Postgres version)
CREATE TABLE competency_score_history (
  id TEXT PRIMARY KEY,
  employee_id TEXT NOT NULL REFERENCES employees(id),
  competency_id TEXT NOT NULL REFERENCES competencies(id),
  old_score INTEGER NOT NULL,
  new_score INTEGER NOT NULL,
  evidence_type TEXT NOT NULL,
  evidence_ref_id TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

-- Sync/audit log for every external or AI call (keeps the "is this live?" story honest)
CREATE TABLE integration_sync_logs (
  id TEXT PRIMARY KEY,
  source TEXT NOT NULL,
  status TEXT CHECK (status IN ('RUNNING','SUCCESS','FAILED')) NOT NULL,
  records_fetched INTEGER DEFAULT 0,
  error_message TEXT,
  started_at TEXT DEFAULT (datetime('now')),
  finished_at TEXT
);
```

> **SQLite ceiling to know about:** no native vector search. For AI Tutor / RAG
> at demo scale (a few hundred document chunks), store embeddings as a JSON
> array column and do cosine similarity **in Node** (a `for` loop over ~500
> rows is milliseconds — totally fine for a hackathon demo). If you outgrow
> that, that's when you'd migrate to Postgres+pgvector, not before.

---

## 2. LEARNER SIDE

### 2.1 Competency Passport (`/learner/competencies`)
**What:** Radar/matrix view of the learner's FRAC-mapped competencies —
current score, required level for their role, ASK type, last-assessed date.
**Working logic:** `GET /api/employees/:id/competencies` joins
`employee_competencies` → `competencies` → `activity_competencies` →
`activities` (filtered to the employee's `job_role_id`), returns per-competency
`{ current, required, gap, askType, trend }`. Not static — every score change
anywhere in the system re-renders this.
**Acceptance:** changing one assessment score updates this view without a
manual data refresh needed elsewhere.

### 2.2 Skill Gap Analysis (`/learner/gaps`)
**What:** Prioritized list of gaps, grouped by activity, with "why this
matters" copy pulled from the activity name (e.g. "needed to *Design and pilot
a household survey*").
**Working logic:**
```
gap = max(required_level - current_score, 0)
priority = normalized_gap × role_weight × department_priority × career_relevance
```
Implement as a pure function in `src/services/gapEngine.js` (or `.ts`), called
by `GET /api/employees/:id/skill-gaps?roleId=`. Sort desc by priority. Mark
`isCritical` for any activity your seed data flags as mandatory.
**Acceptance:** two employees in the same role but different current scores
get genuinely different, correctly-ranked gap lists — not fixture data.

### 2.3 Personalized Recommendations (`/learner/courses`)
**What:** Ranked course/programme cards with an explanation sentence per
recommendation, tagged by 70:20:10 bucket.
**Working logic:** weighted score exactly as your `design.md` specifies
(`0.35·gap_coverage + 0.25·role_relevance + 0.10·quality + 0.10·language_match
+ 0.10·dept_priority + 0.10·accessibility`), computed server-side in
`POST /api/recommendations/generate`, persisted to a `recommendations` table
so refreshing the page doesn't silently re-roll different numbers.
**Acceptance:** recommendation order changes visibly after a learner's gap
profile changes (e.g. after completing an assessment).

### 2.4 Course Player + Progress (`/learner/courses/:id`)
**What:** Video/content player, resumable, marks `completion_percent` in
`learning_progress`.
**Working logic:** `PATCH /api/enrollments/:id/progress { completionPercent,
lastAccessedAt }`. On `completionPercent >= 100`, auto-fire a
`COURSE_COMPLETION` evidence event into the competency-update engine (§2.6) —
this is what makes "complete a course" actually move your Competency Passport,
not just show a checkmark.
**Acceptance:** completing a course changes a related competency score, which
you can point at live in a demo.

### 2.5 Assessments & Adaptive Quiz (`/learner/assessments`)
**What:** MCQ/true-false/scenario quiz, adaptive difficulty, instant feedback
with explanation, competency mapping per question.
**Working logic:**
- Server picks the next question's difficulty based on the running streak of
  correct/incorrect answers (simple adaptive rule: 2 correct in a row →
  harder; 2 incorrect → easier; floor/ceiling at BEGINNER/ADVANCED).
- **Score is always computed server-side from stored answers** — never trust
  a client-submitted score. `POST /api/attempts/:id/submit` recomputes from
  `assessment_answers`.
- On submit, call the same competency-update function as §2.6 with
  `evidenceType: 'ASSESSMENT'`.
**Acceptance:** opening browser devtools and editing the client-side score
before submit has zero effect on the stored result.

### 2.6 Competency Update Engine (shared service, not a page)
**What:** The function that actually moves scores.
**Working logic:**
```
new_score = old_score × (1 - w) + evidence_score × w   // w defaults 0.4
```
Runs inside a SQLite transaction, writes to `competency_score_history`
(old, new, evidence_type, evidence_ref_id) every single time — this table is
what you show a judge when they ask "how do I know the AI isn't just making
up scores?"
**Acceptance:** `SELECT * FROM competency_score_history WHERE employee_id = ?`
tells a complete, chronological story of one learner's growth.

### 2.7 AI Tutor (`/learner/tutor`)
**What:** RAG-grounded chat over uploaded training materials, with citations.
**Working logic:**
1. Trainer-uploaded doc → extracted text → chunked (~1000 chars) → embedded →
   stored (JSON array column, per §1's SQLite note).
2. On a learner question: embed the question, cosine-similarity rank chunks
   in Node, take top 4-6, build a prompt that says *"answer only from the
   following excerpts; if the answer isn't in them, say so"* — this is your
   prompt-injection/hallucination defense, and it's cheap to implement.
3. Return the answer **with the source document + chunk** shown in the UI —
   "grounded, not generic" is the single most convincing thing you can show
   about your AI Tutor.
4. Log every call to `ai_interactions` (prompt, retrieved chunk ids, response,
   latency) — same audit reasoning as everywhere else.
**Acceptance:** ask it something not covered by any uploaded document; it says
so instead of confidently inventing an answer.

### 2.8 Role Readiness (`/learner/gaps`, summary widget)
**What:** Single readiness percentage + "what's blocking you" critical-gap
callouts.
**Working logic:**
```
coverage = min(current/required, 1)
readiness = Σ(coverage × weight) / Σ(weight) × 100
```
Critical activities (flagged in `activities`/`activity_competencies`) always
listed separately even if overall readiness looks high — a judge will ask
"what if someone games one easy competency to inflate the average," and this
is your answer.

### 2.9 Achievements / Certificates (`/learner/achievements`)
**What:** Auto-issued certificate on course/programme completion, downloadable
PDF, verifiable via a public verification URL.
**Working logic:** `POST /api/certificates` on completion event, generates a
PDF (use a lightweight lib like `pdf-lib` — no need for a heavy renderer),
stores a `certificate_id` + issue date + a short verification hash. A public
`GET /verify/:certificateId` route (no auth) lets anyone confirm authenticity
— small feature, disproportionately impressive in a demo.

---

## 3. TRAINER SIDE

### 3.1 Material Upload & Indexing (`/trainer/materials`)
**What:** Upload PDF/PPTX/DOCX, see live status (Uploaded → Processing →
Indexed/Failed).
**Working logic:** `POST /api/documents` (multipart) saves the file, kicks off
async extraction (use `pdf-parse` for PDF, `mammoth` for DOCX; PPTX text
extraction via `pptx2json` or unzip+parse `slideN.xml`), then chunk+embed as
in §2.7. Status is a real column in `documents`, polled or pushed via SSE —
not a spinner that always finishes in 2 seconds regardless of file size.
**Acceptance:** upload a 40-page PDF and a 2-page PDF; the bigger one visibly
takes longer and the status field reflects real progress, not a fixed timer.

### 3.2 AI Quiz/MCQ Generator (`/trainer/quiz-studio`)
**What:** Pick a document + competency + question count + difficulty →
generate MCQs grounded in that document.
**Working logic:**
1. Retrieve top-N chunks for the chosen competency/topic (same retrieval as
   AI Tutor).
2. Prompt the LLM for **structured JSON** (`question, options[4],
   correctOptionIndex, explanation, difficulty`) — validate the response with
   a schema (Zod/ajv); reject and retry once if it doesn't validate.
3. **Grounding check:** reject any generated question whose correct answer
   text doesn't appear (or paraphrase-match) anywhere in the source chunk —
   crude but effective duplicate/hallucination filter.
4. **Duplicate check:** reject if prompt text is near-identical (Levenshtein
   or simple token-overlap) to an existing question in the bank.
5. Store as `review_status = 'PENDING_REVIEW'` — never auto-publish.
**Acceptance:** generating 10 questions from a document about, say, sampling
methods never silently produces a question about an unrelated topic — every
question traces to a specific `source_document_id` + `source_chunk_id`.

### 3.3 Question Review Queue (`/trainer/quiz-studio/review`)
**What:** Approve/edit/reject AI-generated questions before they reach a
learner.
**Working logic:** `PATCH /api/questions/:id { reviewStatus, editedFields? }`.
Only `APPROVED` questions are eligible to appear in `assessment_questions`.
This single gate is what makes "AI-generated content is not automatically
trusted" (your own `README.md`'s stated principle) actually true in the code,
not just a sentence in a doc.

### 3.4 Assessment Builder (`/trainer/assessments`)
**What:** Compose an assessment from approved questions, set time limit,
passing score, adaptive on/off, target competency.
**Working logic:** Straightforward CRUD into `assessments` +
`assessment_questions`, but validate server-side: an assessment can't be
published with zero approved questions, and every question must map to the
assessment's stated competency (or be flagged if not).

### 3.5 Training Programme Proposal (`/trainer/programmes`)
**What:** Trainer proposes an NSSTA/TPAC-style training programme (title,
target designation, duration, competencies covered).
**Working logic:** Writes to `training_programmes` with
`status = 'PENDING_APPROVAL'`. This is the feature grounded in real NSSTA
process (§0) — it's not in your original docs, and it's exactly the kind of
detail that shows you researched the actual institution rather than
generic-LMS-ing the problem.
**Acceptance:** a trainer cannot make their own proposed programme
recommendable to learners until an Admin approves it (§4.4).

### 3.6 Learner Analytics for Trainer's Cohort (`/trainer/analytics`)
**What:** Which competencies is *this trainer's* content actually moving;
which questions have unexpectedly low correct-rates (signals a bad or
ambiguous question, not necessarily learner weakness).
**Working logic:** aggregate `assessment_answers` grouped by `question_id`,
compute correct-rate; flag questions below, say, 30% correct-rate for review
— a genuinely useful trainer-facing insight rather than a vanity chart.

---

## 4. ADMIN SIDE

### 4.1 Workforce Command Center (`/admin`)
**What:** Organization-wide readiness at a glance: average readiness score,
count of critical gaps org-wide, active learners, sync health.
**Working logic:** one aggregate query over `employee_competencies` joined to
`role_competencies`/`activity_competencies`, plus a live read of the most
recent rows in `integration_sync_logs` so "Data last synced: X minutes ago"
is real, not decorative.

### 4.2 Competency Heatmap (`/admin/competencies`)
**What:** Department × Competency grid, colored by average coverage.
**Working logic:** `GROUP BY department_id, competency_id`, average
`current_score / required_level`. This is the single most "wow" admin visual
you can build cheaply, and it directly answers requirements.md's example
query — *"Which department has the largest SQL gap?"*
**Acceptance:** the heatmap changes color when you update seed scores — not
a static image.

### 4.3 Department Comparison & Emerging Skills Radar (`/admin/departments`)
**What:** Bar comparison of readiness across departments; trend of which
competencies are most-requested/most-gapped over the last N assessment
cycles.
**Working logic:** window/trend query over `competency_score_history` grouped
by week/month — "emerging" just means gap size is *increasing* period over
period, which you can compute with two aggregate queries and a subtraction.

### 4.4 Training Programme Approval Queue (`/admin/programmes`)
**What:** Approve/reject trainer-proposed programmes (§3.5), with notes.
**Working logic:** `PATCH /api/training-programmes/:id { status: 'APPROVED'
| 'REJECTED', approvalNotes }`. Only `APPROVED` programmes are eligible for
the recommendation engine (§2.3) to surface. This mirrors NSSTA's real
TPAC-chaired approval process almost exactly — cite that in your pitch.

### 4.5 AI Analytics Assistant (`/admin/analytics/ask`)
**What:** Natural-language Q&A over admin-authorized aggregate data only
(never raw learner records) — "Which department has the largest SQL gap?"
**Working logic:** don't let the LLM query the DB directly. Instead: run a
small set of pre-built, parameterized aggregate queries (by competency, by
department, by time range), let the LLM pick *which* query fits the question
and fill parameters (structured tool-call style), execute it yourself, then
have the LLM phrase the answer in prose. This is safer, faster, and far more
demo-reliable than "the LLM writes raw SQL."
**Acceptance:** asking it something outside the pre-built query set (e.g.
"what's my colleague's salary") gets a clear "I can't answer that" — you
control the blast radius by construction, not by hoping the LLM behaves.

### 4.6 Integration & Data Source Health (`/admin/integrations`)
**What:** Live status per external source — data.gov.in (live), MoSPI WPI
(needs token), iGOT/NSSTA (mock, honestly labelled), with last-sync timestamp
and record counts.
**Working logic:** reads straight from `integration_sync_logs` +
`data_source_registry`. This page alone answers "is it actually fetching
data" for any judge who asks — point at it live.

### 4.7 Audit Log Viewer (`/admin/audit`)
**What:** Searchable log of role changes, competency changes, programme
approvals, AI-generated content approvals, document access.
**Working logic:** every write path above already produces an audit row
(`competency_score_history`, `integration_sync_logs`, `training_programmes`
status changes, `questions.review_status` changes) — this page is mostly a
read/filter UI over tables you already have, which is why it's cheap to add
last and disproportionately convincing to have.

---

## 5. Build order (if you're implementing this incrementally)

1. FRAC schema additions (§1) + seed data reshaped around activities, not
   just flat competencies.
2. Gap engine + Readiness engine + Competency-update engine as shared
   services (§2.2, §2.6, §2.8) — everything else depends on these being real.
3. Learner: Competency Passport → Gaps → Assessments (with server-side
   scoring) → the update engine actually firing. Get this loop *demoable*
   before touching Trainer/Admin.
4. Trainer: Material upload/indexing → AI Tutor retrieval (reuse the same
   retrieval code) → Quiz generator → Review queue.
5. Admin: Heatmap + Programme approval queue + Integration health page —
   these are mostly read-side aggregation once steps 2-4 exist.
6. Polish: certificates, audit log viewer, AI analytics assistant.

Steps 1-3 alone turn your "demo website" into a system with one fully real,
end-to-end, judge-defensible loop: **assess → gap → recommend → learn →
reassess → score updates → readiness moves.** That loop, working live, beats
a wider set of static screens every time.
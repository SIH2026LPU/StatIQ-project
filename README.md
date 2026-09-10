# StatIQ AI

> AI-Powered Competency Intelligence & Personalized Learning Platform for India's Official Statistical System

**SIH 2026 Problem Statement:** 26101  
**Organization:** Ministry of Statistics & Programme Implementation (MoSPI)  
**Department:** Data Informatics & Innovation Division (DIID)  
**Theme:** Smart Education

---

## Overview

StatIQ AI is a full-stack, AI-enabled Progressive Web App designed to strengthen capacity building for officials working in India's Official Statistical System.

Instead of acting as a traditional LMS, StatIQ AI creates a continuous competency loop:

```text
Profile
   ↓
Competency Assessment
   ↓
Skill Gap
   ↓
Personalized Recommendation
   ↓
Learning
   ↓
Assessment
   ↓
Competency Update
   ↓
Role Readiness
   ↓
Workforce Intelligence
```

---

## Core Features

### Learner
- AI competency passport.
- Skill-gap analysis.
- Role readiness.
- Personalized learning paths.
- iGOT/NSSTA recommendation adapters.
- AI tutor with RAG.
- Adaptive assessments.
- AI-generated MCQs.
- Learning analytics.
- PWA/offline learning.

### Trainer
- Course and module management.
- Learning material upload.
- AI quiz generator.
- MCQ validation and review.
- Assessment management.
- Learner analytics.

### Administrator
- Workforce command center.
- Competency heatmaps.
- Department comparison.
- Training effectiveness.
- Skill-risk analysis.
- Emerging skills radar.
- AI analytics assistant.

---

## Technology Stack

| Layer | Technology |
|---|---|
| Framework | Next.js + TypeScript |
| Styling | Tailwind CSS |
| UI | shadcn/ui |
| Client State | Zustand |
| Forms | React Hook Form + Zod |
| Charts | Recharts |
| Database | PostgreSQL |
| ORM | Drizzle ORM |
| Vector Search | pgvector |
| AI | Configurable LLM + embeddings |
| PWA | Manifest + Service Worker + IndexedDB |
| Deployment | Vercel |
| File Storage | S3-compatible object storage |

---

## Project Architecture

```text
                    STATIQ AI
                       |
        +--------------+--------------+
        |              |              |
     Learner         Trainer         Admin
        |              |              |
        +--------------+--------------+
                       |
               Competency Engine
                       |
        +--------------+--------------+
        |              |              |
      Gap Engine   Recommendation    RAG
        |              |              |
        +--------------+--------------+
                       |
                Assessment Engine
                       |
                Analytics Engine
                       |
             PostgreSQL + pgvector
```

---

## Documentation

- `requirements.md` — product and system requirements.
- `features.md` — complete feature catalogue.
- `design.md` — architecture and technical design.
- `README.md` — project overview and setup.

---

## Recommended Repository Structure

```text
statiq-ai/
├── src/
│   ├── app/
│   ├── components/
│   ├── db/
│   ├── lib/
│   ├── stores/
│   ├── types/
│   └── hooks/
├── public/
├── drizzle/
├── scripts/
├── docs/
├── tests/
├── requirements.md
├── features.md
├── design.md
├── README.md
├── package.json
├── tsconfig.json
└── .env.example
```

---

## Getting Started

### Prerequisites

- Node.js 20+
- npm/pnpm
- PostgreSQL with pgvector
- Git
- AI provider API key for AI features

### Install

```bash
git clone <repository-url>
cd StatIQ-AI-project
npm install
cp .env.example .env.local
```

### Demo accounts

All passwords: `demo123`

| Role | Email |
|---|---|
| Learner | learner@statiq.demo |
| Trainer | trainer@statiq.demo |
| Administrator | admin@statiq.demo |

The first runnable slice uses an in-memory synthetic store so the closed loop works without PostgreSQL. Drizzle schema stubs live in `src/db/schema` for the managed Postgres + pgvector phase.

### Environment

Create `.env.local`:

```env
DATABASE_URL=
AUTH_SECRET=

AI_API_KEY=
AI_MODEL=
EMBEDDING_MODEL=

STORAGE_ENDPOINT=
STORAGE_BUCKET=
STORAGE_ACCESS_KEY=
STORAGE_SECRET_KEY=

IGOT_API_BASE_URL=
IGOT_API_KEY=

NSSTA_API_BASE_URL=
NSSTA_API_KEY=
```

Never commit `.env.local`.

### Database

Configure PostgreSQL and enable pgvector.

Run migrations using the project's selected migration workflow.

Seed only synthetic/demo data in development.

### Run

```bash
npm run dev
```

Open the local development URL shown by Next.js.

---

## Development Principles

### 1. Server state vs client state

Use Zustand for UI/session-local state.

Do not duplicate the entire database state into Zustand.

### 2. Security

Never rely on UI-only authorization.

Every sensitive server operation must validate authentication, role and organization scope.

### 3. AI

AI-generated content is not automatically trusted.

MCQs must be reviewed before publication.

RAG answers should cite source material.

### 4. Integrations

Do not couple the application directly to external iGOT/NSSTA API responses.

Use adapters.

### 5. Data

Use synthetic data for demonstrations unless authorized production data is available.

---

## AI Architecture

### Competency Intelligence

```text
Employee Profile
      +
Assessment History
      +
Learning History
      +
Role Requirements
      ↓
Competency Engine
      ↓
Skill Gap + Readiness
```

### Recommendation

```text
Skill Gap
   ↓
Course Competency Matching
   ↓
Role Relevance
   ↓
Learning Effort
   ↓
Ranked Recommendations
```

### RAG

```text
Document
 ↓
Extract
 ↓
Chunk
 ↓
Embed
 ↓
pgvector
 ↓
Retrieve
 ↓
LLM
 ↓
Grounded Answer + Sources
```

---

## Demo Dataset

The project should use synthetic data representing:
- Employees.
- Departments.
- Competencies.
- Job roles.
- Courses.
- Training programmes.
- Learning history.
- Assessments.
- Competency evidence.

Synthetic data must be clearly labelled and must not imply that it represents actual MoSPI personnel.

---

## Deployment

The target deployment platform is **Vercel**.

Production architecture:

```text
Git
 ↓
Vercel
 ↓
Next.js
 ├── Server Components
 ├── Route Handlers
 └── Server Actions
       ↓
PostgreSQL + pgvector
       ↓
Object Storage / AI APIs / External Integrations
```

---

## Important Integration Note

The iGOT Karmayogi integration must be implemented behind an interface.

Development:

```text
Mock iGOT Provider
```

Production:

```text
Official iGOT Provider
```

The same domain-level recommendation engine should work with either provider.

The same approach should be used for NSSTA/TPAC integrations.

---

## Roadmap

### Phase 1 — Foundation
- Next.js setup.
- Tailwind/shadcn.
- PostgreSQL.
- Authentication.
- RBAC.
- Core schema.

### Phase 2 — Competency
- Competency framework.
- Employee profiles.
- Role mapping.
- Skill-gap engine.
- Role readiness.

### Phase 3 — Learning
- Courses.
- Enrollments.
- Learning progress.
- Recommendation engine.

### Phase 4 — AI
- RAG.
- AI tutor.
- MCQ generation.
- Question validation.

### Phase 5 — Assessment
- Assessment engine.
- Adaptive quiz.
- Competency updates.

### Phase 6 — Analytics
- Learner dashboard.
- Trainer dashboard.
- Admin command center.
- Skill heatmaps.

### Phase 7 — PWA
- Service worker.
- IndexedDB.
- Offline learning.
- Sync.

### Phase 8 — Integrations
- Mock iGOT.
- Mock NSSTA/TPAC.
- Production adapter when credentials/specifications are available.

### Phase 9 — Production
- Security hardening.
- Performance testing.
- AI evaluation.
- Vercel deployment.
- Monitoring.

---

## Project Success Metric

The primary success metric is not "number of AI features."

The platform should demonstrate that it can:

> identify a real competency gap → recommend relevant learning → assess learning → update competency → show improved role readiness.

That closed-loop capability is the core of StatIQ AI.

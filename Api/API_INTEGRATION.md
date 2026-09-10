# StatIQ AI — Dataset & API Integration Specification

## 1. Purpose

This document defines the real/public data sources, API integration strategy, dataset mappings, authentication approach, synchronization model, and mock-provider strategy for StatIQ AI.

**SIH Problem Statement:** 26101  
**Organization:** Ministry of Statistics & Programme Implementation (MoSPI)  
**Department:** Data Informatics & Innovation Division (DIID)

> Important: Production access to restricted government APIs must only be used after official authorization and credentials are obtained. Never hard-code or invent credentials/endpoints.

---

# 2. Data Source Strategy

StatIQ AI uses five primary data-source families:

| Source | Primary Use | Access Model |
|---|---|---|
| iGOT Karmayogi | Course catalogue, enrolment/progress | Authorized integration / mock adapter |
| NSSTA | Training programmes, calendar, TPAC recommendations | Official public web/documents; adapter |
| MoSPI API Platform | Machine-readable official statistics | API account/token |
| eSankhyiki | Official statistical catalogue and macro indicators | Public/API resources where available |
| MoSPI UnitData | Official microdata | API key / authorized access |
| data.gov.in | Government open-data discovery/API resources | Public API resources where available |

---

# 3. iGOT Karmayogi

## Purpose

Use iGOT as the external learning-resource ecosystem for personalized course recommendations.

The application should support:

- Course discovery.
- Course metadata.
- Course details.
- Enrollment.
- Learning progress.
- Completion status.

## Production Access

Do not assume anonymous public API access.

The application must use:

```text
IGOT_API_BASE_URL
IGOT_API_KEY
IGOT_CLIENT_ID (if supplied)
IGOT_CLIENT_SECRET (if supplied)
```

Only credentials officially supplied to the project should be used.

## Architecture

```text
StatIQ AI
    |
    v
IGOTProvider Interface
    |
    +---- MockIGOTProvider
    |
    +---- OfficialIGOTProvider
                  |
                  v
             iGOT APIs
```

## Provider Interface

```ts
interface IGOTProvider {
  searchCourses(query: string, filters?: CourseFilters): Promise<Course[]>;
  getCourse(courseId: string): Promise<Course | null>;
  enroll(userId: string, courseId: string): Promise<Enrollment>;
  getProgress(userId: string, courseId: string): Promise<CourseProgress>;
  getCompletion(userId: string, courseId: string): Promise<CompletionStatus>;
}
```

## Publicly Observed Integration Evidence

Karmayogi-related public integration documentation demonstrates API-based integration with iGOT infrastructure and enrollment-related operations.

However, this documentation is treated as **integration reference material**, not as authorization to use production endpoints.

Production endpoint paths, headers, credentials and scopes must be confirmed by the iGOT integration authority before deployment.

---

# 4. NSSTA Data

## Purpose

NSSTA data is highly relevant to the recommendation engine because the problem statement explicitly asks for NSSTA/TPAC recommended training programmes.

Use official NSSTA material for:

- Training programmes.
- Training calendar.
- Training topics.
- Target participants.
- Duration.
- Batch information.
- Venue/institute.
- TPAC recommended programmes.

## Suggested Database Tables

```text
nssta_training_programmes
nssta_training_sessions
nssta_training_topics
tpac_programmes
tpac_documents
```

## Suggested Schema

### nssta_training_programmes

```text
id
external_id
title
description
training_type
topic
target_designation
target_department
duration_days
batch_size
delivery_mode
venue
start_date
end_date
source_url
source_document
status
created_at
updated_at
```

### tpac_programmes

```text
id
external_id
programme_title
competency_area
target_role
recommended_for
duration
priority
source_document
source_url
year
status
created_at
updated_at
```

## Competency Mapping

Every NSSTA/TPAC programme should map to one or more StatIQ competencies.

Example:

```text
Programme:
Sampling Methods

Maps to:
- Survey Design
- Sampling
- Statistical Inference
```

---

# 5. MoSPI API Platform

## Purpose

The MoSPI API Platform provides machine-readable access to official statistical data products.

Official API platform:

https://api.mospi.gov.in/

## Authentication

The API platform documents user registration and login mechanisms.

Conceptual flow:

```text
Register / Existing API Account
        |
        v
Login
        |
        v
Access Token
        |
        v
Authorized API Request
```

Store credentials only in server-side environment variables.

Never expose API keys in client-side JavaScript.

## Environment Variables

```env
MOSPI_API_BASE_URL=https://api.mospi.gov.in
MOSPI_API_USERNAME=
MOSPI_API_PASSWORD=
MOSPI_API_TOKEN=
```

Use the authentication mechanism provided by the current official API documentation.

---

# 6. MoSPI WPI API

The MoSPI API documentation includes a WPI records API.

Conceptual endpoint:

```text
GET /api/wpi/getWpiRecords
```

Parameters documented for WPI include fields such as:

```text
year
month
major group
group
subgroup
item
format
```

Use server-side query construction and validate all user-supplied filters.

## Internal Service

```ts
interface MOSPIWPIService {
  getRecords(filters: WPIFilters): Promise<WPIRecord[]>;
}
```

## Database Cache

Optional cache table:

```text
mospi_wpi_records
```

Fields:

```text
id
year
month
major_group
group_name
subgroup
item
value
unit
source
fetched_at
```

The database cache is for application performance and analytics. The official API remains the source of truth when live retrieval is required.

---

# 7. eSankhyiki

## Purpose

eSankhyiki should provide the Official Statistics data/metadata layer.

Official portal:

https://esankhyiki.mospi.gov.in/

Use it for:

- Macro indicators.
- Statistical datasets.
- Metadata.
- Official statistics discovery.
- Learning examples.
- Data-analysis exercises.

## Recommended Internal Tables

```text
esankhyiki_datasets
esankhyiki_indicators
esankhyiki_metadata
esankhyiki_sync_logs
```

## Dataset Schema

```text
id
external_id
title
description
category
frequency
unit
publisher
source_url
api_available
last_synced_at
```

## Indicator Schema

```text
id
dataset_id
indicator_name
period
geography
value
unit
metadata
source
fetched_at
```

---

# 8. MoSPI UnitData

## Purpose

MoSPI UnitData is relevant for official microdata and statistical learning exercises.

Use it for datasets such as:

- PLFS.
- NSS datasets.
- ASI.
- Other official survey/microdata collections.

The UnitData ecosystem provides programmatic dataset/file discovery and download capabilities using authorized access.

## Architecture

```text
StatIQ AI
    |
    v
UnitDataProvider
    |
    v
Official UnitData APIs
    |
    v
Dataset/File Metadata
```

## Environment Variables

```env
UNITDATA_API_BASE_URL=
UNITDATA_API_KEY=
```

Do not put the API key into browser code.

## Internal Tables

```text
unitdata_datasets
unitdata_files
unitdata_download_logs
```

---

# 9. data.gov.in

## Purpose

Use the Open Government Data platform as an additional discovery and API source.

Useful for:
- Public government datasets.
- API-enabled resources.
- Metadata.
- Government statistical datasets.

Official portal:

https://www.data.gov.in/

The eSankhyiki catalogue is also discoverable through the OGD ecosystem.

## Integration Rule

Do not assume every catalogue entry has a live API.

For each dataset record store:

```text
api_available
api_endpoint
resource_id
format
source_url
last_verified_at
```

---

# 10. Dataset Classification

StatIQ AI should classify datasets into:

### A. Training Data

```text
courses
training_programmes
course_competencies
```

### B. Competency Data

```text
competencies
employee_competencies
role_competencies
```

### C. Learning Behaviour

```text
learning_history
learning_progress
assessment_attempts
```

### D. Official Statistics

```text
mospi_statistics
esankhyiki_indicators
unitdata_datasets
```

### E. Knowledge Documents

```text
documents
document_chunks
document_embeddings
```

---

# 11. Recommended Unified Data Model

```text
                  EMPLOYEE
                     |
                     v
              COMPETENCY PROFILE
                     |
              +------+------+
              |             |
              v             v
          SKILL GAP      ROLE GAP
              |             |
              +------+------+
                     |
                     v
              RECOMMENDATION
                     |
       +-------------+-------------+
       |                           |
       v                           v
   iGOT COURSE               NSSTA/TPAC
       |                           |
       +-------------+-------------+
                     |
                     v
                  LEARN
                     |
                     v
                ASSESSMENT
                     |
                     v
              COMPETENCY UPDATE
```

Official statistics form a separate knowledge/data layer:

```text
MoSPI API
   |
eSankhyiki
   |
UnitData
   |
data.gov.in
   |
   v
Official Statistics Knowledge Layer
   |
   +--> RAG
   +--> Statistical Lab
   +--> AI Data Analyst
   +--> Course Examples
```

---

# 12. API Sync Strategy

Use scheduled or manually triggered synchronization for external catalogues.

### iGOT

```text
Course Catalogue
       |
       v
Normalize
       |
       v
Map Competencies
       |
       v
PostgreSQL
```

### NSSTA

```text
Official Programme Data
       |
       v
Normalize
       |
       v
Competency Mapping
       |
       v
PostgreSQL
```

### MoSPI

```text
API Request
       |
       v
Validate
       |
       v
Normalize
       |
       v
Cache
       |
       v
Analytics
```

---

# 13. Sync Metadata

Every external record should keep:

```text
source
external_id
source_url
source_updated_at
last_synced_at
sync_status
sync_error
checksum
```

This prevents duplicate records and makes synchronization auditable.

---

# 14. Mock Data Strategy

Until official API credentials are available, use provider interfaces and synthetic data.

```text
                    Data Provider
                         |
          +--------------+--------------+
          |                             |
          v                             v
       MOCK                        PRODUCTION
     PROVIDER                       PROVIDER
          |                             |
          v                             v
   JSON/Seed Data              Official API
```

The rest of the application must not know whether data came from a mock or production provider.

---

# 15. Development Seed Datasets

Recommended files:

```text
data/
├── employees.csv
├── departments.csv
├── job_roles.csv
├── competencies.csv
├── employee_competencies.csv
├── role_competencies.csv
├── courses.csv
├── course_competencies.csv
├── nssta_programmes.csv
├── tpac_programmes.csv
├── learning_history.csv
├── assessments.csv
└── questions.csv
```

These are synthetic development datasets.

External official data must retain source attribution.

---

# 16. AI Data Analyst

Official API data can power a natural-language statistics assistant.

Example:

```text
User:
Show the WPI trend for a selected period.

        ↓

Intent Detection
        ↓
Dataset Selection
        ↓
MoSPI WPI API
        ↓
Validated Data
        ↓
Chart
        ↓
LLM Explanation
```

The LLM must not invent numerical values.

Numerical values should originate from:
- API response.
- Verified database cache.
- Uploaded source dataset.

---

# 17. Statistical Learning Lab

Use official datasets to create practical exercises.

Example:

```text
PLFS Dataset
     |
     v
Choose variables
     |
     v
Filter/aggregate
     |
     v
Visualize
     |
     v
Interpret
     |
     v
AI feedback
```

The AI should distinguish between:
- Calculated results.
- User interpretation.
- Source metadata.
- Model-generated explanation.

---

# 18. RAG Integration

Official documents and datasets can be indexed into the RAG layer.

Recommended metadata:

```text
source_type
source_name
document_id
dataset_id
page
section
competency_id
organization_scope
access_scope
```

For structured statistical data, prefer direct API/database queries over embedding raw numerical tables.

Use RAG mainly for:
- Methodologies.
- Definitions.
- Manuals.
- Course content.
- Metadata.
- Policy/training documents.

---

# 19. Data Freshness

Display freshness information:

```text
Last updated:
27 Aug 2026, 12:30 IST

Source:
MoSPI WPI API
```

For cached datasets:

```text
Source: eSankhyiki
Last synchronized: ...
```

Never label cached data as real-time unless it was actually retrieved live.

---

# 20. Error Handling

External API failure must not break the LMS.

Example:

```text
iGOT unavailable
      |
      v
Use cached course catalogue
      |
      v
Show:
"Catalogue last synced at ..."
```

For live statistical data:

```text
MoSPI API unavailable
      |
      v
Check validated cache
      |
      v
Show timestamp
```

If no safe cache exists:

> "Official data is temporarily unavailable."

Never fabricate fallback statistics.

---

# 21. Rate Limiting

All external API calls must go through server-side services.

Use:
- Request validation.
- Caching.
- Deduplication.
- Rate limiting.
- Retry with exponential backoff where appropriate.

Avoid making one external request per dashboard card.

Aggregate requests where possible.

---

# 22. Security

### Never expose:
- API keys.
- Client secrets.
- Access tokens.
- Database credentials.

### Never send unnecessary PII to an external LLM.

### For RAG:
- Check document access before retrieval.
- Apply organization scope.
- Treat retrieved content as untrusted data.
- Block prompt injection attempts.

---

# 23. Vercel Compatibility

The architecture is designed for Vercel.

Recommended pattern:

```text
Next.js Route Handler
        |
        v
Integration Service
        |
        v
External API
```

For large sync jobs:

```text
Trigger
   |
   v
Small resumable job
   |
   v
External queue/background provider if required
   |
   v
PostgreSQL
```

Do not design around a permanent Node.js worker process on Vercel.

---

# 24. API Integration Environment

Example `.env.example`:

```env
# Database
DATABASE_URL=

# Authentication
AUTH_SECRET=

# AI
AI_API_KEY=
AI_MODEL=
EMBEDDING_MODEL=

# Object Storage
STORAGE_ENDPOINT=
STORAGE_BUCKET=
STORAGE_ACCESS_KEY=
STORAGE_SECRET_KEY=

# MoSPI API
MOSPI_API_BASE_URL=https://api.mospi.gov.in
MOSPI_API_TOKEN=

# eSankhyiki
ESANKHYIKI_BASE_URL=https://esankhyiki.mospi.gov.in

# UnitData
UNITDATA_API_BASE_URL=
UNITDATA_API_KEY=

# iGOT
IGOT_API_BASE_URL=
IGOT_API_KEY=

# NSSTA
NSSTA_BASE_URL=https://nssta.gov.in
```

Use the actual current endpoint/credential requirements supplied by each authority.

---

# 25. Data Provenance

Every external dataset must retain provenance.

Minimum fields:

```text
source_name
source_url
external_id
retrieved_at
published_at
license_or_access_note
checksum
```

This enables the UI to display:

> Source: Ministry of Statistics & Programme Implementation

and allows administrators to audit where information came from.

---

# 26. Recommended Priority

### Phase 1 — Immediately implement

1. Synthetic competency data.
2. Synthetic course catalogue.
3. Synthetic NSSTA/TPAC catalogue.
4. MoSPI API adapter.
5. eSankhyiki catalogue adapter.
6. RAG over official/public documents.
7. PostgreSQL + pgvector.

### Phase 2

8. UnitData adapter.
9. Statistical Learning Lab.
10. AI Data Analyst.

### Phase 3

11. Authorized iGOT API integration.
12. SSO.
13. Enrollment/progress synchronization.

---

# 27. Official Sources

- MoSPI API Platform: https://api.mospi.gov.in/
- eSankhyiki: https://esankhyiki.mospi.gov.in/
- MoSPI: https://www.mospi.gov.in/
- NSSTA: https://nssta.gov.in/
- iGOT Karmayogi: https://www.igotkarmayogi.gov.in/
- Government Open Data: https://www.data.gov.in/
- MoSPI UnitData: https://microdata.gov.in/

---

# 28. Implementation Rule

The application must follow this principle:

> **Official data is the source of truth; AI is the interpretation and personalization layer.**

AI must never be the source of numerical official statistics.

For course recommendations, AI ranks and explains courses from the approved catalogue.

For competency scores, the system records the evidence and calculation.

For MCQs, AI generates content but a trainer can review before publication.

For official statistics, API/database results are retrieved first and the AI explains them second.

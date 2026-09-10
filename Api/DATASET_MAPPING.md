# StatIQ AI — Dataset Mapping Matrix

## External → Internal Mapping

| External Source | Internal Entity | Main Purpose |
|---|---|---|
| iGOT course catalogue | `courses` | Personalized learning |
| iGOT course competency metadata | `course_competencies` | Recommendation |
| iGOT enrollment | `enrollments` | Learning history |
| iGOT progress | `learning_progress` | Progress tracking |
| NSSTA programme | `training_programmes` | Official Statistics training |
| TPAC programme | `training_programmes` | Recommended training |
| MoSPI WPI | `mospi_wpi_records` | Official statistics |
| eSankhyiki dataset | `esankhyiki_datasets` | Dataset discovery |
| eSankhyiki indicators | `esankhyiki_indicators` | Analytics |
| UnitData dataset | `unitdata_datasets` | Microdata |
| UnitData files | `unitdata_files` | Statistical lab |
| Official PDFs/PPTs | `documents` | RAG |
| Document text | `document_chunks` | RAG |
| Embeddings | `document_embeddings` | Semantic search |

## Competency Mapping

External training resources must map to the internal competency taxonomy.

Example:

```text
iGOT Course
"Python for Data Analysis"
        |
        +--> Python
        +--> Data Analysis
        +--> Data Visualization
```

Example:

```text
NSSTA Programme
"Sampling Methods"
        |
        +--> Survey Design
        +--> Sampling
        +--> Statistical Inference
```

## Recommendation Data Flow

```text
Employee
  ↓
Current Competencies
  ↓
Target Role
  ↓
Required Competencies
  ↓
Skill Gap
  ↓
Candidate Courses
  ├── iGOT
  ├── NSSTA
  └── TPAC
  ↓
Ranking
  ↓
Explainable Recommendations
```

## Statistical Data Flow

```text
MoSPI API / eSankhyiki / UnitData
                ↓
          Data Adapter
                ↓
         Schema Validation
                ↓
        PostgreSQL Cache
                ↓
        Analytics / Charts
                ↓
          AI Explanation
```

## Provenance Requirement

Never lose the external source identifier.

Every imported record should retain:

```text
source
external_id
source_url
retrieved_at
```

This is required for traceability and future synchronization.

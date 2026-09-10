export interface CourseLesson {
  id: string;
  title: string;
  duration: string;
  videoUrl: string;
  sunbirdContentId?: string;
  overview: string;
  statements: string[];
  keyTakeaways: string[];
}

export interface CourseCurriculum {
  courseId: string;
  modules: CourseLesson[];
}

export const COURSE_CURRICULA: Record<string, CourseLesson[]> = {
  // 1. SQL for Official Statistics
  "crs-sql-os": [
    {
      id: "mod-sql-1",
      title: "Module 1: Relational Architecture for Statistical Microdata",
      duration: "18:40",
      videoUrl: "https://www.youtube.com/embed/HXV3zeRR3h4",
      sunbirdContentId: "do_igot_sql_stats_001_c1",
      overview: "Database normalisation, schema design, and indexing strategies for high-volume survey unit records.",
      statements: [
        "Primary keys link household rosters to individual demographic schedules across NSSO rounds.",
        "Indexed foreign keys accelerate multi-table joins on state, district, and stratum identifiers.",
        "Partitioning tables by survey year and sub-round improves query execution time."
      ],
      keyTakeaways: [
        "Writing optimized SELECT queries for large statistical tables.",
        "Preventing Cartesian products in survey schedule joins.",
        "Creating views for sanitized aggregate indicators."
      ]
    },
    {
      id: "mod-sql-2",
      title: "Module 2: Weighted Aggregations & Grouped Estimations",
      duration: "25:15",
      videoUrl: "https://www.youtube.com/embed/7S_tz1z_5bA",
      sunbirdContentId: "do_igot_sql_stats_001_c2",
      overview: "Calculating survey-weighted means, counts, percentiles, and ratios directly inside the SQL query engine.",
      statements: [
        "Formula in SQL: SUM(indicator_value * multiplier) / SUM(multiplier) for domain-specific ratio estimation.",
        "HAVING clauses filter aggregated domain cells that fail minimum sample threshold standards.",
        "Window functions compute cumulative distributions and decile ranks across regional districts."
      ],
      keyTakeaways: [
        "Proper implementation of base and sub-sample weights in SQL.",
        "Using SUM() FILTER (WHERE ...) for conditional demographic splits.",
        "Exporting auditable query results conforming to official tabulation plans."
      ]
    },
    {
      id: "mod-sql-3",
      title: "Module 3: Codebook Joins & Quality Audit Checks",
      duration: "20:10",
      videoUrl: "https://www.youtube.com/embed/zpX9hP4Y0q8",
      sunbirdContentId: "do_igot_sql_stats_001_c3",
      overview: "Handling missing survey codes, LEFT JOIN codebook mappings, and automated data anomaly detection.",
      statements: [
        "LEFT JOIN preserves all survey unit records even when item codes are unmapped in auxiliary tables.",
        "COALESCE handles sentinel non-response values systematically without corrupting calculations.",
        "Trigger-based validation alerts operators to out-of-range categorical responses."
      ],
      keyTakeaways: [
        "Maintaining data integrity during multi-source ETL pipelines.",
        "Automated audit logs for database transformations.",
        "Securing database endpoints for eSankhyiki data warehouse ingestion."
      ]
    }
  ],

  // 2. Python ETL for Statistical Pipelines
  "crs-python-etl": [
    {
      id: "mod-py-1",
      title: "Module 1: Ingestion & Validation of MoSPI Microdata",
      duration: "22:30",
      videoUrl: "https://www.youtube.com/embed/LHBE6Q9XlzI",
      sunbirdContentId: "do_igot_python_da_002_c1",
      overview: "Loading fixed-width, CSV, and Parquet statistical datasets with memory-efficient chunking.",
      statements: [
        "Pandas and Polars streaming readers process multi-gigabyte survey schedules without OOM crashes.",
        "Pandera and Pydantic schemas enforce type constraints and range validations on intake.",
        "Columnar storage in Apache Parquet reduces disk footprint by over 75% with zero fidelity loss."
      ],
      keyTakeaways: [
        "Using chunksize in pd.read_csv() for high-throughput batching.",
        "Type coercion and validation for official classifications.",
        "Writing reproducible ETL scripts with automated logging."
      ]
    },
    {
      id: "mod-py-2",
      title: "Module 2: Weighted Survey Tabulations in Pandas",
      duration: "28:10",
      videoUrl: "https://www.youtube.com/embed/vmEHCJofslg",
      sunbirdContentId: "do_igot_python_da_002_c2",
      overview: "Executing official MoSPI tabulation formulas, multiplier calculations, and standard error derivations.",
      statements: [
        "Weighted mean calculations: np.average(df['income'], weights=df['multiplier']).",
        "Pivot tables group survey aggregates across Sector (Rural/Urban), Gender, and Social Groups.",
        "Jackknife and bootstrap resampling estimate survey design variances and standard errors."
      ],
      keyTakeaways: [
        "Vectorized operations for million-row survey datasets.",
        "Replicating published MoSPI tables with 100% numerical concordance.",
        "Building automated validation tests against historical series."
      ]
    },
    {
      id: "mod-py-3",
      title: "Module 3: Automated Quality Audits & Pipeline Orchestration",
      duration: "19:45",
      videoUrl: "https://www.youtube.com/embed/r-uOLxNrNk8",
      sunbirdContentId: "do_igot_python_da_002_c3",
      overview: "Creating end-to-end reproducible pipelines that output validated statistical tables and metadata.",
      statements: [
        "Automated pipeline runners ensure every transformation step is logged and traceable.",
        "Discrepancy reports flag inconsistent household totals or extreme outliers.",
        "Direct output generation into JSON/CSV for API gateway dissemination."
      ],
      keyTakeaways: [
        "CI/CD best practices for statistical software pipelines.",
        "Data lineage and governance standards.",
        "Deploying pipelines to production environments."
      ]
    }
  ],

  // 3. Sampling Methods for Household Surveys
  "crs-sampling": [
    {
      id: "mod-samp-1",
      title: "Module 1: Sample Design & Stratification Protocols",
      duration: "18:20",
      videoUrl: "https://www.youtube.com/embed/pT7L_v5iE_Y",
      sunbirdContentId: "do_nssta_sampling_003_c1",
      overview: "Design of NSSO large-scale multi-stage stratified surveys across rural and urban sectors.",
      statements: [
        "Rural stratification is based on population size and agro-climatic zones.",
        "Urban strata are formed according to town class size from Census frames.",
        "Two-stage sampling: FSUs selected with PPSWOR; Second Stage Units (households) selected via Circular Systematic Sampling."
      ],
      keyTakeaways: [
        "Multi-stage stratified sampling principles.",
        "Probability Proportional to Size (PPS) selection with replacement/without replacement.",
        "Allocating sample units across state and central quotas."
      ]
    },
    {
      id: "mod-samp-2",
      title: "Module 2: Unit-Record Microdata Structure & Multipliers",
      duration: "30:45",
      videoUrl: "https://www.youtube.com/embed/Gv9_4yMHFhI",
      sunbirdContentId: "do_nssta_sampling_003_c2",
      overview: "Decoding fixed-width and CSV microdata blocks, item identification keys, and household multipliers.",
      statements: [
        "Record structure comprises Identification Block, Demographic Roster, and Subject-Specific Schedule blocks.",
        "Combined multiplier: Multiplier = (Combined Multiplier Column / 100) to account for sub-sample replication.",
        "Merging Block 1 (household characteristics) with Block 4 (individual person roster) via common serial IDs."
      ],
      keyTakeaways: [
        "Writing ingestion scripts for multi-gigabyte MoSPI microdata.",
        "Applying correct multiplier weights to obtain population-level estimates.",
        "Verifying household counts against published sample survey reports."
      ]
    },
    {
      id: "mod-samp-3",
      title: "Module 3: Variance Estimation & Design Effects",
      duration: "25:10",
      videoUrl: "https://www.youtube.com/embed/3U8O4_c2Okg",
      sunbirdContentId: "do_nssta_sampling_003_c3",
      overview: "Sub-sample pooling equations, Relative Standard Error (RSE) limits, and design effects (Deff).",
      statements: [
        "Design effect (Deff) = 1 + (m - 1) * rho computes inflation in variance due to cluster sampling.",
        "RSE thresholds under 5% at state level and 10% at district level for publishable indicators.",
        "Pooled estimates combine central and state sample allocations with harmonic weights."
      ],
      keyTakeaways: [
        "Quantifying sampling precision.",
        "Handling non-response weight calibration.",
        "Benchmarking standard errors."
      ]
    }
  ],

  // 4. PLFS Concepts and Tabulation
  "crs-plfs": [
    {
      id: "mod-plfs-1",
      title: "Module 1: Periodic Labour Force Survey (PLFS) Activity Frameworks",
      duration: "21:15",
      videoUrl: "https://www.youtube.com/embed/3U8O4_c2Okg",
      sunbirdContentId: "do_nssta_plfs_004_c1",
      overview: "Activity status determination: Usual Principal Status (UPS), Subsidiary Status (SS), and Current Weekly Status (CWS).",
      statements: [
        "Usual Principal Status (UPS) is determined by majority time criterion over the 365-day reference period.",
        "Subsidiary Status (SS) captures economic activity pursued for 30 days or more by non-principal workers.",
        "Current Weekly Status (CWS) assesses employment within a 7-day recall window using 1-hour threshold."
      ],
      keyTakeaways: [
        "Difference between long-term (UPSS) and short-term (CWS) labour market indicators.",
        "Classification of out-of-labour-force vs unemployed persons.",
        "Rotation panel design in urban PLFS (four visits)."
      ]
    },
    {
      id: "mod-plfs-2",
      title: "Module 2: Key Indicators Compilation (LFPR, WPR, UR)",
      duration: "27:40",
      videoUrl: "https://www.youtube.com/embed/pT7L_v5iE_Y",
      sunbirdContentId: "do_nssta_plfs_004_c2",
      overview: "Standard mathematical formulations for Labour Force Participation Rate, Worker Population Ratio, and Unemployment Rate.",
      statements: [
        "Labour Force Participation Rate (LFPR) = (Employed + Unemployed) / Total Population * 100.",
        "Worker Population Ratio (WPR) = Employed / Total Population * 100.",
        "Unemployment Rate (UR) = Unemployed / Labour Force * 100."
      ],
      keyTakeaways: [
        "Deriving gender and sector disaggregated rates.",
        "Applying sub-sample multipliers to individual schedule blocks.",
        "Replicating published MoSPI Annual PLFS tables."
      ]
    },
    {
      id: "mod-plfs-3",
      title: "Module 3: Industry & Occupational Distribution (NIC & NCO)",
      duration: "23:05",
      videoUrl: "https://www.youtube.com/embed/Gv9_4yMHFhI",
      sunbirdContentId: "do_nssta_plfs_004_c3",
      overview: "Mapping economic activities to National Industrial Classification (NIC-2008) and National Classification of Occupations (NCO-2004).",
      statements: [
        "Broad sectoral classification: Agriculture (01-03), Industry (05-43), and Services (45-99).",
        "Informal sector employment is identified through enterprise type, accounts maintenance, and social security benefits.",
        "Hours worked and wage estimation for casual and regular salaried workers."
      ],
      keyTakeaways: [
        "Handling 5-digit NIC codes in survey tabulations.",
        "Quality checks for outlier wages in microdata.",
        "Generating policy briefing summaries on employment transitions."
      ]
    }
  ],

  // 5. Statistical Visualization for Policy Briefs
  "crs-viz": [
    {
      id: "mod-viz-1",
      title: "Module 1: Principles of Honest Statistical Communication",
      duration: "16:20",
      videoUrl: "https://www.youtube.com/embed/fSg6Gg2f5o8",
      sunbirdContentId: "do_internal_viz_005_c1",
      overview: "Visual encoding standards, chart selection rules, avoiding distorted axes, and ensuring high data-ink ratios.",
      statements: [
        "Bar chart baselines must strictly start at zero to maintain proportional representation.",
        "Dual-axis charts require distinct scale calibrations to prevent misleading correlation illusions.",
        "Color palettes must ensure WCAG 2.1 AA contrast and color-blind accessibility."
      ],
      keyTakeaways: [
        "Selecting the correct visual format (Line, Bar, Choropleth, Scatter).",
        "Eliminating non-essential chart junk and visual clutter.",
        "Formulating clear, neutral statistical headlines."
      ]
    },
    {
      id: "mod-viz-2",
      title: "Module 2: Interactive Dashboards & Dissemination",
      duration: "22:15",
      videoUrl: "https://www.youtube.com/embed/_W3R2V599Gg",
      sunbirdContentId: "do_internal_viz_005_c2",
      overview: "Designing executive dashboards with drill-down capabilities for state, district, and time-series comparisons.",
      statements: [
        "Geospatial heatmaps communicate regional disparities across state-level indicators.",
        "Interactive tooltips provide confidence intervals and sample size context.",
        "Responsive layout adapts effortlessly across mobile and desktop interfaces."
      ],
      keyTakeaways: [
        "Connecting visualization layers to REST APIs.",
        "Building interactive time-slider filters.",
        "Ensuring rapid rendering speeds for heavy datasets."
      ]
    },
    {
      id: "mod-viz-3",
      title: "Module 3: Policy Brief Design & Executive Reporting",
      duration: "18:50",
      videoUrl: "https://www.youtube.com/embed/r-uOLxNrNk8",
      sunbirdContentId: "do_internal_viz_005_c3",
      overview: "Translating complex statistical findings into actionable 2-page policy briefs with concise callouts.",
      statements: [
        "Key findings must lead with the primary indicator change and statistical significance.",
        "Methodology notes provide transparency on sample design and reference period.",
        "Data sources and citation standards comply with official MoSPI guidelines."
      ],
      keyTakeaways: [
        "Structuring high-impact executive summaries.",
        "Synthesizing survey data with administrative metrics.",
        "Exporting print-ready vector graphics."
      ]
    }
  ],

  // 6. Responsible AI for Official Statistics
  "crs-aiml": [
    {
      id: "mod-aiml-1",
      title: "Module 1: Ethical Frameworks & Hallucination Prevention",
      duration: "24:30",
      videoUrl: "https://www.youtube.com/embed/Gv9_4yMHFhI",
      sunbirdContentId: "do_igot_aiml_006_c1",
      overview: "Why ungrounded LLMs must never invent official statistics; RAG architectures, provenance, and verification.",
      statements: [
        "Statistical integrity demands that all generated indicators cite an immutable official document or API source.",
        "Confidence scoring and temperature controls minimize stochastic variance in tabular extraction.",
        "Human-in-the-loop validation is mandatory before statistical releases."
      ],
      keyTakeaways: [
        "Implementing Retrieval-Augmented Generation (RAG) with vector databases.",
        "Strict prompt guardrails preventing numerical extrapolation.",
        "Auditable AI decision logs."
      ]
    },
    {
      id: "mod-aiml-2",
      title: "Module 2: Machine Learning for Automated Imputation & Classification",
      duration: "29:10",
      videoUrl: "https://www.youtube.com/embed/k-xZlH1f21g",
      sunbirdContentId: "do_igot_aiml_006_c2",
      overview: "Supervised classification of open-ended economic activity descriptions to NIC and NCO codes.",
      statements: [
        "Fine-tuned NLP models map multilingual job descriptions to 5-digit classification codes.",
        "Uncertainty quantification flags low-confidence predictions for manual officer review.",
        "KNN and tree-based imputation methods handle item non-response while preserving variance."
      ],
      keyTakeaways: [
        "Training classification models on historical census corpora.",
        "Evaluating Precision, Recall, and F1-score on rare economic classes.",
        "Preventing algorithmic bias across regional dialects."
      ]
    }
  ],

  // 7. GIS for Census and Survey Operations
  "crs-gis": [
    {
      id: "mod-gis-1",
      title: "Module 1: Geospatial Frames & Urban Frame Survey (UFS)",
      duration: "20:45",
      videoUrl: "https://www.youtube.com/embed/_W3R2V599Gg",
      sunbirdContentId: "do_tpac_gis_007_c1",
      overview: "Digitization of UFS blocks, satellite imagery integration, and geographic sampling frame maintenance.",
      statements: [
        "Urban Frame Survey blocks are demarcated by permanent identifiable physical boundaries.",
        "WGS84 (EPSG:4326) and Web Mercator (EPSG:3857) coordinate systems are standardized across datasets.",
        "Mobile GIS tools enable field enumerators to geotag sample units and track coverage."
      ],
      keyTakeaways: [
        "Working with Shapefiles, GeoJSON, and GeoPackage formats in QGIS and Python.",
        "Spatial joins between survey microdata and administrative boundaries.",
        "Detecting coverage gaps and overlapping survey boundaries."
      ]
    },
    {
      id: "mod-gis-2",
      title: "Module 2: Small Area Estimation & Geospatial Dissemination",
      duration: "26:15",
      videoUrl: "https://www.youtube.com/embed/pT7L_v5iE_Y",
      sunbirdContentId: "do_tpac_gis_007_c2",
      overview: "Combining survey datasets with satellite indices (e.g. nighttime lights, vegetation) for sub-district estimation.",
      statements: [
        "Fay-Herriot small area models blend direct survey estimates with area-level spatial covariates.",
        "Choropleth map styling standardizes classification thresholds using Natural Breaks (Jenks).",
        "Spatial smoothing reduces noise in sparse rural sample estimations."
      ],
      keyTakeaways: [
        "Generating panchayat and ward level statistical estimates.",
        "Spatial autocorrelation testing with Moran's I.",
        "Disseminating interactive web maps via open geospatial servers."
      ]
    }
  ],

  // 8. NQAF and Data Quality Reporting
  "crs-quality": [
    {
      id: "mod-qual-1",
      title: "Module 1: UN National Quality Assurance Framework (UN-NQAF)",
      duration: "19:30",
      videoUrl: "https://www.youtube.com/embed/k-xZlH1f21g",
      sunbirdContentId: "do_nssta_quality_008_c1",
      overview: "The 19 principles of UN-NQAF: institutional environment, statistical processes, and statistical outputs.",
      statements: [
        "Relevance, accuracy, timeliness, accessibility, interpretability, and coherence form output quality pillars.",
        "Process quality mandates systematic error tracking across questionnaire design, data collection, and processing.",
        "Statistical independence and professional ethics ensure public trust in national indicators."
      ],
      keyTakeaways: [
        "Conducting comprehensive quality self-assessments.",
        "Drafting National Quality Reports conforming to SIMS/SDMX standards.",
        "Mitigating non-sampling errors and measurement biases."
      ]
    },
    {
      id: "mod-qual-2",
      title: "Module 2: Automated Quality Validation & Anomaly Detection",
      duration: "22:50",
      videoUrl: "https://www.youtube.com/embed/rV58m4e5q4Q",
      sunbirdContentId: "do_nssta_quality_008_c2",
      overview: "Implementing algorithmic rules to flag inconsistent survey records, logical contradictions, and outliers.",
      statements: [
        "Range checks verify that continuous variables fall within biological and economic bounds.",
        "Cross-field consistency rules validate relationships (e.g., age vs marital status / education).",
        "Time-series continuity checks alert compilation teams to unexpected structural breaks."
      ],
      keyTakeaways: [
        "Writing declarative data validation suites.",
        "Audit logging and non-destructive data correction workflows.",
        "Standardized quality indicator dashboards."
      ]
    }
  ],

  // 9. Publishing Statistical APIs
  "crs-api": [
    {
      id: "mod-api-1",
      title: "Module 1: RESTful Design & OpenAPI Standards for Official Data",
      duration: "21:10",
      videoUrl: "https://www.youtube.com/embed/zpX9hP4Y0q8",
      sunbirdContentId: "do_internal_api_009_c1",
      overview: "Designing scalable, machine-readable API endpoints for public and inter-departmental statistical dissemination.",
      statements: [
        "REST endpoints adhere to clean URI structures (e.g., /api/v1/indicators/{code}/series).",
        "OpenAPI 3.1 specifications generate interactive documentation and client SDKs.",
        "HTTP status codes (200, 400, 401, 404, 429) accurately reflect query outcomes."
      ],
      keyTakeaways: [
        "Pagination strategies (cursor vs offset) for large time-series datasets.",
        "Content negotiation for JSON, CSV, and SDMX-JSON responses.",
        "Versioning strategies to ensure backward compatibility."
      ]
    },
    {
      id: "mod-api-2",
      title: "Module 2: API Gateway Security, Caching & Rate Limiting",
      duration: "24:45",
      videoUrl: "https://www.youtube.com/embed/HXV3zeRR3h4",
      sunbirdContentId: "do_internal_api_009_c2",
      overview: "Securing public statistical endpoints with API keys, Redis response caching, and DDoS mitigation.",
      statements: [
        "Edge caching with CDN reduces latency for high-demand macroeconomic releases.",
        "Token bucket rate limiting protects statistical database clusters from overload.",
        "OAuth2 and JWT authentication govern access to restricted or preliminary data."
      ],
      keyTakeaways: [
        "Configuring reverse proxies and API gateways.",
        "Real-time monitoring of API uptime and request volumes.",
        "Implementing automated webhook triggers on dataset updates."
      ]
    }
  ],

  // 10. Cloud Patterns for Statistical Systems
  "crs-cloud": [
    {
      id: "mod-cld-1",
      title: "Module 1: Sovereign Cloud Architecture & Containerization",
      duration: "25:30",
      videoUrl: "https://www.youtube.com/embed/7S_tz1z_5bA",
      sunbirdContentId: "do_igot_cloud_010_c1",
      overview: "Architecting statistical computing clusters on sovereign government cloud with Docker and Kubernetes.",
      statements: [
        "Containerized microservices isolate ETL ingestion, aggregation engines, and dissemination web apps.",
        "Infrastructure as Code (IaC) ensures repeatable and auditable environment provisioning.",
        "Data localization and encryption at rest/in transit fulfill national cybersecurity directives."
      ],
      keyTakeaways: [
        "Dockerizing Python and R statistical execution environments.",
        "Horizontal pod autoscaling to absorb census traffic surges.",
        "Zero-trust network architecture within government data centers."
      ]
    },
    {
      id: "mod-cld-2",
      title: "Module 2: High-Performance Data Lakes & Object Storage",
      duration: "28:15",
      videoUrl: "https://www.youtube.com/embed/LHBE6Q9XlzI",
      sunbirdContentId: "do_igot_cloud_010_c2",
      overview: "Organizing petabyte-scale survey microdata and administrative streams using lakehouse architectures.",
      statements: [
        "Object storage with immutable object locking provides tamper-proof historical data archives.",
        "Partitioned Delta Lake / Parquet tables enable sub-second queries across decades of survey series.",
        "Automated lifecycle policies transition cold data to long-term deep archive tiers."
      ],
      keyTakeaways: [
        "Configuring distributed query engines (Trino / DuckDB / Spark).",
        "Backup, disaster recovery, and multi-zone replication.",
        "Optimizing cloud compute costs for statistical batch jobs."
      ]
    }
  ],

  // 11. Leading Statistical Production Teams
  "crs-lead": [
    {
      id: "mod-lead-1",
      title: "Module 1: Survey Lifecycle Management & Field Operations",
      duration: "17:50",
      videoUrl: "https://www.youtube.com/embed/41f8457P3mI",
      sunbirdContentId: "do_internal_lead_011_c1",
      overview: "Planning survey timelines, allocating field teams, managing budget schedules, and supervising fieldwork.",
      statements: [
        "Work breakdown structures schedule questionnaire testing, training, field listing, and data cleaning.",
        "Daily field progress dashboards track response rates and flag lagging supervisory circles.",
        "Quality inspection protocols require independent re-interview of randomly selected sample households."
      ],
      keyTakeaways: [
        "Managing multi-tier field hierarchies (FOD, TSD, SRO).",
        "Fostering a culture of data integrity and ethical surveying.",
        "Mitigating non-response and interviewer attrition."
      ]
    },
    {
      id: "mod-lead-2",
      title: "Module 2: Inter-Agency Coordination & Stakeholder Consultation",
      duration: "21:20",
      videoUrl: "https://www.youtube.com/embed/3U8O4_c2Okg",
      sunbirdContentId: "do_internal_lead_011_c2",
      overview: "Aligning statistical outputs with central ministries, state statistical bureaus (DES), and international bodies.",
      statements: [
        "Standing Committee on Statistics (SCoS) reviews methodological revisions and sample expansion proposals.",
        "State Coordination Committees harmonize administrative data feeds with central survey registers.",
        "Advance release calendars give public and economic stakeholders predictable data publication dates."
      ],
      keyTakeaways: [
        "Leading cross-departmental technical working groups.",
        "Managing media briefings and statistical press releases.",
        "Resolving inter-agency indicator discrepancies."
      ]
    }
  ],

  // 12. SDMX and Metadata for Dissemination
  "crs-sdmx": [
    {
      id: "mod-sdmx-1",
      title: "Module 1: SDMX 3.0 Information Model & Architecture",
      duration: "23:40",
      videoUrl: "https://www.youtube.com/embed/rV58m4e5q4Q",
      sunbirdContentId: "do_nssta_sdmx_012_c1",
      overview: "Statistical Data and Metadata eXchange (SDMX) standards: Data Structure Definitions (DSDs), Concepts, and Codelists.",
      statements: [
        "Dimensions uniquely identify time series (e.g., Country, Indicator, Frequency, Sex).",
        "Attributes convey contextual metadata (e.g., Unit of Measure, Observation Status, Decimals).",
        "Primary measures store observation values."
      ],
      keyTakeaways: [
        "Structuring official datasets into SDMX DSD artifacts.",
        "Using SDMX-ML, SDMX-JSON, and SDMX-CSV exchange formats.",
        "Synchronizing national registries with UN and IMF global data portals."
      ]
    },
    {
      id: "mod-sdmx-2",
      title: "Module 2: Metadata Registry & Dissemination Portals",
      duration: "26:30",
      videoUrl: "https://www.youtube.com/embed/HXV3zeRR3h4",
      sunbirdContentId: "do_nssta_sdmx_012_c2",
      overview: "Building automated metadata catalogs, data mapping engines, and web service endpoints for eSankhyiki.",
      statements: [
        "Metadata reporting follows SIMS (Single Integrated Metadata Structure) guidelines.",
        "Automated transformers convert internal database tables to compliant SDMX feeds.",
        "RESTful SDMX web services support automated machine harvesting."
      ],
      keyTakeaways: [
        "Deploying SDMX Registry instances.",
        "Enforcing codelist standardization across divisions.",
        "Validating SDMX messages against schema constraints."
      ]
    }
  ],

  // 13. National Accounts Compilation Workshop
  "crs-na": [
    {
      id: "mod-na-1",
      title: "Module 1: System of National Accounts (SNA 2008) Framework",
      duration: "26:30",
      videoUrl: "https://www.youtube.com/embed/41f8457P3mI",
      sunbirdContentId: "do_nssta_nas_013_c1",
      overview: "Conceptual structure of Gross Value Added (GVA), Gross Domestic Product (GDP), and institutional sectors.",
      statements: [
        "GVA at basic prices = GVA at factor cost + (Production taxes - Production subsidies).",
        "GDP at market prices = GVA at basic prices + (Product taxes - Product subsidies).",
        "Institutional sectors include Non-Financial Corporations, Financial Corporations, General Government, and Households."
      ],
      keyTakeaways: [
        "Understanding the transition between factor cost and basic prices.",
        "Double deflation method for real GVA calculation.",
        "Sequence of accounts from production to balance sheet."
      ]
    },
    {
      id: "mod-na-2",
      title: "Module 2: Production vs Expenditure Approaches & SUT",
      duration: "32:15",
      videoUrl: "https://www.youtube.com/embed/3nC4M5_Lp8A",
      sunbirdContentId: "do_nssta_nas_013_c2",
      overview: "Reconciling supply-use tables, Gross Capital Formation (GCF), and Private Final Consumption Expenditure (PFCE).",
      statements: [
        "Expenditure GDP = PFCE + GFCE + GCF + (Exports - Imports) + Discrepancies.",
        "Supply-Use Tables (SUT) enforce commodity balance between domestic output, imports, intermediate consumption, and final uses.",
        "Deflators convert current price aggregates into constant base-year (2011-12) series."
      ],
      keyTakeaways: [
        "Compilation of quarterly and annual GDP estimates.",
        "Reconciling statistical discrepancies.",
        "Sectoral contribution analysis for policy planning."
      ]
    }
  ],

  // 14. Microdata Protection and Cyber Hygiene
  "crs-cyber": [
    {
      id: "mod-cyb-1",
      title: "Module 1: Statistical Disclosure Control (SDC) & Anonymization",
      duration: "21:40",
      videoUrl: "https://www.youtube.com/embed/k-xZlH1f21g",
      sunbirdContentId: "do_igot_cyber_014_c1",
      overview: "Methods to prevent identity and attribute disclosure in public-use and licensed microdata files.",
      statements: [
        "Direct identifiers (names, addresses, national IDs) are permanently scrubbed from release datasets.",
        "k-anonymity (k >= 3) ensures that every combination of quasi-identifiers matches at least k respondents.",
        "Top-coding and bottom-coding truncate extreme values in income, landholding, and enterprise turnover."
      ],
      keyTakeaways: [
        "Applying micro-aggregation, local suppression, and perturbation techniques.",
        "Calculating re-identification risk metrics using sdcMicro in R/Python.",
        "Formulating tiered access agreements (Public, Academic, Secure Enclave)."
      ]
    },
    {
      id: "mod-cyb-2",
      title: "Module 2: Secure Data Enclaves & Officer Cyber Hygiene",
      duration: "18:25",
      videoUrl: "https://www.youtube.com/embed/zpX9hP4Y0q8",
      sunbirdContentId: "do_igot_cyber_014_c2",
      overview: "Operational security protocols, multi-factor authentication, air-gapped processing, and data leak prevention.",
      statements: [
        "Secure microdata virtual enclaves prohibit clipboard export, screen capture, and external file transfer.",
        "All analytical outputs undergo automated disclosure review before release to researchers.",
        "Phishing awareness, encrypted communication, and role-based access control protect confidential survey inputs."
      ],
      keyTakeaways: [
        "Operating within MoSPI Virtual Data Labs (VDL).",
        "Auditing researcher output requests.",
        "Complying with the Digital Personal Data Protection (DPDP) Act."
      ]
    }
  ]
};

// Fallback default curriculum with standard modules
export const DEFAULT_CURRICULUM: CourseLesson[] = [
  {
    id: "mod-def-1",
    title: "Module 1: Official Statistical Foundations & Governance",
    duration: "16:20",
    videoUrl: "https://www.youtube.com/embed/LHBE6Q9XlzI",
    sunbirdContentId: "do_igot_stats_default_c1",
    overview: "Introduction to official data collection standards, administrative sources, and survey framework design.",
    statements: [
      "Classification systems conform to National Industrial Classification (NIC-2008) and Central Product Classification (CPC).",
      "Administrative records are validated against primary survey sample frames to minimize coverage errors.",
      "Data collection protocols mandate strict confidentiality under the Collection of Statistics Act."
    ],
    keyTakeaways: [
      "Understanding statutory frameworks for official Indian data.",
      "Classification hierarchy from 2-digit to 5-digit NIC subclasses.",
      "Minimizing non-sampling and response biases."
    ]
  },
  {
    id: "mod-def-2",
    title: "Module 2: Multi-Stage Survey Design & Estimation",
    duration: "24:45",
    videoUrl: "https://www.youtube.com/embed/pT7L_v5iE_Y",
    sunbirdContentId: "do_igot_stats_default_c2",
    overview: "Deep dive into multi-stage stratified sampling, First Stage Units (FSUs), and multiplier estimation equations.",
    statements: [
      "First Stage Units (FSUs) correspond to Census Villages in rural sectors and Urban Frame Survey (UFS) blocks in urban sectors.",
      "Sub-sample multipliers account for non-response adjustments across both central and state sample allocations.",
      "Pooled estimates combine central and state sample datasets to generate district-level precision."
    ],
    keyTakeaways: [
      "Equation for combined multiplier weight: W_i = (N_h / n_h) * (H_hi / h_hi).",
      "Differences between Central Sample and State Sample pooling.",
      "Relative Standard Error (RSE) computation guidelines."
    ]
  }
];

export function getCurriculumForCourse(courseTitle: string, provider: string, courseId?: string): CourseLesson[] {
  // 1. If explicit courseId provided, check direct key lookup
  if (courseId && COURSE_CURRICULA[courseId]) {
    return COURSE_CURRICULA[courseId];
  }

  const title = (courseTitle || "").toLowerCase();

  // 2. Exact or semantic matching based on course topic
  if (title.includes("sql") || courseId === "crs-sql-os") {
    return COURSE_CURRICULA["crs-sql-os"];
  }
  if (title.includes("python") || title.includes("etl") || courseId === "crs-python-etl") {
    return COURSE_CURRICULA["crs-python-etl"];
  }
  if (title.includes("plfs") || title.includes("labour") || courseId === "crs-plfs") {
    return COURSE_CURRICULA["crs-plfs"];
  }
  if (title.includes("sampling") || title.includes("survey") || courseId === "crs-sampling") {
    return COURSE_CURRICULA["crs-sampling"];
  }
  if (title.includes("visual") || title.includes("viz") || title.includes("chart") || courseId === "crs-viz") {
    return COURSE_CURRICULA["crs-viz"];
  }
  if (title.includes("responsible ai") || title.includes("aiml") || title.includes("artificial") || courseId === "crs-aiml") {
    return COURSE_CURRICULA["crs-aiml"];
  }
  if (title.includes("gis") || title.includes("census") || title.includes("geospatial") || courseId === "crs-gis") {
    return COURSE_CURRICULA["crs-gis"];
  }
  if (title.includes("quality") || title.includes("nqaf") || courseId === "crs-quality") {
    return COURSE_CURRICULA["crs-quality"];
  }
  if (title.includes("api") || courseId === "crs-api") {
    return COURSE_CURRICULA["crs-api"];
  }
  if (title.includes("cloud") || courseId === "crs-cloud") {
    return COURSE_CURRICULA["crs-cloud"];
  }
  if (title.includes("lead") || title.includes("team") || courseId === "crs-lead") {
    return COURSE_CURRICULA["crs-lead"];
  }
  if (title.includes("sdmx") || title.includes("metadata") || courseId === "crs-sdmx") {
    return COURSE_CURRICULA["crs-sdmx"];
  }
  if (title.includes("national accounts") || title.includes("gdp") || title.includes("sna") || courseId === "crs-na") {
    return COURSE_CURRICULA["crs-na"];
  }
  if (title.includes("cyber") || title.includes("disclosure") || title.includes("protection") || courseId === "crs-cyber") {
    return COURSE_CURRICULA["crs-cyber"];
  }

  return DEFAULT_CURRICULUM;
}

export function getAllCurriculumSummaries(): string {
  return `
1. Course: "SQL for Official Statistics" (crs-sql-os) - Relational architecture, weighted aggregations, codebook joins.
2. Course: "Python ETL for Statistical Pipelines" (crs-python-etl) - MoSPI microdata ingestion, Pandera validation, weighted tabulations.
3. Course: "Sampling Methods for Household Surveys" (crs-sampling) - Stratification, multi-stage sampling, variance estimation.
4. Course: "PLFS Concepts and Tabulation" (crs-plfs) - UPSS & CWS status, LFPR, WPR, UR indicators, NIC & NCO coding.
5. Course: "Statistical Visualization for Policy Briefs" (crs-viz) - Honest statistical charts, WCAG contrast, interactive dashboards.
6. Course: "Responsible AI for Official Statistics" (crs-aiml) - RAG verification, ethical AI, automated classification.
7. Course: "GIS for Census and Survey Operations" (crs-gis) - UFS digitization, small-area estimation, thematic maps.
8. Course: "NQAF and Data Quality Reporting" (crs-quality) - UN-NQAF principles, automated validation checks, SIMS reports.
9. Course: "Publishing Statistical APIs" (crs-api) - RESTful OpenAPI endpoints, rate limiting, caching.
10. Course: "Cloud Patterns for Statistical Systems" (crs-cloud) - Sovereign government cloud, Kubernetes, petabyte data lakes.
11. Course: "Leading Statistical Production Teams" (crs-lead) - Survey operations management, SCoS coordination.
12. Course: "SDMX and Metadata for Dissemination" (crs-sdmx) - SDMX 3.0 DSDs, codelists, registry sync.
13. Course: "National Accounts Compilation Workshop" (crs-na) - SNA 2008, GVA, Supply-Use Tables, double deflation.
14. Course: "Microdata Protection and Cyber Hygiene" (crs-cyber) - Statistical disclosure control, k-anonymity, secure enclaves.
`;
}

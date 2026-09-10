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
  default: [
    {
      id: "mod-1",
      title: "Module 1: Methodological Foundations & Scope",
      duration: "14:20",
      videoUrl: "https://www.youtube.com/embed/LHBE6Q9XlzI",
      sunbirdContentId: "do_igot_stats_001_c1",
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
      id: "mod-2",
      title: "Module 2: Sampling Frame & Unit-Level Multipliers",
      duration: "28:45",
      videoUrl: "https://www.youtube.com/embed/pT7L_v5iE_Y",
      sunbirdContentId: "do_igot_stats_001_c2",
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
    },
    {
      id: "mod-3",
      title: "Module 3: Index Numbers Compilation (WPI / CPI / IIP)",
      duration: "35:10",
      videoUrl: "https://www.youtube.com/embed/rV58m4e5q4Q",
      sunbirdContentId: "do_igot_stats_001_c3",
      overview: "Formulation of price relatives, base-year weighting diagrams, and quality adjustments in index series.",
      statements: [
        "Laspeyres formula: I = (sum(P_t * Q_0) / sum(P_0 * Q_0)) * 100 with item-level geometric mean aggregation.",
        "Imputation techniques for seasonal and missing price quotations prevent artificial volatility in core indicators.",
        "Linking factors enable smooth transitions across historical base revisions (e.g. 2004-05 to 2011-12)."
      ],
      keyTakeaways: [
        "Elementary aggregation using Jevons Index vs Dutot Index.",
        "Handling non-response in wholesale commodity price feeds.",
        "Deflating nominal national accounts using appropriate sectoral indices."
      ]
    },
    {
      id: "mod-4",
      title: "Module 4: Statistical Disclosure Control & Microdata Governance",
      duration: "22:15",
      videoUrl: "https://www.youtube.com/embed/k-xZlH1f21g",
      sunbirdContentId: "do_igot_stats_001_c4",
      overview: "Safe dissemination of unit-record files, anonymization, k-anonymity, and metadata packaging under NADA standards.",
      statements: [
        "Direct identifiers (enterprise names, exact geo-coordinates, pan/aadhaar/GSTIN) are completely stripped prior to release.",
        "Top-coding and perturbation are applied to extreme wealth/turnover outliers to prevent deductive disclosure.",
        "DDI/Dublin Core metadata structures guarantee interoperability with international repositories."
      ],
      keyTakeaways: [
        "Understanding Statistical Disclosure Control (SDC) thresholds.",
        "NADA / Microdata XML/JSON catalog integration.",
        "Data access categories: Open Access, Licensed Access, and Enclave Data."
      ]
    },
    {
      id: "mod-5",
      title: "Module 5: Practical Case Study & Applied Analytics",
      duration: "18:30",
      videoUrl: "https://www.youtube.com/embed/HXV3zeRR3h4",
      sunbirdContentId: "do_igot_stats_001_c5",
      overview: "End-to-end analytical pipeline using SQL/Python to process raw microdata and compute official aggregates.",
      statements: [
        "Microdata parsing using standardized layout files and record length formats.",
        "Generating weighted tables matching MoSPI published statistical tables.",
        "Interpreting confidence intervals and drawing policy inferences."
      ],
      keyTakeaways: [
        "Validating computed aggregates against MoSPI press notes.",
        "Diagnosing discrepancies between administrative and survey data.",
        "Readying analysis for executive and ministerial briefing."
      ]
    }
  ]
};

export function getCurriculumForCourse(courseTitle: string, provider: string): CourseLesson[] {
  const title = (courseTitle || "").toLowerCase();

  // 1. SQL for Official Statistics
  if (title.includes("sql")) {
    return [
      {
        id: "mod-sql-1",
        title: "Module 1: Relational Architecture for Statistical Microdata",
        duration: "18:40",
        videoUrl: "https://www.youtube.com/embed/HXV3zeRR3h4",
        sunbirdContentId: "do_igot_sql_stats_002_c1",
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
        sunbirdContentId: "do_igot_sql_stats_002_c2",
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
        sunbirdContentId: "do_igot_sql_stats_002_c3",
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
    ];
  }

  // 2. Python for Statistical Pipelines / ETL
  if (title.includes("python") || title.includes("etl")) {
    return [
      {
        id: "mod-py-1",
        title: "Module 1: Ingestion & Validation of MoSPI Microdata",
        duration: "22:30",
        videoUrl: "https://www.youtube.com/embed/LHBE6Q9XlzI",
        sunbirdContentId: "do_igot_python_da_001_c1",
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
        sunbirdContentId: "do_igot_python_da_001_c2",
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
        sunbirdContentId: "do_igot_python_da_001_c3",
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
    ];
  }

  // 3. Price Index (WPI / CPI)
  if (/index|wpi|cpi|price/i.test(title)) {
    return [
      {
        id: "mod-wpi-1",
        title: "Module 1: Principles of Economic Price Indices",
        duration: "16:40",
        videoUrl: "https://www.youtube.com/embed/rV58m4e5q4Q",
        sunbirdContentId: "do_igot_wpi_cpi_004_c1",
        overview: "Foundational concepts of Wholesale Price Index (WPI), Consumer Price Index (CPI), and GDP Deflator.",
        statements: [
          "WPI measures wholesale transaction prices, capturing price changes at the first point of bulk sale.",
          "Basket weights are derived from gross value of domestic output and net imports from Input-Output tables.",
          "Item coverage spans Primary Articles (22.62%), Fuel & Power (13.15%), and Manufactured Products (64.23%)."
        ],
        keyTakeaways: [
          "Differentiating producer price indices from retail consumption indices.",
          "Weight allocation methodology across 3 major WPI commodity groups.",
          "Base-year selection criteria and price representative centers."
        ]
      },
      {
        id: "mod-wpi-2",
        title: "Module 2: Mathematical Formulation & Laspeyres Aggregation",
        duration: "24:15",
        videoUrl: "https://www.youtube.com/embed/3nC4M5_Lp8A",
        sunbirdContentId: "do_igot_wpi_cpi_004_c2",
        overview: "Mathematical mechanics of price relatives, Laspeyres base weighting, and geometric averaging.",
        statements: [
          "Laspeyres formula: WPI_t = [ (sum p_{i,t} * w_{i,0}) / (sum p_{i,0} * w_{i,0}) ] * 100.",
          "Item-level price relatives: R_{i,t} = (p_{i,t} / p_{i,0}) * 100 computed across representative markets.",
          "Linking factor calculation: Ratio of average index in overlapping period between new and old series."
        ],
        keyTakeaways: [
          "Derivation of group and headline index values.",
          "Handling missing quotes through carry-forward and relative change imputations.",
          "Calculation of point-to-point and financial year average inflation rates."
        ]
      },
      {
        id: "mod-wpi-3",
        title: "Module 3: Official Data Pipeline & Real-Time Analytics",
        duration: "20:30",
        videoUrl: "https://www.youtube.com/embed/K8e6Jg_8u9M",
        sunbirdContentId: "do_igot_wpi_cpi_004_c3",
        overview: "Processing live MoSPI API data streams, seasonal adjustments, and inflation contribution decomposition.",
        statements: [
          "Connecting to MoSPI / eSankhyiki live REST API endpoints to fetch time series.",
          "Decomposing headline inflation into base effects and month-on-month momentum.",
          "Generating automated discrepancy alerts for abnormal price spikes."
        ],
        keyTakeaways: [
          "Building automated inflation tracking pipelines.",
          "Heatmap visualization of commodity group contributions.",
          "Reconciling WPI variations with CPI headline movements."
        ]
      }
    ];
  }

  // 4. Sampling Methods & Surveys
  if (/sampling|survey|plfs|hces|nss/i.test(title)) {
    return [
      {
        id: "mod-samp-1",
        title: "Module 1: Sample Design & Stratification Protocols",
        duration: "18:20",
        videoUrl: "https://www.youtube.com/embed/pT7L_v5iE_Y",
        sunbirdContentId: "do_igot_sampling_005_c1",
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
        sunbirdContentId: "do_igot_sampling_005_c2",
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
        title: "Module 3: Labor Force & Expenditure Aggregate Estimation",
        duration: "25:10",
        videoUrl: "https://www.youtube.com/embed/3U8O4_c2Okg",
        sunbirdContentId: "do_igot_sampling_005_c3",
        overview: "Calculating Usual Status (ps+ss) and Current Weekly Status (CWS) LFPR, WPR, and MPCE indicators.",
        statements: [
          "Labour Force Participation Rate (LFPR) = (Employed + Unemployed) / Total Population * 100.",
          "Worker Population Ratio (WPR) = Employed / Total Population * 100.",
          "Monthly Per Capita Consumption Expenditure (MPCE) fractile distribution computation."
        ],
        keyTakeaways: [
          "Executing official definition formulas for employment statuses.",
          "Quantifying rural vs urban structural disparities.",
          "Benchmarking computed survey indicators against national SDG targets."
        ]
      }
    ];
  }

  // 5. National Accounts & GDP
  if (/national|accounts|gdp|sna/i.test(title)) {
    return [
      {
        id: "mod-na-1",
        title: "Module 1: System of National Accounts (SNA 2008) Framework",
        duration: "26:30",
        videoUrl: "https://www.youtube.com/embed/41f8457P3mI",
        sunbirdContentId: "do_igot_nas_006_c1",
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
        title: "Module 2: Production vs Expenditure Approaches",
        duration: "32:15",
        videoUrl: "https://www.youtube.com/embed/3nC4M5_Lp8A",
        sunbirdContentId: "do_igot_nas_006_c2",
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
    ];
  }

  return COURSE_CURRICULA.default;
}

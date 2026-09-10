export interface CourseLesson {
  id: string;
  title: string;
  duration: string;
  videoUrl?: string;
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
      title: "Module 5: Practical Case Study & ISS Applied Analytics",
      duration: "18:30",
      overview: "End-to-end analytical pipeline using Python/R to process raw microdata and compute official aggregates.",
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
  const isIndex = /index|wpi|cpi|price/i.test(courseTitle);
  const isSampling = /sampling|survey|plfs|hces|nss/i.test(courseTitle);
  const isIndustrial = /industry|asi|enterprise|manufacturing/i.test(courseTitle);

  if (isIndex) {
    return [
      {
        id: "mod-wpi-1",
        title: "Module 1: Principles of Economic Price Indices",
        duration: "16:40",
        overview: "Foundational concepts of Wholesale Price Index (WPI), Consumer Price Index (CPI), and GDP Deflator.",
        statements: [
          "WPI measures wholesale transaction prices, capturing price changes at the first point of bulk sale.",
          "Basket weights are derived from gross value of domestic output and net imports from Input-Output tables.",
          "Item coverage spans Primary Articles, Fuel & Power, and Manufactured Products."
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
        overview: "Mathematical mechanics of price relatives, Laspeyres base weighting, and geometric averaging.",
        statements: [
          "Item-level price relatives: R_i = (P_it / P_i0) * 100 computed across representative markets.",
          "Group indices are calculated as weighted arithmetic mean of individual commodity price relatives.",
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

  if (isSampling || isIndustrial) {
    return [
      {
        id: "mod-samp-1",
        title: "Module 1: Sample Design & Stratification Protocols",
        duration: "18:20",
        overview: "Design of NSSO large-scale multi-stage stratified surveys across rural and urban sectors.",
        statements: [
          "Rural stratification is based on population size and agro-climatic zones.",
          "Urban strata are formed according to town class size from Census frames.",
          "Two-stage sampling: FSUs selected with PPSWOR; Second Stage Units (SSUs/households) selected via Circular Systematic Sampling."
        ],
        keyTakeaways: [
          "Multi-stage stratified sampling principles.",
          "Probability Proportional to Size (PPS) selection with replacement/without replacement.",
          "Allocating sample units across state and central quotas."
        ]
      },
      {
        id: "mod-samp-2",
        title: "Module 2: Unit-Record Microdata Structure & Layout Parsing",
        duration: "30:45",
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

  return COURSE_CURRICULA.default;
}

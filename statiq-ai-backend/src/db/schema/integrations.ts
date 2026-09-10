import {
  pgTable,
  uuid,
  text,
  varchar,
  timestamp,
  integer,
  numeric,
  jsonb,
  pgEnum,
  boolean,
  index,
  unique,
} from "drizzle-orm/pg-core";

export const syncStatusEnum = pgEnum("sync_status", [
  "PENDING",
  "RUNNING",
  "SUCCESS",
  "PARTIAL",
  "FAILED",
]);

// Mirrors DATA_SOURCE_REGISTRY.csv so the registry is queryable, not just documentation.
export const dataSourceRegistry = pgTable("data_source_registry", {
  id: uuid("id").defaultRandom().primaryKey(),
  source: varchar("source", { length: 100 }).notNull().unique(), // "MoSPI API Platform", "eSankhyiki", ...
  officialUrl: text("official_url").notNull(),
  purpose: text("purpose"),
  access: varchar("access", { length: 100 }), // "Public/API where available", "Token/API account", ...
  integrationMode: varchar("integration_mode", { length: 20 }).notNull().default("mock"), // mock | live
  notes: text("notes"),
  isActive: boolean("is_active").notNull().default(true),
});

// Every sync run against an external source — auditable, per API_INTEGRATION.md #12/#13.
export const integrationSyncLogs = pgTable(
  "integration_sync_logs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    source: varchar("source", { length: 100 }).notNull(),
    resource: varchar("resource", { length: 255 }), // e.g. data.gov.in resource_id, "wpi", "esankhyiki_catalogue"
    status: syncStatusEnum("status").notNull().default("PENDING"),
    recordsFetched: integer("records_fetched").default(0),
    recordsUpserted: integer("records_upserted").default(0),
    errorMessage: text("error_message"),
    startedAt: timestamp("started_at").defaultNow().notNull(),
    finishedAt: timestamp("finished_at"),
  },
  (t) => ({
    sourceIdx: index("sync_logs_source_idx").on(t.source),
    statusIdx: index("sync_logs_status_idx").on(t.status),
  })
);

// --- MoSPI WPI (Wholesale Price Index) cache — design.md #6 ---
export const mospiWpiRecords = pgTable(
  "mospi_wpi_records",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    year: integer("year").notNull(),
    month: integer("month").notNull(),
    majorGroup: varchar("major_group", { length: 255 }),
    groupName: varchar("group_name", { length: 255 }),
    subgroup: varchar("subgroup", { length: 255 }),
    item: varchar("item", { length: 255 }),
    value: numeric("value", { precision: 12, scale: 4 }),
    unit: varchar("unit", { length: 50 }),
    source: varchar("source", { length: 100 }).notNull().default("MoSPI WPI API"),
    fetchedAt: timestamp("fetched_at").defaultNow().notNull(),
  },
  (t) => ({
    periodIdx: index("wpi_period_idx").on(t.year, t.month),
    uniqRecord: unique("wpi_unique_record").on(
      t.year,
      t.month,
      t.majorGroup,
      t.groupName,
      t.subgroup,
      t.item
    ),
  })
);

// --- eSankhyiki catalogue — design.md #7 ---
export const esankhyikiDatasets = pgTable(
  "esankhyiki_datasets",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    externalId: varchar("external_id", { length: 255 }).notNull().unique(),
    title: varchar("title", { length: 500 }).notNull(),
    description: text("description"),
    category: varchar("category", { length: 255 }),
    frequency: varchar("frequency", { length: 100 }),
    unit: varchar("unit", { length: 100 }),
    publisher: varchar("publisher", { length: 255 }).default("MoSPI"),
    sourceUrl: text("source_url"),
    apiAvailable: boolean("api_available").notNull().default(false),
    lastSyncedAt: timestamp("last_synced_at"),
  },
  (t) => ({
    categoryIdx: index("esankhyiki_datasets_category_idx").on(t.category),
  })
);

export const esankhyikiIndicators = pgTable(
  "esankhyiki_indicators",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    datasetId: uuid("dataset_id")
      .notNull()
      .references(() => esankhyikiDatasets.id, { onDelete: "cascade" }),
    indicatorName: varchar("indicator_name", { length: 255 }).notNull(),
    period: varchar("period", { length: 50 }),
    geography: varchar("geography", { length: 100 }),
    value: numeric("value", { precision: 14, scale: 4 }),
    unit: varchar("unit", { length: 50 }),
    metadata: jsonb("metadata"),
    source: varchar("source", { length: 100 }).default("eSankhyiki"),
    fetchedAt: timestamp("fetched_at").defaultNow().notNull(),
  },
  (t) => ({
    datasetIdx: index("esankhyiki_indicators_dataset_idx").on(t.datasetId),
  })
);

// --- MoSPI UnitData / microdata.gov.in — design.md #8 ---
// PostgreSQL is a cache/index. Official source of truth remains microdata.gov.in.
export const unitdataDatasets = pgTable("unitdata_datasets", {
  id: uuid("id").defaultRandom().primaryKey(),
  externalId: varchar("external_id", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 500 }).notNull(),
  title: varchar("title", { length: 500 }),
  referenceId: varchar("reference_id", { length: 255 }),
  collection: varchar("collection", { length: 255 }),
  year: varchar("year", { length: 64 }),
  surveyRound: varchar("survey_round", { length: 100 }),
  description: text("description"),
  sourceUrl: text("source_url"),
  source: varchar("source", { length: 100 }).notNull().default("MoSPI Microdata Portal"),
  accessStatus: varchar("access_status", { length: 100 }),
  metadata: jsonb("metadata").$type<Record<string, unknown>>(),
  lastSyncedAt: timestamp("last_synced_at"),
});

export const unitdataFiles = pgTable(
  "unitdata_files",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    datasetId: uuid("dataset_id")
      .notNull()
      .references(() => unitdataDatasets.id, { onDelete: "cascade" }),
    fileName: varchar("file_name", { length: 500 }).notNull(),
    format: varchar("format", { length: 50 }),
    sizeBytes: integer("size_bytes"),
    downloadUrl: text("download_url"),
    checksum: varchar("checksum", { length: 64 }),
    sourceFileId: varchar("source_file_id", { length: 500 }),
    accessStatus: varchar("access_status", { length: 100 }),
    metadata: jsonb("metadata").$type<Record<string, unknown>>(),
    lastSyncedAt: timestamp("last_synced_at"),
  },
  (t) => ({
    datasetIdx: index("unitdata_files_dataset_idx").on(t.datasetId),
    uniqFile: unique("unitdata_files_dataset_name_unique").on(t.datasetId, t.fileName),
  })
);

export const unitdataSearchLogs = pgTable(
  "unitdata_search_logs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: varchar("user_id", { length: 64 }),
    query: varchar("query", { length: 255 }),
    page: integer("page").notNull().default(1),
    resultCount: integer("result_count").notNull().default(0),
    mode: varchar("mode", { length: 40 }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => ({
    createdIdx: index("unitdata_search_logs_created_idx").on(t.createdAt),
  })
);

export const unitdataAccessLogs = pgTable(
  "unitdata_access_logs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: varchar("user_id", { length: 64 }),
    role: varchar("role", { length: 40 }),
    action: varchar("action", { length: 80 }).notNull(),
    datasetId: varchar("dataset_id", { length: 255 }),
    fileId: varchar("file_id", { length: 500 }),
    status: varchar("status", { length: 40 }).notNull(),
    category: varchar("category", { length: 40 }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => ({
    datasetIdx: index("unitdata_access_logs_dataset_idx").on(t.datasetId),
  })
);

export const unitdataDownloadLogs = pgTable(
  "unitdata_download_logs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: varchar("user_id", { length: 64 }),
    datasetId: varchar("dataset_id", { length: 255 }).notNull(),
    fileId: varchar("file_id", { length: 500 }).notNull(),
    fileName: varchar("file_name", { length: 500 }),
    status: varchar("status", { length: 40 }).notNull(),
    category: varchar("category", { length: 40 }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => ({
    createdIdx: index("unitdata_download_logs_created_idx").on(t.createdAt),
  })
);

export const unitdataActivityLogs = pgTable(
  "unitdata_activity_logs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: varchar("user_id", { length: 64 }),
    role: varchar("role", { length: 40 }),
    action: varchar("action", { length: 80 }).notNull(),
    datasetId: varchar("dataset_id", { length: 255 }),
    fileId: varchar("file_id", { length: 500 }),
    status: varchar("status", { length: 40 }),
    details: jsonb("details").$type<Record<string, unknown>>(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => ({
    userIdx: index("unitdata_activity_user_idx").on(t.userId),
  })
);

export const unitdataAssignments = pgTable(
  "unitdata_assignments",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    trainerUserId: varchar("trainer_user_id", { length: 64 }).notNull(),
    learnerUserId: varchar("learner_user_id", { length: 64 }),
    sourceDatasetId: varchar("source_dataset_id", { length: 255 }).notNull(),
    title: varchar("title", { length: 500 }),
    tasks: jsonb("tasks").$type<string[]>(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => ({
    datasetIdx: index("unitdata_assignments_dataset_idx").on(t.sourceDatasetId),
  })
);

// --- Generic data.gov.in OGD resources (used for the demo-ready public dataset layer) ---
export const dataGovInResources = pgTable(
  "datagovin_resources",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    resourceId: varchar("resource_id", { length: 100 }).notNull().unique(), // data.gov.in resource UUID
    title: varchar("title", { length: 500 }).notNull(),
    sector: varchar("sector", { length: 255 }),
    orgName: varchar("org_name", { length: 255 }),
    recordCount: integer("record_count"),
    fields: jsonb("fields").$type<string[]>(),
    lastSyncedAt: timestamp("last_synced_at"),
  },
  (t) => ({
    sectorIdx: index("datagovin_resources_sector_idx").on(t.sector),
  })
);

export const dataGovInRecords = pgTable(
  "datagovin_records",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    resourceId: varchar("resource_id", { length: 100 })
      .notNull()
      .references(() => dataGovInResources.resourceId, { onDelete: "cascade" }),
    payload: jsonb("payload").notNull(), // raw row as returned by the API — schema varies per resource
    fetchedAt: timestamp("fetched_at").defaultNow().notNull(),
  },
  (t) => ({
    resourceIdx: index("datagovin_records_resource_idx").on(t.resourceId),
  })
);

export const mospiDatasets = pgTable("mospi_datasets", {
  id: uuid("id").defaultRandom().primaryKey(),
  code: varchar("code", { length: 255 }).notNull().unique(),
  name: varchar("name", { length: 500 }).notNull(),
  description: text("description"),
  source: varchar("source", { length: 255 }).notNull().default("MoSPI e-Sankhyiki"),
  lastSyncedAt: timestamp("last_synced_at"),
  status: varchar("status", { length: 50 }).default("ACTIVE"),
});

export const mospiDatasetSyncs = pgTable(
  "mospi_dataset_syncs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    datasetId: uuid("dataset_id")
      .notNull()
      .references(() => mospiDatasets.id, { onDelete: "cascade" }),
    startedAt: timestamp("started_at").defaultNow().notNull(),
    completedAt: timestamp("completed_at"),
    status: syncStatusEnum("status").notNull().default("PENDING"),
    recordsFetched: integer("records_fetched").default(0),
    errorMessage: text("error_message"),
  },
  (t) => ({
    datasetIdx: index("mospi_syncs_dataset_idx").on(t.datasetId),
  })
);

export const mospiStatisticalRecords = pgTable(
  "mospi_statistical_records",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    datasetId: uuid("dataset_id")
      .notNull()
      .references(() => mospiDatasets.id, { onDelete: "cascade" }),
    indicatorCode: varchar("indicator_code", { length: 255 }),
    indicatorName: varchar("indicator_name", { length: 500 }),
    period: varchar("period", { length: 100 }),
    geography: varchar("geography", { length: 255 }),
    category: varchar("category", { length: 255 }),
    value: numeric("value", { precision: 16, scale: 4 }),
    unit: varchar("unit", { length: 100 }),
    rawData: jsonb("raw_data"),
    source: varchar("source", { length: 255 }).default("MoSPI e-Sankhyiki"),
    fetchedAt: timestamp("fetched_at").defaultNow().notNull(),
  },
  (t) => ({
    datasetIdx: index("mospi_records_dataset_idx").on(t.datasetId),
    indicatorIdx: index("mospi_records_indicator_idx").on(t.indicatorCode),
  })
);


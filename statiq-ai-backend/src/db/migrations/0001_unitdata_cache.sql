-- MoSPI UnitData metadata cache and activity (source of truth remains microdata.gov.in)

ALTER TABLE unitdata_datasets ADD COLUMN IF NOT EXISTS title varchar(500);
ALTER TABLE unitdata_datasets ADD COLUMN IF NOT EXISTS reference_id varchar(255);
ALTER TABLE unitdata_datasets ADD COLUMN IF NOT EXISTS collection varchar(255);
ALTER TABLE unitdata_datasets ADD COLUMN IF NOT EXISTS year varchar(64);
ALTER TABLE unitdata_datasets ADD COLUMN IF NOT EXISTS source varchar(100) DEFAULT 'MoSPI Microdata Portal';
ALTER TABLE unitdata_datasets ADD COLUMN IF NOT EXISTS access_status varchar(100);
ALTER TABLE unitdata_datasets ADD COLUMN IF NOT EXISTS metadata jsonb;

ALTER TABLE unitdata_files ADD COLUMN IF NOT EXISTS source_file_id varchar(500);
ALTER TABLE unitdata_files ADD COLUMN IF NOT EXISTS access_status varchar(100);
ALTER TABLE unitdata_files ADD COLUMN IF NOT EXISTS metadata jsonb;
ALTER TABLE unitdata_files ADD COLUMN IF NOT EXISTS last_synced_at timestamp;

CREATE UNIQUE INDEX IF NOT EXISTS unitdata_files_dataset_name_unique ON unitdata_files (dataset_id, file_name);

CREATE TABLE IF NOT EXISTS unitdata_search_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id varchar(64),
  query varchar(255),
  page integer NOT NULL DEFAULT 1,
  result_count integer NOT NULL DEFAULT 0,
  mode varchar(40),
  created_at timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS unitdata_access_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id varchar(64),
  role varchar(40),
  action varchar(80) NOT NULL,
  dataset_id varchar(255),
  file_id varchar(500),
  status varchar(40) NOT NULL,
  category varchar(40),
  created_at timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS unitdata_download_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id varchar(64),
  dataset_id varchar(255) NOT NULL,
  file_id varchar(500) NOT NULL,
  file_name varchar(500),
  status varchar(40) NOT NULL,
  category varchar(40),
  created_at timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS unitdata_activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id varchar(64),
  role varchar(40),
  action varchar(80) NOT NULL,
  dataset_id varchar(255),
  file_id varchar(500),
  status varchar(40),
  details jsonb,
  created_at timestamp NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS unitdata_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trainer_user_id varchar(64) NOT NULL,
  learner_user_id varchar(64),
  source_dataset_id varchar(255) NOT NULL,
  title varchar(500),
  tasks jsonb,
  created_at timestamp NOT NULL DEFAULT now()
);

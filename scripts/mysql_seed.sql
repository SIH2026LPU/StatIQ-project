USE `statiq_db`;

-- 1. Default Organization
INSERT INTO `organizations` (`id`, `name`, `code`, `created_at`, `updated_at`)
VALUES ('org_demo_001', 'StatIQ National Analytics Organization', 'DEMO_ORG', NOW(), NOW())
ON DUPLICATE KEY UPDATE `name`=VALUES(`name`);

-- 2. Default Roles
INSERT INTO `roles` (`id`, `name`, `description`, `created_at`, `updated_at`)
VALUES 
  ('role_super_admin', 'SUPER_ADMIN', 'System administrator with full access', NOW(), NOW()),
  ('role_org_admin', 'ORG_ADMIN', 'Organization level administrator', NOW(), NOW()),
  ('role_trainer', 'TRAINER', 'Content creator and course instructor', NOW(), NOW()),
  ('role_learner', 'LEARNER', 'Platform end-user', NOW(), NOW()),
  ('role_content_manager', 'CONTENT_MANAGER', 'Manages learning content', NOW(), NOW())
ON DUPLICATE KEY UPDATE `description`=VALUES(`description`);

-- 3. Demo Users (Password: demo123)
INSERT INTO `users` (`id`, `organization_id`, `email`, `password_hash`, `role`, `name`, `username`, `first_name`, `last_name`, `display_name`, `status`, `email_verified`, `created_at`, `updated_at`)
VALUES
  ('user_admin_001', 'org_demo_001', 'admin@statiq.demo', '$2b$10$SIFFrSE197oZGhcq3NZIN.Kn2c3NcP28BLuVnn0dcUvLMFPreE3li', 'ORG_ADMIN', 'Kavita Iyer', 'demoadmin', 'Kavita', 'Iyer', 'Kavita Iyer (Admin)', 'ACTIVE', 1, NOW(), NOW()),
  ('user_learner_001', 'org_demo_001', 'learner@statiq.demo', '$2b$10$SIFFrSE197oZGhcq3NZIN.Kn2c3NcP28BLuVnn0dcUvLMFPreE3li', 'LEARNER', 'Aarav Sharma', 'aarav', 'Aarav', 'Sharma', 'Aarav Sharma', 'ACTIVE', 1, NOW(), NOW()),
  ('user_trainer_001', 'org_demo_001', 'trainer@statiq.demo', '$2b$10$SIFFrSE197oZGhcq3NZIN.Kn2c3NcP28BLuVnn0dcUvLMFPreE3li', 'TRAINER', 'Dr. Ramesh Gupta', 'rgupta', 'Ramesh', 'Gupta', 'Dr. Ramesh Gupta', 'ACTIVE', 1, NOW(), NOW())
ON DUPLICATE KEY UPDATE `password_hash`=VALUES(`password_hash`);

-- 4. User Profiles
INSERT INTO `user_profiles` (`id`, `user_id`, `department`, `institution`, `country`, `state`, `created_at`, `updated_at`)
VALUES
  ('prof_001', 'user_admin_001', 'National Accounts Division', 'MoSPI', 'India', 'New Delhi', NOW(), NOW()),
  ('prof_002', 'user_learner_001', 'Economic Statistics Wing', 'Indian Statistical Institute', 'India', 'Karnataka', NOW(), NOW())
ON DUPLICATE KEY UPDATE `department`=VALUES(`department`);

-- 5. Data Sources
INSERT INTO `data_sources` (`id`, `name`, `organization`, `type`, `official_url`, `integration_mode`, `enabled`, `requires_credentials`)
VALUES
  ('src_mospi_api', 'MoSPI Official API Gateway', 'Ministry of Statistics & PI', 'REST_API', 'https://api.mospi.gov.in', 'LIVE', 1, 1),
  ('src_mospi_microdata', 'MoSPI Microdata / UnitData Portal', 'National Data Archive (NADA)', 'REST_API', 'https://microdata.gov.in', 'LIVE', 1, 1),
  ('src_esankhyiki', 'eSankhyiki Portal & MCP', 'MoSPI Data Directorate', 'MCP_PROTOCOL', 'https://esankhyiki.mospi.gov.in', 'MCP', 1, 0),
  ('src_datagovin', 'Open Government Data (OGD) Platform', 'NIC / MeitY', 'REST_API', 'https://data.gov.in', 'LIVE', 1, 1)
ON DUPLICATE KEY UPDATE `enabled`=VALUES(`enabled`);

-- 6. Competency Categories
INSERT INTO `competency_categories` (`id`, `organization_id`, `name`, `description`, `created_at`, `updated_at`)
VALUES
  ('cat_stat_analysis', 'org_demo_001', 'Statistical Analysis & Inference', 'Methodologies, time series modeling, sample designs', NOW(), NOW()),
  ('cat_data_governance', 'org_demo_001', 'Data Governance & Ethics', 'Public data standards, metadata compliance, anonymization', NOW(), NOW()),
  ('cat_macro_indicators', 'org_demo_001', 'Macroeconomic Indicators', 'WPI, CPI, GDP calculation, ASI and PLFS analytics', NOW(), NOW())
ON DUPLICATE KEY UPDATE `name`=VALUES(`name`);
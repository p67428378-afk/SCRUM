CREATE TABLE IF NOT EXISTS `{project}.{dataset}.etl_audit_logs` (
  `job_id` STRING NOT NULL,
  `execution_date` DATE NOT NULL,
  `ingested_count` INTEGER NOT NULL,
  `cleaned_count` INTEGER NOT NULL,
  `deduplicated_count` INTEGER NOT NULL,
  `quarantined_count` INTEGER NOT NULL,
  `loaded_count` INTEGER NOT NULL,
  `status` STRING NOT NULL,
  `completed_at` TIMESTAMP NOT NULL
)
PARTITION BY DATE(`execution_date`);

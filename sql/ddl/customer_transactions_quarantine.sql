CREATE TABLE IF NOT EXISTS `{project}.{dataset}.customer_transactions_quarantine` (
  `quarantine_id` STRING NOT NULL,
  `raw_record_json` STRING NOT NULL,
  `transaction_id` STRING,
  `error_reason` STRING NOT NULL,
  `source_file` STRING,
  `quarantined_at` TIMESTAMP NOT NULL,
  `quarantine_date` DATE NOT NULL
)
PARTITION BY DATE(`quarantine_date`);

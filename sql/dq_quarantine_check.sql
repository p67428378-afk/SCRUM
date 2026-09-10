-- Data Quality Quarantine SQL
-- Identifies and routes invalid records from staging into the quarantine table

INSERT INTO `analytics_staging.quarantine_transactions` (
  transaction_id,
  customer_id,
  amount,
  currency,
  transaction_timestamp,
  payment_method,
  store_id,
  updated_at,
  quarantine_reason,
  quarantined_at
)
SELECT
  transaction_id,
  customer_id,
  amount,
  currency,
  transaction_timestamp,
  payment_method,
  store_id,
  updated_at,
  CASE
    WHEN transaction_id IS NULL OR TRIM(transaction_id) = '' THEN 'NULL_OR_EMPTY_TRANSACTION_ID'
    WHEN customer_id IS NULL OR TRIM(customer_id) = '' THEN 'NULL_OR_EMPTY_CUSTOMER_ID'
    WHEN amount IS NULL THEN 'NULL_AMOUNT'
    WHEN amount <= 0 THEN 'INVALID_AMOUNT_NON_POSITIVE'
    WHEN transaction_timestamp IS NULL THEN 'NULL_TRANSACTION_TIMESTAMP'
    WHEN currency IS NULL OR TRIM(currency) = '' THEN 'NULL_OR_EMPTY_CURRENCY'
    ELSE 'UNKNOWN_DATA_QUALITY_ERROR'
  END AS quarantine_reason,
  CURRENT_TIMESTAMP() AS quarantined_at
FROM `analytics_staging.stg_customer_transactions`
WHERE transaction_id IS NULL
   OR TRIM(transaction_id) = ''
   OR customer_id IS NULL
   OR TRIM(customer_id) = ''
   OR amount IS NULL
   OR amount <= 0
   OR transaction_timestamp IS NULL
   OR currency IS NULL
   OR TRIM(currency) = '';

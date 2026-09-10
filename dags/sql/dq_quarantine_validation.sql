-- =============================================================================
-- Data Quality Validation & Quarantine Routing
-- Identifies corrupt, invalid, or null mandatory fields and routes to quarantine
-- Dataset: analytics
-- =============================================================================

INSERT INTO `analytics.customer_transactions_quarantine` (
  quarantine_id,
  raw_record_json,
  transaction_id,
  error_reason,
  source_file,
  quarantined_at,
  quarantine_date
)
WITH validated_staging AS (
  SELECT
    GENERATE_UUID() AS quarantine_id,
    TO_JSON_STRING(STRUCT(
      transaction_id,
      customer_id,
      transaction_timestamp,
      original_amount,
      original_currency,
      merchant_category,
      payment_method,
      _source_file
    )) AS raw_record_json,
    transaction_id,
    _source_file AS source_file,
    CURRENT_TIMESTAMP() AS quarantined_at,
    CURRENT_DATE() AS quarantine_date,
    CASE
      WHEN transaction_id IS NULL OR TRIM(transaction_id) = '' THEN 'NULL_TRANSACTION_ID'
      WHEN customer_id IS NULL OR TRIM(customer_id) = '' THEN 'NULL_CUSTOMER_ID'
      WHEN transaction_timestamp IS NULL OR SAFE_CAST(transaction_timestamp AS TIMESTAMP) IS NULL THEN 'NULL_TIMESTAMP'
      WHEN original_amount IS NULL OR SAFE_CAST(original_amount AS NUMERIC) IS NULL OR SAFE_CAST(original_amount AS NUMERIC) <= 0 THEN 'INVALID_AMOUNT'
      WHEN original_currency IS NULL OR TRIM(original_currency) = '' THEN 'NULL_CURRENCY'
      ELSE NULL
    END AS error_reason
  FROM `analytics.stg_customer_transactions`
)
SELECT
  quarantine_id,
  raw_record_json,
  transaction_id,
  error_reason,
  source_file,
  quarantined_at,
  quarantine_date
FROM validated_staging
WHERE error_reason IS NOT NULL;

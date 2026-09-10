-- =============================================================================
-- Transformation: Deduplication & Currency Normalization
-- Deduplicates transactions keeping the latest record per transaction_id,
-- normalizes currencies to USD, and performs idempotent MERGE into target.
-- Target: analytics.customer_transactions
-- =============================================================================

MERGE `analytics.customer_transactions` T
USING (
  WITH valid_staging AS (
    SELECT
      TRIM(transaction_id) AS transaction_id,
      TRIM(customer_id) AS customer_id,
      SAFE_CAST(transaction_timestamp AS TIMESTAMP) AS transaction_timestamp,
      DATE(SAFE_CAST(transaction_timestamp AS TIMESTAMP)) AS transaction_date,
      SAFE_CAST(original_amount AS NUMERIC) AS original_amount,
      UPPER(TRIM(original_currency)) AS original_currency,
      TRIM(merchant_category) AS merchant_category,
      TRIM(payment_method) AS payment_method,
      _ingested_at
    FROM `analytics.stg_customer_transactions`
    WHERE transaction_id IS NOT NULL AND TRIM(transaction_id) != ''
      AND customer_id IS NOT NULL AND TRIM(customer_id) != ''
      AND transaction_timestamp IS NOT NULL AND SAFE_CAST(transaction_timestamp AS TIMESTAMP) IS NOT NULL
      AND original_amount IS NOT NULL AND SAFE_CAST(original_amount AS NUMERIC) IS NOT NULL AND SAFE_CAST(original_amount AS NUMERIC) > 0
      AND original_currency IS NOT NULL AND TRIM(original_currency) != ''
  ),
  deduplicated AS (
    SELECT
      *,
      ROW_NUMBER() OVER (
        PARTITION BY transaction_id
        ORDER BY transaction_timestamp DESC, _ingested_at DESC
      ) AS row_num
    FROM valid_staging
  ),
  final_records AS (
    SELECT
      d.transaction_id,
      d.customer_id,
      d.transaction_timestamp,
      d.transaction_date,
      d.original_amount,
      d.original_currency,
      COALESCE(fx.usd_conversion_rate, 1.0) AS fx_rate_to_usd,
      ROUND(d.original_amount * COALESCE(fx.usd_conversion_rate, 1.0), 2) AS amount_usd,
      d.merchant_category,
      d.payment_method,
      CURRENT_TIMESTAMP() AS ingested_at
    FROM deduplicated d
    LEFT JOIN `analytics.currency_conversion_rates` fx
      ON d.original_currency = fx.currency_code
      AND d.transaction_date = fx.rate_date
    WHERE d.row_num = 1
  )
  SELECT * FROM final_records
) S
ON T.transaction_id = S.transaction_id
   AND T.transaction_date = S.transaction_date
WHEN MATCHED THEN
  UPDATE SET
    customer_id = S.customer_id,
    transaction_timestamp = S.transaction_timestamp,
    original_amount = S.original_amount,
    original_currency = S.original_currency,
    fx_rate_to_usd = S.fx_rate_to_usd,
    amount_usd = S.amount_usd,
    merchant_category = S.merchant_category,
    payment_method = S.payment_method,
    ingested_at = S.ingested_at
WHEN NOT MATCHED THEN
  INSERT (
    transaction_id,
    customer_id,
    transaction_timestamp,
    transaction_date,
    original_amount,
    original_currency,
    fx_rate_to_usd,
    amount_usd,
    merchant_category,
    payment_method,
    ingested_at
  )
  VALUES (
    S.transaction_id,
    S.customer_id,
    S.transaction_timestamp,
    S.transaction_date,
    S.original_amount,
    S.original_currency,
    S.fx_rate_to_usd,
    S.amount_usd,
    S.merchant_category,
    S.payment_method,
    S.ingested_at
  );

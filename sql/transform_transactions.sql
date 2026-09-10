-- SQL Transformation & Idempotent Load
-- Performs deduplication via window functions, currency normalization to USD, and MERGE into target

MERGE `analytics.customer_transactions` T
USING (
  WITH raw_valid AS (
    SELECT
      TRIM(transaction_id) AS transaction_id,
      TRIM(customer_id) AS customer_id,
      CAST(amount AS NUMERIC) AS amount_local,
      UPPER(TRIM(currency)) AS currency_local,
      transaction_timestamp,
      DATE(transaction_timestamp) AS transaction_date,
      payment_method,
      store_id,
      COALESCE(updated_at, transaction_timestamp) AS updated_at,
      ROW_NUMBER() OVER (
        PARTITION BY TRIM(transaction_id)
        ORDER BY COALESCE(updated_at, transaction_timestamp) DESC
      ) AS row_num
    FROM `analytics_staging.stg_customer_transactions`
    WHERE transaction_id IS NOT NULL 
      AND TRIM(transaction_id) != ''
      AND customer_id IS NOT NULL
      AND TRIM(customer_id) != ''
      AND amount IS NOT NULL
      AND amount > 0
      AND transaction_timestamp IS NOT NULL
      AND currency IS NOT NULL
      AND TRIM(currency) != ''
  ),
  deduplicated AS (
    SELECT * EXCEPT(row_num)
    FROM raw_valid
    WHERE row_num = 1
  ),
  fx_lookup AS (
    SELECT
      d.transaction_id,
      d.customer_id,
      d.amount_local,
      d.currency_local,
      CASE
        WHEN d.currency_local = 'USD' THEN 1.0
        ELSE COALESCE(fx.rate_to_usd, 1.0)
      END AS exchange_rate_usd,
      d.transaction_timestamp,
      d.transaction_date,
      d.payment_method,
      d.store_id,
      d.updated_at
    FROM deduplicated d
    LEFT JOIN `analytics.currency_exchange_rates` fx
      ON d.currency_local = fx.currency_code
      AND d.transaction_date = fx.rate_date
  )
  SELECT
    transaction_id,
    customer_id,
    amount_local,
    currency_local,
    CAST(exchange_rate_usd AS NUMERIC) AS exchange_rate_usd,
    CAST(ROUND(amount_local * exchange_rate_usd, 2) AS NUMERIC) AS amount_usd,
    transaction_timestamp,
    transaction_date,
    payment_method,
    store_id,
    updated_at,
    CURRENT_TIMESTAMP() AS etl_loaded_at
  FROM fx_lookup
) S
ON T.transaction_id = S.transaction_id
  AND T.transaction_date = S.transaction_date
WHEN MATCHED AND S.updated_at >= T.updated_at THEN
  UPDATE SET
    customer_id = S.customer_id,
    amount_local = S.amount_local,
    currency_local = S.currency_local,
    exchange_rate_usd = S.exchange_rate_usd,
    amount_usd = S.amount_usd,
    transaction_timestamp = S.transaction_timestamp,
    payment_method = S.payment_method,
    store_id = S.store_id,
    updated_at = S.updated_at,
    etl_loaded_at = S.etl_loaded_at
WHEN NOT MATCHED THEN
  INSERT (
    transaction_id,
    customer_id,
    amount_local,
    currency_local,
    exchange_rate_usd,
    amount_usd,
    transaction_timestamp,
    transaction_date,
    payment_method,
    store_id,
    updated_at,
    etl_loaded_at
  )
  VALUES (
    S.transaction_id,
    S.customer_id,
    S.amount_local,
    S.currency_local,
    S.exchange_rate_usd,
    S.amount_usd,
    S.transaction_timestamp,
    S.transaction_date,
    S.payment_method,
    S.store_id,
    S.updated_at,
    S.etl_loaded_at
  );

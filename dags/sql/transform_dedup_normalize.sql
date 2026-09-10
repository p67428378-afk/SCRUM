-- Deduplicate valid staging records and normalize currency to base USD, then load to production table
MERGE `analytics.customer_transactions` T
USING (
    WITH valid_staging AS (
        SELECT *
        FROM `analytics.stg_customer_transactions`
        WHERE transaction_id IS NOT NULL AND TRIM(transaction_id) != ''
          AND customer_id IS NOT NULL AND TRIM(customer_id) != ''
          AND transaction_timestamp IS NOT NULL
          AND original_amount IS NOT NULL AND original_amount > 0
    ),
    deduplicated_records AS (
        SELECT
            *,
            ROW_NUMBER() OVER (
                PARTITION BY transaction_id
                ORDER BY transaction_timestamp DESC, ingested_at DESC
            ) AS row_num
        FROM valid_staging
    ),
    dedup_valid AS (
        SELECT * EXCEPT(row_num)
        FROM deduplicated_records
        WHERE row_num = 1
    )
    SELECT
        s.transaction_id,
        s.customer_id,
        s.transaction_timestamp,
        DATE(s.transaction_timestamp) AS transaction_date,
        s.original_amount,
        UPPER(s.original_currency) AS original_currency,
        COALESCE(fx.usd_conversion_rate, 1.0) AS fx_rate_to_usd,
        ROUND(CAST(s.original_amount AS NUMERIC) * COALESCE(fx.usd_conversion_rate, 1.0), 2) AS amount_usd,
        s.merchant_category,
        s.payment_method,
        CURRENT_TIMESTAMP() AS ingested_at
    FROM dedup_valid s
    LEFT JOIN `analytics.currency_conversion_rates` fx
        ON UPPER(s.original_currency) = fx.currency_code
        AND DATE(s.transaction_timestamp) = fx.rate_date
) S
ON T.transaction_id = S.transaction_id AND T.transaction_date = S.transaction_date
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

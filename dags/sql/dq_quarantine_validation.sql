-- Identify and route invalid or duplicate records from staging to quarantine table
INSERT INTO `analytics.customer_transactions_quarantine` (
    quarantine_id,
    raw_record_json,
    transaction_id,
    error_reason,
    source_file,
    quarantined_at,
    quarantine_date
)
WITH ranked_staging AS (
    SELECT
        *,
        COUNT(*) OVER (PARTITION BY transaction_id) AS id_count,
        ROW_NUMBER() OVER (
            PARTITION BY transaction_id
            ORDER BY transaction_timestamp DESC, ingested_at DESC
        ) AS row_num
    FROM `analytics.stg_customer_transactions`
),
flagged_records AS (
    SELECT
        GENERATE_UUID() AS quarantine_id,
        TO_JSON_STRING(t) AS raw_record_json,
        t.transaction_id,
        CASE
            WHEN t.transaction_id IS NULL OR TRIM(t.transaction_id) = '' THEN 'NULL_TRANSACTION_ID'
            WHEN t.customer_id IS NULL OR TRIM(t.customer_id) = '' THEN 'NULL_CUSTOMER_ID'
            WHEN t.transaction_timestamp IS NULL THEN 'NULL_TIMESTAMP'
            WHEN t.original_amount IS NULL OR t.original_amount <= 0 THEN 'INVALID_AMOUNT'
            WHEN t.id_count > 1 AND t.row_num > 1 THEN 'DUPLICATE_TRANSACTION_ID'
            ELSE NULL
        END AS error_reason,
        t.source_file,
        CURRENT_TIMESTAMP() AS quarantined_at,
        CURRENT_DATE() AS quarantine_date
    FROM ranked_staging t
)
SELECT
    quarantine_id,
    raw_record_json,
    transaction_id,
    error_reason,
    source_file,
    quarantined_at,
    quarantine_date
FROM flagged_records
WHERE error_reason IS NOT NULL;

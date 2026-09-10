-- Target Production Table: analytics.customer_transactions
CREATE TABLE IF NOT EXISTS `analytics.customer_transactions` (
    transaction_id STRING NOT NULL,
    customer_id STRING NOT NULL,
    transaction_timestamp TIMESTAMP NOT NULL,
    transaction_date DATE NOT NULL,
    original_amount NUMERIC NOT NULL,
    original_currency STRING NOT NULL,
    fx_rate_to_usd NUMERIC NOT NULL,
    amount_usd NUMERIC NOT NULL,
    merchant_category STRING,
    payment_method STRING,
    ingested_at TIMESTAMP NOT NULL
)
PARTITION BY transaction_date
CLUSTER BY customer_id, transaction_id;

-- Quarantine / Dead-Letter Table: analytics.customer_transactions_quarantine
CREATE TABLE IF NOT EXISTS `analytics.customer_transactions_quarantine` (
    quarantine_id STRING NOT NULL,
    raw_record_json STRING,
    transaction_id STRING,
    error_reason STRING NOT NULL,
    source_file STRING,
    quarantined_at TIMESTAMP NOT NULL,
    quarantine_date DATE NOT NULL
)
PARTITION BY quarantine_date;

-- Currency Conversion Rates Reference Table: analytics.currency_conversion_rates
CREATE TABLE IF NOT EXISTS `analytics.currency_conversion_rates` (
    currency_code STRING NOT NULL,
    rate_date DATE NOT NULL,
    usd_conversion_rate NUMERIC NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

-- Staging Table: analytics.stg_customer_transactions
CREATE TABLE IF NOT EXISTS `analytics.stg_customer_transactions` (
    transaction_id STRING,
    customer_id STRING,
    transaction_timestamp TIMESTAMP,
    original_amount NUMERIC,
    original_currency STRING,
    merchant_category STRING,
    payment_method STRING,
    source_file STRING,
    ingested_at TIMESTAMP
);

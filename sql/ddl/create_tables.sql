-- =============================================================================
-- BigQuery DDL Definitions for Customer Transactions Pipeline
-- Jira Issue: SCRUM-268
-- Dataset: analytics
-- =============================================================================

CREATE SCHEMA IF NOT EXISTS `analytics`
OPTIONS(
  location="US"
);

-- Staging Table for Raw Ingested CSV Records
CREATE TABLE IF NOT EXISTS `analytics.stg_customer_transactions` (
  transaction_id STRING,
  customer_id STRING,
  transaction_timestamp STRING,
  original_amount STRING,
  original_currency STRING,
  merchant_category STRING,
  payment_method STRING,
  _source_file STRING,
  _ingested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP()
);

-- FX Currency Conversion Reference Table
CREATE TABLE IF NOT EXISTS `analytics.currency_conversion_rates` (
  currency_code STRING NOT NULL,
  rate_date DATE NOT NULL,
  usd_conversion_rate NUMERIC NOT NULL,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP()
);

-- Quarantine / Dead-Letter Table for Invalid or Corrupt Records
CREATE TABLE IF NOT EXISTS `analytics.customer_transactions_quarantine` (
  quarantine_id STRING NOT NULL,
  raw_record_json STRING NOT NULL,
  transaction_id STRING,
  error_reason STRING NOT NULL,
  source_file STRING,
  quarantined_at TIMESTAMP NOT NULL,
  quarantine_date DATE NOT NULL
)
PARTITION BY quarantine_date
OPTIONS(
  description="Quarantine isolation table for customer transactions failing data quality validation"
);

-- Production Target Partitioned & Clustered Table
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
CLUSTER BY customer_id, transaction_id
OPTIONS(
  description="Production customer transaction data partitioned daily and clustered by customer_id and transaction_id"
);

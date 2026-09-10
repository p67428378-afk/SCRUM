-- DDL script for BigQuery schemas and tables

-- 1. Create Datasets
CREATE SCHEMA IF NOT EXISTS `analytics`
OPTIONS(
  location="US",
  description="Production Analytics Dataset"
);

CREATE SCHEMA IF NOT EXISTS `analytics_staging`
OPTIONS(
  location="US",
  description="Transient Staging Dataset for ETL Ingestion"
);

-- 2. Staging Table for Raw Ingested CSV Data
CREATE TABLE IF NOT EXISTS `analytics_staging.stg_customer_transactions` (
  transaction_id STRING,
  customer_id STRING,
  amount FLOAT64,
  currency STRING,
  transaction_timestamp TIMESTAMP,
  payment_method STRING,
  store_id STRING,
  updated_at TIMESTAMP,
  ingestion_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP()
)
OPTIONS(
  description="Staging table for raw customer transaction files from GCS"
);

-- 3. Quarantine Table for Invalid / Malformed Records
CREATE TABLE IF NOT EXISTS `analytics_staging.quarantine_transactions` (
  transaction_id STRING,
  customer_id STRING,
  amount FLOAT64,
  currency STRING,
  transaction_timestamp TIMESTAMP,
  payment_method STRING,
  store_id STRING,
  updated_at TIMESTAMP,
  quarantine_reason STRING,
  quarantined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP()
)
OPTIONS(
  description="Quarantine table storing records that failed data quality validation rules"
);

-- 4. Currency Exchange Rates Reference Table
CREATE TABLE IF NOT EXISTS `analytics.currency_exchange_rates` (
  currency_code STRING NOT NULL,
  rate_date DATE NOT NULL,
  rate_to_usd NUMERIC NOT NULL
)
OPTIONS(
  description="Daily currency exchange rates reference table to normalize to USD base"
);

-- 5. Production Target Customer Transactions Table
CREATE TABLE IF NOT EXISTS `analytics.customer_transactions` (
  transaction_id STRING NOT NULL OPTIONS(description="Unique transaction identifier"),
  customer_id STRING NOT NULL OPTIONS(description="Unique customer identifier"),
  amount_local NUMERIC NOT NULL OPTIONS(description="Original transaction amount in local currency"),
  currency_local STRING NOT NULL OPTIONS(description="Original ISO currency code"),
  exchange_rate_usd NUMERIC NOT NULL OPTIONS(description="Applied conversion rate to USD"),
  amount_usd NUMERIC NOT NULL OPTIONS(description="Normalized transaction amount in USD"),
  transaction_timestamp TIMESTAMP NOT NULL OPTIONS(description="Transaction execution timestamp in UTC"),
  transaction_date DATE NOT NULL OPTIONS(description="Transaction date for partitioning"),
  payment_method STRING OPTIONS(description="Payment channel / method"),
  store_id STRING OPTIONS(description="Store or digital channel identifier"),
  updated_at TIMESTAMP NOT NULL OPTIONS(description="Last update timestamp"),
  etl_loaded_at TIMESTAMP NOT NULL OPTIONS(description="ETL load timestamp")
)
PARTITION BY transaction_date
CLUSTER BY customer_id, transaction_id
OPTIONS(
  description="Sanitized, deduplicated, and currency-normalized customer transactions partitioned by day"
);

CREATE TABLE IF NOT EXISTS `{project}.{dataset}.customer_transactions` (
  `transaction_id` STRING NOT NULL,
  `customer_id` STRING NOT NULL,
  `amount_local` NUMERIC NOT NULL,
  `currency_local` STRING NOT NULL,
  `exchange_rate_usd` NUMERIC NOT NULL,
  `amount_usd` NUMERIC NOT NULL,
  `transaction_timestamp` TIMESTAMP NOT NULL,
  `transaction_date` DATE NOT NULL,
  `payment_method` STRING,
  `store_id` STRING,
  `updated_at` TIMESTAMP NOT NULL,
  `etl_loaded_at` TIMESTAMP NOT NULL
)
PARTITION BY DATE(`transaction_date`)
CLUSTER BY `customer_id`, `transaction_id`;

CREATE TABLE IF NOT EXISTS `{project}.{dataset}.customer_transactions` (
  `transaction_id` STRING NOT NULL,
  `customer_id` STRING NOT NULL,
  `transaction_date` DATE NOT NULL,
  `transaction_timestamp` TIMESTAMP NOT NULL,
  `original_amount` NUMERIC NOT NULL,
  `currency` STRING NOT NULL,
  `exchange_rate` NUMERIC NOT NULL,
  `usd_amount` NUMERIC NOT NULL,
  `cleansed_at` TIMESTAMP NOT NULL
)
PARTITION BY DATE(`transaction_date`)
CLUSTER BY `customer_id`, `currency`;

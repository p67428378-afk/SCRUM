CREATE TABLE IF NOT EXISTS `{project}.{dataset}.customer_transactions` (
  `transaction_id` STRING NOT NULL,
  `customer_id` STRING NOT NULL,
  `transaction_timestamp` TIMESTAMP NOT NULL,
  `transaction_date` DATE NOT NULL,
  `original_amount` NUMERIC NOT NULL,
  `original_currency` STRING NOT NULL,
  `fx_rate_to_usd` NUMERIC NOT NULL,
  `amount_usd` NUMERIC NOT NULL,
  `merchant_category` STRING,
  `payment_method` STRING,
  `ingested_at` TIMESTAMP NOT NULL
)
PARTITION BY DATE(`transaction_date`)
CLUSTER BY `customer_id`, `transaction_id`;

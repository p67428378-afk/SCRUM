CREATE TABLE IF NOT EXISTS `{project}.{dataset}.retail_orders` (
  `order_id` STRING NOT NULL,
  `customer_id` STRING NOT NULL,
  `order_date` DATE NOT NULL,
  `order_timestamp` TIMESTAMP NOT NULL,
  `original_amount` NUMERIC NOT NULL,
  `original_currency` STRING NOT NULL,
  `exchange_rate_used` NUMERIC NOT NULL,
  `amount_usd` NUMERIC NOT NULL,
  `item_count` INTEGER,
  `status` STRING,
  `ingested_at` TIMESTAMP NOT NULL,
  `source_filename` STRING NOT NULL
)
PARTITION BY DATE(`order_date`)
CLUSTER BY `customer_id`, `original_currency`;

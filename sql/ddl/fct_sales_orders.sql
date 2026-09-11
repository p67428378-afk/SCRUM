CREATE TABLE IF NOT EXISTS `{project}.{dataset}.fct_sales_orders` (
  `order_id` STRING NOT NULL,
  `customer_email` STRING NOT NULL,
  `amount` FLOAT64 NOT NULL,
  `order_date` DATE NOT NULL,
  `created_at` TIMESTAMP NOT NULL
)
PARTITION BY DATE(`order_date`)
CLUSTER BY `customer_email`;

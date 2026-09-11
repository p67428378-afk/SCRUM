"""Unit tests for BigQuery loader module."""
from datetime import date, datetime
from unittest.mock import MagicMock
from server.loader import BigQueryLoader


def test_loader_simulation_mode():
    loader = BigQueryLoader(project_id="test-proj", dataset_id="test_ds", table_id="fct_sales_orders", simulation_mode=True)
    records = [
        {
            "order_id": "ord-1",
            "customer_email": "user@example.com",
            "amount": 99.99,
            "order_date": date(2026, 5, 18),
            "created_at": datetime.utcnow()
        }
    ]
    count = loader.load_records(records)
    assert count == 1


def test_loader_mock_client():
    mock_client = MagicMock()
    mock_client.insert_rows_json.return_value = []  # No errors

    loader = BigQueryLoader(
        project_id="test-proj",
        dataset_id="test_ds",
        table_id="fct_sales_orders",
        client=mock_client
    )

    records = [
        {
            "order_id": "ord-1",
            "customer_email": "user@example.com",
            "amount": 99.99,
            "order_date": date(2026, 5, 18),
            "created_at": datetime.utcnow()
        }
    ]
    count = loader.load_records(records)
    assert count == 1
    assert mock_client.insert_rows_json.called

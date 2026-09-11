from unittest.mock import MagicMock
import pytest
from server.loader import BigQueryLoader


def test_loader_dry_run():
    loader = BigQueryLoader(project_id="test-proj", dataset_id="test_ds", table_name="fct_sales_orders")
    records = [
        {"order_id": "1", "customer_email": "a@b.com", "amount": 100.0, "order_date": "2025-01-01", "created_at": "2025-01-01T00:00:00Z"},
        {"order_id": "2", "customer_email": "c@d.com", "amount": 200.0, "order_date": "2025-01-01", "created_at": "2025-01-01T00:00:00Z"},
    ]
    loaded = loader.load_records(records, dry_run=True)
    assert loaded == 2


def test_loader_empty_records():
    loader = BigQueryLoader(project_id="test-proj", dataset_id="test_ds", table_name="fct_sales_orders")
    loaded = loader.load_records([], dry_run=False)
    assert loaded == 0


def test_loader_with_mocked_client():
    mock_client = MagicMock()
    mock_client.insert_rows_json.return_value = []  # No errors

    loader = BigQueryLoader(
        project_id="test-proj",
        dataset_id="test_ds",
        table_name="fct_sales_orders",
        client=mock_client
    )
    records = [
        {"order_id": "1", "customer_email": "user@example.com", "amount": 99.9, "order_date": "2025-01-01", "created_at": "2025-01-01T00:00:00Z"}
    ]
    loaded = loader.load_records(records, dry_run=False)
    assert loaded == 1
    assert mock_client.insert_rows_json.called


def test_loader_raises_on_insert_errors():
    mock_client = MagicMock()
    mock_client.insert_rows_json.return_value = [{"index": 0, "errors": [{"message": "Schema mismatch"}]}]

    loader = BigQueryLoader(
        project_id="test-proj",
        dataset_id="test_ds",
        table_name="fct_sales_orders",
        client=mock_client
    )
    records = [{"order_id": "1", "customer_email": "user@example.com", "amount": 99.9, "order_date": "2025-01-01", "created_at": "2025-01-01T00:00:00Z"}]
    
    with pytest.raises(RuntimeError) as exc_info:
        loader.load_records(records, dry_run=False)
    assert "BigQuery insert failed" in str(exc_info.value)

"""Unit tests for BigQueryLoader."""
from datetime import date, datetime
from unittest.mock import MagicMock
import pytest

from server.models import FctSalesOrder
from server.loader import BigQueryLoader


def test_load_orders_empty():
    loader = BigQueryLoader()
    count = loader.load_orders([])
    assert count == 0


def test_load_orders_with_mock_client():
    mock_client = MagicMock()
    mock_client.insert_rows_json.return_value = []  # No errors

    loader = BigQueryLoader(
        project_id="test-project",
        dataset_id="test_dataset",
        table_id="test_table",
        client=mock_client,
    )

    orders = [
        FctSalesOrder(
            order_id="ord-01",
            customer_email="test1@example.com",
            amount=45.5,
            order_date=date(2025, 1, 1),
            created_at=datetime(2025, 1, 1, 12, 0, 0),
        ),
        FctSalesOrder(
            order_id="ord-02",
            customer_email="test2@example.com",
            amount=99.0,
            order_date=date(2025, 1, 1),
            created_at=datetime(2025, 1, 1, 13, 0, 0),
        ),
    ]

    loaded_count = loader.load_orders(orders)
    assert loaded_count == 2
    mock_client.insert_rows_json.assert_called_once()
    args, kwargs = mock_client.insert_rows_json.call_args
    assert args[0] == "test-project.test_dataset.test_table"
    assert len(args[1]) == 2
    assert args[1][0]["order_id"] == "ord-01"


def test_load_orders_error_raises():
    mock_client = MagicMock()
    mock_client.insert_rows_json.return_value = [{"index": 0, "errors": ["Insert error"]}]

    loader = BigQueryLoader(client=mock_client)
    orders = [
        FctSalesOrder(
            order_id="ord-01",
            customer_email="test1@example.com",
            amount=45.5,
            order_date=date(2025, 1, 1),
            created_at=datetime(2025, 1, 1, 12, 0, 0),
        )
    ]

    with pytest.raises(RuntimeError) as exc_info:
        loader.load_orders(orders)
    assert "Encountered errors while inserting rows" in str(exc_info.value)

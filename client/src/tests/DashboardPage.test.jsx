import React from "react";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { describe, it, expect, vi } from "vitest";
import DashboardPage from "../pages/DashboardPage";

vi.mock("../services/api", () => ({
  getInventory: vi.fn().mockResolvedValue({
    total: 1,
    items: [
      {
        item_id: "e81d7f42-a123-4bde-8f81-8971f1234567",
        sku: "SKU-9901",
        item_name: "Industrial Widget Alpha",
        warehouse_id: "11111111-2222-3333-4444-555555555555",
        warehouse_name: "Warehouse A (Central)",
        quantity_on_hand: 150,
        reorder_threshold: 10,
        unit_price: 49.99,
        updated_at: "2026-08-04T14:35:10Z",
      },
    ],
  }),
  getItems: vi.fn().mockResolvedValue({
    total: 1,
    items: [
      {
        id: "e81d7f42-a123-4bde-8f81-8971f1234567",
        sku: "SKU-9901",
        name: "Industrial Widget Alpha",
        category_id: "3fa85f64-5717-4562-b3fc-2c963f66afa6",
        unit_price: 49.99,
        reorder_threshold: 10,
        reorder_quantity: 50,
        created_at: "2026-08-04T14:35:10Z",
      },
    ],
  }),
  getAlerts: vi.fn().mockResolvedValue({
    alerts: [
      {
        id: "77777777-8888-9999-0000-111122223333",
        item_id: "e81d7f42-a123-4bde-8f81-8971f1234567",
        sku: "SKU-9901",
        warehouse_id: "11111111-2222-3333-4444-555555555555",
        current_quantity: 8,
        reorder_threshold: 10,
        status: "ACTIVE",
        created_at: "2026-08-04T14:35:10Z",
      },
    ],
  }),
  createStockAdjustment: vi.fn().mockResolvedValue({}),
  createItem: vi.fn().mockResolvedValue({}),
}));

describe("DashboardPage", () => {
  it("renders inventory dashboard heading and key stat cards", async () => {
    render(
      <BrowserRouter>
        <DashboardPage selectedWarehouse="ALL" setAlertsCount={vi.fn()} />
      </BrowserRouter>,
    );

    expect(screen.getByText("Inventory Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Total Items On Hand")).toBeInTheDocument();
    expect(screen.getByText("Active SKUs")).toBeInTheDocument();
    expect(screen.getByText("Low Stock Alerts")).toBeInTheDocument();
  });
});

import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import InventoryPage from "../pages/InventoryPage";

// Mock API module
vi.mock("../services/api", () => ({
  getTeas: vi.fn().mockResolvedValue([
    {
      id: "1",
      name: "Dragonwell Green Tea",
      category: "Green Tea",
      current_stock_grams: 350,
      min_threshold_grams: 500,
      unit_price: 18.5,
      supplier_name: "Hangzhou Teas",
    },
    {
      id: "2",
      name: "Earl Grey",
      category: "Black Tea",
      current_stock_grams: 1500,
      min_threshold_grams: 500,
      unit_price: 12.0,
      supplier_name: "Ceylon Co",
    },
  ]),
  getInventoryAlerts: vi
    .fn()
    .mockResolvedValue([
      {
        id: "1",
        name: "Dragonwell Green Tea",
        current_stock_grams: 350,
        min_threshold_grams: 500,
      },
    ]),
  createTea: vi.fn().mockResolvedValue({ id: "3", name: "New Tea" }),
  adjustInventory: vi.fn().mockResolvedValue({ status: "success" }),
}));

describe("InventoryPage", () => {
  it("renders page header and action buttons", async () => {
    render(<InventoryPage />);
    expect(
      screen.getByText(/Tea Inventory & Stock Management/i),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Add Tea \/ Adjust Stock/i }),
    ).toBeInTheDocument();
  });

  it("renders metric cards", () => {
    render(<InventoryPage />);
    expect(screen.getByText(/Total Varieties/i)).toBeInTheDocument();
    expect(screen.getByText(/Total Stock Volume/i)).toBeInTheDocument();
    expect(screen.getByText(/Reorder Alerts/i)).toBeInTheDocument();
  });
});

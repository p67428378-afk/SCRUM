import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import App from "./App";

// Mock API calls to prevent network errors in vitest
vi.mock("./services/api", () => ({
  getAnalyticsSummary: vi.fn().mockResolvedValue({
    daily_revenue: 150.0,
    total_revenue: 1200.0,
    instant_orders_count: 10,
    active_pre_orders_count: 2,
    completed_orders_count: 12,
    cancelled_orders_count: 0,
    low_stock_ingredients_count: 1,
    top_selling_items: [
      {
        product_id: "p1",
        product_name: "Croissant",
        total_quantity_sold: 25,
        total_revenue: 100.0,
      },
    ],
  }),
  listProducts: vi.fn().mockResolvedValue([]),
  listIngredients: vi.fn().mockResolvedValue([]),
  listOrders: vi.fn().mockResolvedValue([]),
  loginUser: vi.fn(),
  registerUser: vi.fn(),
  getCurrentUser: vi.fn(),
}));

describe("Artisan Bakery POS App", () => {
  it("renders application brand title without crashing", async () => {
    render(<App />);
    const titleElements = screen.getAllByText(/Artisan Bakery POS/i);
    expect(titleElements.length).toBeGreaterThan(0);
  });

  it("renders navigation links", () => {
    render(<App />);
    expect(screen.getByText(/Dashboard/i)).toBeInTheDocument();
    expect(screen.getByText(/Products & Recipes/i)).toBeInTheDocument();
    expect(screen.getByText(/Ingredient Inventory/i)).toBeInTheDocument();
    expect(screen.getByText(/POS & Orders/i)).toBeInTheDocument();
  });
});

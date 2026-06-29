import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import App from "./App.jsx";
import * as api from "./services/api.js";

// Mock the API module
vi.mock("./services/api.js", () => {
  return {
    getKpis: vi.fn(),
    getSkus: vi.fn(),
    getScenario: vi.fn(),
    submitAssortmentReview: vi.fn(),
  };
});

describe("DG Cluster Assortment Advisor App", () => {
  const mockKpis = {
    sales_per_linear_ft: {
      label: "Sales per Linear Ft",
      value: 145.5,
      trend: "up",
    },
    private_brand_pct: { label: "Private Brand %", value: 28.4, trend: "up" },
    in_stock_rate: { label: "In-Stock Rate", value: 96.2, trend: "down" },
    shelf_capacity: { label: "Shelf Capacity", value: 88.0, trend: "stable" },
  };

  const mockSkus = [
    {
      id: "sku-1",
      name: "Clover Valley Potato Chips Classic 10oz",
      private_brand: true,
      sales_performance: 12500.5,
      shelf_space: 2.5,
      status: "GROW",
    },
    {
      id: "sku-2",
      name: "Lay's Classic Potato Chips 13oz",
      private_brand: false,
      sales_performance: 9800.0,
      shelf_space: 3.0,
      status: "MAINTAIN",
    },
  ];

  const mockScenario = {
    name: "balanced",
    projected_sales_impact: 4.2,
    projected_private_brand_impact: 1.5,
    sku_action_summary: { grow: 5, maintain: 15, reduce: 2, swap: 3 },
    guardrails: {
      private_brand_goal_met: true,
      shelf_space_limit_ok: true,
    },
    skus_to_action: [
      {
        id: "sku-1",
        name: "Clover Valley Potato Chips Classic 10oz",
        action: "GROW",
      },
    ],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    api.getKpis.mockResolvedValue(mockKpis);
    api.getSkus.mockResolvedValue(mockSkus);
    api.getScenario.mockResolvedValue(mockScenario);
  });

  it("renders the dashboard with KPIs and SKU table", async () => {
    render(<App />);

    // Verify header is present
    expect(
      screen.getByText("DG Cluster Assortment Advisor"),
    ).toBeInTheDocument();

    // Wait for KPIs to load and render
    await waitFor(() => {
      expect(screen.getByText("Sales per Linear Ft")).toBeInTheDocument();
    });
    expect(screen.getByText("$145.50")).toBeInTheDocument();
    expect(screen.getByText("28.4%")).toBeInTheDocument();

    // Wait for SKUs to load and render
    await waitFor(() => {
      expect(
        screen.getByText("Clover Valley Potato Chips Classic 10oz"),
      ).toBeInTheDocument();
    });
    expect(
      screen.getByText("Lay's Classic Potato Chips 13oz"),
    ).toBeInTheDocument();
  });

  it("updates scenario when a different scenario is selected", async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText("Scenario Selection")).toBeInTheDocument();
    });

    // Click on Conservative scenario
    const conservativeCard = screen.getByText("Conservative");
    fireEvent.click(conservativeCard);

    await waitFor(() => {
      expect(api.getScenario).toHaveBeenCalledWith("conservative");
    });
  });

  it("submits assortment review and shows success banner", async () => {
    const mockSubmitResult = {
      audit_id: "DG-REV-2026-0109-B2",
      created_at: "2026-01-09T11:50:00Z",
      id: "review-id-123",
      scenario_name: "balanced",
      status: "SUCCESS",
    };
    api.submitAssortmentReview.mockResolvedValue(mockSubmitResult);

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText("Submit Assortment Review")).toBeInTheDocument();
    });

    const submitButton = screen.getByText("Submit Assortment Review");
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(api.submitAssortmentReview).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(
        screen.getByText("Assortment changes submitted successfully!"),
      ).toBeInTheDocument();
    });
  });
});

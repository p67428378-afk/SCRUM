import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import React from "react";
import DashboardPage from "./DashboardPage";
import * as api from "../services/api";

// Mock the API service
vi.mock("../services/api", () => ({
  getKPIs: vi.fn(),
  getSKUs: vi.fn(),
  selectScenario: vi.fn(),
  submitReview: vi.fn(),
}));

describe("DashboardPage Smoke and Interaction Tests", () => {
  const mockKPIs = {
    sales_per_linear_ft: 15.75,
    private_brand_pct: 24.5,
    in_stock_rate: 98.2,
    shelf_capacity: 88.0,
    sales_trend_pct: 4.2,
    private_brand_status: "Warning",
    in_stock_status: "Healthy",
  };

  const mockSKUs = [
    {
      sku: "SKU-8821",
      name: "Clover Valley Potato Chips 10oz",
      sales: 42500,
      units: 17000,
      profit: 14875,
      status: "GROW",
    },
    {
      sku: "SKU-4412",
      name: "Lay's Classic Potato Chips 13oz",
      sales: 38200,
      units: 11200,
      profit: 9550,
      status: "MAINTAIN",
    },
  ];

  const mockScenarioBalanced = {
    scenario: "Balanced",
    projected_sales: 4.8,
    projected_private_brand_pct: 25.2,
    actions: {
      grow: 40,
      maintain: 30,
      swap: 15,
      reduce: 15,
    },
    guardrails: {
      pb_penetration: "MET",
      shelf_capacity: "OK",
    },
  };

  const mockScenarioConservative = {
    scenario: "Conservative",
    projected_sales: 1.2,
    projected_private_brand_pct: 22.0,
    actions: {
      grow: 20,
      maintain: 60,
      swap: 10,
      reduce: 10,
    },
    guardrails: {
      pb_penetration: "MET",
      shelf_capacity: "OK",
    },
  };

  const mockReviewResponse = {
    success: true,
    approved_scenario: "Balanced",
    audit_trail:
      "Scenario 'Balanced' approved at 2026-07-07T12:00:00Z with projected sales impact of +4.8% and private brand mix of 25.2%.",
    timestamp: "2026-07-07T12:00:00Z",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    api.getKPIs.mockResolvedValue(mockKPIs);
    api.getSKUs.mockResolvedValue(mockSKUs);
    api.selectScenario.mockResolvedValue(mockScenarioBalanced);
    api.submitReview.mockResolvedValue(mockReviewResponse);
  });

  it("renders loading state initially and then loads dashboard data", async () => {
    render(<DashboardPage />);
    expect(screen.getByText(/Loading Assortment Advisor/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(
        screen.getByText("DG Cluster Assortment Advisor"),
      ).toBeInTheDocument();
    });

    // Verify KPIs are rendered
    expect(screen.getByText("$15.75")).toBeInTheDocument();
    expect(screen.getByText("24.5%")).toBeInTheDocument();
    expect(screen.getByText("98.2%")).toBeInTheDocument();

    // Verify SKUs are rendered
    expect(screen.getByText("SKU-8821")).toBeInTheDocument();
    expect(
      screen.getByText("Clover Valley Potato Chips 10oz"),
    ).toBeInTheDocument();
  });

  it("allows selecting a different scenario and updates the review panel", async () => {
    api.selectScenario.mockImplementation((name) => {
      if (name === "Conservative")
        return Promise.resolve(mockScenarioConservative);
      return Promise.resolve(mockScenarioBalanced);
    });

    render(<DashboardPage />);
    await waitFor(() => {
      expect(
        screen.getByText("DG Cluster Assortment Advisor"),
      ).toBeInTheDocument();
    });

    // Click Conservative scenario card
    const conservativeCard = screen.getByText("Conservative");
    fireEvent.click(conservativeCard);

    await waitFor(() => {
      expect(api.selectScenario).toHaveBeenCalledWith("Conservative");
    });
  });

  it("submits the scenario and displays the confirmation modal", async () => {
    render(<DashboardPage />);
    await waitFor(() => {
      expect(
        screen.getByText("DG Cluster Assortment Advisor"),
      ).toBeInTheDocument();
    });

    // Click Submit Scenario button
    const submitButtons = screen.getAllByText("Submit Scenario");
    fireEvent.click(submitButtons[0]);

    await waitFor(() => {
      expect(api.submitReview).toHaveBeenCalledWith("Balanced");
      expect(
        screen.getByText("Scenario Submitted Successfully"),
      ).toBeInTheDocument();
      expect(
        screen.getByText(/Scenario 'Balanced' approved/i),
      ).toBeInTheDocument();
    });
  });
});

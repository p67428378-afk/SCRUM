import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import HeaderBar from "./HeaderBar.jsx";
import KPIHeaderStrip from "./KPIHeaderStrip.jsx";
import ScenarioSelector from "./ScenarioSelector.jsx";
import SKUPerformanceTable from "./SKUPerformanceTable.jsx";
import ApprovalReviewPanel from "./ApprovalReviewPanel.jsx";
import InlineConfirmationModal from "./InlineConfirmationModal.jsx";
import App from "../App.jsx";

describe("HeaderBar Component", () => {
  it("renders DG branding, cluster name, and audit trail button", () => {
    render(
      <HeaderBar
        clusterName="Small Town Value Cluster"
        onOpenAuditTrail={() => {}}
        backendConnected={true}
      />,
    );

    expect(screen.getByText("DOLLAR GENERAL")).toBeInTheDocument();
    expect(
      screen.getByText("DG Cluster Assortment Advisor"),
    ).toBeInTheDocument();
    expect(screen.getByText("Small Town Value Cluster")).toBeInTheDocument();
    expect(screen.getByText("Audit Trail")).toBeInTheDocument();
    expect(screen.getByText("API Connected")).toBeInTheDocument();
  });
});

describe("KPIHeaderStrip Component", () => {
  it("renders all 4 assortment health KPI cards correctly", () => {
    const mockKpis = {
      sales_per_linear_ft: 1250,
      private_brand_pct: 28.0,
      in_stock_rate: 96.5,
      shelf_capacity_pct: 92.0,
    };

    render(<KPIHeaderStrip kpis={mockKpis} loading={false} error={null} />);

    expect(screen.getByText(/Sales \/ Linear Ft/i)).toBeInTheDocument();
    expect(screen.getByText(/\$1,250/i)).toBeInTheDocument();

    expect(screen.getByText(/Private Brand %/i)).toBeInTheDocument();
    expect(screen.getByText(/28.0%/i)).toBeInTheDocument();

    expect(screen.getByText(/In-Stock Rate/i)).toBeInTheDocument();
    expect(screen.getByText(/96.5%/i)).toBeInTheDocument();

    expect(screen.getByText(/Shelf Capacity/i)).toBeInTheDocument();
    expect(screen.getByText(/92.0%/i)).toBeInTheDocument();
  });

  it("renders loading skeleton when loading is true", () => {
    const { container } = render(<KPIHeaderStrip loading={true} />);
    expect(
      container.getElementsByClassName("animate-pulse").length,
    ).toBeGreaterThan(0);
  });
});

describe("ScenarioSelector Component", () => {
  it("renders Conservative, Balanced, and Aggressive scenario cards", () => {
    const onSelectScenario = vi.fn();

    render(
      <ScenarioSelector
        selectedScenario="Balanced"
        onSelectScenario={onSelectScenario}
        loading={false}
      />,
    );

    expect(screen.getByText(/Conservative Scenario/i)).toBeInTheDocument();
    expect(screen.getByText(/Balanced Scenario/i)).toBeInTheDocument();
    expect(screen.getByText(/Aggressive Growth/i)).toBeInTheDocument();

    // Click Aggressive
    const aggressiveCard = screen
      .getByText(/Aggressive Growth/i)
      .closest('div[role="button"]');
    if (aggressiveCard) {
      fireEvent.click(aggressiveCard);
      expect(onSelectScenario).toHaveBeenCalledWith("Aggressive");
    }
  });
});

describe("SKUPerformanceTable Component", () => {
  const mockSkus = [
    {
      id: "1",
      sku_code: "SNK-101",
      product_name: "Clover Valley Kettle Chips 8oz",
      sub_category: "Salty Snacks",
      brand_type: "Private Brand",
      sales_per_linear_ft: 1420,
      margin_pct: 42.5,
      units_sold: 5200,
      action_badge: "GROW",
      in_stock_rate: 98.2,
    },
    {
      id: "2",
      sku_code: "SNK-102",
      product_name: "Brand Name Tortilla Chips 10oz",
      sub_category: "Salty Snacks",
      brand_type: "National Brand",
      sales_per_linear_ft: 890,
      margin_pct: 22.0,
      units_sold: 1400,
      action_badge: "SWAP",
      in_stock_rate: 94.0,
    },
  ];

  it("renders SKU rows with color-coded status badges and summary counts", () => {
    render(
      <SKUPerformanceTable
        skus={mockSkus}
        counts={{
          grow_count: 1,
          maintain_count: 0,
          swap_count: 1,
          reduce_count: 0,
          total: 2,
        }}
        loading={false}
        error={null}
      />,
    );

    expect(screen.getByText("SNK-101")).toBeInTheDocument();
    expect(
      screen.getByText("Clover Valley Kettle Chips 8oz"),
    ).toBeInTheDocument();
    expect(screen.getByText("SNK-102")).toBeInTheDocument();

    expect(screen.getAllByText("GROW").length).toBeGreaterThan(0);
    expect(screen.getAllByText("SWAP").length).toBeGreaterThan(0);
  });

  it("filters SKUs when search input is typed", () => {
    render(
      <SKUPerformanceTable
        skus={mockSkus}
        counts={{
          grow_count: 1,
          maintain_count: 0,
          swap_count: 1,
          reduce_count: 0,
          total: 2,
        }}
        loading={false}
      />,
    );

    const searchInput = screen.getByPlaceholderText(
      /Search product or SKU code/i,
    );
    fireEvent.change(searchInput, { target: { value: "Kettle Chips" } });

    expect(
      screen.getByText("Clover Valley Kettle Chips 8oz"),
    ).toBeInTheDocument();
    expect(
      screen.queryByText("Brand Name Tortilla Chips 10oz"),
    ).not.toBeInTheDocument();
  });
});

describe("ApprovalReviewPanel Component", () => {
  it("renders selected scenario summary, guardrails, and triggers submit", () => {
    const onSubmit = vi.fn();

    render(
      <ApprovalReviewPanel
        selectedScenario="Balanced"
        clusterName="Small Town Value Cluster"
        onSubmit={onSubmit}
        submitting={false}
      />,
    );

    const planElements = screen.getAllByText(/Balanced Plan/i);
    expect(planElements.length).toBeGreaterThan(0);
    expect(screen.getByText(/ALL PASSED/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Submit Balanced Plan/i }),
    ).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole("button", { name: /Submit Balanced Plan/i }),
    );
    expect(onSubmit).toHaveBeenCalled();
  });
});

describe("InlineConfirmationModal Component", () => {
  it("renders audit-trail confirmation details upon submission", () => {
    const mockAudit = {
      audit_id: "AUD-2026-9981",
      timestamp: "2026-09-10T14:30:00Z",
      user_id: "user@dollargeneral.com",
      cluster_name: "Small Town Value Cluster",
      scenario: "Balanced",
      total_modified_skus: 18,
      guardrail_status: "ALL_PASSED",
      status: "APPROVED",
      message: "Assortment plan submitted successfully.",
    };

    const onClose = vi.fn();

    render(
      <InlineConfirmationModal
        auditData={mockAudit}
        onClose={onClose}
        onViewAuditTrail={() => {}}
      />,
    );

    expect(screen.getByText("AUD-2026-9981")).toBeInTheDocument();
    expect(screen.getByText("Assortment Plan Submitted")).toBeInTheDocument();
    expect(screen.getByText(/18 SKUs/i)).toBeInTheDocument();
    expect(screen.getByText("ALL_PASSED")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Acknowledge & Close"));
    expect(onClose).toHaveBeenCalled();
  });
});

describe("App Top-Level Integration", () => {
  it("renders the top-level application root without crashing", () => {
    render(<App />);
    const dgBrandings = screen.getAllByText(/DOLLAR GENERAL/i);
    expect(dgBrandings.length).toBeGreaterThan(0);
    const advisorTitles = screen.getAllByText(/DG Cluster Assortment Advisor/i);
    expect(advisorTitles.length).toBeGreaterThan(0);
  });
});

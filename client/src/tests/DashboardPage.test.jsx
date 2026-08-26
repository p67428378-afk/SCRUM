import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { BrowserRouter } from "react-router-dom";
import DashboardPage from "../pages/DashboardPage";
import MetricGroup from "../components/dashboard/MetricGroup";
import SpendingBreakdownCard from "../components/dashboard/SpendingBreakdownCard";
import * as api from "../services/api";

vi.mock("../services/api", () => ({
  getSummary: vi.fn(),
  getExpenses: vi.fn(),
  getCategories: vi.fn(),
  createExpense: vi.fn(),
  formatApiError: vi.fn((err) => err?.message || "Error occurred"),
}));

describe("Dashboard Component & Pages", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders MetricGroup correctly with summary figures", () => {
    const mockSummary = {
      total_income: 5000,
      total_expense: 2100,
      net_balance: 2900,
      category_breakdown: [],
    };

    render(<MetricGroup summary={mockSummary} loading={false} />);

    expect(screen.getByText("Net Balance")).toBeInTheDocument();
    expect(screen.getByText("$2,900.00")).toBeInTheDocument();
    expect(screen.getByText("Total Income")).toBeInTheDocument();
    expect(screen.getByText("$5,000.00")).toBeInTheDocument();
    expect(screen.getByText("Total Expenses")).toBeInTheDocument();
    expect(screen.getByText("$2,100.00")).toBeInTheDocument();
    expect(screen.getByText("Savings Rate")).toBeInTheDocument();
    expect(screen.getByText("58.0%")).toBeInTheDocument();
  });

  it("renders SpendingBreakdownCard with category breakdown items", () => {
    const mockBreakdown = [
      { category_id: "1", category_name: "Food", amount: 500, percentage: 50 },
      {
        category_id: "2",
        category_name: "Transport",
        amount: 300,
        percentage: 30,
      },
    ];

    render(
      <SpendingBreakdownCard
        breakdown={mockBreakdown}
        totalExpense={800}
        loading={false}
      />,
    );

    expect(screen.getByText("Spending Breakdown")).toBeInTheDocument();
    expect(screen.getByText("Food")).toBeInTheDocument();
    expect(screen.getByText("Transport")).toBeInTheDocument();
    expect(screen.getByText("$500.00")).toBeInTheDocument();
    expect(screen.getByText("$300.00")).toBeInTheDocument();
  });

  it("renders DashboardPage and displays fetched data", async () => {
    api.getSummary.mockResolvedValueOnce({
      total_income: 4000,
      total_expense: 1500,
      net_balance: 2500,
      category_breakdown: [
        {
          category_id: "cat-1",
          category_name: "Rent",
          amount: 1000,
          percentage: 66.7,
        },
      ],
    });

    api.getExpenses.mockResolvedValueOnce([
      {
        id: "tx-1",
        amount: 1000,
        type: "expense",
        date: "2026-05-18",
        description: "May Apartment Rent",
        category_id: "cat-1",
        payment_method: "Bank Transfer",
      },
    ]);

    api.getCategories.mockResolvedValueOnce([
      { id: "cat-1", name: "Rent", type: "expense", is_predefined: true },
    ]);

    render(
      <BrowserRouter>
        <DashboardPage />
      </BrowserRouter>,
    );

    expect(screen.getByText("Financial Dashboard")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("$2,500.00")).toBeInTheDocument();
      expect(screen.getByText("$4,000.00")).toBeInTheDocument();
      expect(screen.getByText("$1,500.00")).toBeInTheDocument();
      expect(screen.getByText("May Apartment Rent")).toBeInTheDocument();
    });
  });
});

import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import React from "react";
import AnalyticsDashboard from "./AnalyticsDashboard";
import * as api from "../../services/api";

vi.mock("../../services/api");

describe("AnalyticsDashboard Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders metrics cards when analytics data is loaded successfully", async () => {
    api.getAdminAnalytics.mockResolvedValue({
      most_popular_genres: [{ genre: "Technology", checkout_count: 15 }],
      turn_around_rates: {
        average_turnaround_days: 3.5,
        total_returned_loans: 20,
      },
      active_members_count: 12,
      total_fines_collected: 25.5,
    });
    api.getBooks.mockResolvedValue([]);

    render(<AnalyticsDashboard />);

    await waitFor(() => {
      expect(
        screen.getByText("Admin Purchasing & Inventory Analytics"),
      ).toBeInTheDocument();
    });

    expect(screen.getByText("Technology")).toBeInTheDocument();
    expect(screen.getByText("3.5 Days")).toBeInTheDocument();
    expect(screen.getByText("12")).toBeInTheDocument();
    expect(screen.getByText("$25.50")).toBeInTheDocument();
  });

  it("renders error view and allows retry when API call fails", async () => {
    api.getAdminAnalytics.mockRejectedValue(new Error("Network Error"));
    api.getBooks.mockResolvedValue([]);

    render(<AnalyticsDashboard />);

    await waitFor(() => {
      expect(
        screen.getByText("Analytics Data Unavailable"),
      ).toBeInTheDocument();
    });

    const retryBtn = screen.getByRole("button", {
      name: /retry loading analytics/i,
    });
    expect(retryBtn).toBeInTheDocument();

    api.getAdminAnalytics.mockResolvedValue({
      most_popular_genres: [],
      turn_around_rates: {
        average_turnaround_days: 0,
        total_returned_loans: 0,
      },
      active_members_count: 0,
      total_fines_collected: 0,
    });

    fireEvent.click(retryBtn);

    await waitFor(() => {
      expect(
        screen.getByText("Admin Purchasing & Inventory Analytics"),
      ).toBeInTheDocument();
    });
  });
});

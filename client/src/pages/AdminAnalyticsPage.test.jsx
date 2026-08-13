import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import React from "react";
import { MemoryRouter } from "react-router-dom";
import AdminAnalyticsPage from "./AdminAnalyticsPage";
import * as api from "../services/api";

vi.mock("../services/api");

describe("AdminAnalyticsPage Component", () => {
  it("renders admin navigation tabs and analytics dashboard", async () => {
    api.getAdminAnalytics.mockResolvedValue({
      most_popular_genres: [],
      turn_around_rates: {
        average_turnaround_days: 0,
        total_returned_loans: 0,
      },
      active_members_count: 5,
      total_fines_collected: 0,
    });
    api.getBooks.mockResolvedValue([]);

    render(
      <MemoryRouter initialEntries={["/admin/analytics"]}>
        <AdminAnalyticsPage />
      </MemoryRouter>,
    );

    expect(screen.getByText("Inventory Management")).toBeInTheDocument();
    expect(screen.getByText("Purchasing & Analytics")).toBeInTheDocument();

    await waitFor(() => {
      expect(
        screen.getByText("Admin Purchasing & Inventory Analytics"),
      ).toBeInTheDocument();
    });
  });
});

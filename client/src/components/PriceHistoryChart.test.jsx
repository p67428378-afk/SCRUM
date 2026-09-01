import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import React from "react";
import PriceHistoryChart from "./PriceHistoryChart";

describe("PriceHistoryChart Component", () => {
  it("renders empty state when no history entries are present", () => {
    render(<PriceHistoryChart initialHistory={[]} />);
    expect(screen.getByText(/No price history available/i)).toBeInTheDocument();
  });

  it("renders single history entry banner and event badge", () => {
    const history = [
      {
        id: "1",
        property_id: "prop-1",
        price: 450000,
        change_event: "listed",
        recorded_at: "2026-01-01T00:00:00Z",
      },
    ];
    render(<PriceHistoryChart initialHistory={history} />);
    expect(
      screen.getByText(/No price modifications recorded since listing/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/\$450,000/i)).toBeInTheDocument();
  });
});

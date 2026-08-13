import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import React from "react";
import PurchasingRecommendationTable from "./PurchasingRecommendationTable";

describe("PurchasingRecommendationTable Component", () => {
  it("renders recommendation table headers and genre items", () => {
    const genres = [
      { genre: "Fiction", checkout_count: 8 },
      { genre: "History", checkout_count: 3 },
    ];
    const books = [
      { id: "1", genre: "Fiction", total_copies: 5, available_copies: 1 },
      { id: "2", genre: "History", total_copies: 4, available_copies: 3 },
    ];

    render(
      <PurchasingRecommendationTable
        genres={genres}
        books={books}
        avgTurnaround={4.2}
      />,
    );

    expect(
      screen.getByText("Purchasing & Inventory Recommendations"),
    ).toBeInTheDocument();
    expect(screen.getByText("Fiction")).toBeInTheDocument();
    expect(screen.getByText("History")).toBeInTheDocument();
    expect(screen.getByText("8 loans")).toBeInTheDocument();
    expect(
      screen.getByText("Avg Loan Turnaround: 4.2 days"),
    ).toBeInTheDocument();
  });

  it("renders empty message when no genres provided", () => {
    render(<PurchasingRecommendationTable genres={[]} books={[]} />);
    expect(
      screen.getByText("No purchasing recommendation data available."),
    ).toBeInTheDocument();
  });
});

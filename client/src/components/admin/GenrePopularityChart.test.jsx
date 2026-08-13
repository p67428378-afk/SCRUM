import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import React from "react";
import GenrePopularityChart from "./GenrePopularityChart";

describe("GenrePopularityChart Component", () => {
  it("renders chart title and total checkout count", () => {
    const mockData = [
      { genre: "Fiction", checkout_count: 10 },
      { genre: "Science", checkout_count: 5 },
    ];
    render(<GenrePopularityChart data={mockData} />);
    expect(screen.getByText("Most Popular Genres")).toBeInTheDocument();
    expect(screen.getByText("Total Checkouts: 15")).toBeInTheDocument();
  });

  it("renders empty state when data is empty", () => {
    render(<GenrePopularityChart data={[]} />);
    expect(screen.getByText("No checkout data available")).toBeInTheDocument();
  });
});

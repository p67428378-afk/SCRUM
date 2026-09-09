import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { SearchFilterBar } from "./SearchFilterBar";

describe("SearchFilterBar Component", () => {
  it("renders inputs and dropdown filters", () => {
    const handleReset = vi.fn();
    const handleSetSearch = vi.fn();

    render(
      <SearchFilterBar
        searchQuery=""
        setSearchQuery={handleSetSearch}
        genreFilter=""
        setGenreFilter={vi.fn()}
        statusFilter=""
        setStatusFilter={vi.fn()}
        isbnFilter=""
        setIsbnFilter={vi.fn()}
        genres={["Fiction", "Computer Science"]}
        onReset={handleReset}
        totalResults={10}
      />,
    );

    expect(
      screen.getByPlaceholderText(
        /Search book catalog by title, author, keyword, or ISBN/i,
      ),
    ).toBeInTheDocument();
    expect(screen.getByText("All Genres")).toBeInTheDocument();
    expect(screen.getByText("Fiction")).toBeInTheDocument();
    expect(screen.getByText("Computer Science")).toBeInTheDocument();
    expect(screen.getByText(/books in library catalog/i)).toBeInTheDocument();
  });

  it("triggers onReset when Reset button is clicked", () => {
    const handleReset = vi.fn();

    render(
      <SearchFilterBar
        searchQuery="test"
        setSearchQuery={vi.fn()}
        genreFilter=""
        setGenreFilter={vi.fn()}
        statusFilter=""
        setStatusFilter={vi.fn()}
        isbnFilter=""
        setIsbnFilter={vi.fn()}
        genres={[]}
        onReset={handleReset}
        totalResults={5}
      />,
    );

    const resetBtn = screen.getByRole("button", { name: /Reset/i });
    fireEvent.click(resetBtn);
    expect(handleReset).toHaveBeenCalledTimes(1);
  });
});

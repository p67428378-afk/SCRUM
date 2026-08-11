import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import HeaderSearch from "../common/HeaderSearch";
import * as api from "../../services/api";

vi.mock("../../services/api", () => ({
  searchProducts: vi.fn(),
  getCategories: vi.fn().mockResolvedValue([]),
  getProducts: vi.fn().mockResolvedValue([]),
}));

describe("HeaderSearch Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it("renders search input with placeholder text", () => {
    render(<HeaderSearch />);
    const input = screen.getByPlaceholderText(
      "Search products, brands, or categories...",
    );
    expect(input).toBeInTheDocument();
  });

  it("opens dropdown and displays recent searches when focused", () => {
    render(<HeaderSearch />);
    const input = screen.getByPlaceholderText(
      "Search products, brands, or categories...",
    );
    fireEvent.focus(input);

    const dropdown = screen.getByTestId("search-dropdown");
    expect(dropdown).toBeInTheDocument();
  });

  it("displays dark overlay on focus", () => {
    render(<HeaderSearch />);
    const input = screen.getByPlaceholderText(
      "Search products, brands, or categories...",
    );
    fireEvent.focus(input);

    const overlay = screen.getByTestId("search-dark-overlay");
    expect(overlay).toBeInTheDocument();
  });

  it("allows typing query into search input", () => {
    render(<HeaderSearch />);
    const input = screen.getByPlaceholderText(
      "Search products, brands, or categories...",
    );
    fireEvent.change(input, { target: { value: "running shoes" } });
    expect(input.value).toBe("running shoes");
  });

  it("clears query when clear button is clicked", () => {
    render(<HeaderSearch />);
    const input = screen.getByPlaceholderText(
      "Search products, brands, or categories...",
    );
    fireEvent.change(input, { target: { value: "hoodie" } });
    fireEvent.focus(input);

    const clearButton = screen.getByTitle("Clear search");
    fireEvent.click(clearButton);

    expect(input.value).toBe("");
  });

  it("calls search API after debounced input >= 3 chars", async () => {
    api.searchProducts.mockResolvedValueOnce({
      query: "running",
      total: 1,
      page: 1,
      limit: 10,
      took_ms: 25,
      categories: [{ id: "cat-1", name: "Footwear", count: 1 }],
      suggestions: [
        {
          id: "p-1",
          title: "Running Shoes",
          category_name: "Footwear",
          price: 99.99,
          tags: ["running"],
        },
      ],
    });

    render(<HeaderSearch />);
    const input = screen.getByPlaceholderText(
      "Search products, brands, or categories...",
    );
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "running" } });

    await waitFor(
      () => {
        expect(api.searchProducts).toHaveBeenCalledWith(
          expect.objectContaining({ q: "running", limit: 10, page: 1 }),
        );
      },
      { timeout: 1000 },
    );
  });

  it("closes dropdown when Esc key is pressed", () => {
    render(<HeaderSearch />);
    const input = screen.getByPlaceholderText(
      "Search products, brands, or categories...",
    );
    fireEvent.focus(input);

    expect(screen.getByTestId("search-dropdown")).toBeInTheDocument();

    fireEvent.keyDown(input, { key: "Escape", code: "Escape" });

    expect(screen.queryByTestId("search-dropdown")).not.toBeInTheDocument();
  });
});

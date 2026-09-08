import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import BookDetails from "./BookDetails";

describe("BookDetails Component", () => {
  const mockBook = {
    id: "book-789",
    title: "The Pragmatic Programmer",
    author: "David Thomas, Andrew Hunt",
    isbn: "978-0135957059",
    price: 34.5,
    stock_quantity: 5,
    rating: 4.9,
    summary: "A comprehensive guide to software craft.",
    cover_image: "https://example.com/pragmatic.jpg",
    category: {
      id: "cat-tech",
      name: "Technology",
    },
  };

  it("renders detailed book attributes", () => {
    render(
      <BrowserRouter>
        <BookDetails book={mockBook} onAddToCart={vi.fn()} />
      </BrowserRouter>,
    );

    expect(screen.getByText("The Pragmatic Programmer")).toBeInTheDocument();
    expect(screen.getByText("David Thomas, Andrew Hunt")).toBeInTheDocument();
    expect(screen.getByText("$34.50")).toBeInTheDocument();
    expect(screen.getByText("978-0135957059")).toBeInTheDocument();
    expect(screen.getByText(/Low Stock \(5 remaining\)/i)).toBeInTheDocument();
  });

  it("allows quantity increment and invokes onAddToCart with selected quantity", () => {
    const handleAddToCart = vi.fn();
    render(
      <BrowserRouter>
        <BookDetails book={mockBook} onAddToCart={handleAddToCart} />
      </BrowserRouter>,
    );

    const plusBtn = screen.getByRole("button", { name: /increase quantity/i });
    fireEvent.click(plusBtn);

    const addToCartBtn = screen.getByRole("button", { name: /add to cart/i });
    fireEvent.click(addToCartBtn);

    expect(handleAddToCart).toHaveBeenCalledWith(mockBook, 2);
  });
});

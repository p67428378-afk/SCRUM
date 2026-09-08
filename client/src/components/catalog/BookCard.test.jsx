import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import BookCard from "./BookCard";

describe("BookCard Component", () => {
  const mockBook = {
    id: "book-123",
    title: "Clean Code",
    author: "Robert C. Martin",
    price: 29.99,
    stock_quantity: 10,
    rating: 4.8,
    cover_image: "https://example.com/clean-code.jpg",
    category: {
      id: "cat-1",
      name: "Technology",
    },
  };

  it("renders book information correctly", () => {
    const handleAddToCart = vi.fn();
    render(
      <BrowserRouter>
        <BookCard book={mockBook} onAddToCart={handleAddToCart} />
      </BrowserRouter>,
    );

    expect(screen.getByText("Clean Code")).toBeInTheDocument();
    expect(screen.getByText("Robert C. Martin")).toBeInTheDocument();
    expect(screen.getByText("$29.99")).toBeInTheDocument();
    expect(screen.getByText("In Stock")).toBeInTheDocument();
  });

  it("triggers onAddToCart when Add to Cart button is clicked", () => {
    const handleAddToCart = vi.fn();
    render(
      <BrowserRouter>
        <BookCard book={mockBook} onAddToCart={handleAddToCart} />
      </BrowserRouter>,
    );

    const button = screen.getByRole("button", {
      name: /add clean code to cart/i,
    });
    fireEvent.click(button);
    expect(handleAddToCart).toHaveBeenCalledWith(mockBook);
  });

  it("disables add to cart button when book is out of stock", () => {
    const outOfStockBook = { ...mockBook, stock_quantity: 0 };
    render(
      <BrowserRouter>
        <BookCard book={outOfStockBook} onAddToCart={vi.fn()} />
      </BrowserRouter>,
    );

    expect(screen.getByText("Out of Stock")).toBeInTheDocument();
    const button = screen.getByRole("button", {
      name: /add clean code to cart/i,
    });
    expect(button).toBeDisabled();
  });
});

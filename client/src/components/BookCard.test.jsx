import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { BookCard } from "./BookCard";
import { AuthProvider } from "../context/AuthContext";

const mockBook = {
  id: "b123",
  title: "Clean Architecture",
  author: "Robert C. Martin",
  isbn: "9780134494166",
  genre: "Software Engineering",
  total_copies: 5,
  available_copies: 3,
};

describe("BookCard Component", () => {
  it("renders book information properly", () => {
    render(
      <AuthProvider>
        <BookCard book={mockBook} />
      </AuthProvider>,
    );

    expect(screen.getByText("Clean Architecture")).toBeInTheDocument();
    expect(screen.getByText("Robert C. Martin")).toBeInTheDocument();
    expect(screen.getByText("9780134494166")).toBeInTheDocument();
    expect(screen.getByText("Software Engineering")).toBeInTheDocument();
    expect(screen.getByText(/3 Available/i)).toBeInTheDocument();
    expect(screen.getByText(/Borrow Book/i)).toBeInTheDocument();
  });

  it("displays unavailable when stock is 0", () => {
    const zeroStockBook = { ...mockBook, available_copies: 0 };
    render(
      <AuthProvider>
        <BookCard book={zeroStockBook} />
      </AuthProvider>,
    );

    expect(screen.getByText(/Checked Out/i)).toBeInTheDocument();
    const btn = screen.getByRole("button", { name: /Unavailable/i });
    expect(btn).toBeDisabled();
  });
});

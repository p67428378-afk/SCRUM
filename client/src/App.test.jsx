import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import React from "react";
import App from "./App";
import Button from "./components/common/Button";
import Badge from "./components/common/Badge";
import SearchBar from "./components/common/SearchBar";
import StatCard from "./components/common/StatCard";
import BookCard from "./components/catalog/BookCard";

// Mock API service module
vi.mock("./services/api", () => ({
  getBooks: vi.fn().mockResolvedValue([
    {
      id: "123-456",
      title: "The Clean Coder",
      author: "Robert C. Martin",
      isbn: "978-0137081073",
      genre: "Software Engineering",
      available_copies: 3,
      total_copies: 5,
    },
  ]),
  loginUser: vi.fn(),
  getCurrentUser: vi.fn().mockRejectedValue(new Error("Unauthorized")),
  checkoutBook: vi.fn(),
  getMyLoans: vi.fn().mockResolvedValue([]),
}));

describe("LibSys Frontend Unit Tests", () => {
  it("renders Button component with children", () => {
    render(<Button>Click Me</Button>);
    expect(
      screen.getByRole("button", { name: /click me/i }),
    ).toBeInTheDocument();
  });

  it("renders Badge component", () => {
    render(<Badge variant="success">Available</Badge>);
    expect(screen.getByText("Available")).toBeInTheDocument();
  });

  it("renders SearchBar input", () => {
    render(<SearchBar value="Clean" onChange={() => {}} />);
    expect(screen.getByPlaceholderText(/search by title/i)).toHaveValue(
      "Clean",
    );
  });

  it("renders StatCard with title and value", () => {
    render(<StatCard title="Total Books" value={10} />);
    expect(screen.getByText("Total Books")).toBeInTheDocument();
    expect(screen.getByText("10")).toBeInTheDocument();
  });

  it("renders BookCard with title and author", () => {
    const book = {
      id: "b1",
      title: "Design Patterns",
      author: "Gang of Four",
      isbn: "978-0201633610",
      genre: "Architecture",
      available_copies: 2,
      total_copies: 5,
    };
    render(<BookCard book={book} onCheckout={() => {}} />);
    expect(screen.getByText("Design Patterns")).toBeInTheDocument();
    expect(screen.getByText("By Gang of Four")).toBeInTheDocument();
  });

  it("renders App navigation brand", async () => {
    render(<App />);
    const brands = screen.getAllByText(/LibSys/i);
    expect(brands.length).toBeGreaterThan(0);
    expect(brands[0]).toBeInTheDocument();
  });
});

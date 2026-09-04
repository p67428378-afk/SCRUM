import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { describe, it, expect, vi, beforeEach } from "vitest";
import BooksDashboardPage from "../pages/BooksDashboardPage";
import * as api from "../services/api";

vi.mock("../services/api");

const mockBooks = [
  {
    id: "11111111-1111-1111-1111-111111111111",
    title: "Clean Code",
    author: "Robert C. Martin",
    isbn: "978-0132350884",
    category: "Software Engineering",
    publication_year: 2008,
    price: 39.99,
    stock_quantity: 15,
    description: "A Handbook of Agile Software Craftsmanship",
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
  },
  {
    id: "22222222-2222-2222-2222-222222222222",
    title: "The Pragmatic Programmer",
    author: "Andrew Hunt",
    isbn: "978-0201616224",
    category: "Software Engineering",
    publication_year: 1999,
    price: 45.0,
    stock_quantity: 3,
    description: "Your Journey To Mastery",
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
  },
];

describe("BooksDashboardPage", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("renders dashboard heading, KPI banner, search bar, and book table", async () => {
    api.getBooks.mockResolvedValue({
      items: mockBooks,
      total: 2,
      skip: 0,
      limit: 10,
    });

    render(
      <BrowserRouter>
        <BooksDashboardPage />
      </BrowserRouter>,
    );

    expect(screen.getByText("Book Inventory & Catalog")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Search by title, author, or keyword..."),
    ).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("Clean Code")).toBeInTheDocument();
      expect(screen.getByText("The Pragmatic Programmer")).toBeInTheDocument();
    });
  });

  it("opens Add Book modal when Add New Book button is clicked", async () => {
    api.getBooks.mockResolvedValue({
      items: mockBooks,
      total: 2,
      skip: 0,
      limit: 10,
    });

    render(
      <BrowserRouter>
        <BooksDashboardPage />
      </BrowserRouter>,
    );

    const addBtn = screen.getAllByRole("button", { name: /Add New Book/i })[0];
    fireEvent.click(addBtn);

    expect(
      screen.getByText("Add New Book", { selector: "h2" }),
    ).toBeInTheDocument();
    expect(screen.getByPlaceholderText("e.g. Clean Code")).toBeInTheDocument();
  });
});

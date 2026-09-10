import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { CatalogSearch } from "./CatalogSearch";
import { AuthProvider } from "../context/AuthContext";
import { api } from "../services/api";

vi.mock("../services/api", () => ({
  api: {
    getBooks: vi.fn(),
    checkoutBook: vi.fn(),
    login: vi.fn(),
    getMemberById: vi.fn(),
  },
}));

describe("CatalogSearch Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders catalog header and filters sidebar", async () => {
    api.getBooks.mockResolvedValueOnce([
      {
        id: "book-1",
        isbn: "978-0137081073",
        title: "The Clean Coder",
        author: "Robert C. Martin",
        category: "Technology",
        total_copies: 5,
        available_copies: 5,
      },
    ]);

    render(
      <AuthProvider>
        <CatalogSearch />
      </AuthProvider>,
    );

    expect(screen.getByText("Library Book Catalog")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("ISBN, Title, or Author..."),
    ).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("The Clean Coder")).toBeInTheDocument();
      expect(screen.getByText("by Robert C. Martin")).toBeInTheDocument();
    });
  });

  it("renders empty state when no books return", async () => {
    api.getBooks.mockResolvedValueOnce([]);

    render(
      <AuthProvider>
        <CatalogSearch />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText("No books found")).toBeInTheDocument();
    });
  });
});

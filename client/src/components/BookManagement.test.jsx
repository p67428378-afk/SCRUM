import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { BookManagement } from "./BookManagement";
import { AuthProvider } from "../context/AuthContext";
import { api } from "../services/api";

vi.mock("../services/api", () => ({
  api: {
    getBooks: vi.fn(),
    getMembers: vi.fn(),
    createBook: vi.fn(),
    updateBook: vi.fn(),
    deleteBook: vi.fn(),
    createMember: vi.fn(),
    updateMember: vi.fn(),
  },
}));

describe("BookManagement Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders inventory tabs and book records", async () => {
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
    api.getMembers.mockResolvedValueOnce([]);

    render(
      <AuthProvider>
        <BookManagement />
      </AuthProvider>,
    );

    expect(
      screen.getByText("Staff Administration Console"),
    ).toBeInTheDocument();
    expect(screen.getByText("+ Add New Book")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("The Clean Coder")).toBeInTheDocument();
      expect(screen.getByText("978-0137081073")).toBeInTheDocument();
    });
  });
});

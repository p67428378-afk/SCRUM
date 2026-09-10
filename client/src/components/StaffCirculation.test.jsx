import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { StaffCirculation } from "./StaffCirculation";
import { AuthProvider } from "../context/AuthContext";
import { api } from "../services/api";

vi.mock("../services/api", () => ({
  api: {
    getMembers: vi.fn(),
    getBooks: vi.fn(),
    getLoans: vi.fn(),
    checkoutBook: vi.fn(),
    returnBook: vi.fn(),
    recalculateOverdueFines: vi.fn(),
  },
}));

describe("StaffCirculation Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders dual circulation desk panels", async () => {
    api.getMembers.mockResolvedValueOnce([
      {
        id: "member-1",
        membership_tier: "STANDARD",
        status: "ACTIVE",
        unpaid_fines: 0,
        user: { email: "alice@example.com", full_name: "Alice Johnson" },
      },
    ]);
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
    api.getLoans.mockResolvedValueOnce([]);

    render(
      <AuthProvider>
        <StaffCirculation />
      </AuthProvider>,
    );

    expect(screen.getByText("Staff Circulation Desk")).toBeInTheDocument();
    expect(screen.getByText("Issue New Book Checkout")).toBeInTheDocument();
    expect(screen.getByText("Process Book Return")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(/Alice Johnson/)).toBeInTheDocument();
      expect(screen.getByText(/The Clean Coder/)).toBeInTheDocument();
    });
  });
});

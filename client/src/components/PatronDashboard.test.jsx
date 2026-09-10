import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { PatronDashboard } from "./PatronDashboard";
import { AuthProvider } from "../context/AuthContext";
import { api } from "../services/api";

vi.mock("../services/api", () => ({
  api: {
    getMyLoans: vi.fn(),
    renewLoan: vi.fn(),
    payFine: vi.fn(),
    getMemberById: vi.fn(),
  },
}));

describe("PatronDashboard Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it("renders sign in required message when unauthenticated", () => {
    render(
      <AuthProvider>
        <PatronDashboard />
      </AuthProvider>,
    );

    expect(screen.getByText("Sign In Required")).toBeInTheDocument();
  });

  it("renders active loans table when authenticated", async () => {
    localStorage.setItem("auth_token", "test-token");
    localStorage.setItem(
      "auth_user",
      JSON.stringify({
        access_token: "test-token",
        user_id: "user-1",
        email: "test@example.com",
        full_name: "Alice Johnson",
        role: "PATRON",
        member_id: "member-1",
      }),
    );

    api.getMyLoans.mockResolvedValueOnce([
      {
        id: "loan-1",
        book_id: "book-1",
        member_id: "member-1",
        checkout_date: "2026-10-01T00:00:00Z",
        due_date: "2026-10-15T00:00:00Z",
        status: "BORROWED",
        fine_amount: 0,
        book: {
          id: "book-1",
          title: "The Clean Coder",
          author: "Robert C. Martin",
        },
      },
    ]);

    render(
      <AuthProvider>
        <PatronDashboard />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText("Patron Dashboard & Loans")).toBeInTheDocument();
      expect(screen.getByText("The Clean Coder")).toBeInTheDocument();
      expect(screen.getByText("BORROWED")).toBeInTheDocument();
    });
  });
});

import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { LoansTable } from "./LoansTable";

const mockLoans = [
  {
    id: "l1",
    book_id: "b1",
    patron_id: "p1",
    checkout_date: "2026-05-01T10:00:00Z",
    due_date: "2026-05-15T10:00:00Z",
    status: "active",
    book: {
      title: "Domain-Driven Design",
      author: "Eric Evans",
      isbn: "9780321125217",
    },
    patron: {
      full_name: "Alice Reader",
      email: "alice@example.com",
    },
  },
];

describe("LoansTable Component", () => {
  it("renders loans list with book title, author, and action buttons", () => {
    render(<LoansTable loans={mockLoans} isAdminView={false} />);

    expect(screen.getByText("Domain-Driven Design")).toBeInTheDocument();
    expect(screen.getByText(/by Eric Evans/i)).toBeInTheDocument();
    expect(screen.getByText("Renew")).toBeInTheDocument();
    expect(screen.getByText("Return")).toBeInTheDocument();
  });

  it("renders empty state when no loans provided", () => {
    render(<LoansTable loans={[]} isAdminView={false} />);
    expect(screen.getByText(/No loan records found/i)).toBeInTheDocument();
  });
});

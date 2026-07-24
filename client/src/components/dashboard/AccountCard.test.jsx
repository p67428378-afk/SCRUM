import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import AccountCard from "./AccountCard";

describe("AccountCard", () => {
  const mockAccount = {
    id: "123",
    account_number: "1234567890",
    account_type: "Checking",
    balance: 1000,
    available_balance: 950,
    currency: "USD",
    status: "active",
  };

  it("renders account details correctly", () => {
    render(<AccountCard account={mockAccount} onSelect={() => {}} />);
    expect(screen.getByText("Checking")).toBeInTheDocument();
    expect(screen.getByText("$1,000.00")).toBeInTheDocument();
    expect(screen.getByText("Available: $950.00")).toBeInTheDocument();
  });

  it("calls onSelect when View Activity is clicked", () => {
    const handleSelect = vi.fn();
    render(<AccountCard account={mockAccount} onSelect={handleSelect} />);
    fireEvent.click(screen.getByText("View Activity"));
    expect(handleSelect).toHaveBeenCalledWith(mockAccount);
  });
});

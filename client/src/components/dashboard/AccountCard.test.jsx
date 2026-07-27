import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import AccountCard from "./AccountCard";

describe("AccountCard Component", () => {
  const mockAccount = {
    id: "123",
    account_type: "Checking",
    account_number_masked: "...4321",
    balance: "12450.80",
    status: "active",
  };

  it("renders account details correctly", () => {
    render(
      <AccountCard
        account={mockAccount}
        onViewDetails={vi.fn()}
        onTransfer={vi.fn()}
      />,
    );

    expect(screen.getByText("Checking Account")).toBeInTheDocument();
    expect(screen.getByText("...4321")).toBeInTheDocument();
    expect(screen.getByText("$12,450.80")).toBeInTheDocument();
  });

  it("calls onViewDetails and onTransfer when buttons are clicked", () => {
    const mockViewDetails = vi.fn();
    const mockTransfer = vi.fn();

    render(
      <AccountCard
        account={mockAccount}
        onViewDetails={mockViewDetails}
        onTransfer={mockTransfer}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /view details/i }));
    expect(mockViewDetails).toHaveBeenCalled();

    fireEvent.click(screen.getByRole("button", { name: /transfer/i }));
    expect(mockTransfer).toHaveBeenCalled();
  });
});

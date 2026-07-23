import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import SplitFundingForm from "../SplitFundingForm";

describe("SplitFundingForm", () => {
  const mockPayees = [
    { id: "payee-1", name: "Metropolitan Water" },
    { id: "payee-2", name: "Apex Energy" },
  ];

  const mockAccounts = [
    {
      id: "acc-1",
      account_provider: "Chase",
      account_type: "CHECKING",
      account_number_last4: "1234",
      balance: 1000,
      is_active: true,
    },
    {
      id: "acc-2",
      account_provider: "Wells Fargo",
      account_type: "SAVINGS",
      account_number_last4: "5678",
      balance: 2000,
      is_active: true,
    },
  ];

  it("renders form fields and live validation banner", () => {
    render(
      <SplitFundingForm
        payees={mockPayees}
        accounts={mockAccounts}
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
      />,
    );

    expect(screen.getByText("Configure Recurring Payment")).toBeInTheDocument();
    expect(screen.getByLabelText("Payee")).toBeInTheDocument();
    expect(screen.getByLabelText("Amount ($)")).toBeInTheDocument();
    expect(screen.getByTestId("live-validation-banner")).toBeInTheDocument();
  });

  it("shows validation warning when split percentage is not 100%", () => {
    render(
      <SplitFundingForm
        payees={mockPayees}
        accounts={mockAccounts}
        onSubmit={vi.fn()}
        onCancel={vi.fn()}
      />,
    );

    // Set amount
    const amountInput = screen.getByLabelText("Amount ($)");
    fireEvent.change(amountInput, { target: { value: "100" } });

    // Change split value to 50% (default is 100%)
    const valueInput = screen.getByLabelText("Value");
    fireEvent.change(valueInput, { target: { value: "50" } });

    expect(
      screen.getByText(/Total split percentage must equal 100%/),
    ).toBeInTheDocument();
  });
});

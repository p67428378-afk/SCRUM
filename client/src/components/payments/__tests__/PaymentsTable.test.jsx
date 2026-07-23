import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import PaymentsTable from "../PaymentsTable";

describe("PaymentsTable", () => {
  const mockAccounts = [
    {
      id: "acc-1",
      account_provider: "Chase",
      account_number_last4: "1234",
      balance: 1000,
      is_active: true,
    },
    {
      id: "acc-2",
      account_provider: "Wells Fargo",
      account_number_last4: "5678",
      balance: 2000,
      is_active: true,
    },
  ];

  const mockSchedules = [
    {
      id: "sched-1",
      amount: 100,
      currency: "USD",
      frequency: "MONTHLY",
      next_payment_date: "2026-08-01",
      is_active: true,
      payee: { id: "payee-1", name: "Metropolitan Water" },
      splits: [
        {
          id: "split-1",
          funding_account_id: "acc-1",
          split_type: "PERCENTAGE",
          split_value: 60,
        },
        {
          id: "split-2",
          funding_account_id: "acc-2",
          split_type: "PERCENTAGE",
          split_value: 40,
        },
      ],
    },
  ];

  it("renders the list of recurring payments", () => {
    render(
      <PaymentsTable
        schedules={mockSchedules}
        accounts={mockAccounts}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onExecute={vi.fn()}
      />,
    );

    expect(screen.getByText("Metropolitan Water")).toBeInTheDocument();
    expect(screen.getByText("$100.00 USD")).toBeInTheDocument();
    expect(screen.getByText("Chase (...1234): 60%")).toBeInTheDocument();
    expect(screen.getByText("Wells Fargo (...5678): 40%")).toBeInTheDocument();
  });

  it("calls onExecute when play button is clicked", () => {
    const handleExecute = vi.fn();
    render(
      <PaymentsTable
        schedules={mockSchedules}
        accounts={mockAccounts}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onExecute={handleExecute}
      />,
    );

    const executeBtn = screen.getByTitle("Execute Payment Now");
    fireEvent.click(executeBtn);
    expect(handleExecute).toHaveBeenCalledWith("sched-1");
  });
});

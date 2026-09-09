import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import TransferPortal from "./TransferPortal.jsx";
import * as api from "../services/api.js";

vi.mock("../services/api.js", () => ({
  transferMoney: vi.fn(),
  fetchAccounts: vi.fn(),
  fetchTransfers: vi.fn(),
}));

describe("TransferPortal Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    api.fetchAccounts.mockResolvedValue([
      {
        id: "550e8400-e29b-41d4-a716-446655440000",
        account_number: "ACC-1001",
        balance: "12450.00",
        currency: "USD",
      },
    ]);
    api.fetchTransfers.mockResolvedValue([]);
  });

  it("renders portal heading, input fields, and submit button", async () => {
    render(<TransferPortal />);

    expect(screen.getByText(/SecureBank P2P Portal/i)).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(/6ba7b810-9dad-11d1-80b4-00c04fd430c8/i),
    ).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/250.00/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Send Transfer Now/i }),
    ).toBeInTheDocument();
  });

  it("executes successful transfer and displays success confirmation banner", async () => {
    api.transferMoney.mockResolvedValueOnce({
      id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
      sender_id: "550e8400-e29b-41d4-a716-446655440000",
      receiver_id: "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
      amount: 250.0,
      status: "COMPLETED",
      created_at: "2026-05-18T12:00:00Z",
      updated_at: "2026-05-18T12:00:00Z",
    });

    render(<TransferPortal />);

    const submitBtn = screen.getByRole("button", {
      name: /Send Transfer Now/i,
    });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(api.transferMoney).toHaveBeenCalledWith({
        sender_id: "550e8400-e29b-41d4-a716-446655440000",
        receiver_id: "6ba7b810-9dad-11d1-80b4-00c04fd430c8",
        amount: "250.00",
      });
      expect(
        screen.getByText(/Transfer Completed Successfully!/i),
      ).toBeInTheDocument();
      expect(screen.getByText(/\$250.00/i)).toBeInTheDocument();
    });
  });

  it("displays fraud threshold exceeded error when amount > $10,000", async () => {
    api.transferMoney.mockRejectedValueOnce({
      response: {
        status: 400,
        data: {
          detail: "Blocked: Fraud threshold exceeded",
        },
      },
    });

    render(<TransferPortal />);

    const amountInput = screen.getByPlaceholderText(/250.00/i);
    fireEvent.change(amountInput, { target: { value: "10001.00" } });

    const submitBtn = screen.getByRole("button", {
      name: /Send Transfer Now/i,
    });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(
        screen.getByText(/Blocked: Fraud threshold exceeded/i),
      ).toBeInTheDocument();
      expect(screen.getByText(/Transfer Blocked/i)).toBeInTheDocument();
    });
  });

  it("displays insufficient funds error when balance is insufficient", async () => {
    api.transferMoney.mockRejectedValueOnce({
      response: {
        status: 400,
        data: {
          detail: "Insufficient funds",
        },
      },
    });

    render(<TransferPortal />);

    const amountInput = screen.getByPlaceholderText(/250.00/i);
    fireEvent.change(amountInput, { target: { value: "150000.00" } });

    const submitBtn = screen.getByRole("button", {
      name: /Send Transfer Now/i,
    });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/Insufficient funds/i)).toBeInTheDocument();
      expect(screen.getByText(/Transfer Rejected/i)).toBeInTheDocument();
    });
  });
});

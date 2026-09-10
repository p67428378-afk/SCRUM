import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import TransferPortal from "./TransferPortal";
import * as api from "../services/api";

vi.mock("../services/api", () => ({
  createTransfer: vi.fn(),
  getTransfers: vi.fn(),
  getAllAccounts: vi.fn(),
  getAccountById: vi.fn(),
  getTransferById: vi.fn(),
  checkHealth: vi.fn(),
}));

describe("TransferPortal Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    api.getAllAccounts.mockResolvedValue([
      {
        id: "123e4567-e89b-12d3-a456-426614174000",
        account_number: "ACC-1001",
        balance: 50000.0,
        owner_name: "Apex Test Sender",
      },
      {
        id: "987f6543-e89b-12d3-a456-426614174000",
        account_number: "ACC-2002",
        balance: 1000.0,
        owner_name: "Apex Test Receiver",
      },
      {
        id: "222e4567-e89b-12d3-a456-426614174000",
        account_number: "ACC-3003",
        balance: 100.0,
        owner_name: "Low Balance Account",
      },
    ]);
    api.getTransfers.mockResolvedValue([]);
  });

  it("renders the portal header, balance, and form elements", async () => {
    render(<TransferPortal />);

    expect(screen.getByText(/P2P Fund Transfer/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Recipient Account ID/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Transfer Amount/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Send Transfer/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/Recent P2P Transfers/i)).toBeInTheDocument();
  });

  it("handles successful transfer and displays receipt modal", async () => {
    const mockTransferResponse = {
      id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
      sender_id: "123e4567-e89b-12d3-a456-426614174000",
      receiver_id: "987f6543-e89b-12d3-a456-426614174000",
      amount: 250.0,
      status: "COMPLETED",
      created_at: "2026-09-10T12:00:00Z",
    };

    api.createTransfer.mockResolvedValueOnce(mockTransferResponse);

    render(<TransferPortal />);

    const recipientInput = screen.getByLabelText(/Recipient Account ID/i);
    const amountInput = screen.getByLabelText(/Transfer Amount/i);
    const submitButton = screen.getByRole("button", { name: /Send Transfer/i });

    fireEvent.change(recipientInput, {
      target: { value: "987f6543-e89b-12d3-a456-426614174000" },
    });
    fireEvent.change(amountInput, { target: { value: "250.00" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(api.createTransfer).toHaveBeenCalledWith({
        sender_id: "123e4567-e89b-12d3-a456-426614174000",
        receiver_id: "987f6543-e89b-12d3-a456-426614174000",
        amount: 250.0,
      });
    });

    expect(
      await screen.findByText(/Transfer Completed Successfully!/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText("a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11"),
    ).toBeInTheDocument();

    const closeButtons = screen.getAllByRole("button", { name: /Close/i });
    fireEvent.click(closeButtons[0]);

    await waitFor(() => {
      expect(
        screen.queryByText(/Transfer Completed Successfully!/i),
      ).not.toBeInTheDocument();
    });
  });

  it("displays error alert when backend rejects for fraud threshold exceeded", async () => {
    const fraudError = {
      response: {
        status: 400,
        data: {
          detail: "Blocked: Fraud threshold exceeded",
        },
      },
    };
    api.createTransfer.mockRejectedValueOnce(fraudError);

    render(<TransferPortal />);

    const amountInput = screen.getByLabelText(/Transfer Amount/i);
    const submitButton = screen.getByRole("button", { name: /Send Transfer/i });

    fireEvent.change(amountInput, { target: { value: "10501.00" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      const alert = screen.getByRole("alert");
      expect(alert).toBeInTheDocument();
      expect(alert).toHaveTextContent("Blocked: Fraud threshold exceeded");
    });
  });

  it("displays error alert when backend rejects for insufficient funds", async () => {
    const balanceError = {
      response: {
        status: 400,
        data: {
          detail: "Insufficient funds",
        },
      },
    };
    api.createTransfer.mockRejectedValueOnce(balanceError);

    render(<TransferPortal />);

    const amountInput = screen.getByLabelText(/Transfer Amount/i);
    const submitButton = screen.getByRole("button", { name: /Send Transfer/i });

    fireEvent.change(amountInput, { target: { value: "500.00" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      const alert = screen.getByRole("alert");
      expect(alert).toBeInTheDocument();
      expect(alert).toHaveTextContent("Insufficient funds");
    });
  });

  it("populates fields using quick scenario buttons", () => {
    render(<TransferPortal />);

    const fraudButton = screen.getByRole("button", { name: /\$10,501 Fraud/i });
    fireEvent.click(fraudButton);

    const amountInput = screen.getByLabelText(/Transfer Amount/i);
    expect(amountInput.value).toBe("10501.00");
  });
});

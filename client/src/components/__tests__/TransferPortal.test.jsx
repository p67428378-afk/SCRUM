import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import TransferPortal from "../TransferPortal.jsx";
import BalanceCard from "../BalanceCard.jsx";
import TransferForm from "../TransferForm.jsx";
import FraudAlertBanner from "../FraudAlertBanner.jsx";
import TransferReceiptModal from "../TransferReceiptModal.jsx";
import * as apiModule from "../../services/api.js";

vi.mock("../../services/api.js", () => ({
  createTransfer: vi.fn(),
  getBalance: vi.fn().mockResolvedValue({ id: "usr_12345", balance: 24850.0 }),
  getTransfers: vi.fn().mockResolvedValue([]),
}));

describe("P2P Transfer Portal Components", () => {
  it("renders TransferPortal page with title and inputs", async () => {
    render(<TransferPortal />);
    expect(
      screen.getByText(/Peer-to-Peer \(P2P\) Money Transfer/i),
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText(/Recipient User \/ Account ID/i),
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText(/Transfer Amount \(USD\)/i),
    ).toBeInTheDocument();
  });

  it("renders BalanceCard with balance and sender account ID", () => {
    render(
      <BalanceCard
        senderId="usr_12345"
        balance={24850.0}
        fraudThreshold={10000.0}
      />,
    );
    expect(screen.getByText(/\$24,850\.00/i)).toBeInTheDocument();
    expect(screen.getByText("usr_12345")).toBeInTheDocument();
  });

  it("submits TransferForm with receiver_id and amount when Send Money button clicked", async () => {
    const handleSubmit = vi.fn();
    render(
      <TransferForm
        senderId="usr_12345"
        onSubmit={handleSubmit}
        isLoading={false}
      />,
    );

    const recipientInput = screen.getByLabelText(
      /Recipient User \/ Account ID/i,
    );
    const amountInput = screen.getByLabelText(/Transfer Amount \(USD\)/i);
    const submitBtn = screen.getByRole("button", { name: /Send Money Now/i });

    fireEvent.change(recipientInput, { target: { value: "usr_98765" } });
    fireEvent.change(amountInput, { target: { value: "250.00" } });
    fireEvent.click(submitBtn);

    expect(handleSubmit).toHaveBeenCalledWith({
      sender_id: "usr_12345",
      receiver_id: "usr_98765",
      amount: 250.0,
    });
  });

  it("displays FraudAlertBanner when fraud error occurs", () => {
    render(<FraudAlertBanner error="Blocked: Fraud threshold exceeded" />);
    expect(
      screen.getByText(/Blocked: Fraud threshold exceeded/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/SECURITY ALERT - TRANSFER BLOCKED/i),
    ).toBeInTheDocument();
  });

  it("displays TransferReceiptModal when valid transaction receipt is provided", () => {
    const mockReceipt = {
      id: "123e4567-e89b-12d3-a456-426614174000",
      sender_id: "usr_12345",
      receiver_id: "usr_98765",
      amount: 250.0,
      status: "COMPLETED",
      created_at: "2026-05-18T12:00:00Z",
    };
    render(<TransferReceiptModal transfer={mockReceipt} onClose={vi.fn()} />);
    expect(
      screen.getByText(/Transfer Completed Successfully/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/\$250\.00/i)).toBeInTheDocument();
  });

  it("handles fraud error response in TransferPortal on submission", async () => {
    apiModule.createTransfer.mockRejectedValueOnce(
      new Error("Blocked: Fraud threshold exceeded"),
    );

    render(<TransferPortal />);
    const amountInput = screen.getByLabelText(/Transfer Amount \(USD\)/i);
    const submitBtn = screen.getByRole("button", { name: /Send Money Now/i });

    fireEvent.change(amountInput, { target: { value: "15000" } });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(
        screen.getByText(/Blocked: Fraud threshold exceeded/i),
      ).toBeInTheDocument();
    });
  });
});

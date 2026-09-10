import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import TransferPortal from "./TransferPortal.jsx";
import AccountSummaryCard from "./AccountSummaryCard.jsx";
import TransferForm from "./TransferForm.jsx";
import StatusAlertBanner from "./StatusAlertBanner.jsx";
import TransferReceiptModal from "./TransferReceiptModal.jsx";
import * as api from "../services/api.js";

vi.mock("../services/api.js", () => ({
  getAccounts: vi.fn(),
  getTransfers: vi.fn(),
  createTransfer: vi.fn(),
}));

describe("P2P Transfer Portal Components", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    api.getAccounts.mockResolvedValue([
      {
        id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
        user_name: "Primary Checking Account",
        balance: 15420.5,
      },
    ]);
    api.getTransfers.mockResolvedValue([]);
  });

  it("renders AccountSummaryCard with account details", () => {
    const acc = {
      id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
      user_name: "Test Account",
      balance: 5000,
    };
    render(<AccountSummaryCard account={acc} />);
    expect(screen.getByText("Sender Account Details")).toBeInTheDocument();
    expect(screen.getByText("$5,000.00")).toBeInTheDocument();
    expect(screen.getByText("Test Account")).toBeInTheDocument();
  });

  it("renders TransferForm and handles form input", () => {
    const handleSubmit = vi.fn();
    render(
      <TransferForm
        senderId="a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11"
        onSubmit={handleSubmit}
        loading={false}
      />,
    );

    expect(screen.getByText("Send Peer-to-Peer Payment")).toBeInTheDocument();

    const recipientInput = screen.getByPlaceholderText(
      "e.g., b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22",
    );
    const amountInput = screen.getByPlaceholderText("150.00");

    fireEvent.change(recipientInput, {
      target: { value: "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22" },
    });
    fireEvent.change(amountInput, { target: { value: "150" } });

    fireEvent.click(screen.getByText("Send Transfer Now"));

    expect(handleSubmit).toHaveBeenCalledWith({
      sender_id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
      receiver_id: "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22",
      amount: 150,
    });
  });

  it("handles quick amount selection in TransferForm", () => {
    const handleSubmit = vi.fn();
    render(
      <TransferForm
        senderId="a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11"
        onSubmit={handleSubmit}
        loading={false}
      />,
    );

    const quickBtn = screen.getByText("$500");
    fireEvent.click(quickBtn);

    const amountInput = screen.getByPlaceholderText("150.00");
    expect(amountInput.value).toBe("500");
  });

  it("renders StatusAlertBanner for Fraud Threshold Exceeded error", () => {
    render(<StatusAlertBanner error="Blocked: Fraud threshold exceeded" />);
    expect(
      screen.getByText("Blocked: Fraud threshold exceeded"),
    ).toBeInTheDocument();
  });

  it("renders StatusAlertBanner for Insufficient Funds error", () => {
    render(<StatusAlertBanner error="Insufficient funds" />);
    expect(screen.getByText("Insufficient funds")).toBeInTheDocument();
  });

  it("renders TransferReceiptModal on completed transfer", () => {
    const transfer = {
      id: "c1fec999-9c0b-4ef8-bb6d-7cc9bd380a33",
      sender_id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
      receiver_id: "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22",
      amount: 250.0,
      status: "COMPLETED",
      created_at: new Date().toISOString(),
    };
    render(<TransferReceiptModal transfer={transfer} onClose={() => {}} />);
    expect(
      screen.getByText("Transfer Completed Successfully"),
    ).toBeInTheDocument();
    expect(screen.getByText("$250.00")).toBeInTheDocument();
    expect(
      screen.getByText("c1fec999-9c0b-4ef8-bb6d-7cc9bd380a33"),
    ).toBeInTheDocument();
  });

  it("submits transfer via TransferPortal and displays receipt on success", async () => {
    api.createTransfer.mockResolvedValueOnce({
      id: "c1fec999-9c0b-4ef8-bb6d-7cc9bd380a33",
      sender_id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
      receiver_id: "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22",
      amount: 150.0,
      status: "COMPLETED",
      created_at: new Date().toISOString(),
    });

    render(<TransferPortal />);

    await waitFor(() => {
      expect(api.getAccounts).toHaveBeenCalled();
    });

    const recipientInput = screen.getByPlaceholderText(
      "e.g., b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22",
    );
    const amountInput = screen.getByPlaceholderText("150.00");

    fireEvent.change(recipientInput, {
      target: { value: "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22" },
    });
    fireEvent.change(amountInput, { target: { value: "150" } });

    fireEvent.click(screen.getByText("Send Transfer Now"));

    await waitFor(() => {
      expect(api.createTransfer).toHaveBeenCalledWith({
        sender_id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
        receiver_id: "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22",
        amount: 150,
      });
      expect(
        screen.getByText("Transfer Completed Successfully"),
      ).toBeInTheDocument();
    });
  });

  it("displays error banner when createTransfer fails with fraud threshold", async () => {
    api.createTransfer.mockRejectedValueOnce(
      new Error("Blocked: Fraud threshold exceeded"),
    );

    render(<TransferPortal />);

    await waitFor(() => {
      expect(api.getAccounts).toHaveBeenCalled();
    });

    const recipientInput = screen.getByPlaceholderText(
      "e.g., b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22",
    );
    const amountInput = screen.getByPlaceholderText("150.00");

    fireEvent.change(recipientInput, {
      target: { value: "b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a22" },
    });
    fireEvent.change(amountInput, { target: { value: "12000" } });

    fireEvent.click(screen.getByText("Send Transfer Now"));

    await waitFor(() => {
      expect(
        screen.getByText("Blocked: Fraud threshold exceeded"),
      ).toBeInTheDocument();
    });
  });
});

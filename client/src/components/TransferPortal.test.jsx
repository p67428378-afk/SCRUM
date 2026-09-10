import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import TransferPortal from "./TransferPortal";

vi.mock("../services/api", () => ({
  getBalance: vi.fn().mockResolvedValue({
    user_id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    available_balance: 5000.0,
    currency: "USD",
    account_number: "CHK-8492",
  }),
  getTransfers: vi.fn().mockResolvedValue([
    {
      id: "c1fbc882-1234-4a56-8789-90abcdef1234",
      sender_id: "usr_alexander",
      receiver_id: "usr_987654",
      amount: 500.0,
      status: "COMPLETED",
      created_at: "2026-09-10T10:00:00Z",
    },
  ]),
  createTransfer: vi.fn().mockResolvedValue({
    id: "d2fbc882-1234-4a56-8789-90abcdef5678",
    sender_id: "usr_alexander",
    receiver_id: "usr_987654",
    amount: 100.0,
    status: "COMPLETED",
    created_at: "2026-09-10T10:05:00Z",
  }),
  getUsers: vi.fn().mockResolvedValue([]),
  getAccounts: vi.fn().mockResolvedValue([]),
  getTransferById: vi.fn(),
  depositFunds: vi.fn(),
  checkHealth: vi.fn().mockResolvedValue({ status: "ok" }),
}));

describe("TransferPortal Component", () => {
  it("renders portal header, balance card, and form elements", async () => {
    render(<TransferPortal />);

    expect(screen.getByText("SecureBank")).toBeInTheDocument();
    expect(
      screen.getByText(/Primary Checking & P2P Settlement/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/Send Money/i)).toBeInTheDocument();
    expect(screen.getByText(/Recent Transfers History/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(/c1fbc882/i)).toBeInTheDocument();
    });
  });
});

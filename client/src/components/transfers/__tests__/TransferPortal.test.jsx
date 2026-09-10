import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import TransferPortal from "../TransferPortal";
import AlertBanner from "../AlertBanner";
import TransferReceiptModal from "../TransferReceiptModal";
import TransferHistoryTable from "../TransferHistoryTable";
import * as api from "../../../services/api";

vi.mock("../../../services/api", () => ({
  createTransfer: vi.fn(),
  listTransfers: vi.fn(),
  listAccounts: vi.fn(),
  getCurrentUserProfile: vi.fn(),
  getAccountById: vi.fn(),
}));

describe("AlertBanner Component", () => {
  it("renders correctly with error message", () => {
    render(
      <AlertBanner
        type="error"
        title="Transfer Blocked"
        message="Blocked: Fraud threshold exceeded"
      />,
    );
    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(
      screen.getByText("Blocked: Fraud threshold exceeded"),
    ).toBeInTheDocument();
    expect(screen.getByText("Transfer Blocked")).toBeInTheDocument();
  });

  it("renders correctly with success message", () => {
    render(
      <AlertBanner
        type="success"
        title="Transfer Completed"
        message="Successfully transferred $250.00 to recipient."
      />,
    );
    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(
      screen.getByText("Successfully transferred $250.00 to recipient."),
    ).toBeInTheDocument();
  });
});

describe("TransferReceiptModal Component", () => {
  const mockTransfer = {
    id: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
    sender_id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    receiver_id: "b1ffcd00-1d1c-5fa9-cc7e-7cc0ce491b22",
    amount: 250.0,
    status: "COMPLETED",
    created_at: "2026-09-10T12:00:00Z",
  };

  it("renders receipt details when open", () => {
    render(
      <TransferReceiptModal
        isOpen={true}
        onClose={vi.fn()}
        transfer={mockTransfer}
      />,
    );
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Transfer Confirmed")).toBeInTheDocument();
    expect(screen.getByText("$250.00")).toBeInTheDocument();
    expect(screen.getByText("COMPLETED")).toBeInTheDocument();
  });

  it("does not render when isOpen is false", () => {
    const { container } = render(
      <TransferReceiptModal
        isOpen={false}
        onClose={vi.fn()}
        transfer={mockTransfer}
      />,
    );
    expect(container.firstChild).toBeNull();
  });
});

describe("TransferHistoryTable Component", () => {
  const mockTransfers = [
    {
      id: "tx-1001-uuid-val",
      sender_id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
      receiver_id: "b1ffcd00-1d1c-5fa9-cc7e-7cc0ce491b22",
      amount: 150.0,
      status: "COMPLETED",
      created_at: "2026-09-10T11:00:00Z",
    },
  ];

  it("renders transactions list correctly", () => {
    render(
      <TransferHistoryTable
        transfers={mockTransfers}
        isLoading={false}
        onRefresh={vi.fn()}
        onViewReceipt={vi.fn()}
      />,
    );
    expect(
      screen.getByText("Transfer Activity & Audit Ledger"),
    ).toBeInTheDocument();
    expect(screen.getByText("$150.00")).toBeInTheDocument();
    expect(screen.getByText("COMPLETED")).toBeInTheDocument();
  });
});

describe("TransferPortal Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    api.listAccounts.mockResolvedValue([
      {
        id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
        user_id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
        balance: 25000.0,
      },
    ]);
  });

  it("renders the portal form with pre-filled defaults", async () => {
    render(<TransferPortal onTransferSuccess={vi.fn()} />);

    expect(screen.getByText("Send Money Instantly")).toBeInTheDocument();
    expect(
      screen.getByDisplayValue("b1ffcd00-1d1c-5fa9-cc7e-7cc0ce491b22"),
    ).toBeInTheDocument();
    expect(screen.getByDisplayValue("250.00")).toBeInTheDocument();
  });

  it("updates amount when quick select preset chips are clicked", async () => {
    render(<TransferPortal onTransferSuccess={vi.fn()} />);

    const chip500 = screen.getByRole("button", { name: "$500" });
    fireEvent.click(chip500);

    expect(screen.getByDisplayValue("500.00")).toBeInTheDocument();
  });

  it("submits valid transfer and triggers callback", async () => {
    const mockSuccessResponse = {
      id: "99999999-9c0b-4ef8-bb6d-6bb9bd380a99",
      sender_id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
      receiver_id: "b1ffcd00-1d1c-5fa9-cc7e-7cc0ce491b22",
      amount: 250.0,
      status: "COMPLETED",
      created_at: "2026-09-10T12:00:00Z",
      updated_at: "2026-09-10T12:00:00Z",
    };
    api.createTransfer.mockResolvedValueOnce(mockSuccessResponse);
    const mockSuccessCb = vi.fn();

    render(<TransferPortal onTransferSuccess={mockSuccessCb} />);

    const submitBtn = screen.getByRole("button", {
      name: /Send Transfer Now/i,
    });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(api.createTransfer).toHaveBeenCalledWith({
        sender_id: "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
        receiver_id: "b1ffcd00-1d1c-5fa9-cc7e-7cc0ce491b22",
        amount: 250.0,
      });
      expect(mockSuccessCb).toHaveBeenCalledWith(mockSuccessResponse);
      expect(
        screen.getByText("Successfully transferred $250.00 to recipient."),
      ).toBeInTheDocument();
    });
  });

  it("handles backend fraud rejection cleanly without fake success", async () => {
    api.createTransfer.mockRejectedValueOnce({
      response: {
        status: 400,
        data: { detail: "Blocked: Fraud threshold exceeded" },
      },
    });
    const mockSuccessCb = vi.fn();

    render(<TransferPortal onTransferSuccess={mockSuccessCb} />);

    const submitBtn = screen.getByRole("button", {
      name: /Send Transfer Now/i,
    });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(api.createTransfer).toHaveBeenCalled();
      expect(mockSuccessCb).not.toHaveBeenCalled();
      expect(
        screen.getByText("Blocked: Fraud threshold exceeded"),
      ).toBeInTheDocument();
    });
  });

  it("handles backend insufficient funds rejection cleanly", async () => {
    api.createTransfer.mockRejectedValueOnce({
      response: {
        status: 400,
        data: { detail: "Insufficient funds" },
      },
    });
    const mockSuccessCb = vi.fn();

    render(<TransferPortal onTransferSuccess={mockSuccessCb} />);

    const submitBtn = screen.getByRole("button", {
      name: /Send Transfer Now/i,
    });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(api.createTransfer).toHaveBeenCalled();
      expect(mockSuccessCb).not.toHaveBeenCalled();
      expect(screen.getByText("Insufficient funds")).toBeInTheDocument();
    });
  });
});

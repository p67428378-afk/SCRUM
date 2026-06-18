import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import PaymentActionsPanel from "./PaymentActionsPanel";

const mockBooking = {
  booking_id: "bk-1024-uuid",
  client_name: "Alice Smith",
  client_contact: "alice@example.com",
  trek_name: "Everest Base Camp",
  trek_date: "2026-12-12",
  participants: 3,
  payment_status: "Paid",
  status: "Confirmed",
};

describe("PaymentActionsPanel Component", () => {
  it("renders form fields correctly", () => {
    render(<PaymentActionsPanel booking={mockBooking} />);

    expect(screen.getByText("Update Booking Details")).toBeInTheDocument();
    expect(screen.getByLabelText("Participants")).toBeInTheDocument();
    expect(screen.getByLabelText("Payment Status")).toBeInTheDocument();
    expect(screen.getByLabelText("Booking Status")).toBeInTheDocument();
  });
});

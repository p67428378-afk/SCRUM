import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import BookingInfoCard from "./BookingInfoCard";

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

describe("BookingInfoCard Component", () => {
  it("renders booking details correctly", () => {
    render(<BookingInfoCard booking={mockBooking} />);

    expect(screen.getByText("Booking Details")).toBeInTheDocument();
    expect(screen.getByText("Alice Smith")).toBeInTheDocument();
    expect(screen.getByText("alice@example.com")).toBeInTheDocument();
    expect(screen.getByText("Everest Base Camp")).toBeInTheDocument();
    expect(screen.getByText("2026-12-12")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("Paid")).toBeInTheDocument();
    expect(screen.getByText("Confirmed")).toBeInTheDocument();
  });
});

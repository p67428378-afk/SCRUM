import React from "react";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { describe, it, expect } from "vitest";
import BookingsTable from "./BookingsTable";

const mockBookings = [
  {
    booking_id: "bk-1024-uuid",
    client_name: "Alice Smith",
    trek_name: "Everest Base Camp",
    trek_date: "2026-12-12",
    participants: 3,
    payment_status: "Paid",
    status: "Confirmed",
  },
];

describe("BookingsTable Component", () => {
  it("renders bookings list correctly", () => {
    render(
      <BrowserRouter>
        <BookingsTable bookings={mockBookings} />
      </BrowserRouter>,
    );

    expect(screen.getByText("Upcoming Bookings")).toBeInTheDocument();
    expect(screen.getByText("Alice Smith")).toBeInTheDocument();
    expect(screen.getByText("Everest Base Camp")).toBeInTheDocument();
    expect(screen.getByText("2026-12-12")).toBeInTheDocument();
  });

  it("renders empty state when no bookings are provided", () => {
    render(
      <BrowserRouter>
        <BookingsTable bookings={[]} />
      </BrowserRouter>,
    );

    expect(screen.getByText("No bookings found.")).toBeInTheDocument();
  });
});

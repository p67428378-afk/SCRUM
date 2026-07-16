import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import BookingsPage from "./BookingsPage.jsx";

describe("BookingsPage Smoke Test", () => {
  const mockRooms = [
    {
      id: "1",
      room_number: "101",
      type: "Standard",
      capacity: 2,
      price_per_night: 100,
      status: "Available",
    },
  ];
  const mockBookings = [
    {
      id: "b1",
      room_id: "1",
      guest_name: "John Doe",
      check_in_date: "2026-07-20",
      check_out_date: "2026-07-25",
      status: "Booked",
      total_amount: 500,
    },
  ];

  it("renders booking management title and calendar grid", () => {
    const handleCreate = vi.fn();
    const handleCancel = vi.fn();
    render(
      <BookingsPage
        bookings={mockBookings}
        rooms={mockRooms}
        onCreateBooking={handleCreate}
        onCancelBooking={handleCancel}
      />,
    );
    expect(screen.getByText("Booking Management")).toBeInTheDocument();
    expect(
      screen.getByText("Room Availability Timeline (Next 14 Days)"),
    ).toBeInTheDocument();
  });
});

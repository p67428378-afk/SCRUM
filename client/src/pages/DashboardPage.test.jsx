import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import DashboardPage from "./DashboardPage.jsx";

describe("DashboardPage Smoke Test", () => {
  const mockRooms = [
    {
      id: "1",
      room_number: "101",
      type: "Standard",
      capacity: 2,
      price_per_night: 100,
      status: "Available",
    },
    {
      id: "2",
      room_number: "102",
      type: "Deluxe",
      capacity: 3,
      price_per_night: 150,
      status: "Occupied",
    },
  ];
  const mockBookings = [
    {
      id: "b1",
      room_id: "2",
      guest_name: "John Doe",
      check_in_date: "2026-07-20",
      check_out_date: "2026-07-25",
      status: "Booked",
      total_amount: 750,
    },
  ];

  it("renders dashboard metrics correctly", () => {
    render(<DashboardPage rooms={mockRooms} bookings={mockBookings} />);
    expect(screen.getByText("Dashboard Overview")).toBeInTheDocument();
    expect(screen.getByText("Occupancy Rate")).toBeInTheDocument();
    expect(screen.getByText("Available Rooms")).toBeInTheDocument();
    expect(screen.getByText("Total Revenue")).toBeInTheDocument();
  });
});

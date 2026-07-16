import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import RoomsPage from "./RoomsPage.jsx";

describe("RoomsPage Smoke Test", () => {
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
      status: "Dirty",
    },
  ];

  it("renders room management title and room cards", () => {
    const handleStatusChange = vi.fn();
    render(
      <RoomsPage
        rooms={mockRooms}
        onStatusChange={handleStatusChange}
        userRole="Administrator"
      />,
    );
    expect(screen.getByText("Room Management")).toBeInTheDocument();
    expect(screen.getByText("Room 101")).toBeInTheDocument();
    expect(screen.getByText("Room 102")).toBeInTheDocument();
  });
});

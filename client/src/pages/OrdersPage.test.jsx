import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import OrdersPage from "./OrdersPage.jsx";
import { orderService } from "../services/api.js";

// Mock the api service
vi.mock("../services/api.js", () => ({
  orderService: {
    getOrders: vi.fn(),
    updateOrderStatus: vi.fn(),
  },
}));

describe("OrdersPage", () => {
  const mockOrders = [
    {
      id: "o1",
      restaurant_id: "r1",
      booking_id: "b1",
      total_price: "17.98",
      status: "Placed",
      notes: "No onions",
      created_at: "2026-07-21T06:40:46.259562+00:00",
      updated_at: "2026-07-21T06:40:46.259562+00:00",
      restaurant: { id: "r1", name: "Luigi's Pizzeria" },
      booking: {
        id: "b1",
        guest_name: "John Doe",
        room: { id: "rm1", room_number: "101" },
      },
      items: [
        {
          id: "oi1",
          menu_item_id: "m1",
          quantity: 1,
          price: "12.99",
          menu_item: { id: "m1", name: "Margherita Pizza" },
        },
        {
          id: "oi2",
          menu_item_id: "m2",
          quantity: 1,
          price: "4.99",
          menu_item: { id: "m2", name: "Garlic Bread" },
        },
      ],
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    orderService.getOrders.mockResolvedValue(mockOrders);
  });

  it("renders the page title and loads orders", async () => {
    render(<OrdersPage userRole="Administrator" />);

    expect(screen.getByText("Food Orders")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(
        "Search by Order ID, guest, or restaurant...",
      ),
    ).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("Luigi's Pizzeria")).toBeInTheDocument();
      expect(screen.getByText("John Doe")).toBeInTheDocument();
      expect(screen.getByText("Room 101")).toBeInTheDocument();
    });
  });

  it("filters orders by status", async () => {
    render(<OrdersPage userRole="Administrator" />);

    await waitFor(() => {
      expect(screen.getByText("Luigi's Pizzeria")).toBeInTheDocument();
    });

    const statusSelect = screen.getByRole("combobox");
    fireEvent.change(statusSelect, { target: { value: "Cancelled" } });

    expect(screen.queryByText("Luigi's Pizzeria")).not.toBeInTheDocument();
  });
});

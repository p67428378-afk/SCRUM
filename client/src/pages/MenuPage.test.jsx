import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import MenuPage from "./MenuPage.jsx";
import { restaurantService } from "../services/api.js";

// Mock the api service
vi.mock("../services/api.js", () => ({
  restaurantService: {
    getMenuItems: vi.fn(),
    createMenuItem: vi.fn(),
  },
  orderService: {
    createOrder: vi.fn(),
  },
}));

describe("MenuPage", () => {
  const mockRestaurant = {
    id: "1",
    name: "Luigi's Pizzeria",
    cuisine: "Italian",
    address: "123 Main St",
    phone_number: "555-1234",
    operating_hours: "11:00 AM - 10:00 PM",
  };

  const mockMenuItems = [
    {
      id: "m1",
      restaurant_id: "1",
      name: "Margherita Pizza",
      description: "Classic cheese and tomato pizza.",
      price: "12.99",
      category: "Pizza",
    },
    {
      id: "m2",
      restaurant_id: "1",
      name: "Garlic Bread",
      description: "Toasted bread with garlic butter.",
      price: "4.99",
      category: "Appetizer",
    },
  ];

  const mockBookings = [
    {
      id: "b1",
      guest_name: "John Doe",
      room: { room_number: "101" },
      status: "Checked In",
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    restaurantService.getMenuItems.mockResolvedValue(mockMenuItems);
  });

  it("renders the restaurant details and menu items", async () => {
    render(
      <MenuPage
        restaurant={mockRestaurant}
        onBack={vi.fn()}
        bookings={mockBookings}
        onPlaceOrder={vi.fn()}
        userRole="Administrator"
      />,
    );

    expect(screen.getByText("Luigi's Pizzeria")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("Margherita Pizza")).toBeInTheDocument();
      expect(screen.getByText("Garlic Bread")).toBeInTheDocument();
    });
  });

  it("adds items to the cart and displays them", async () => {
    render(
      <MenuPage
        restaurant={mockRestaurant}
        onBack={vi.fn()}
        bookings={mockBookings}
        onPlaceOrder={vi.fn()}
        userRole="Administrator"
      />,
    );

    await waitFor(() => {
      expect(screen.getByText("Margherita Pizza")).toBeInTheDocument();
    });

    const addButtons = screen.getAllByText("Add");
    fireEvent.click(addButtons[0]); // Add Margherita Pizza

    expect(screen.getByText("1 in Cart")).toBeInTheDocument();
    expect(screen.getByText("Your Order")).toBeInTheDocument();
  });
});

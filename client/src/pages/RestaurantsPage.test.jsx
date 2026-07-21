import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import RestaurantsPage from "./RestaurantsPage.jsx";
import { restaurantService } from "../services/api.js";

// Mock the api service
vi.mock("../services/api.js", () => ({
  restaurantService: {
    getRestaurants: vi.fn(),
    createRestaurant: vi.fn(),
  },
}));

describe("RestaurantsPage", () => {
  const mockRestaurants = [
    {
      id: "1",
      name: "Luigi's Pizzeria",
      cuisine: "Italian",
      address: "123 Main St",
      phone_number: "555-1234",
      operating_hours: "11:00 AM - 10:00 PM",
    },
    {
      id: "2",
      name: "Golden Dragon",
      cuisine: "Asian",
      address: "456 Oak Ave",
      phone_number: "555-5678",
      operating_hours: "12:00 PM - 9:30 PM",
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    restaurantService.getRestaurants.mockResolvedValue(mockRestaurants);
  });

  it("renders the page title and loads restaurants", async () => {
    render(
      <RestaurantsPage onSelectRestaurant={vi.fn()} userRole="Administrator" />,
    );

    expect(screen.getByText("Restaurant Directory")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Search by name or cuisine..."),
    ).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("Luigi's Pizzeria")).toBeInTheDocument();
      expect(screen.getByText("Golden Dragon")).toBeInTheDocument();
    });
  });

  it("filters restaurants by search term", async () => {
    render(
      <RestaurantsPage onSelectRestaurant={vi.fn()} userRole="Administrator" />,
    );

    await waitFor(() => {
      expect(screen.getByText("Luigi's Pizzeria")).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(
      "Search by name or cuisine...",
    );
    fireEvent.change(searchInput, { target: { value: "Luigi" } });

    expect(screen.getByText("Luigi's Pizzeria")).toBeInTheDocument();
    expect(screen.queryByText("Golden Dragon")).not.toBeInTheDocument();
  });

  it("opens the add restaurant modal for administrators", async () => {
    render(
      <RestaurantsPage onSelectRestaurant={vi.fn()} userRole="Administrator" />,
    );

    const addButton = screen.getByText("Add Restaurant");
    fireEvent.click(addButton);

    expect(screen.getByText("Add Partner Restaurant")).toBeInTheDocument();
  });
});

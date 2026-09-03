import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import MenuTable from "./MenuTable";

describe("MenuTable Component", () => {
  const mockItems = [
    {
      id: "m1",
      name: "Iced Coffee",
      category: "Beverages",
      price: 3.5,
      is_available: true,
    },
    {
      id: "m2",
      name: "Croissant",
      category: "Food",
      price: 4.0,
      is_available: false,
    },
  ];

  it("renders menu items and category filter tabs", () => {
    render(<MenuTable items={mockItems} />);
    expect(screen.getByText("Menu Catalog")).toBeInTheDocument();
    expect(screen.getByText("Iced Coffee")).toBeInTheDocument();
    expect(screen.getByText("Croissant")).toBeInTheDocument();
    expect(screen.getByText("In Stock")).toBeInTheDocument();
    expect(screen.getByText("Out of Stock")).toBeInTheDocument();
  });
});

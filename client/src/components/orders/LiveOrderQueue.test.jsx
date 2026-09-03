import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import LiveOrderQueue from "./LiveOrderQueue";

describe("LiveOrderQueue Component", () => {
  const mockOrders = [
    {
      id: "o1",
      order_number: "#101",
      table_number: 2,
      status: "Preparing",
      items: [{ quantity: 1, name: "Latte", unit_price: 4.5 }],
      total_price: 4.5,
    },
  ];

  it("renders order number, status badge, and item details", () => {
    render(<LiveOrderQueue orders={mockOrders} />);
    expect(screen.getByText("Live Order Queue")).toBeInTheDocument();
    expect(screen.getByText("#101")).toBeInTheDocument();
    expect(screen.getByText("Preparing")).toBeInTheDocument();
    expect(screen.getByText("Latte")).toBeInTheDocument();
  });
});

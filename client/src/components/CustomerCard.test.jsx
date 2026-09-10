import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import CustomerCard from "./CustomerCard";

describe("CustomerCard Component", () => {
  const mockCustomer = {
    id: "cst-1",
    full_name: "Jane Doe",
    email: "test@example.com",
    phone: "555-0199",
    loyalty_points: 150,
    notes: "Color Formula: 7/81",
    preferred_staff_name: "Sarah Jenkins",
  };

  it("renders customer name, loyalty points, and formulas", () => {
    render(<CustomerCard customer={mockCustomer} history={[]} />);
    expect(screen.getByText("Jane Doe")).toBeInTheDocument();
    expect(screen.getByText("150")).toBeInTheDocument();
    expect(screen.getByText(/VIP Client/i)).toBeInTheDocument();
  });
});

import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import PosPage from "../pages/PosPage";

vi.mock("../services/api", () => ({
  getTeas: vi
    .fn()
    .mockResolvedValue([
      {
        id: "1",
        name: "Jasmine Milk Tea",
        category: "Milk Tea",
        current_stock_grams: 1200,
        unit_price: 6.0,
      },
    ]),
  createOrder: vi
    .fn()
    .mockResolvedValue({
      id: "ord-123",
      order_number: "ORD-8492",
      status: "COMPLETED",
    }),
}));

describe("PosPage", () => {
  it("renders POS Portal header and 3 section workspace", () => {
    render(<PosPage />);
    expect(screen.getByText(/ZenTea POS Entry Portal/i)).toBeInTheDocument();
    expect(screen.getByText(/1. Select Tea Variety/i)).toBeInTheDocument();
    expect(screen.getByText(/2. Customization/i)).toBeInTheDocument();
    expect(screen.getByText(/3. Order Ticket/i)).toBeInTheDocument();
  });
});

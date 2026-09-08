import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import OrderHistory from "./OrderHistory";

describe("OrderHistory Component", () => {
  const mockOrders = [
    {
      id: "order-99887766-5544",
      status: "Shipped",
      subtotal: 94.48,
      tax_amount: 7.55,
      shipping_amount: 5.0,
      total_amount: 107.03,
      created_at: "2026-09-09T01:00:00Z",
      shipping_address: {
        full_name: "Alex Morgan",
        street_address: "123 Market St",
        city: "San Francisco",
        state: "CA",
        postal_code: "94105",
        country: "US",
      },
      order_items: [
        {
          id: "item-1",
          book_id: "book-1",
          quantity: 2,
          unit_price: 29.99,
          line_total: 59.98,
          book: {
            id: "book-1",
            title: "Clean Code",
            author: "Robert C. Martin",
            price: 29.99,
          },
        },
      ],
    },
  ];

  it("renders order summary and allows toggling itemized receipt", () => {
    render(<OrderHistory orders={mockOrders} loading={false} />);

    expect(screen.getByText(/Order #ORDER-99/i)).toBeInTheDocument();
    expect(screen.getByText("Shipped")).toBeInTheDocument();
    expect(screen.getByText("$107.03")).toBeInTheDocument();

    const viewReceiptBtn = screen.getByRole("button", {
      name: /view receipt/i,
    });
    fireEvent.click(viewReceiptBtn);

    expect(screen.getByText("Itemized Items")).toBeInTheDocument();
    expect(screen.getByText("Clean Code")).toBeInTheDocument();
  });

  it("renders empty order history message when orders array is empty", () => {
    render(<OrderHistory orders={[]} loading={false} />);

    expect(screen.getByText("No Orders Found")).toBeInTheDocument();
  });
});

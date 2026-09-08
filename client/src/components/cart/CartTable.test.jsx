import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import CartTable from "./CartTable";

describe("CartTable Component", () => {
  const mockItems = [
    {
      id: "item-1",
      cart_id: "cart-1",
      book_id: "book-1",
      quantity: 2,
      item_total: 59.98,
      book: {
        id: "book-1",
        title: "Clean Code",
        author: "Robert C. Martin",
        price: 29.99,
        stock_quantity: 15,
        cover_image: "",
      },
    },
  ];

  it("renders empty cart view when no items are present", () => {
    render(
      <BrowserRouter>
        <CartTable
          items={[]}
          onUpdateQuantity={vi.fn()}
          onRemoveItem={vi.fn()}
          onClearCart={vi.fn()}
          onProceedToCheckout={vi.fn()}
        />
      </BrowserRouter>,
    );

    expect(screen.getByText("Your Cart is Empty")).toBeInTheDocument();
    expect(screen.getByText("Browse Catalog")).toBeInTheDocument();
  });

  it("renders cart items and summary financial details correctly", () => {
    const handleUpdate = vi.fn();
    const handleRemove = vi.fn();
    const handleCheckout = vi.fn();

    render(
      <BrowserRouter>
        <CartTable
          items={mockItems}
          subtotal={59.98}
          tax={4.8}
          shipping={0}
          total={64.78}
          onUpdateQuantity={handleUpdate}
          onRemoveItem={handleRemove}
          onClearCart={vi.fn()}
          onProceedToCheckout={handleCheckout}
        />
      </BrowserRouter>,
    );

    expect(screen.getByText("Clean Code")).toBeInTheDocument();
    expect(screen.getAllByText("$59.98").length).toBeGreaterThan(0);
    expect(screen.getByText("FREE")).toBeInTheDocument();
    expect(screen.getByText("$64.78")).toBeInTheDocument();

    const checkoutBtn = screen.getByRole("button", {
      name: /proceed to checkout/i,
    });
    fireEvent.click(checkoutBtn);
    expect(handleCheckout).toHaveBeenCalled();
  });
});

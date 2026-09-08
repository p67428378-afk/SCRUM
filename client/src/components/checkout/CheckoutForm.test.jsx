import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import CheckoutForm from "./CheckoutForm";

describe("CheckoutForm Component", () => {
  const mockUser = {
    id: "user-123",
    full_name: "Alex Morgan",
    email: "alex@example.com",
  };

  const mockCart = {
    id: "cart-123",
    item_count: 2,
    subtotal: 59.98,
    estimated_tax: 4.8,
    estimated_shipping: 0,
    total_amount: 64.78,
  };

  it("renders shipping step with pre-filled inputs and moves to payment", () => {
    render(
      <CheckoutForm user={mockUser} cart={mockCart} onBackToCart={vi.fn()} />,
    );

    expect(screen.getByText("Shipping Address")).toBeInTheDocument();
    expect(screen.getByLabelText(/recipient full name/i)).toHaveValue(
      "Alex Morgan",
    );

    const continueBtn = screen.getByRole("button", {
      name: /continue to payment/i,
    });
    fireEvent.click(continueBtn);

    expect(screen.getByText("Payment Details")).toBeInTheDocument();
  });
});

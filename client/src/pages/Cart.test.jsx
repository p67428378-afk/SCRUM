import React from "react";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { describe, it, expect } from "vitest";
import Cart from "./Cart";
import { AuthProvider } from "../context/AuthContext";
import { CartProvider } from "../context/CartContext";

describe("Cart Page", () => {
  it("renders empty cart state when no items exist", () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <CartProvider>
            <Cart />
          </CartProvider>
        </AuthProvider>
      </BrowserRouter>,
    );

    expect(screen.getByText("Your Shopping Cart is Empty")).toBeInTheDocument();
    expect(screen.getByText("Explore Catalog")).toBeInTheDocument();
  });
});

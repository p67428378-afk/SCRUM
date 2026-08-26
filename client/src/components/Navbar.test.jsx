import React from "react";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { describe, it, expect } from "vitest";
import Navbar from "./Navbar";
import { AuthProvider } from "../context/AuthContext";
import { CartProvider } from "../context/CartContext";

describe("Navbar Component", () => {
  it("renders brand title and navigation links", () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <CartProvider>
            <Navbar />
          </CartProvider>
        </AuthProvider>
      </BrowserRouter>,
    );

    expect(screen.getByText("FurniCraft")).toBeInTheDocument();
    expect(screen.getByText("All Furniture")).toBeInTheDocument();
    expect(screen.getByText("Living Room")).toBeInTheDocument();
    expect(screen.getByText("Bedroom")).toBeInTheDocument();
    expect(screen.getByText("Office")).toBeInTheDocument();
    expect(screen.getByText("Dining")).toBeInTheDocument();
  });

  it("renders cart and wishlist navigation actions", () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <CartProvider>
            <Navbar />
          </CartProvider>
        </AuthProvider>
      </BrowserRouter>,
    );

    expect(screen.getByLabelText("Shopping Cart")).toBeInTheDocument();
    expect(screen.getByLabelText("Wishlist")).toBeInTheDocument();
  });
});

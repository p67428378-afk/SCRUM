import React from "react";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { describe, it, expect } from "vitest";
import Catalog from "./Catalog";
import { AuthProvider } from "../context/AuthContext";
import { CartProvider } from "../context/CartContext";

describe("Catalog Page", () => {
  it("renders search input and category filter headers", () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <CartProvider>
            <Catalog />
          </CartProvider>
        </AuthProvider>
      </BrowserRouter>,
    );

    expect(screen.getByText("Furniture Catalog")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(/Search sofas, dining tables, desks/i),
    ).toBeInTheDocument();
  });
});

import React from "react";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { describe, it, expect } from "vitest";
import ProductCard from "./ProductCard";
import { AuthProvider } from "../context/AuthContext";
import { CartProvider } from "../context/CartContext";

describe("ProductCard Component", () => {
  const mockProduct = {
    id: "prod-123",
    name: "Nordic Velvet 3-Seater Sofa",
    description: "Luxurious Scandinavian design sofa",
    price: 899.0,
    material: "Velvet",
    color: "Emerald Green",
    finish_options: ["Natural Oak", "Dark Walnut"],
    dimension_options: ['Standard (84" W)'],
    rating: 4.8,
    image_url: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc",
    stock_quantity: 15,
  };

  it("renders product name, price, and stock status", () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <CartProvider>
            <ProductCard product={mockProduct} />
          </CartProvider>
        </AuthProvider>
      </BrowserRouter>,
    );

    expect(screen.getByText("Nordic Velvet 3-Seater Sofa")).toBeInTheDocument();
    expect(screen.getByText("$899.00")).toBeInTheDocument();
    expect(screen.getByText("In Stock")).toBeInTheDocument();
  });

  it("renders Add button for in-stock items", () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <CartProvider>
            <ProductCard product={mockProduct} />
          </CartProvider>
        </AuthProvider>
      </BrowserRouter>,
    );

    expect(
      screen.getByRole("button", { name: /add to cart/i }),
    ).toBeInTheDocument();
  });
});

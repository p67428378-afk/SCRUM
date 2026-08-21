import React from "react";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "../context/AuthContext";
import { CartProvider } from "../context/CartContext";
import WishlistPage from "./WishlistPage";

describe("WishlistPage Component", () => {
  test("renders sign in prompt when user is not authenticated", () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <CartProvider>
            <WishlistPage />
          </CartProvider>
        </AuthProvider>
      </BrowserRouter>,
    );

    const promptText = screen.getByText(
      /Save Your Favorite Clothing & Accessories/i,
    );
    expect(promptText).toBeInTheDocument();
  });
});

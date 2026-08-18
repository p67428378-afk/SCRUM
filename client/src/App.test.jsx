import React from "react";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import App from "./App";

describe("App Component", () => {
  test("renders navigation header with brand title", () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <CartProvider>
            <App />
          </CartProvider>
        </AuthProvider>
      </BrowserRouter>,
    );

    const brandElement = screen.getByText(/THREAD & STYLE/i);
    expect(brandElement).toBeInTheDocument();
  });
});

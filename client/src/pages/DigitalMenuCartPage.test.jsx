import React from "react";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { describe, it, expect, vi } from "vitest";
import DigitalMenuCartPage from "./DigitalMenuCartPage";

describe("DigitalMenuCartPage", () => {
  it("renders hero title and menu filtering options", async () => {
    render(
      <BrowserRouter>
        <DigitalMenuCartPage
          cartItems={[]}
          onAddToCart={vi.fn()}
          onOpenCart={vi.fn()}
        />
      </BrowserRouter>,
    );

    expect(screen.getByText("Bandra Hotel Food Delivery")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(/Search Butter Chicken, Biryani/i),
    ).toBeInTheDocument();
    expect(screen.getByText("All Items")).toBeInTheDocument();
  });
});

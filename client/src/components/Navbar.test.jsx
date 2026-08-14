import React from "react";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { describe, it, expect } from "vitest";
import Navbar from "./layout/Navbar";

describe("Navbar Component", () => {
  it("renders brand title and navigation links", () => {
    render(
      <BrowserRouter>
        <Navbar brand="Bandra Hotel Delivery" cartCount={2} />
      </BrowserRouter>,
    );

    expect(screen.getByText("Bandra Hotel Delivery")).toBeInTheDocument();
    expect(screen.getByText("Digital Menu")).toBeInTheDocument();
    expect(screen.getByText("Staff Portal")).toBeInTheDocument();
    expect(screen.getByText("Cart")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
  });
});

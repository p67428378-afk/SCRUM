import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import App from "../App";

describe("App Component", () => {
  it("renders ZenTea header brand and main navigation links", () => {
    render(<App />);
    expect(screen.getByText(/ZenTea Management/i)).toBeInTheDocument();
    expect(screen.getByText(/Inventory Dashboard/i)).toBeInTheDocument();
    expect(screen.getByText(/POS Entry Portal/i)).toBeInTheDocument();
    expect(screen.getByText(/Recipes & Quality/i)).toBeInTheDocument();
  });

  it("renders test credentials notice banner", () => {
    render(<App />);
    expect(screen.getByText(/test@example.com/i)).toBeInTheDocument();
  });
});

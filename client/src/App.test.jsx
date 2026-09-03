import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import App from "./App";

describe("App Component", () => {
  it("renders the navbar and dashboard title without crashing", () => {
    render(<App />);
    expect(screen.getByText(/Artisan Cafe/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Cafe Overview & KPI Analytics/i),
    ).toBeInTheDocument();
  });
});

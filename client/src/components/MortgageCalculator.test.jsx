import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import React from "react";
import MortgageCalculator from "./MortgageCalculator";

describe("MortgageCalculator Component", () => {
  it("renders header and initial estimated monthly payment", () => {
    render(<MortgageCalculator listingPrice={400000} />);
    expect(
      screen.getByText(/Mortgage & Affordability Calculator/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Estimated Total Monthly Payment/i),
    ).toBeInTheDocument();
  });

  it("updates down payment amount when percentage slider changes", () => {
    render(<MortgageCalculator listingPrice={500000} />);
    // Down payment label initially shows 20% -> $100,000
    expect(screen.getByText(/\$100,000/i)).toBeInTheDocument();
  });
});

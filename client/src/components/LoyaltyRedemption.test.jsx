import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import LoyaltyRedemption from "./LoyaltyRedemption";

describe("LoyaltyRedemption Component", () => {
  const mockCustomer = {
    id: "cst-1",
    loyalty_points: 150,
  };

  it("renders reward tiers and voucher redemption button", () => {
    render(<LoyaltyRedemption customer={mockCustomer} />);
    expect(
      screen.getByText(/Loyalty Rewards & Voucher Redemption/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/\$10 Off Next Visit/i)).toBeInTheDocument();
  });
});

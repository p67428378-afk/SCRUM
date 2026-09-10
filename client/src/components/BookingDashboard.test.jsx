import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import BookingDashboard from "./BookingDashboard";

describe("BookingDashboard Component", () => {
  it("renders booking heading and policy banner", () => {
    render(<BookingDashboard />);
    expect(screen.getByText(/Book an Appointment/i)).toBeInTheDocument();
    expect(screen.getByText(/Salon Booking Policy/i)).toBeInTheDocument();
  });

  it("renders form inputs for service, staff, date, and customer", () => {
    render(<BookingDashboard />);
    expect(screen.getByText(/Select Service/i)).toBeInTheDocument();
    expect(screen.getByText(/Select Stylist \/ Staff/i)).toBeInTheDocument();
  });
});

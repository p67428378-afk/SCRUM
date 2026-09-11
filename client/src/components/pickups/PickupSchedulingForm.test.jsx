import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import PickupSchedulingForm from "./PickupSchedulingForm";

describe("PickupSchedulingForm Component", () => {
  it("renders form inputs correctly", () => {
    render(<PickupSchedulingForm />);

    expect(
      screen.getByText(/Schedule New Pickup Appointment/i),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", {
        name: /Confirm Appointment & Assign Tracking Code/i,
      }),
    ).toBeInTheDocument();
  });
});

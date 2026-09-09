import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import CitizenPortal from "./CitizenPortal";

vi.mock("../services/api", () => ({
  fetchCitizens: vi
    .fn()
    .mockResolvedValue([
      {
        id: "c1",
        full_name: "Jane Doe",
        email: "jane.doe@city.gov",
        phone: "555-0192",
        address: "123 Main St",
      },
    ]),
  createCitizen: vi.fn(),
}));

describe("CitizenPortal Component", () => {
  it("renders citizen registration form and directory", async () => {
    render(<CitizenPortal />);

    expect(
      screen.getByText(/Citizen Directory & Registration/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/Register Citizen Record/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/e.g. Jane Doe/i)).toBeInTheDocument();
  });
});

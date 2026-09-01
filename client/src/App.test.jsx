import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import App from "./App";

vi.mock("./services/api", () => ({
  getPatients: vi.fn().mockResolvedValue([]),
  searchPatients: vi.fn().mockResolvedValue([]),
  getAppointments: vi.fn().mockResolvedValue([]),
  getDoctors: vi.fn().mockResolvedValue([]),
}));

describe("App", () => {
  it("renders navbar and brand title", async () => {
    render(<App />);
    expect(await screen.findByText("CarePulse EHR")).toBeInTheDocument();
  });
});

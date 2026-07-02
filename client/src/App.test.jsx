import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import React from "react";
import App from "./App";

// Mock the API services
vi.mock("./services/api", () => ({
  registerAlert: vi.fn(),
  verifyOtp: vi.fn(),
  getActiveAlerts: vi.fn(() => Promise.resolve([])),
}));

describe("App Component Smoke Test", () => {
  it("renders the main layout and title", async () => {
    render(<App />);
    expect(screen.getByText("Debit Card Spend Alerts")).toBeInTheDocument();
    expect(screen.getByText("Vertex Bank")).toBeInTheDocument();
  });
});

import React from "react";
import { render, screen } from "@testing-library/react";
import { vi, describe, it, expect } from "vitest";
import App from "./App.jsx";

// Mock the API services
vi.mock("./services/api.js", () => ({
  getResident: vi.fn().mockResolvedValue({
    id: "11111111-1111-1111-1111-111111111111",
    name: "John Doe",
    email: "john.doe@example.com",
    phone_number: "+1 (555) 019-2834",
    apartment_number: "A-402",
    family_members: [],
  }),
  updateResident: vi.fn(),
  getBills: vi.fn().mockResolvedValue([]),
  makePayment: vi.fn(),
  getAnnouncements: vi.fn().mockResolvedValue([]),
  getDiscussions: vi.fn().mockResolvedValue([]),
  postComment: vi.fn(),
  getFacilities: vi.fn().mockResolvedValue([]),
  bookFacility: vi.fn(),
  getBookings: vi.fn().mockResolvedValue([]),
  preApproveVisitor: vi.fn(),
  getVisitorLog: vi.fn().mockResolvedValue([]),
  createMaintenanceRequest: vi.fn(),
  getMaintenanceRequests: vi.fn().mockResolvedValue([]),
}));

describe("App Smoke Test", () => {
  it("renders the application and sidebar logo", async () => {
    render(<App />);

    // Check if the logo is present
    const logoElement = screen.getByText("ResiEase");
    expect(logoElement).toBeInTheDocument();

    // Check if the main navigation items are present
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Profile")).toBeInTheDocument();
    expect(screen.getByText("Maintenance")).toBeInTheDocument();
    expect(screen.getByText("Payments")).toBeInTheDocument();
    expect(screen.getByText("Facilities")).toBeInTheDocument();
    expect(screen.getByText("Visitors")).toBeInTheDocument();
  });
});

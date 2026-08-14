import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import AdminDashboard from "./AdminDashboard";

// Mock the API calls
vi.mock("../services/api", () => ({
  getAuditLogs: vi.fn(() => Promise.resolve({ logs: [], total: 0 })),
  getDashboardUsers: vi.fn(() => Promise.resolve({ users: [], total: 0 })),
}));

describe("AdminDashboard Component", () => {
  it("renders dashboard widgets", () => {
    render(<AdminDashboard onNavigate={vi.fn()} />);
    expect(screen.getByText("Security Status")).toBeInTheDocument();
    expect(screen.getByText("Active Users")).toBeInTheDocument();
    expect(screen.getByText("Pending Approvals")).toBeInTheDocument();
  });
});

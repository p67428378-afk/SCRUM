import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import App from "./App.jsx";

// Mock the API calls
vi.mock("./services/api.js", () => ({
  getTodos: vi.fn(() => Promise.resolve([])),
  createTodo: vi.fn(() => Promise.resolve({})),
  updateTodo: vi.fn(() => Promise.resolve({})),
  deleteTodo: vi.fn(() => Promise.resolve({})),
}));

describe("App Smoke Test", () => {
  it("renders without crashing", async () => {
    render(<App />);

    // Check if the main brand title is present
    const brandTitle = screen.getAllByText("TaskMaster");
    expect(brandTitle.length).toBeGreaterThan(0);

    // Check if the Dashboard heading is present
    const dashboardHeading = screen.getAllByText("Dashboard");
    expect(dashboardHeading.length).toBeGreaterThan(0);
  });
});

import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import React from "react";
import App from "./App.jsx";

describe("App Component", () => {
  it("renders VillageOS branding and main dashboard title", () => {
    render(<App />);
    const brandElements = screen.getAllByText(/VillageOS/i);
    expect(brandElements.length).toBeGreaterThan(0);
    expect(
      screen.getByText(/Village Community Dashboard/i),
    ).toBeInTheDocument();
  });

  it("renders navigation links", () => {
    render(<App />);
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Directory")).toBeInTheDocument();
    expect(screen.getByText("Facilities")).toBeInTheDocument();
    expect(screen.getByText("Announcements")).toBeInTheDocument();
    expect(screen.getByText("Service Requests")).toBeInTheDocument();
  });
});

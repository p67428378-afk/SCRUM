import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import App from "./App";
import StatCard from "./components/common/StatCard";
import StatusBadge from "./components/common/StatusBadge";
import AlertBanner from "./components/common/AlertBanner";
import TopNavbar from "./components/layout/TopNavbar";
import { BrowserRouter } from "react-router-dom";

describe("Farm Management System - Common Components", () => {
  it("renders StatCard correctly with title and value", () => {
    render(
      <StatCard
        title="Active Crop Cycles"
        value="4"
        subtitle="4 Parcels Planted"
      />,
    );
    expect(screen.getByText("Active Crop Cycles")).toBeInTheDocument();
    expect(screen.getByText("4")).toBeInTheDocument();
  });

  it("renders StatusBadge with expected label", () => {
    render(<StatusBadge status="Optimal" />);
    expect(screen.getByText("Optimal")).toBeInTheDocument();
  });

  it("renders AlertBanner with message", () => {
    render(
      <AlertBanner
        type="warning"
        title="Test Warning"
        message="Check soil moisture level."
      />,
    );
    expect(screen.getByText("Test Warning")).toBeInTheDocument();
    expect(screen.getByText("Check soil moisture level.")).toBeInTheDocument();
  });

  it("renders TopNavbar brand title", () => {
    render(
      <BrowserRouter>
        <TopNavbar />
      </BrowserRouter>,
    );
    expect(screen.getByText("AgriCore")).toBeInTheDocument();
  });

  it("mounts full App without throwing errors", () => {
    render(<App />);
    expect(screen.getByText("Farm Operations Dashboard")).toBeInTheDocument();
  });
});

import React from "react";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { describe, it, expect } from "vitest";
import Sidebar from "./Sidebar";

describe("Sidebar Component", () => {
  it("renders the logo and navigation links", () => {
    render(
      <BrowserRouter>
        <Sidebar />
      </BrowserRouter>,
    );

    expect(screen.getByText("AuraJewel")).toBeInTheDocument();
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Inventory")).toBeInTheDocument();
    expect(screen.getByText("Logout")).toBeInTheDocument();
  });
});

import React from "react";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { describe, it, expect } from "vitest";
import App from "./App";

describe("App Component Navigation", () => {
  it("renders brand title and navigation links", () => {
    render(
      <BrowserRouter>
        <App />
      </BrowserRouter>,
    );

    expect(screen.getByText("Glow & Grace")).toBeInTheDocument();
    expect(screen.getByText("Appointments")).toBeInTheDocument();
    expect(screen.getByText("Staff & Schedules")).toBeInTheDocument();
    expect(screen.getByText("Customers & Loyalty")).toBeInTheDocument();
  });
});

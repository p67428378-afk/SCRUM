import React from "react";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { describe, it, expect } from "vitest";
import Navbar from "./Navbar";

describe("Navbar", () => {
  it("renders navigation links", () => {
    render(
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>,
    );

    expect(screen.getByText("CarePulse EHR")).toBeInTheDocument();
    expect(screen.getByText("Patients")).toBeInTheDocument();
    expect(screen.getByText("Appointments")).toBeInTheDocument();
  });
});

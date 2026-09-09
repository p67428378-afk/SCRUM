import React from "react";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { describe, it, expect } from "vitest";
import Navbar from "../Navbar";

describe("Navbar Component", () => {
  it("renders branding and section links", () => {
    render(
      <BrowserRouter>
        <Navbar activeSection="profile" />
      </BrowserRouter>,
    );

    expect(screen.getByText(/Spotlight/i)).toBeInTheDocument();
    expect(screen.getByText(/Profile & Bio/i)).toBeInTheDocument();
    expect(screen.getByText(/Media & Headshots/i)).toBeInTheDocument();
    expect(screen.getByText(/Filmography Credits/i)).toBeInTheDocument();
    expect(screen.getByText(/View Public Portfolio/i)).toBeInTheDocument();
  });
});

import React from "react";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { describe, it, expect, vi } from "vitest";
import Navbar from "./Navbar";

describe("Navbar Component", () => {
  it("renders brand logo and links", () => {
    render(
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>,
    );

    expect(screen.getByText("PurrfectMatch")).toBeInTheDocument();
    expect(screen.getByText("Browse Cats")).toBeInTheDocument();
  });
});

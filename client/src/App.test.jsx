import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import App from "./App";

describe("App Component", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("renders login page when unauthenticated", async () => {
    render(<App />);
    expect(
      await screen.findByText(/Welcome back|Sign In/i),
    ).toBeInTheDocument();
  });
});

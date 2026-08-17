import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import React from "react";
import App from "./App";

describe("App Smoke Test", () => {
  it("renders login page when unauthenticated", async () => {
    render(<App />);
    expect(screen.getByText(/Attendance Hub/i)).toBeInTheDocument();
  });
});

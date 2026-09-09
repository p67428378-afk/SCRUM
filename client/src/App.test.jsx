import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import App from "./App";

describe("App Component", () => {
  it("renders application navigation and root view without throwing", () => {
    render(<App />);
    expect(screen.getByText(/Athenaeum Archives/i)).toBeInTheDocument();
  });
});

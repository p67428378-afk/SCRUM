import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import App from "./App";

describe("App Root Integration", () => {
  it("mounts without crashing and displays header brand and catalog", () => {
    render(<App />);

    expect(screen.getAllByText("Book Haven").length).toBeGreaterThan(0);
    expect(
      screen.getByText(/Explore Our Curated Bookstore Catalog/i),
    ).toBeInTheDocument();
  });
});

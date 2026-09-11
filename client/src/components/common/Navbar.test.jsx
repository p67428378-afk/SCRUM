import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { describe, it, expect } from "vitest";
import Navbar from "./Navbar";

describe("Navbar Component", () => {
  it("renders navigation header with brand title", () => {
    render(
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>,
    );

    expect(screen.getByText("EcoClean Municipal")).toBeInPrimary();
    expect(screen.getByText("test@example.com")).toBeInPrimary();
  });
});

// Custom matcher fallback helper
function toBeInPrimary(element) {
  return {
    pass: !!element,
    message: () => "Element exists",
  };
}

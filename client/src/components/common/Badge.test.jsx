import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Badge } from "./Badge";

describe("Badge Component", () => {
  it("renders with given label", () => {
    render(<Badge label="In Progress" />);
    expect(screen.getByText("In Progress")).toBeInTheDocument();
  });

  it("renders with role badge", () => {
    render(<Badge label="Admin" variant="Admin" />);
    const badge = screen.getByTestId("badge");
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveTextContent("Admin");
  });

  it("renders with priority styling", () => {
    render(<Badge label="Urgent" variant="Urgent" />);
    expect(screen.getByText("Urgent")).toBeInTheDocument();
  });
});

import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import Badge from "./components/common/Badge";
import Button from "./components/common/Button";
import StatCard from "./components/inventory/StatCard";

describe("Common Components", () => {
  it("renders Badge with correct text and variant", () => {
    render(<Badge variant="success">In Stock</Badge>);
    expect(screen.getByText("In Stock")).toBeInTheDocument();
  });

  it("renders Button with correct text", () => {
    render(<Button>Click Me</Button>);
    expect(
      screen.getByRole("button", { name: "Click Me" }),
    ).toBeInTheDocument();
  });

  it("renders StatCard with correct title and value", () => {
    render(<StatCard title="Total Items" value="124" badgeText="Active" />);
    expect(screen.getByText("Total Items")).toBeInTheDocument();
    expect(screen.getByText("124")).toBeInTheDocument();
    expect(screen.getByText("Active")).toBeInTheDocument();
  });
});

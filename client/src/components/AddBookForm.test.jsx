import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { AddBookForm } from "./AddBookForm";

describe("AddBookForm Component", () => {
  it("renders all required form fields", () => {
    render(<AddBookForm />);

    expect(
      screen.getByPlaceholderText(/Clean Architecture/i),
    ).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText(/Robert C. Martin/i),
    ).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/9780134494166/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /Save Book to Catalog/i }),
    ).toBeInTheDocument();
  });
});

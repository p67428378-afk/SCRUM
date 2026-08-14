import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import AuthForm from "./AuthForm";

describe("AuthForm Component", () => {
  it("renders sign in tab and input fields by default", () => {
    render(<AuthForm onAuthSuccess={vi.fn()} />);

    expect(screen.getByPlaceholderText("user@example.com")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("••••••••")).toBeInTheDocument();
  });
});

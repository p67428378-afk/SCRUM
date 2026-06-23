import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect, vi } from "vitest";
import LoginPage from "./LoginPage";

describe("LoginPage Component", () => {
  it("renders login form fields", () => {
    render(
      <MemoryRouter>
        <LoginPage onLoginSuccess={vi.fn()} />
      </MemoryRouter>,
    );

    expect(screen.getByLabelText("Email Address")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Sign In" })).toBeInTheDocument();
  });
});

import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect } from "vitest";
import { AuthCard } from "./AuthCard";
import { AuthProvider } from "../context/AuthContext";

describe("AuthCard Component", () => {
  it("renders sign in tab with test accounts note", () => {
    render(
      <AuthProvider>
        <MemoryRouter>
          <AuthCard />
        </MemoryRouter>
      </AuthProvider>,
    );

    expect(
      screen.getByRole("button", { name: /Sign In to Account/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/test@example.com/i)).toBeInTheDocument();
    expect(screen.getByText(/Quick Demo Accounts/i)).toBeInTheDocument();
  });
});

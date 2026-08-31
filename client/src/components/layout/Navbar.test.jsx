import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { BrowserRouter } from "react-router-dom";
import { Navbar } from "./Navbar";
import AuthContext from "../../context/AuthContext";

const renderWithAuth = (user = null) => {
  const authValue = {
    user,
    token: user ? "fake-token" : null,
    loading: false,
    isAdmin: user?.role === "Admin",
    login: vi.fn(),
    logout: vi.fn(),
    register: vi.fn(),
  };

  return render(
    <AuthContext.Provider value={authValue}>
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>
    </AuthContext.Provider>,
  );
};

describe("Navbar Component", () => {
  it("renders brand name", () => {
    renderWithAuth(null);
    expect(screen.getByText("TeamFlow")).toBeInTheDocument();
  });

  it("renders user details and logout when logged in", () => {
    const mockUser = {
      id: "u1",
      email: "test@example.com",
      full_name: "Test User",
      role: "Member",
    };
    renderWithAuth(mockUser);
    expect(screen.getByText("Test User")).toBeInTheDocument();
    expect(screen.getByText("Logout")).toBeInTheDocument();
  });

  it("renders Login link when unauthenticated", () => {
    renderWithAuth(null);
    expect(screen.getByText("Login")).toBeInTheDocument();
  });
});

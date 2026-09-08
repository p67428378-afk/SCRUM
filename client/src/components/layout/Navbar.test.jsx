import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import Navbar from "./Navbar";

describe("Navbar Component", () => {
  it("renders branding and navigation elements", () => {
    render(
      <BrowserRouter>
        <Navbar
          user={null}
          cartCount={3}
          onOpenAuth={vi.fn()}
          onLogout={vi.fn()}
        />
      </BrowserRouter>,
    );

    expect(screen.getByText("Book Haven")).toBeInTheDocument();
    expect(screen.getByText("Catalog")).toBeInTheDocument();
    expect(screen.getAllByText("3").length).toBeGreaterThan(0);
  });

  it("shows Sign In button when user is not logged in and triggers onOpenAuth", () => {
    const handleOpenAuth = vi.fn();
    render(
      <BrowserRouter>
        <Navbar
          user={null}
          cartCount={0}
          onOpenAuth={handleOpenAuth}
          onLogout={vi.fn()}
        />
      </BrowserRouter>,
    );

    const signInBtn = screen.getByRole("button", { name: /sign in/i });
    expect(signInBtn).toBeInTheDocument();
    fireEvent.click(signInBtn);
    expect(handleOpenAuth).toHaveBeenCalledWith("login");
  });

  it("displays user profile name and triggers logout when logged in", () => {
    const handleLogout = vi.fn();
    const mockUser = {
      id: "u1",
      full_name: "Alex Morgan",
      email: "alex@example.com",
      role: "user",
    };

    render(
      <BrowserRouter>
        <Navbar
          user={mockUser}
          cartCount={1}
          onOpenAuth={vi.fn()}
          onLogout={handleLogout}
        />
      </BrowserRouter>,
    );

    expect(screen.getByText("Alex Morgan")).toBeInTheDocument();
    const logoutBtn = screen.getByRole("button", { name: /sign out/i });
    fireEvent.click(logoutBtn);
    expect(handleLogout).toHaveBeenCalled();
  });
});

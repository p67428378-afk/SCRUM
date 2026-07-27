import React from "react";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { describe, it, expect, vi } from "vitest";
import Sidebar from "./Sidebar";

describe("Sidebar Component", () => {
  const mockUser = {
    username: "testuser",
    role: "customer",
  };

  it("renders sidebar with brand name and menu items", () => {
    render(
      <BrowserRouter>
        <Sidebar user={mockUser} onNewTransaction={vi.fn()} />
      </BrowserRouter>,
    );

    expect(screen.getByText("Apex Bank")).toBeInTheDocument();
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Accounts")).toBeInTheDocument();
    expect(screen.getByText("Transfers")).toBeInTheDocument();
  });

  it("renders admin support link only for admin users", () => {
    const { rerender } = render(
      <BrowserRouter>
        <Sidebar user={mockUser} onNewTransaction={vi.fn()} />
      </BrowserRouter>,
    );

    expect(screen.queryByText("Admin Support")).not.toBeInTheDocument();

    const adminUser = { username: "adminuser", role: "admin" };
    rerender(
      <BrowserRouter>
        <Sidebar user={adminUser} onNewTransaction={vi.fn()} />
      </BrowserRouter>,
    );

    expect(screen.getByText("Admin Support")).toBeInTheDocument();
  });
});

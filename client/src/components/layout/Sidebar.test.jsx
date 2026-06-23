import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect, vi } from "vitest";
import Sidebar from "./Sidebar";

describe("Sidebar Component", () => {
  const mockStudent = {
    first_name: "Alex",
    last_name: "Rivera",
    email: "alex@apex.edu",
    profile_picture_url: "",
  };

  it("renders university branding and student name", () => {
    render(
      <MemoryRouter>
        <Sidebar student={mockStudent} onLogout={vi.fn()} />
      </MemoryRouter>,
    );

    expect(screen.getByText("Apex University")).toBeInTheDocument();
    expect(screen.getByText("Alex Rivera")).toBeInTheDocument();
  });

  it("renders navigation links", () => {
    render(
      <MemoryRouter>
        <Sidebar student={mockStudent} onLogout={vi.fn()} />
      </MemoryRouter>,
    );

    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Profile Settings")).toBeInTheDocument();
  });
});

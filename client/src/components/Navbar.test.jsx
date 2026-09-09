import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect, vi } from "vitest";
import { Navbar } from "./Navbar";
import { AuthProvider } from "../context/AuthContext";

describe("Navbar Component", () => {
  it("renders brand logo and title", () => {
    render(
      <AuthProvider>
        <MemoryRouter>
          <Navbar />
        </MemoryRouter>
      </AuthProvider>,
    );

    expect(screen.getByText(/Athenaeum Archives/i)).toBeInTheDocument();
    expect(screen.getByText(/Library Management System/i)).toBeInTheDocument();
    expect(screen.getByText(/Book Catalog/i)).toBeInTheDocument();
  });

  it("renders Sign In button when unauthenticated", () => {
    render(
      <AuthProvider>
        <MemoryRouter>
          <Navbar />
        </MemoryRouter>
      </AuthProvider>,
    );

    expect(screen.getByText(/Sign In \/ Register/i)).toBeInTheDocument();
  });
});

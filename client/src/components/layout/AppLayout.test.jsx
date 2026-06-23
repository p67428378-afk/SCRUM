import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect, vi } from "vitest";
import AppLayout from "./AppLayout";

describe("AppLayout Component", () => {
  const mockStudent = {
    first_name: "Alex",
    last_name: "Rivera",
    profile_picture_url: "",
  };

  it("renders children inside layout", () => {
    render(
      <MemoryRouter>
        <AppLayout student={mockStudent} onLogout={vi.fn()}>
          <div data-testid="test-child">Dashboard Content</div>
        </AppLayout>
      </MemoryRouter>,
    );

    expect(screen.getByTestId("test-child")).toBeInTheDocument();
    expect(screen.getByText("Apex University")).toBeInTheDocument();
  });
});

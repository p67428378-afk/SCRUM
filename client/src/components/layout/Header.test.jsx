import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { describe, it, expect } from "vitest";
import Header from "./Header";

describe("Header Component", () => {
  const mockStudent = {
    first_name: "Alex",
    last_name: "Rivera",
    profile_picture_url: "",
  };

  it("renders breadcrumbs and search input", () => {
    render(
      <MemoryRouter initialEntries={["/dashboard"]}>
        <Header student={mockStudent} />
      </MemoryRouter>,
    );

    expect(screen.getByText("Student Portal / Dashboard")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("Search courses, assignments..."),
    ).toBeInTheDocument();
  });
});

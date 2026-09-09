import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import CreditsTable from "../CreditsTable";

describe("CreditsTable Component", () => {
  const mockCredits = [
    {
      id: "c1",
      category: "Film",
      production_name: "Hamlet",
      role_name: "Hamlet (Lead)",
      director: "Jane Doe",
      year: 2024,
    },
  ];

  it("renders credit entries and allows opening modal", () => {
    render(
      <CreditsTable
        credits={mockCredits}
        onAddCredit={vi.fn()}
        onDeleteCredit={vi.fn()}
      />,
    );

    expect(screen.getByText("Hamlet")).toBeInTheDocument();
    expect(screen.getByText("Hamlet (Lead)")).toBeInTheDocument();

    const addButton = screen.getByText(/Add Credit/i);
    fireEvent.click(addButton);

    expect(screen.getByText(/Add New Credit Entry/i)).toBeInTheDocument();
  });
});

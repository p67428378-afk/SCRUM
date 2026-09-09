import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import ProfileEditor from "../ProfileEditor";

describe("ProfileEditor Component", () => {
  it("renders form fields with initial values and validates input", () => {
    const handleSave = vi.fn();
    render(<ProfileEditor onSave={handleSave} isLoading={false} />);

    expect(screen.getByDisplayValue("John Doe")).toBeInTheDocument();
    expect(
      screen.getByText(/Physical Attributes & Location/i),
    ).toBeInTheDocument();

    const saveButton = screen.getByText(/Save Profile Changes/i);
    expect(saveButton).toBeInTheDocument();
  });

  it("displays error message when bio is cleared and submitted", () => {
    render(<ProfileEditor onSave={vi.fn()} isLoading={false} />);

    const bioInput = screen.getByPlaceholderText(
      /Provide a detailed biography/i,
    );
    fireEvent.change(bioInput, { target: { value: "" } });

    const saveButton = screen.getByText(/Save Profile Changes/i);
    fireEvent.click(saveButton);

    expect(
      screen.getByText(/Professional bio cannot be empty/i),
    ).toBeInTheDocument();
  });
});

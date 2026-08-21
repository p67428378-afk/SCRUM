import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { vi, describe, it, expect, beforeEach } from "vitest";
import AddRecipeForm from "./AddRecipeForm";
import * as api from "../services/api";

// Mock the API service
vi.mock("../services/api", () => ({
  createRecipe: vi.fn(),
}));

describe("AddRecipeForm Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders form fields correctly", () => {
    render(
      <BrowserRouter>
        <AddRecipeForm />
      </BrowserRouter>,
    );

    expect(screen.getByLabelText(/Recipe Title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Prep Time/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Cook Time/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Servings/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Instructions/i)).toBeInTheDocument();
  });

  it("shows validation error when required fields are empty", async () => {
    render(
      <BrowserRouter>
        <AddRecipeForm />
      </BrowserRouter>,
    );

    const saveButton = screen.getByRole("button", { name: /Save Recipe/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText(/All fields are required./i)).toBeInTheDocument();
    });
  });

  it("shows validation error when negative numbers are entered", async () => {
    render(
      <BrowserRouter>
        <AddRecipeForm />
      </BrowserRouter>,
    );

    // Fill in text fields
    fireEvent.change(screen.getByLabelText(/Recipe Title/i), {
      target: { value: "Test Recipe" },
    });
    fireEvent.change(screen.getByLabelText(/Description/i), {
      target: { value: "Test Description" },
    });
    fireEvent.change(screen.getByLabelText(/Instructions/i), {
      target: { value: "Test Instructions" },
    });

    // Fill in negative numbers
    fireEvent.change(screen.getByLabelText(/Prep Time/i), {
      target: { value: "-10" },
    });
    fireEvent.change(screen.getByLabelText(/Cook Time/i), {
      target: { value: "15" },
    });
    fireEvent.change(screen.getByLabelText(/Servings/i), {
      target: { value: "4" },
    });

    const saveButton = screen.getByRole("button", { name: /Save Recipe/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(
        screen.getByText(/Please enter a valid positive number./i),
      ).toBeInTheDocument();
    });
  });
});

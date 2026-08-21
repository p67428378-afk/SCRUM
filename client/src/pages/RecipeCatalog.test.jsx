import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { vi, describe, it, expect, beforeEach } from "vitest";
import RecipeCatalog from "./RecipeCatalog";
import * as api from "../services/api";

// Mock the API service
vi.mock("../services/api", () => ({
  getRecipes: vi.fn(),
  deleteRecipe: vi.fn(),
}));

describe("RecipeCatalog Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders loading state initially", async () => {
    api.getRecipes.mockReturnValue(new Promise(() => {})); // Never resolves to keep loading state
    render(
      <BrowserRouter>
        <RecipeCatalog />
      </BrowserRouter>,
    );
    expect(screen.getByText(/Loading recipes.../i)).toBeInTheDocument();
  });

  it("renders empty state when no recipes are returned", async () => {
    api.getRecipes.mockResolvedValue([]);
    render(
      <BrowserRouter>
        <RecipeCatalog />
      </BrowserRouter>,
    );
    await waitFor(() => {
      expect(
        screen.getByText(/No recipes found. Be the first to add one!/i),
      ).toBeInTheDocument();
    });
  });

  it("renders recipe cards when recipes are returned", async () => {
    const mockRecipes = [
      {
        id: "1",
        title: "Spaghetti Carbonara",
        description: "Classic Roman pasta dish",
        prep_time: 10,
        cook_time: 15,
        servings: 4,
      },
    ];
    api.getRecipes.mockResolvedValue(mockRecipes);

    render(
      <BrowserRouter>
        <RecipeCatalog />
      </BrowserRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText("Spaghetti Carbonara")).toBeInTheDocument();
      expect(screen.getByText("Classic Roman pasta dish")).toBeInTheDocument();
    });
  });
});

import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { vi, describe, it, expect, beforeEach } from "vitest";
import RecipeDetail from "./RecipeDetail";
import * as api from "../services/api";

// Mock the API service
vi.mock("../services/api", () => ({
  getRecipe: vi.fn(),
  deleteRecipe: vi.fn(),
}));

// Mock react-router-dom useParams
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useParams: () => ({ id: "1" }),
    useNavigate: () => vi.fn(),
  };
});

describe("RecipeDetail Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders loading state initially", async () => {
    api.getRecipe.mockReturnValue(new Promise(() => {}));
    render(
      <BrowserRouter>
        <RecipeDetail />
      </BrowserRouter>,
    );
    expect(screen.getByText(/Loading recipe details.../i)).toBeInTheDocument();
  });

  it("renders error state when recipe is not found", async () => {
    const error = new Error("Not Found");
    error.response = { status: 404 };
    api.getRecipe.mockRejectedValue(error);

    render(
      <BrowserRouter>
        <RecipeDetail />
      </BrowserRouter>,
    );

    await waitFor(() => {
      expect(screen.getByText(/Recipe not found./i)).toBeInTheDocument();
    });
  });

  it("renders recipe details when recipe is returned", async () => {
    const mockRecipe = {
      id: "1",
      title: "Spaghetti Carbonara",
      description: "Classic Roman pasta dish",
      prep_time: 10,
      cook_time: 15,
      servings: 4,
      instructions: "Cook pasta. Crisp guanciale. Whisk eggs. Combine.",
      ingredients: [
        {
          id: "i1",
          recipe_id: "1",
          name: "Spaghetti",
          quantity: "400",
          unit: "g",
        },
      ],
    };
    api.getRecipe.mockResolvedValue(mockRecipe);

    render(
      <BrowserRouter>
        <RecipeDetail />
      </BrowserRouter>,
    );

    await waitFor(() => {
      // Use getAllByText because Spaghetti Carbonara is in both breadcrumbs and heading
      expect(screen.getAllByText("Spaghetti Carbonara")[0]).toBeInTheDocument();
      expect(screen.getByText("Classic Roman pasta dish")).toBeInTheDocument();
      expect(screen.getByText("Spaghetti")).toBeInTheDocument();
    });
  });
});

import React from "react";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { describe, it, expect } from "vitest";
import CatCard from "./CatCard";

describe("CatCard Component", () => {
  const mockCat = {
    id: "123",
    name: "Luna",
    breed: "Siamese",
    age_months: 4,
    gender: "Female",
    price: 350.0,
    description: "A lovely and healthy companion looking for a warm home.",
    status: "Available",
    image_url: null,
  };

  it("renders cat details correctly", () => {
    render(
      <BrowserRouter>
        <CatCard cat={mockCat} />
      </BrowserRouter>,
    );

    expect(screen.getByText("Luna")).toBeInTheDocument();
    expect(screen.getByText("$350.00")).toBeInTheDocument();
    expect(screen.getByText("Siamese")).toBeInTheDocument();
    expect(screen.getByText("Female")).toBeInTheDocument();
    expect(screen.getByText("4 months")).toBeInTheDocument();
    expect(screen.getByText("Available")).toBeInTheDocument();
  });
});

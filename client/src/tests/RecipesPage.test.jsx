import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import RecipesPage from "../pages/RecipesPage";

vi.mock("../services/api", () => ({
  getRecipes: vi.fn().mockResolvedValue([
    {
      id: "r1",
      tea_id: "1",
      tea_name: "Sencha Green Tea",
      steep_temperature_c: 80,
      steep_time_seconds: 120,
      leaf_water_ratio_g_per_ml: "5g / 250ml",
      instructions: "Pre-heat gaiwan vessel.",
    },
  ]),
  getQualityLogs: vi.fn().mockResolvedValue([]),
  getTeas: vi.fn().mockResolvedValue([]),
  logQuality: vi.fn().mockResolvedValue({ id: "log-1", status: "success" }),
}));

describe("RecipesPage", () => {
  it("renders recipe guide header and quality feedback form", () => {
    render(<RecipesPage />);
    expect(
      screen.getByText(/Brewing Recipe Guide & Quality Control/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Brewing Quality Feedback Form/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Brewing Quality Audit Log History/i),
    ).toBeInTheDocument();
  });
});

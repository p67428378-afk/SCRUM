import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import ContinentsDashboardPage from "./ContinentsDashboardPage.jsx";
import * as api from "../services/api.js";
import { vi } from "vitest";

vi.mock("../services/api.js", () => ({
  getContinents: vi.fn(() =>
    Promise.resolve([
      {
        id: "1",
        name: "Asia",
        code: "AS",
        country_count: 5,
        total_portfolio_assets_usd: 1000000,
      },
    ]),
  ),
  getCountries: vi.fn(() =>
    Promise.resolve([
      { id: "c1", name: "Japan", code: "JP", portfolio_status: "Active" },
    ]),
  ),
}));

describe("ContinentsDashboardPage component", () => {
  test("renders dashboard heading and stat cards", async () => {
    render(
      <MemoryRouter>
        <ContinentsDashboardPage />
      </MemoryRouter>,
    );

    expect(
      screen.getByText(/Continents Portfolio Overview/i),
    ).toBeInTheDocument();
    expect(await screen.findByText("Asia")).toBeInTheDocument();
  });
});

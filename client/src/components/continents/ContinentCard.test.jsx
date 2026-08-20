import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import ContinentCard from "./ContinentCard.jsx";

describe("ContinentCard component", () => {
  test("renders continent details and explore button", () => {
    const continent = {
      id: "cont-1",
      name: "Europe",
      code: "EU",
      country_count: 12,
      total_portfolio_assets_usd: 5000000,
    };

    render(
      <MemoryRouter>
        <ContinentCard continent={continent} />
      </MemoryRouter>,
    );

    expect(screen.getByText("Europe")).toBeInTheDocument();
    expect(screen.getByText("EU")).toBeInTheDocument();
    expect(screen.getByText("12")).toBeInTheDocument();
    expect(screen.getByText("Explore Countries")).toBeInTheDocument();
  });
});

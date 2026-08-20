import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { describe, it, expect, vi } from "vitest";

import Navbar from "../components/layout/Navbar";
import SearchBar from "../components/directory/SearchBar";
import FilterToggles from "../components/directory/FilterToggles";
import RegionCard from "../components/directory/RegionCard";

describe("Navbar Component", () => {
  it("renders portal branding and GIS status badge", () => {
    render(
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>,
    );
    expect(screen.getByText(/BharatGeo Portal/i)).toBeInTheDocument();
    expect(screen.getByText(/GIS Connected/i)).toBeInTheDocument();
  });
});

describe("SearchBar Component", () => {
  it("renders search input and triggers onChange callback", () => {
    const handleChange = vi.fn();
    render(<SearchBar value="" onChange={handleChange} />);
    const input = screen.getByPlaceholderText(/Search state, union territory/i);
    expect(input).toBeInTheDocument();

    fireEvent.change(input, { target: { value: "Jaipur" } });
    expect(handleChange).toHaveBeenCalledWith("Jaipur");
  });
});

describe("FilterToggles Component", () => {
  it("renders filter options and handles category click", () => {
    const handleFilterChange = vi.fn();
    render(
      <FilterToggles
        activeFilter="all"
        onFilterChange={handleFilterChange}
        viewMode="grid"
        onViewModeChange={() => {}}
      />,
    );

    expect(screen.getByText(/All Regions/i)).toBeInTheDocument();
    expect(screen.getByText(/States Only/i)).toBeInTheDocument();
    expect(screen.getByText(/Union Territories/i)).toBeInTheDocument();

    fireEvent.click(screen.getByText(/States Only/i));
    expect(handleFilterChange).toHaveBeenCalledWith("state");
  });
});

describe("RegionCard Component", () => {
  const mockRegion = {
    id: "reg-1",
    name: "Rajasthan",
    capital: "Jaipur",
    type: "state",
    region: "Northern India",
    population: 68548437,
    official_languages: ["Hindi"],
  };

  it("displays state name, capital, and population", () => {
    render(<RegionCard region={mockRegion} onSelect={() => {}} />);
    expect(screen.getByText("Rajasthan")).toBeInTheDocument();
    expect(screen.getByText("Jaipur")).toBeInTheDocument();
    expect(screen.getByText(/6.85 Cr/i)).toBeInTheDocument();
  });

  it("fires onSelect callback on click", () => {
    const handleSelect = vi.fn();
    render(<RegionCard region={mockRegion} onSelect={handleSelect} />);
    fireEvent.click(screen.getByText("Rajasthan"));
    expect(handleSelect).toHaveBeenCalledWith(mockRegion);
  });
});

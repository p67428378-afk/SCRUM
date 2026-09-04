import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { vi, describe, it, expect } from "vitest";
import Navbar from "../common/Navbar";
import FilterBar from "../common/FilterBar";
import HeroBanner from "../catalog/HeroBanner";
import ContentGrid from "../catalog/ContentGrid";

describe("Catalog Page & Components Smoke Tests", () => {
  it("renders Navbar with logo and navigation links", () => {
    render(
      <BrowserRouter>
        <Navbar searchQuery="" onSearchChange={() => {}} />
      </BrowserRouter>,
    );

    expect(screen.getByText(/PRIME VIDEO/i)).toBeInTheDocument();
    expect(screen.getByText(/Browse Catalog/i)).toBeInTheDocument();
  });

  it("renders HeroBanner with featured title details", () => {
    const featuredItem = {
      id: "test-featured-1",
      title: "Inception Test",
      description: "A mind-bending sci-fi thriller test.",
      release_year: 2010,
      duration: 148,
      age_rating: "PG-13",
      genres: [{ name: "Sci-Fi" }, { name: "Action" }],
    };

    render(
      <BrowserRouter>
        <HeroBanner featuredItem={featuredItem} />
      </BrowserRouter>,
    );

    expect(screen.getByText("Inception Test")).toBeInTheDocument();
    expect(
      screen.getByText(/A mind-bending sci-fi thriller test/i),
    ).toBeInTheDocument();
  });

  it("renders FilterBar with filter selectors and handles content type toggle", () => {
    const onContentTypeChange = vi.fn();

    render(
      <FilterBar contentType="all" onContentTypeChange={onContentTypeChange} />,
    );

    expect(screen.getByText(/All Content/i)).toBeInTheDocument();
    const movieBtn = screen.getByText(/Movies/i);
    expect(movieBtn).toBeInTheDocument();

    fireEvent.click(movieBtn);
    expect(onContentTypeChange).toHaveBeenCalledWith("movie");
  });

  it("renders ContentGrid with movie and series cards", () => {
    const sampleItems = [
      {
        id: "m1",
        title: "Movie One",
        type: "movie",
        release_year: 2023,
        age_rating: "PG-13",
        poster_url: "https://example.com/poster.jpg",
        genres: [{ name: "Action" }],
      },
      {
        id: "s1",
        title: "Series One",
        type: "series",
        release_year: 2022,
        seasons: [{ season_number: 1 }],
        genres: [{ name: "Sci-Fi" }],
      },
    ];

    render(
      <BrowserRouter>
        <ContentGrid items={sampleItems} />
      </BrowserRouter>,
    );

    expect(screen.getByText("Movie One")).toBeInTheDocument();
    expect(screen.getByText("Series One")).toBeInTheDocument();
  });
});

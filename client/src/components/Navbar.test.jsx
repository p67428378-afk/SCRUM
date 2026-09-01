import React from "react";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import Navbar from "./Navbar";

describe("Navbar Component", () => {
  test("renders logo and navigation links", () => {
    render(
      <BrowserRouter>
        <Navbar favoritesCount={3} />
      </BrowserRouter>,
    );

    expect(screen.getByText("HomeFinder")).toBeInTheDocument();
    expect(screen.getByText("Search")).toBeInTheDocument();
    expect(screen.getByText("Favorites")).toBeInTheDocument();
    expect(screen.getByText("My Listings")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
  });
});

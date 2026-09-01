import React from "react";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import SearchDashboardPage from "./SearchDashboardPage";

describe("SearchDashboardPage Component", () => {
  test("renders page heading and search controls", () => {
    render(
      <BrowserRouter>
        <SearchDashboardPage />
      </BrowserRouter>,
    );

    expect(screen.getByText("Find Your Dream House")).toBeInTheDocument();
    expect(screen.getByText("Filter Properties")).toBeInTheDocument();
  });
});

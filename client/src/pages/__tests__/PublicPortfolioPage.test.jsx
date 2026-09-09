import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { describe, it, expect } from "vitest";
import PublicPortfolioPage from "../PublicPortfolioPage";

describe("PublicPortfolioPage Component", () => {
  it("renders public portfolio layout for valid slug", async () => {
    render(
      <MemoryRouter initialEntries={["/actors/john-doe"]}>
        <Routes>
          <Route path="/actors/:slug" element={<PublicPortfolioPage />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(await screen.findByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText(/Share Portfolio/i)).toBeInTheDocument();
  });

  it("renders 404 page for non-existent actor slug", async () => {
    render(
      <MemoryRouter initialEntries={["/actors/nonexistent-actor-404"]}>
        <Routes>
          <Route path="/actors/:slug" element={<PublicPortfolioPage />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(
      await screen.findByText(/Actor Portfolio Unavailable/i),
    ).toBeInTheDocument();
  });
});

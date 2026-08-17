import { render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { describe, it, expect, vi } from "vitest";
import ConcertsPage from "./ConcertsPage";
import * as api from "../services/api";

vi.mock("../services/api", () => ({
  getConcerts: vi.fn(),
}));

describe("ConcertsPage Component", () => {
  it("renders tour schedule heading and filter bar", async () => {
    api.getConcerts.mockResolvedValue({
      total: 1,
      items: [
        {
          id: "123e4567-e89b-12d3-a456-426614174000",
          tour_name: "AURA Berlin Night",
          event_date: "2026-10-24T20:00:00Z",
          status: "On Sale",
          country: "Germany",
          city: "Berlin",
          venue_name: "Mercedes-Benz Arena",
          min_price_local: 85.0,
          currency_code: "EUR",
          currency_symbol: "€",
        },
      ],
    });

    render(
      <BrowserRouter>
        <ConcertsPage />
      </BrowserRouter>,
    );

    expect(
      screen.getByText(/International Concert Schedule/i),
    ).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText(/AURA Berlin Night/i)).toBeInTheDocument();
    });
  });
});

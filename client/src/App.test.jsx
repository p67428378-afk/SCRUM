import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import App from "./App";

// Mock the API calls
vi.mock("./services/api", () => ({
  locationsApi: {
    list: vi.fn().mockResolvedValue([]),
    create: vi.fn(),
    delete: vi.fn(),
    setDefault: vi.fn(),
  },
  weatherApi: {
    getCurrent: vi.fn().mockResolvedValue({
      current: {
        condition: "Sunny",
        condition_icon: "sunny",
        humidity: 50,
        pressure_mb: 1012,
        temp_c: 20,
        temp_f: 68,
        updated_at: "2026-06-19 12:00",
        uv: 5,
        wind_dir: "N",
        wind_kph: 10,
      },
      location: {
        country: "US",
        lat: 40.7128,
        lon: -74.006,
        name: "New York",
        timezone: "America/New_York",
      },
    }),
    getForecast: vi.fn().mockResolvedValue({
      forecast: [],
      location: { country: "US", name: "New York" },
    }),
    getInsights: vi.fn().mockResolvedValue({
      insights: "Nice day",
      trend: [],
    }),
  },
}));

describe("App Component Smoke Test", () => {
  it("renders without crashing", () => {
    render(<App />);
    expect(screen.getByText("SkyWatch Pro")).toBeInTheDocument();
  });
});

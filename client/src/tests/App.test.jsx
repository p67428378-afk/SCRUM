import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import App from "../App";

// Mock api calls to avoid actual HTTP requests during test run
vi.mock("../services/api", () => ({
  getLocations: vi.fn().mockResolvedValue([
    {
      id: "loc-1",
      name: "San Francisco Bay Station",
      city: "San Francisco",
      state: "CA",
      country: "USA",
      latitude: 37.7749,
      longitude: -122.4194,
      elevation_meters: 16,
      status: "ACTIVE",
    },
  ]),
  getCurrentWeather: vi.fn().mockResolvedValue({
    temperature_celsius: 22.5,
    humidity_percent: 64,
    wind_speed_mph: 12.5,
    wind_direction: "NW",
    precipitation_inches: 0.05,
    pressure_hpa: 1013.2,
    uv_index: 4.5,
  }),
  getForecasts: vi.fn().mockResolvedValue({
    daily: [
      {
        forecast_date: "2026-09-08",
        temp_max_celsius: 25,
        temp_min_celsius: 15,
        precipitation_probability: 20,
        condition_text: "Sunny / Clear",
      },
    ],
  }),
  getWeatherHistory: vi.fn().mockResolvedValue([]),
  getAlertConfigs: vi.fn().mockResolvedValue([]),
  getAlertNotifications: vi.fn().mockResolvedValue([]),
  ingestWeatherData: vi.fn().mockResolvedValue({ status: "success" }),
  createLocation: vi.fn().mockResolvedValue({ id: "loc-2" }),
  createAlertConfig: vi.fn().mockResolvedValue({ id: "cfg-1" }),
}));

describe("WeatherPulse App Smoke Tests", () => {
  it("renders the App and displays brand title WeatherPulse", async () => {
    render(<App />);
    const brandElement = await screen.findByText(/Weather/i);
    expect(brandElement).toBeInTheDocument();
  });

  it("renders the dashboard heading", async () => {
    render(<App />);
    const heading = await screen.findByText(
      /Real-Time Weather Observation Dashboard/i,
    );
    expect(heading).toBeInTheDocument();
  });

  it("renders KPI telemetry stat titles", async () => {
    render(<App />);
    const tempTitle = await screen.findByText(/Temperature/i);
    expect(tempTitle).toBeInTheDocument();
  });
});

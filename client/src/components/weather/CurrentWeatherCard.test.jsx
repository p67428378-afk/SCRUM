import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import CurrentWeatherCard from "./CurrentWeatherCard";

const mockWeatherData = {
  current: {
    condition: "Partly Cloudy",
    condition_icon: "partly_cloudy",
    humidity: 70,
    pressure_mb: 1012,
    temp_c: 15,
    temp_f: 59,
    updated_at: "Thursday, 10:42 AM",
    uv: 3,
    wind_dir: "NW",
    wind_kph: 10,
  },
  location: {
    country: "UK",
    lat: 51.5074,
    lon: -0.1278,
    name: "London",
    timezone: "Europe/London",
  },
};

describe("CurrentWeatherCard Component", () => {
  it("renders weather details correctly", () => {
    render(<CurrentWeatherCard weatherData={mockWeatherData} unit="C" />);

    expect(screen.getByText("London, UK")).toBeInTheDocument();
    expect(screen.getByText("Partly Cloudy")).toBeInTheDocument();
    expect(screen.getByText("15°C")).toBeInTheDocument();
    expect(screen.getByText("70%")).toBeInTheDocument();
  });

  it("renders Fahrenheit temperature when unit is F", () => {
    render(<CurrentWeatherCard weatherData={mockWeatherData} unit="F" />);

    expect(screen.getByText("59°F")).toBeInTheDocument();
  });
});

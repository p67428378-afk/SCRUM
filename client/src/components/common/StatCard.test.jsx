import React from "react";
import { render, screen } from "@testing-library/react";
import StatCard from "./StatCard.jsx";
import { Globe } from "lucide-react";

describe("StatCard component", () => {
  test("renders title, value, and subtitle correctly", () => {
    render(
      <StatCard
        title="Total Continents"
        value="6"
        subtitle="Active regions"
        icon={Globe}
        trend="+5%"
      />,
    );

    expect(screen.getByText(/Total Continents/i)).toBeInTheDocument();
    expect(screen.getByText("6")).toBeInTheDocument();
    expect(screen.getByText(/Active regions/i)).toBeInTheDocument();
    expect(screen.getByText("+5%")).toBeInTheDocument();
  });
});

import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import App from "./App";

vi.mock("./services/api", () => ({
  getPortfolio: vi.fn().mockResolvedValue({
    name: "AURA",
    bio: "Test bio",
    monthly_listeners: 1000000,
    discography: [],
  }),
  getConcerts: vi.fn().mockResolvedValue({ total: 0, items: [] }),
}));

describe("App Component", () => {
  it("renders the brand title in the navbar", async () => {
    render(<App />);
    const brandElements = screen.getAllByText(/AURA/i);
    expect(brandElements.length).toBeGreaterThan(0);
  });

  it("renders navigation links", () => {
    render(<App />);
    expect(screen.getByText(/Artist Bio/i)).toBeInTheDocument();
    expect(screen.getByText(/Tour Schedule/i)).toBeInTheDocument();
    expect(screen.getByText(/Order Lookup/i)).toBeInTheDocument();
  });
});

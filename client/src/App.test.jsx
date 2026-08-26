import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import App from "./App";

// Mock axios or API calls
vi.mock("./services/api", () => ({
  authService: {
    getCurrentUser: vi.fn(() => ({
      id: "test-user-id",
      email: "test@example.com",
      full_name: "Test User",
      role: "seller",
    })),
    logout: vi.fn(),
  },
  listingsService: {
    getListings: vi.fn(() =>
      Promise.resolve([
        {
          id: "1",
          title: "Buddy Golden Retriever",
          breed: "Golden Retriever",
          age_months: 24,
          price: 1200,
          location: "Austin, TX",
          status: "available",
        },
      ]),
    ),
    getListing: vi.fn(() => Promise.resolve({})),
  },
  inquiriesService: {
    getInquiries: vi.fn(() => Promise.resolve([])),
  },
}));

describe("Paws & Homes App Component", () => {
  it("renders application brand header", async () => {
    render(<App />);
    const brandElements = screen.getAllByText(/Paws & Homes/i);
    expect(brandElements.length).toBeGreaterThan(0);
  });

  it("renders find dogs link", () => {
    render(<App />);
    expect(screen.getByText(/Find Dogs/i)).toBeInTheDocument();
  });
});

import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import App from "./App.jsx";

// Mock API to prevent network calls during component tests
vi.mock("./services/api.js", () => ({
  default: {
    getDrugs: vi.fn().mockResolvedValue([
      {
        id: "1",
        name: "Amoxicillin 500mg",
        dosage: "500mg Capsule",
        batch_number: "BATCH-2026-A",
        stock_quantity: 500,
        expiration_date: "2027-12-31",
        unit_price: 15.0,
      },
    ]),
    createDrug: vi.fn(),
    updateDrug: vi.fn(),
    deleteDrug: vi.fn(),
  },
  getDrugs: vi.fn().mockResolvedValue([]),
  createDrug: vi.fn(),
  updateDrug: vi.fn(),
  deleteDrug: vi.fn(),
}));

describe("App Component", () => {
  it("renders application header and title successfully", async () => {
    render(<App />);
    const brandElement = screen.getByText("PharmaCare");
    expect(brandElement).toBeInTheDocument();

    const subtitleElement = screen.getByText("Drugs Management System");
    expect(subtitleElement).toBeInTheDocument();
  });
});

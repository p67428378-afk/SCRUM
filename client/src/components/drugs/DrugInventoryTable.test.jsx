import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import DrugInventoryTable from "./DrugInventoryTable.jsx";

describe("DrugInventoryTable Component", () => {
  const sampleDrugs = [
    {
      id: "1",
      name: "Amoxicillin 500mg",
      generic_name: "Amoxicillin Trihydrate",
      dosage: "500mg Capsule",
      manufacturer: "Pfizer Inc.",
      batch_number: "BATCH-2026-A",
      stock_quantity: 500,
      expiration_date: "2027-12-31",
      category: "Antibiotics",
      unit_price: 15.0,
      is_low_stock: false,
      is_near_expiry: false,
    },
    {
      id: "2",
      name: "Ibuprofen 200mg",
      generic_name: "Ibuprofen",
      dosage: "200mg Tablet",
      manufacturer: "Bayer",
      batch_number: "BATCH-2026-B",
      stock_quantity: 15,
      expiration_date: "2026-10-15",
      category: "Analgesics",
      unit_price: 8.5,
      is_low_stock: true,
      is_near_expiry: false,
    },
  ];

  it("renders drug items in table", () => {
    render(<DrugInventoryTable drugs={sampleDrugs} isLoading={false} />);

    expect(screen.getByText("Amoxicillin 500mg")).toBeInTheDocument();
    expect(screen.getByText("Ibuprofen 200mg")).toBeInTheDocument();
    expect(screen.getByText("Low Stock")).toBeInTheDocument();
  });

  it("renders loading state when isLoading is true", () => {
    render(<DrugInventoryTable drugs={[]} isLoading={true} />);
    expect(screen.getByText("Loading drug inventory...")).toBeInTheDocument();
  });

  it("renders empty message when no drugs are available", () => {
    render(<DrugInventoryTable drugs={[]} isLoading={false} />);
    expect(screen.getByText("No drugs found")).toBeInTheDocument();
  });
});

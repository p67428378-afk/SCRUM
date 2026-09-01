import React from "react";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import PropertyCard from "./PropertyCard";

describe("PropertyCard Component", () => {
  const sampleProperty = {
    id: "prop-123",
    title: "Modern Suburban Home",
    price: 450000,
    property_type: "Single Family",
    status: "Active",
    bedrooms: 3,
    bathrooms: 2.5,
    square_feet: 2200,
    address_street: "123 Maple St",
    city: "Austin",
    state: "TX",
    zip_code: "78701",
    images: [{ image_url: "https://example.com/photo.jpg" }],
  };

  test("renders property details correctly", () => {
    render(
      <BrowserRouter>
        <PropertyCard property={sampleProperty} />
      </BrowserRouter>,
    );

    expect(screen.getByText("$450,000")).toBeInTheDocument();
    expect(screen.getByText("Modern Suburban Home")).toBeInTheDocument();
    expect(screen.getByText("Active")).toBeInTheDocument();
    expect(screen.getByText("3 Beds")).toBeInTheDocument();
  });
});

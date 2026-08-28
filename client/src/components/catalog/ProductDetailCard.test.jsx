import React from "react";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "../../context/AuthContext";
import ProductDetailCard from "./ProductDetailCard";
import { describe, test, expect, vi } from "vitest";

// Mock API functions
vi.mock("../../services/api", () => ({
  addToWishlist: vi.fn(),
  removeFromWishlist: vi.fn(),
  getWishlist: vi.fn().mockResolvedValue([]),
  getProductReviews: vi.fn().mockResolvedValue({
    product_id: "prod-1",
    average_rating: 4.5,
    total_reviews: 2,
    reviews: [
      {
        id: "rev-1",
        user_id: "u1",
        user_name: "Jane Doe",
        product_id: "prod-1",
        rating: 5,
        comment: "Great quality product!",
        created_at: "2026-01-01T00:00:00Z",
      },
      {
        id: "rev-2",
        user_id: "u2",
        user_name: "John Smith",
        product_id: "prod-1",
        rating: 4,
        comment: "Very nice fit.",
        created_at: "2026-01-02T00:00:00Z",
      },
    ],
  }),
  createReview: vi.fn(),
}));

describe("ProductDetailCard Component", () => {
  const sampleProduct = {
    id: "prod-1",
    title: "Classic Denim Jacket",
    price: 89.99,
    description: "Stylish denim jacket for daily wear.",
    category: "Clothing",
    image_url: "http://example.com/jacket.jpg",
    variants: [],
  };

  test("renders product details and reviews section", async () => {
    render(
      <BrowserRouter>
        <AuthProvider>
          <ProductDetailCard product={sampleProduct} />
        </AuthProvider>
      </BrowserRouter>,
    );

    // Assert product title is rendered
    expect(screen.getByText("Classic Denim Jacket")).toBeInTheDocument();

    // Assert reviews section header is present
    expect(screen.getByText(/Product Reviews & Ratings/i)).toBeInTheDocument();

    // Assert review form heading or prompt is rendered
    expect(screen.getByText(/Write a Review/i)).toBeInTheDocument();
  });
});

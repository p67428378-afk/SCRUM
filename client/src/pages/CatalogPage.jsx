import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Navbar from "../components/common/Navbar";
import FilterSidebar from "../components/catalog/FilterSidebar";
import ProductCard from "../components/catalog/ProductCard";
import { getProducts } from "../services/api";
import { Loader, AlertCircle } from "lucide-react";

export default function CatalogPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [filters, setFilters] = useState({
    category: searchParams.get("category") || "",
    size: searchParams.get("size") || "",
    color: searchParams.get("color") || "",
    min_price: searchParams.get("min_price") || "",
    max_price: searchParams.get("max_price") || "",
    q: searchParams.get("q") || "",
  });

  const [page, setPage] = useState(1);
  const limit = 12;

  useEffect(() => {
    // Keep URL search params in sync with filter state
    const newCategory = searchParams.get("category") || "";
    const newQ = searchParams.get("q") || "";
    setFilters((prev) => ({ ...prev, category: newCategory, q: newQ }));
  }, [searchParams]);

  useEffect(() => {
    const fetchCatalog = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getProducts({
          category: filters.category,
          size: filters.size,
          color: filters.color,
          min_price: filters.min_price,
          max_price: filters.max_price,
          q: filters.q,
          skip: (page - 1) * limit,
          limit: limit,
        });
        setProducts(data.items || []);
        setTotal(data.total || 0);
      } catch (err) {
        console.error("Failed to load catalog products", err);
        setError(
          "Unable to fetch product catalog. Please ensure backend service is running.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchCatalog();
  }, [filters, page]);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setPage(1);
  };

  const handleResetFilters = () => {
    setFilters({
      category: "",
      size: "",
      color: "",
      min_price: "",
      max_price: "",
      q: "",
    });
    setSearchParams({});
    setPage(1);
  };

  const handleSearch = (term) => {
    handleFilterChange({ ...filters, q: term });
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="min-h-screen flex flex-col bg-[#f7fafc]">
      <Navbar onSearch={handleSearch} />

      {/* Hero Header */}
      <div className="bg-white border-b border-[#e3e8f0] py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-[#171c29]">
            Clothes &amp; Accessories Catalog
          </h1>
          <p className="text-[#707a8c] text-sm mt-1">
            Browse our curated collection of denim, jackets, footwear, and
            accessories.
          </p>
        </div>
      </div>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Left Sidebar Filter */}
          <FilterSidebar
            filters={filters}
            onFilterChange={handleFilterChange}
            onReset={handleResetFilters}
          />

          {/* Product Grid Area */}
          <section className="flex-1">
            <div className="flex justify-between items-center mb-6">
              <span className="text-sm font-semibold text-[#707a8c]">
                Showing {products.length} of {total} products
              </span>
              {filters.q && (
                <span className="text-sm bg-[#e0e7ff] text-[#2663eb] px-3 py-1 rounded-full font-medium">
                  Search: "{filters.q}"
                </span>
              )}
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 text-[#707a8c]">
                <Loader className="w-8 h-8 animate-spin text-[#2663eb] mb-2" />
                <p className="text-sm">Loading clothes &amp; accessories...</p>
              </div>
            ) : error ? (
              <div className="bg-[#fee2e2] text-[#db2626] p-4 rounded-xl flex items-center gap-3 text-sm">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span>{error}</span>
              </div>
            ) : products.length === 0 ? (
              <div className="bg-white border border-[#e3e8f0] rounded-xl p-12 text-center text-[#707a8c] space-y-3">
                <p className="text-lg font-bold text-[#171c29]">
                  No items match your criteria
                </p>
                <p className="text-sm">
                  Try relaxing your category or price range filters.
                </p>
                <button
                  onClick={handleResetFilters}
                  className="bg-[#2663eb] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#1d4ed8]"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-10">
                <button
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="px-4 py-2 border border-[#e3e8f0] rounded-lg text-sm font-medium text-[#171c29] bg-white hover:bg-[#f7fafc] disabled:opacity-40"
                >
                  Previous
                </button>
                <span className="text-sm font-semibold text-[#707a8c] px-2">
                  Page {page} of {totalPages}
                </span>
                <button
                  disabled={page === totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="px-4 py-2 border border-[#e3e8f0] rounded-lg text-sm font-medium text-[#171c29] bg-white hover:bg-[#f7fafc] disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

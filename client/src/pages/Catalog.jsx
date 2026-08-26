import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Search,
  Filter,
  SlidersHorizontal,
  RotateCcw,
  Star,
  X,
} from "lucide-react";
import { productApi } from "../services/api";
import ProductCard from "../components/ProductCard";

export default function Catalog() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Filter States initialized from URL params
  const categoryParam = searchParams.get("category") || "";
  const searchParam = searchParams.get("search") || "";
  const minPriceParam = searchParams.get("min_price") || "";
  const maxPriceParam = searchParams.get("max_price") || "";
  const materialParam = searchParams.get("material") || "";
  const colorParam = searchParams.get("color") || "";
  const ratingParam = searchParams.get("rating") || "";
  const sortParam = searchParams.get("sort") || "newest";

  const [searchInput, setSearchInput] = useState(searchParam);
  const [selectedCategory, setSelectedCategory] = useState(categoryParam);
  const [minPrice, setMinPrice] = useState(minPriceParam);
  const [maxPrice, setMaxPrice] = useState(maxPriceParam);
  const [selectedMaterial, setSelectedMaterial] = useState(materialParam);
  const [selectedColor, setSelectedColor] = useState(colorParam);
  const [selectedRating, setSelectedRating] = useState(ratingParam);
  const [sortBy, setSortBy] = useState(sortParam);

  // Fetch Categories
  useEffect(() => {
    productApi
      .getCategories()
      .then((res) => setCategories(res.data || []))
      .catch(() => {});
  }, []);

  // Sync state when URL params change
  useEffect(() => {
    setSelectedCategory(searchParams.get("category") || "");
    setSearchInput(searchParams.get("search") || "");
    setMinPrice(searchParams.get("min_price") || "");
    setMaxPrice(searchParams.get("max_price") || "");
    setSelectedMaterial(searchParams.get("material") || "");
    setSelectedColor(searchParams.get("color") || "");
    setSelectedRating(searchParams.get("rating") || "");
    setSortBy(searchParams.get("sort") || "newest");
  }, [searchParams]);

  // Fetch Products
  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params = { limit: 50 };
      if (selectedCategory) params.category = selectedCategory;
      if (searchInput.trim()) params.search = searchInput.trim();
      if (minPrice) params.min_price = Number(minPrice);
      if (maxPrice) params.max_price = Number(maxPrice);
      if (selectedMaterial) params.material = selectedMaterial;
      if (selectedColor) params.color = selectedColor;
      if (selectedRating) params.rating = Number(selectedRating);
      if (sortBy) params.sort = sortBy;

      const res = await productApi.getProducts(params);
      setProducts(res.data?.items || []);
    } catch (err) {
      setError(
        err?.response?.data?.detail || "Failed to load furniture catalog",
      );
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  }, [
    selectedCategory,
    searchInput,
    minPrice,
    maxPrice,
    selectedMaterial,
    selectedColor,
    selectedRating,
    sortBy,
  ]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const applyFilters = () => {
    const nextParams = {};
    if (selectedCategory) nextParams.category = selectedCategory;
    if (searchInput.trim()) nextParams.search = searchInput.trim();
    if (minPrice) nextParams.min_price = minPrice;
    if (maxPrice) nextParams.max_price = maxPrice;
    if (selectedMaterial) nextParams.material = selectedMaterial;
    if (selectedColor) nextParams.color = selectedColor;
    if (selectedRating) nextParams.rating = selectedRating;
    if (sortBy && sortBy !== "newest") nextParams.sort = sortBy;

    setSearchParams(nextParams);
    setMobileFilterOpen(false);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    applyFilters();
  };

  const handleResetFilters = () => {
    setSelectedCategory("");
    setSearchInput("");
    setMinPrice("");
    setMaxPrice("");
    setSelectedMaterial("");
    setSelectedColor("");
    setSelectedRating("");
    setSortBy("newest");
    setSearchParams({});
    setMobileFilterOpen(false);
  };

  const materials = ["Velvet", "Oak", "Leather", "Walnut", "Fabric"];
  const colors = [
    "Emerald Green",
    "Natural Oak",
    "Cognac Brown",
    "Warm Walnut",
    "Dark Walnut",
    "Smoked Gray",
    "Black",
    "Oatmeal Beige",
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-textmain">
          Furniture Catalog
        </h1>
        <p className="text-sm text-textmuted mt-1">
          Explore handcrafted, sustainable furniture designed for every room in
          your home.
        </p>
      </div>

      {/* Search & Sort Bar */}
      <div className="bg-white p-4 rounded-xl border border-borderline shadow-sm mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full">
          <input
            type="text"
            placeholder="Search sofas, dining tables, desks, materials..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full pl-10 pr-24 py-2 text-sm border border-borderline rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          />
          <Search className="w-4 h-4 text-textmuted absolute left-3 top-3" />
          <button
            type="submit"
            className="absolute right-1.5 top-1.5 px-3 py-1 bg-primary text-white text-xs font-semibold rounded-md hover:bg-primary-hover transition-colors"
          >
            Search
          </button>
        </form>

        {/* Sort & Filter Controls */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
          <button
            onClick={() => setMobileFilterOpen(true)}
            className="md:hidden flex items-center gap-2 px-3 py-2 text-xs font-semibold border border-borderline rounded-lg text-textmain bg-bgsoft"
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>Filters</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="text-xs text-textmuted whitespace-nowrap">
              Sort by:
            </span>
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                const next = Object.fromEntries(searchParams.entries());
                next.sort = e.target.value;
                setSearchParams(next);
              }}
              className="text-xs border border-borderline rounded-lg px-2.5 py-2 bg-white text-textmain focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="newest">Newest Arrivals</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating_desc">Highest Rated</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Desktop Filter Sidebar */}
        <aside className="hidden lg:block space-y-6 bg-white p-5 rounded-xl border border-borderline h-fit">
          <div className="flex items-center justify-between pb-3 border-b border-borderline">
            <div className="flex items-center gap-2 font-semibold text-sm text-textmain">
              <Filter className="w-4 h-4 text-primary" />
              <span>Filter Catalog</span>
            </div>
            <button
              onClick={handleResetFilters}
              className="text-xs text-primary hover:underline flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          </div>

          {/* Categories Filter */}
          <div>
            <h3 className="text-xs font-bold text-textmain uppercase tracking-wider mb-2.5">
              Category
            </h3>
            <div className="space-y-1.5">
              <button
                onClick={() => {
                  setSelectedCategory("");
                  const next = Object.fromEntries(searchParams.entries());
                  delete next.category;
                  setSearchParams(next);
                }}
                className={`w-full text-left text-xs px-2.5 py-1.5 rounded-md font-medium transition-colors ${
                  !selectedCategory
                    ? "bg-primary text-white"
                    : "text-textmuted hover:bg-bgsoft"
                }`}
              >
                All Categories
              </button>
              {categories.map((cat) => {
                const isSelected = selectedCategory === cat.slug;
                return (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setSelectedCategory(cat.slug);
                      const next = Object.fromEntries(searchParams.entries());
                      next.category = cat.slug;
                      setSearchParams(next);
                    }}
                    className={`w-full text-left text-xs px-2.5 py-1.5 rounded-md font-medium transition-colors ${
                      isSelected
                        ? "bg-primary text-white"
                        : "text-textmuted hover:bg-bgsoft"
                    }`}
                  >
                    {cat.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Price Range Filter */}
          <div>
            <h3 className="text-xs font-bold text-textmain uppercase tracking-wider mb-2.5">
              Price Range ($)
            </h3>
            <div className="grid grid-cols-2 gap-2 mb-2">
              <input
                type="number"
                placeholder="Min"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="w-full text-xs px-2.5 py-1.5 border border-borderline rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <input
                type="number"
                placeholder="Max"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="w-full text-xs px-2.5 py-1.5 border border-borderline rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <button
              onClick={applyFilters}
              className="w-full py-1.5 text-xs font-semibold bg-bgsoft hover:bg-primary hover:text-white rounded-md border border-borderline transition-colors"
            >
              Apply Price
            </button>
          </div>

          {/* Material Filter */}
          <div>
            <h3 className="text-xs font-bold text-textmain uppercase tracking-wider mb-2.5">
              Material
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {materials.map((mat) => {
                const isSelected = selectedMaterial === mat;
                return (
                  <button
                    key={mat}
                    onClick={() => {
                      const nextMat = isSelected ? "" : mat;
                      setSelectedMaterial(nextMat);
                      const next = Object.fromEntries(searchParams.entries());
                      if (nextMat) next.material = nextMat;
                      else delete next.material;
                      setSearchParams(next);
                    }}
                    className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                      isSelected
                        ? "bg-primary text-white border-primary"
                        : "bg-white text-textmuted border-borderline hover:bg-bgsoft"
                    }`}
                  >
                    {mat}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Color Filter */}
          <div>
            <h3 className="text-xs font-bold text-textmain uppercase tracking-wider mb-2.5">
              Color
            </h3>
            <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
              {colors.map((color) => {
                const isSelected = selectedColor === color;
                return (
                  <button
                    key={color}
                    onClick={() => {
                      const nextCol = isSelected ? "" : color;
                      setSelectedColor(nextCol);
                      const next = Object.fromEntries(searchParams.entries());
                      if (nextCol) next.color = nextCol;
                      else delete next.color;
                      setSearchParams(next);
                    }}
                    className={`w-full text-left text-xs px-2 py-1 rounded-md transition-colors flex items-center justify-between ${
                      isSelected
                        ? "bg-primary-light text-primary font-semibold"
                        : "text-textmuted hover:bg-bgsoft"
                    }`}
                  >
                    <span>{color}</span>
                    {isSelected && (
                      <span className="text-primary font-bold">&check;</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Rating Filter */}
          <div>
            <h3 className="text-xs font-bold text-textmain uppercase tracking-wider mb-2.5">
              Customer Rating
            </h3>
            <div className="space-y-1">
              {[4.5, 4.0, 3.0].map((rate) => {
                const isSelected = Number(selectedRating) === rate;
                return (
                  <button
                    key={rate}
                    onClick={() => {
                      const nextRate = isSelected ? "" : rate.toString();
                      setSelectedRating(nextRate);
                      const next = Object.fromEntries(searchParams.entries());
                      if (nextRate) next.rating = nextRate;
                      else delete next.rating;
                      setSearchParams(next);
                    }}
                    className={`w-full text-left text-xs px-2 py-1.5 rounded-md flex items-center gap-1.5 transition-colors ${
                      isSelected
                        ? "bg-amber-50 text-amber-800 font-semibold"
                        : "text-textmuted hover:bg-bgsoft"
                    }`}
                  >
                    <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                    <span>{rate}+ Stars & Up</span>
                  </button>
                );
              })}
            </div>
          </div>
        </aside>

        {/* Product Grid Area */}
        <main className="lg:col-span-3">
          {/* Active Filter Tags */}
          {(selectedCategory ||
            selectedMaterial ||
            selectedColor ||
            minPrice ||
            maxPrice ||
            selectedRating ||
            searchInput) && (
            <div className="flex flex-wrap items-center gap-2 mb-4 bg-white p-3 rounded-lg border border-borderline">
              <span className="text-xs text-textmuted font-medium">
                Active Filters:
              </span>
              {selectedCategory && (
                <span className="inline-flex items-center gap-1 bg-primary-light text-primary text-xs px-2.5 py-0.5 rounded-full font-medium">
                  Category: {selectedCategory}
                  <button
                    onClick={() => {
                      setSelectedCategory("");
                      const n = Object.fromEntries(searchParams.entries());
                      delete n.category;
                      setSearchParams(n);
                    }}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {selectedMaterial && (
                <span className="inline-flex items-center gap-1 bg-primary-light text-primary text-xs px-2.5 py-0.5 rounded-full font-medium">
                  Material: {selectedMaterial}
                  <button
                    onClick={() => {
                      setSelectedMaterial("");
                      const n = Object.fromEntries(searchParams.entries());
                      delete n.material;
                      setSearchParams(n);
                    }}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {selectedColor && (
                <span className="inline-flex items-center gap-1 bg-primary-light text-primary text-xs px-2.5 py-0.5 rounded-full font-medium">
                  Color: {selectedColor}
                  <button
                    onClick={() => {
                      setSelectedColor("");
                      const n = Object.fromEntries(searchParams.entries());
                      delete n.color;
                      setSearchParams(n);
                    }}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              {(minPrice || maxPrice) && (
                <span className="inline-flex items-center gap-1 bg-primary-light text-primary text-xs px-2.5 py-0.5 rounded-full font-medium">
                  Price: ${minPrice || "0"} - ${maxPrice || "Any"}
                  <button
                    onClick={() => {
                      setMinPrice("");
                      setMaxPrice("");
                      const n = Object.fromEntries(searchParams.entries());
                      delete n.min_price;
                      delete n.max_price;
                      setSearchParams(n);
                    }}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              )}
              <button
                onClick={handleResetFilters}
                className="text-xs text-danger hover:underline ml-auto font-medium"
              >
                Clear All
              </button>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div
              className="bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-xl text-sm mb-6"
              role="alert"
            >
              {error}
            </div>
          )}

          {/* Loading Skeletons */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 6].map((i) => (
                <div
                  key={i}
                  className="bg-white border border-borderline rounded-xl p-4 animate-pulse space-y-3"
                >
                  <div className="aspect-square bg-gray-200 rounded-lg"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-8 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            /* Empty State */
            <div className="bg-white border border-borderline rounded-2xl p-12 text-center space-y-4">
              <div className="w-16 h-16 bg-bgsoft text-textmuted rounded-full flex items-center justify-center mx-auto">
                <Search className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-textmain">
                No furniture found
              </h3>
              <p className="text-xs text-textmuted max-w-md mx-auto">
                We couldn&apos;t find any items matching your selected criteria.
                Try adjusting your search keywords, price range, or clearing
                filters.
              </p>
              <button
                onClick={handleResetFilters}
                className="px-4 py-2 bg-primary text-white text-xs font-semibold rounded-lg hover:bg-primary-hover transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            /* Product Cards Grid */
            <div>
              <div className="text-xs text-textmuted mb-4 font-medium">
                Showing{" "}
                <strong className="text-textmain">{products.length}</strong>{" "}
                handcrafted furniture items
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Mobile Filters Drawer */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex bg-black/40 lg:hidden">
          <div className="bg-white w-5/6 max-w-sm h-full p-6 overflow-y-auto space-y-6 ml-auto">
            <div className="flex items-center justify-between pb-4 border-b border-borderline">
              <h2 className="text-base font-bold text-textmain">Filters</h2>
              <button onClick={() => setMobileFilterOpen(false)}>
                <X className="w-5 h-5 text-textmuted" />
              </button>
            </div>

            {/* Mobile Categories */}
            <div>
              <h3 className="text-xs font-bold text-textmain uppercase tracking-wider mb-2">
                Category
              </h3>
              <div className="space-y-1">
                <button
                  onClick={() => setSelectedCategory("")}
                  className={`w-full text-left text-xs px-3 py-2 rounded-md ${
                    !selectedCategory
                      ? "bg-primary text-white"
                      : "text-textmuted"
                  }`}
                >
                  All Categories
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.slug)}
                    className={`w-full text-left text-xs px-3 py-2 rounded-md ${
                      selectedCategory === cat.slug
                        ? "bg-primary text-white"
                        : "text-textmuted"
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Inputs */}
            <div>
              <h3 className="text-xs font-bold text-textmain uppercase tracking-wider mb-2">
                Price Range ($)
              </h3>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  className="w-full text-xs px-2.5 py-1.5 border border-borderline rounded-md"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-full text-xs px-2.5 py-1.5 border border-borderline rounded-md"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-borderline flex gap-3">
              <button
                onClick={handleResetFilters}
                className="flex-1 py-2.5 text-xs font-semibold text-textmain bg-bgsoft rounded-lg border border-borderline"
              >
                Reset
              </button>
              <button
                onClick={applyFilters}
                className="flex-1 py-2.5 text-xs font-semibold text-white bg-primary rounded-lg shadow-sm"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

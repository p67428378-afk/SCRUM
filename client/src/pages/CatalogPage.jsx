import React, { useState, useEffect, useCallback } from "react";
import PropTypes from "prop-types";
import { useSearchParams } from "react-router-dom";
import { catalogService } from "../services/api";
import BookCard from "../components/catalog/BookCard";
import FilterSidebar from "../components/catalog/FilterSidebar";
import {
  Search,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Sparkles,
} from "lucide-react";

export default function CatalogPage({
  onAddToCart,
  globalSearchQuery = "",
  onClearGlobalSearch,
}) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [addingBookId, setAddingBookId] = useState(null);

  // Filter & pagination states
  const [searchQuery, setSearchQuery] = useState(
    searchParams.get("query") || globalSearchQuery || "",
  );
  const [selectedCategoryId, setSelectedCategoryId] = useState(
    searchParams.get("category_id") || "",
  );
  const [minPrice, setMinPrice] = useState(searchParams.get("min_price") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("max_price") || "");
  const [sortBy, setSortBy] = useState(searchParams.get("sort_by") || "");
  const [page, setPage] = useState(1);
  const [totalBooks, setTotalBooks] = useState(0);
  const pageSize = 9;

  // Sync with globalSearchQuery if changed from Navbar
  useEffect(() => {
    if (globalSearchQuery !== undefined && globalSearchQuery !== searchQuery) {
      setSearchQuery(globalSearchQuery);
      setPage(1);
    }
  }, [globalSearchQuery]);

  // Load Categories on mount
  useEffect(() => {
    async function loadCategories() {
      try {
        const data = await catalogService.getCategories();
        setCategories(Array.isArray(data) ? data : []);
      } catch {
        // Fallback or ignore
      }
    }
    loadCategories();
  }, []);

  // Fetch books with filters
  const fetchBooks = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const params = {
        skip: (page - 1) * pageSize,
        limit: pageSize,
      };

      if (searchQuery.trim()) params.query = searchQuery.trim();
      if (selectedCategoryId) params.category_id = selectedCategoryId;
      if (minPrice !== "") params.min_price = Number(minPrice);
      if (maxPrice !== "") params.max_price = Number(maxPrice);
      if (sortBy) params.sort_by = sortBy;

      const response = await catalogService.getBooks(params);
      if (response && Array.isArray(response.items)) {
        setBooks(response.items);
        setTotalBooks(response.total || response.items.length);
      } else if (Array.isArray(response)) {
        setBooks(response);
        setTotalBooks(response.length);
      } else {
        setBooks([]);
        setTotalBooks(0);
      }
    } catch (err) {
      const msg =
        err.response?.data?.detail ||
        "Failed to load catalog books. Please try again.";
      setError(typeof msg === "string" ? msg : "Error loading books.");
      setBooks([]);
    } finally {
      setLoading(false);
    }
  }, [page, searchQuery, selectedCategoryId, minPrice, maxPrice, sortBy]);

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchBooks();
  };

  const handleCategorySelect = (catId) => {
    setSelectedCategoryId(catId);
    setPage(1);
  };

  const handlePriceChange = (type, val) => {
    if (type === "min") setMinPrice(val);
    if (type === "max") setMaxPrice(val);
    setPage(1);
  };

  const handleSortChange = (val) => {
    setSortBy(val);
    setPage(1);
  };

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedCategoryId("");
    setMinPrice("");
    setMaxPrice("");
    setSortBy("");
    setPage(1);
    if (onClearGlobalSearch) onClearGlobalSearch();
    setSearchParams({});
  };

  const handleAddToCart = async (book, quantity = 1) => {
    setAddingBookId(book.id);
    try {
      await onAddToCart(book, quantity);
    } finally {
      setAddingBookId(null);
    }
  };

  const totalPages = Math.ceil(totalBooks / pageSize) || 1;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-brand-950 via-brand-900 to-indigo-950 rounded-2xl p-6 sm:p-10 text-white mb-8 shadow-md relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center space-x-1.5 bg-accent/20 text-accent px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Discover Great Reads</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold leading-tight mb-3 text-white">
            Explore Our Curated Bookstore Catalog
          </h1>
          <p className="text-slate-300 text-sm sm:text-base mb-6">
            Browse through thousands of bestselling books across engineering,
            literature, science, and business.
          </p>

          {/* Quick Search on Hero */}
          <form onSubmit={handleSearchSubmit} className="flex gap-2 max-w-lg">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                placeholder="Search Python, Clean Code, Frank Herbert..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white text-slate-900 text-sm rounded-xl focus:outline-none focus:ring-2 focus:ring-accent shadow-inner"
              />
            </div>
            <button
              type="submit"
              className="bg-accent hover:bg-accent-hover text-slate-950 font-bold px-5 py-3 rounded-xl text-sm transition-colors shadow flex-shrink-0"
            >
              Search
            </button>
          </form>
        </div>
      </div>

      {/* Main Grid: Sidebar Filters + Books */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Sidebar Filters */}
        <div className="lg:col-span-1">
          <FilterSidebar
            categories={categories}
            selectedCategoryId={selectedCategoryId}
            onSelectCategory={handleCategorySelect}
            minPrice={minPrice}
            maxPrice={maxPrice}
            onPriceChange={handlePriceChange}
            sortBy={sortBy}
            onSortChange={handleSortChange}
            onResetFilters={handleResetFilters}
          />
        </div>

        {/* Right Book Cards Area */}
        <div className="lg:col-span-3 space-y-6">
          {/* Active Filter Tags & Count Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm text-xs sm:text-sm text-slate-600">
            <div className="flex items-center space-x-2">
              <span className="font-bold text-slate-900">{totalBooks}</span>
              <span>books found</span>
              {selectedCategoryId && (
                <span className="bg-brand-100 text-brand-950 px-2 py-0.5 rounded-full font-semibold">
                  Category:{" "}
                  {categories.find((c) => c.id === selectedCategoryId)?.name ||
                    "Filtered"}
                </span>
              )}
              {searchQuery && (
                <span className="bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full font-semibold">
                  &ldquo;{searchQuery}&rdquo;
                </span>
              )}
            </div>

            {(selectedCategoryId ||
              searchQuery ||
              minPrice ||
              maxPrice ||
              sortBy) && (
              <button
                onClick={handleResetFilters}
                className="text-red-600 hover:text-red-700 font-bold underline"
              >
                Clear all filters
              </button>
            )}
          </div>

          {error && (
            <div
              role="alert"
              className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm flex items-start gap-2"
            >
              <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-600 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Books Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 animate-pulse">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div
                  key={n}
                  className="bg-white rounded-xl border border-slate-200 h-80 p-4 space-y-3"
                >
                  <div className="bg-slate-200 h-44 rounded-lg" />
                  <div className="bg-slate-200 h-4 w-3/4 rounded" />
                  <div className="bg-slate-200 h-4 w-1/2 rounded" />
                </div>
              ))}
            </div>
          ) : books.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200/80 p-12 text-center shadow-sm">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                <BookOpen className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-serif font-bold text-slate-800 mb-2">
                No Books Found
              </h3>
              <p className="text-sm text-slate-500 max-w-sm mx-auto mb-6">
                We couldn&apos;t find any books matching your current search or
                filter criteria. Try adjusting your filters.
              </p>
              <button
                onClick={handleResetFilters}
                className="bg-accent hover:bg-accent-hover text-slate-950 font-bold px-6 py-2.5 rounded-lg text-sm transition-colors shadow-sm"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {books.map((book) => (
                <BookCard
                  key={book.id}
                  book={book}
                  onAddToCart={handleAddToCart}
                  isAdding={addingBookId === book.id}
                />
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center space-x-2 pt-6">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 disabled:opacity-40 disabled:hover:bg-white transition-colors"
                aria-label="Previous page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {[...Array(totalPages)].map((_, i) => {
                const pageNum = i + 1;
                return (
                  <button
                    key={`page-${pageNum}`}
                    onClick={() => setPage(pageNum)}
                    className={`w-9 h-9 rounded-lg text-xs font-bold transition-colors ${
                      page === pageNum
                        ? "bg-brand-950 text-white shadow-sm"
                        : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 disabled:opacity-40 disabled:hover:bg-white transition-colors"
                aria-label="Next page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

CatalogPage.propTypes = {
  onAddToCart: PropTypes.func.isRequired,
  globalSearchQuery: PropTypes.string,
  onClearGlobalSearch: PropTypes.func,
};

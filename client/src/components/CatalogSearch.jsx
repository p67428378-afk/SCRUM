import React, { useState, useEffect, useCallback } from "react";
import { api } from "../services/api";
import { useAuth } from "../context/AuthContext";
import { BookCard } from "./BookCard";
import {
  Search,
  Filter,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  BookOpen,
} from "lucide-react";

export const CatalogSearch = () => {
  const { user, member, isAuthenticated, isStaffOrAdmin } = useAuth();

  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionSuccess, setActionSuccess] = useState(null);
  const [borrowingBookId, setBorrowingBookId] = useState(null);

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [availableOnly, setAvailableOnly] = useState(false);

  const fetchBooks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (searchTerm.trim()) params.query = searchTerm.trim();
      if (selectedCategory) params.category = selectedCategory;
      if (availableOnly) params.available_only = true;

      const data = await api.getBooks(params);
      setBooks(data);

      // Extract unique categories
      const cats = Array.from(
        new Set(data.map((b) => b.category).filter(Boolean)),
      );
      setCategories((prev) => Array.from(new Set([...prev, ...cats])));
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          err.message ||
          "Failed to fetch book catalog",
      );
    } finally {
      setLoading(false);
    }
  }, [searchTerm, selectedCategory, availableOnly]);

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  const handleResetFilters = () => {
    setSearchTerm("");
    setSelectedCategory("");
    setAvailableOnly(false);
  };

  const handleBorrow = async (book) => {
    setActionSuccess(null);
    setError(null);

    if (!isAuthenticated) {
      setError("Please sign in to borrow books from the library.");
      return;
    }

    // Determine member ID
    const memberIdToUse = member?.id || user?.member_id;
    if (!memberIdToUse && !isStaffOrAdmin) {
      setError("No active library member account linked to your user profile.");
      return;
    }

    setBorrowingBookId(book.id);
    try {
      await api.checkoutBook({
        book_id: book.id,
        member_id: memberIdToUse,
      });

      setActionSuccess(
        `Successfully checked out "${book.title}". Standard 14-day loan issued!`,
      );
      // Refresh book catalog to update available_copies
      await fetchBooks();
    } catch (err) {
      const detail =
        err.response?.data?.detail ||
        err.message ||
        "Failed to process checkout";
      setError(typeof detail === "string" ? detail : JSON.stringify(detail));
    } finally {
      setBorrowingBookId(null);
    }
  };

  return (
    <div className="min-h-[calc(100vh-73px)] bg-slate-50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-[#0F172A] tracking-tight">
              Library Book Catalog
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Explore our collection of tech books, classics, and reference
              guides.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchBooks}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors disabled:opacity-50"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`}
              />
              Refresh Catalog
            </button>
          </div>
        </div>

        {/* Alerts */}
        {error && (
          <div
            role="alert"
            className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl flex items-start gap-3 text-sm animate-in fade-in"
          >
            <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Operation Error</p>
              <p className="text-xs text-rose-700 mt-0.5">{error}</p>
            </div>
          </div>
        )}

        {actionSuccess && (
          <div
            role="status"
            className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-start gap-3 text-sm animate-in fade-in"
          >
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Checkout Confirmed</p>
              <p className="text-xs text-emerald-700 mt-0.5">{actionSuccess}</p>
            </div>
          </div>
        )}

        {/* Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
          {/* Sidebar Filters */}
          <aside className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 flex items-center gap-2 text-sm uppercase tracking-wider">
                <Filter className="w-4 h-4 text-indigo-600" />
                Filters
              </h3>
              {(searchTerm || selectedCategory || availableOnly) && (
                <button
                  onClick={handleResetFilters}
                  className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold"
                >
                  Reset
                </button>
              )}
            </div>

            {/* Keyword Search */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Search Catalog
              </label>
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="ISBN, Title, or Author..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Availability Toggle */}
            <div className="pt-2">
              <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl bg-slate-50 border border-slate-100 hover:bg-slate-100 transition-colors">
                <input
                  type="checkbox"
                  checked={availableOnly}
                  onChange={(e) => setAvailableOnly(e.target.checked)}
                  className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                />
                <span className="text-xs font-medium text-slate-700">
                  Available Books Only
                </span>
              </label>
            </div>
          </aside>

          {/* Main Book Grid */}
          <main className="lg:col-span-3">
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <div
                    key={n}
                    className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm animate-pulse space-y-4"
                  >
                    <div className="h-4 bg-slate-200 rounded w-1/3"></div>
                    <div className="h-6 bg-slate-200 rounded w-3/4"></div>
                    <div className="h-4 bg-slate-200 rounded w-1/2"></div>
                    <div className="h-10 bg-slate-200 rounded w-full mt-4"></div>
                  </div>
                ))}
              </div>
            ) : books.length === 0 ? (
              <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-3">
                <BookOpen className="w-12 h-12 text-slate-300 mx-auto" />
                <h4 className="text-lg font-bold text-slate-800">
                  No books found
                </h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  No catalog items match your search criteria. Try clearing some
                  filters.
                </p>
                <button
                  onClick={handleResetFilters}
                  className="mt-3 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-xl text-xs font-semibold hover:bg-indigo-100 transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {books.map((book) => (
                  <BookCard
                    key={book.id}
                    book={book}
                    onBorrow={handleBorrow}
                    isBorrowing={borrowingBookId === book.id}
                    canBorrow={true}
                  />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

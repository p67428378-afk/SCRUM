import React, { useState, useEffect } from "react";
import { BookOpen, Filter, AlertCircle, CheckCircle } from "lucide-react";
import { getBooks, checkoutBook } from "../services/api";
import { useAuth } from "../context/AuthContext";
import SearchBar from "../components/common/SearchBar";
import BookCard from "../components/catalog/BookCard";
import StatCard from "../components/common/StatCard";

export const CatalogPage = () => {
  const { user } = useAuth();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState("");
  const [genres, setGenres] = useState([]);
  const [checkingOutId, setCheckingOutId] = useState(null);
  const [notification, setNotification] = useState(null);

  const fetchCatalog = async () => {
    setLoading(true);
    try {
      const data = await getBooks({
        query: searchQuery,
        genre: selectedGenre,
        skip: 0,
        limit: 50,
      });
      const items = Array.isArray(data) ? data : data.items || [];
      setBooks(items);

      // Extract unique genres for filter dropdown
      const uniqueGenres = Array.from(
        new Set(items.map((b) => b.genre).filter(Boolean)),
      );
      if (uniqueGenres.length > 0 && genres.length === 0) {
        setGenres(uniqueGenres);
      }
    } catch (err) {
      console.error("Error fetching books:", err);
      showNotification("error", "Failed to load catalog items.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCatalog();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, selectedGenre]);

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleCheckout = async (book) => {
    if (!user) {
      showNotification("error", "Please log in to borrow books.");
      return;
    }
    setCheckingOutId(book.id);
    try {
      await checkoutBook(book.id);
      showNotification(
        "success",
        `Successfully checked out "${book.title}"! Due in 14 days.`,
      );
      fetchCatalog();
    } catch (err) {
      const errorDetail =
        err.response?.data?.detail || "Checkout failed. Please try again.";
      showNotification("error", errorDetail);
    } finally {
      setCheckingOutId(null);
    }
  };

  const totalTitles = books.length;
  const availableCount = books.reduce(
    (acc, b) => acc + (b.available_copies || 0),
    0,
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Library Book Catalog
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Browse, search, and borrow titles from our central collection.
          </p>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        <StatCard
          title="Total Titles"
          value={totalTitles}
          icon={BookOpen}
          color="blue"
        />
        <StatCard
          title="Available Copies"
          value={availableCount}
          icon={CheckCircle}
          color="green"
        />
        <StatCard
          title="Search Filter"
          value={selectedGenre || "All Genres"}
          icon={Filter}
          color="purple"
        />
      </div>

      {/* Notifications */}
      {notification && (
        <div
          className={`p-4 rounded-xl border flex items-center gap-3 text-sm font-medium transition-all ${
            notification.type === "success"
              ? "bg-emerald-50 text-emerald-800 border-emerald-200"
              : "bg-red-50 text-red-800 border-red-200"
          }`}
        >
          {notification.type === "success" ? (
            <CheckCircle size={18} />
          ) : (
            <AlertCircle size={18} />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Controls & Filters */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-4 items-center">
        <div className="flex-1 w-full">
          <SearchBar value={searchQuery} onChange={setSearchQuery} />
        </div>
        <div className="w-full sm:w-64">
          <select
            value={selectedGenre}
            onChange={(e) => setSelectedGenre(e.target.value)}
            className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Genres</option>
            {genres.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Catalog Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-64 bg-slate-100 rounded-xl animate-pulse"
            ></div>
          ))}
        </div>
      ) : books.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-xl border border-slate-200">
          <BookOpen className="mx-auto h-12 w-12 text-slate-300 mb-3" />
          <h3 className="text-lg font-bold text-slate-800">No books found</h3>
          <p className="text-sm text-slate-500 mt-1">
            Try adjusting your search query or genre filter.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {books.map((book) => (
            <BookCard
              key={book.id}
              book={book}
              onCheckout={handleCheckout}
              isCheckingOut={checkingOutId === book.id}
              userRole={user?.role}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default CatalogPage;

import React, { useState, useEffect, useCallback } from "react";
import { booksApi } from "../services/api";
import { SearchFilterBar } from "../components/SearchFilterBar";
import { BookCard } from "../components/BookCard";
import {
  BookOpen,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  X,
  Layers,
  Hash,
  Tag,
  UserCheck,
} from "lucide-react";

export const CatalogPage = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [genreFilter, setGenreFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [isbnFilter, setIsbnFilter] = useState("");

  // Pagination state
  const [page, setPage] = useState(1);
  const limit = 12;

  // Selected book for details modal
  const [selectedBook, setSelectedBook] = useState(null);

  const fetchBooks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {
        skip: (page - 1) * limit,
        limit,
      };
      if (searchQuery.trim()) params.q = searchQuery.trim();
      if (genreFilter) params.genre = genreFilter;
      if (statusFilter) params.status = statusFilter;
      if (isbnFilter.trim()) params.isbn = isbnFilter.trim();

      const data = await booksApi.getBooks(params);
      setBooks(data);
    } catch (err) {
      console.error("Error fetching books:", err);
      setError(
        "Unable to load book catalog. Please check backend service connection.",
      );
    } finally {
      setLoading(false);
    }
  }, [page, searchQuery, genreFilter, statusFilter, isbnFilter]);

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  const handleResetFilters = () => {
    setSearchQuery("");
    setGenreFilter("");
    setStatusFilter("");
    setIsbnFilter("");
    setPage(1);
  };

  const handleCheckoutSuccess = () => {
    fetchBooks();
  };

  const genresList = [
    "Software Engineering",
    "Computer Science",
    "Fiction",
    "Dystopian",
    "Science",
    "History",
    "Philosophy",
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Header */}
      <div className="mb-8 text-center sm:text-left">
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#111c2d] tracking-tight">
          Athenaeum Book Catalog
        </h1>
        <p className="text-[#566070] text-sm sm:text-base mt-2 max-w-3xl">
          Discover, search, and borrow from our comprehensive repository of
          physical and digital volumes.
        </p>
      </div>

      {/* Search and Filters */}
      <SearchFilterBar
        searchQuery={searchQuery}
        setSearchQuery={(q) => {
          setSearchQuery(q);
          setPage(1);
        }}
        genreFilter={genreFilter}
        setGenreFilter={(g) => {
          setGenreFilter(g);
          setPage(1);
        }}
        statusFilter={statusFilter}
        setStatusFilter={(s) => {
          setStatusFilter(s);
          setPage(1);
        }}
        isbnFilter={isbnFilter}
        setIsbnFilter={(i) => {
          setIsbnFilter(i);
          setPage(1);
        }}
        genres={genresList}
        onReset={handleResetFilters}
        totalResults={books.length}
      />

      {/* Error state */}
      {error && (
        <div className="mb-8 p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl flex items-center space-x-3">
          <AlertCircle className="w-5 h-5 text-[#ba1a1a] flex-shrink-0" />
          <div className="text-sm">{error}</div>
        </div>
      )}

      {/* Loading Skeleton / Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-xl border border-gray-200 p-5 animate-pulse h-64 flex flex-col justify-between"
            >
              <div>
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-3"></div>
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
              <div className="h-8 bg-gray-200 rounded w-full"></div>
            </div>
          ))}
        </div>
      ) : books.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center my-8">
          <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="font-serif text-xl font-bold text-[#111c2d]">
            No books matching criteria
          </h3>
          <p className="text-sm text-[#566070] mt-1 max-w-md mx-auto">
            Try adjusting your search terms, changing the genre filter, or
            clearing the ISBN query.
          </p>
          <button
            onClick={handleResetFilters}
            className="mt-6 inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-[#111c2d] bg-white hover:bg-gray-50 transition"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {books.map((book) => (
            <BookCard
              key={book.id}
              book={book}
              onCheckoutSuccess={handleCheckoutSuccess}
              onSelectBook={(b) => setSelectedBook(b)}
            />
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {!loading && books.length > 0 && (
        <div className="mt-10 flex items-center justify-between border-t border-gray-200 pt-6">
          <div className="text-xs text-[#566070]">
            Page <strong className="text-[#111c2d]">{page}</strong>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              disabled={page === 1}
              className="inline-flex items-center px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-medium text-[#111c2d] bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Previous
            </button>
            <button
              onClick={() => setPage((prev) => prev + 1)}
              disabled={books.length < limit}
              className="inline-flex items-center px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-medium text-[#111c2d] bg-white hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </button>
          </div>
        </div>
      )}

      {/* Book Details Modal */}
      {selectedBook && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl relative border border-gray-100">
            <button
              onClick={() => setSelectedBook(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3 mb-4">
              <div className="p-3 bg-[#122338]/10 rounded-xl text-[#122338]">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs uppercase font-semibold text-[#0d6847] tracking-wider">
                  {selectedBook.genre}
                </span>
                <h3 className="font-serif text-xl font-bold text-[#111c2d] leading-tight">
                  {selectedBook.title}
                </h3>
              </div>
            </div>

            <div className="space-y-3 py-3 border-y border-gray-100 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#566070] flex items-center">
                  <UserCheck className="w-4 h-4 mr-1.5 text-gray-400" />
                  Author:
                </span>
                <span className="font-medium text-[#111c2d]">
                  {selectedBook.author}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#566070] flex items-center">
                  <Hash className="w-4 h-4 mr-1.5 text-gray-400" />
                  ISBN:
                </span>
                <span className="font-mono text-xs text-[#111c2d] bg-gray-100 px-2 py-0.5 rounded">
                  {selectedBook.isbn}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#566070] flex items-center">
                  <Tag className="w-4 h-4 mr-1.5 text-gray-400" />
                  Genre:
                </span>
                <span className="text-xs font-semibold text-[#111c2d]">
                  {selectedBook.genre}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#566070] flex items-center">
                  <Layers className="w-4 h-4 mr-1.5 text-gray-400" />
                  Inventory Status:
                </span>
                <span className="text-xs font-semibold">
                  <strong className="text-emerald-700">
                    {selectedBook.available_copies}
                  </strong>{" "}
                  available of {selectedBook.total_copies} copies
                </span>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setSelectedBook(null)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

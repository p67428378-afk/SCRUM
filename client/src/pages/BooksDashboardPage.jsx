import React, { useState, useEffect, useCallback } from "react";
import Navbar from "../components/layout/Navbar";
import KpiBanner from "../components/books/KpiBanner";
import BooksTable from "../components/books/BooksTable";
import BookFormModal from "../components/books/BookFormModal";
import { getBooks, createBook, updateBook, deleteBook } from "../services/api";
import {
  Search,
  Filter,
  Plus,
  RefreshCw,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

export default function BooksDashboardPage() {
  const [books, setBooks] = useState([]);
  const [total, setTotal] = useState(0);
  const [skip, setSkip] = useState(0);
  const [limit] = useState(10);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [inStockFilter, setInStockFilter] = useState("All"); // All, true, false

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState(null);

  const [deletingBook, setDeletingBook] = useState(null);

  const fetchBooks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let inStockParam;
      if (inStockFilter === "In Stock") inStockParam = true;
      if (inStockFilter === "Out of Stock") inStockParam = false;

      const data = await getBooks({
        query: searchQuery,
        category: selectedCategory,
        in_stock: inStockParam,
        skip,
        limit,
      });

      if (Array.isArray(data)) {
        setBooks(data);
        setTotal(data.length);
      } else if (data && Array.isArray(data.items)) {
        setBooks(data.items);
        setTotal(data.total !== undefined ? data.total : data.items.length);
      } else {
        setBooks([]);
        setTotal(0);
      }
    } catch (err) {
      console.error("Error fetching books:", err);
      const msg =
        err.response?.data?.detail ||
        err.message ||
        "Failed to fetch book inventory.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedCategory, inStockFilter, skip, limit]);

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSkip(0);
    fetchBooks();
  };

  const handleOpenAddModal = () => {
    setEditingBook(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (book) => {
    setEditingBook(book);
    setIsModalOpen(true);
  };

  const handleSaveBook = async (formData) => {
    if (editingBook && editingBook.id) {
      await updateBook(editingBook.id, formData);
      setNotification("Book updated successfully!");
    } else {
      await createBook(formData);
      setNotification("New book added successfully!");
    }
    setTimeout(() => setNotification(null), 4000);
    fetchBooks();
  };

  const handleDeleteBook = async () => {
    if (!deletingBook) return;
    try {
      await deleteBook(deletingBook.id);
      setNotification(`Book "${deletingBook.title}" deleted successfully.`);
      setTimeout(() => setNotification(null), 4000);
      setDeletingBook(null);
      fetchBooks();
    } catch (err) {
      const msg =
        err.response?.data?.detail || err.message || "Failed to delete book.";
      setError(msg);
      setDeletingBook(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar onOpenAddModal={handleOpenAddModal} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Book Inventory & Catalog
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Manage library records, monitor stock levels, and search catalog
              items.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchBooks}
              disabled={loading}
              className="p-2.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 rounded-lg transition shadow-sm"
              title="Refresh inventory"
            >
              <RefreshCw
                className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
              />
            </button>
            <button
              onClick={handleOpenAddModal}
              className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white font-medium text-sm rounded-lg hover:bg-indigo-700 transition shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Book</span>
            </button>
          </div>
        </div>

        {/* Notifications */}
        {notification && (
          <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-emerald-800 text-sm font-medium">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{notification}</span>
            </div>
            <button
              onClick={() => setNotification(null)}
              className="text-xs text-emerald-600 underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center justify-between text-red-800 text-sm font-medium">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-xs text-red-600 underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* KPI Summary */}
        <KpiBanner books={books} totalCount={total} />

        {/* Search & Filter Bar */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6 flex flex-col md:flex-row gap-4 justify-between items-center">
          <form
            onSubmit={handleSearchSubmit}
            className="flex-1 w-full flex items-center gap-2"
          >
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by title, author, or keyword..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white font-medium text-sm rounded-lg hover:bg-indigo-700 transition"
            >
              Search
            </button>
          </form>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="flex items-center gap-2 w-1/2 md:w-auto">
              <Filter className="w-4 h-4 text-slate-500 shrink-0" />
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setSkip(0);
                }}
                className="w-full md:w-auto border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white"
              >
                <option value="All">All Categories</option>
                <option value="Software Engineering">
                  Software Engineering
                </option>
                <option value="Fiction">Fiction</option>
                <option value="Non-Fiction">Non-Fiction</option>
                <option value="Science & Technology">
                  Science & Technology
                </option>
                <option value="Biography">Biography</option>
                <option value="History">History</option>
                <option value="Business">Business</option>
              </select>
            </div>

            <select
              value={inStockFilter}
              onChange={(e) => {
                setInStockFilter(e.target.value);
                setSkip(0);
              }}
              className="w-1/2 md:w-auto border border-slate-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white"
            >
              <option value="All">All Availability</option>
              <option value="In Stock">In Stock Only</option>
              <option value="Out of Stock">Out of Stock</option>
            </select>
          </div>
        </div>

        {/* Data Table */}
        <BooksTable
          books={books}
          total={total}
          skip={skip}
          limit={limit}
          onPageChange={setSkip}
          onEdit={handleOpenEditModal}
          onDelete={(book) => setDeletingBook(book)}
          loading={loading}
        />
      </main>

      {/* Add / Edit Form Modal */}
      <BookFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSaveBook}
        initialData={editingBook}
      />

      {/* Delete Confirmation Modal */}
      {deletingBook && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 mb-2">
              Delete Book Record
            </h3>
            <p className="text-sm text-slate-600 mb-6">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-slate-900">
                "{deletingBook.title}"
              </span>
              ? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setDeletingBook(null)}
                className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteBook}
                className="px-4 py-2 bg-red-600 text-white font-medium text-sm rounded-lg hover:bg-red-700 transition"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

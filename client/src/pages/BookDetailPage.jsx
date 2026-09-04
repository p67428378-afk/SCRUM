import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import StockBadge from "../components/common/StockBadge";
import BookFormModal from "../components/books/BookFormModal";
import { getBookById, updateBook, deleteBook } from "../services/api";
import {
  ArrowLeft,
  Edit3,
  Trash2,
  Calendar,
  DollarSign,
  Tag,
  Hash,
  BookOpen,
  AlertCircle,
} from "lucide-react";

export default function BookDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    async function loadBook() {
      setLoading(true);
      setError(null);
      try {
        const data = await getBookById(id);
        setBook(data);
      } catch (err) {
        console.error("Error fetching book detail:", err);
        const msg =
          err.response?.data?.detail || err.message || "Book record not found.";
        setError(msg);
      } finally {
        setLoading(false);
      }
    }
    if (id) {
      loadBook();
    }
  }, [id]);

  const handleUpdateBook = async (formData) => {
    const updated = await updateBook(id, formData);
    setBook(updated);
  };

  const handleDeleteBook = async () => {
    try {
      await deleteBook(id);
      navigate("/");
    } catch (err) {
      const msg =
        err.response?.data?.detail || err.message || "Failed to delete book.";
      setError(msg);
      setShowDeleteConfirm(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm font-medium text-slate-600">
              Loading book details...
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar />
        <div className="flex-1 max-w-4xl mx-auto w-full px-4 py-12">
          <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 text-center">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
            <h2 className="text-xl font-bold text-slate-900 mb-2">
              Book Not Found
            </h2>
            <p className="text-sm text-slate-600 mb-6">
              {error || "The requested book record does not exist."}
            </p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-medium text-sm rounded-lg hover:bg-indigo-700 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Catalog</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const stockQty = parseInt(book.stock_quantity, 10) || 0;
  const stockHealthPercent = Math.min(100, Math.max(0, (stockQty / 20) * 100));

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Breadcrumb */}
        <div className="mb-6">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-indigo-600 hover:text-indigo-800 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Inventory Catalog</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info Card */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 p-6 sm:p-8">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <span className="inline-block px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-semibold rounded-full border border-indigo-100 mb-2">
                  {book.category}
                </span>
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 leading-tight">
                  {book.title}
                </h1>
                <p className="text-slate-600 font-medium text-base mt-1">
                  By <span className="text-slate-800">{book.author}</span>
                </p>
              </div>
              <StockBadge stockQuantity={book.stock_quantity} />
            </div>

            {/* Metadata Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 border-t border-b border-slate-100 py-6 my-6 text-sm">
              <div className="flex items-center gap-2.5">
                <Hash className="w-4 h-4 text-slate-400 shrink-0" />
                <div>
                  <p className="text-xs text-slate-500 font-medium">ISBN</p>
                  <p className="font-mono text-slate-900 font-semibold">
                    {book.isbn}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <DollarSign className="w-4 h-4 text-slate-400 shrink-0" />
                <div>
                  <p className="text-xs text-slate-500 font-medium">Price</p>
                  <p className="text-slate-900 font-semibold">
                    ${parseFloat(book.price).toFixed(2)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                <div>
                  <p className="text-xs text-slate-500 font-medium">
                    Publication Year
                  </p>
                  <p className="text-slate-900 font-semibold">
                    {book.publication_year}
                  </p>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="mb-6">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2">
                Description
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">
                {book.description || "No description provided for this book."}
              </p>
            </div>

            {/* Record Audit Info */}
            <div className="pt-4 border-t border-slate-100 text-xs text-slate-400 flex flex-wrap justify-between gap-2">
              <span>
                Record ID:{" "}
                <span className="font-mono text-slate-600">{book.id}</span>
              </span>
              {book.created_at && (
                <span>
                  Created: {new Date(book.created_at).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>

          {/* Side Panel Actions & Stock Health */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4">
                Stock Health
              </h3>

              <div className="mb-4">
                <div className="flex justify-between text-xs font-semibold text-slate-600 mb-1">
                  <span>Current Stock</span>
                  <span>{book.stock_quantity} units</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                  <div
                    className={`h-2.5 rounded-full transition-all duration-500 ${
                      stockQty === 0
                        ? "bg-red-500"
                        : stockQty <= 5
                          ? "bg-amber-500"
                          : "bg-emerald-500"
                    }`}
                    style={{ width: `${stockHealthPercent}%` }}
                  ></div>
                </div>
              </div>

              <p className="text-xs text-slate-500">
                {stockQty === 0
                  ? "Out of stock! Please reorder inventory."
                  : stockQty <= 5
                    ? "Low stock warning! Consider placing an order soon."
                    : "Inventory level is healthy."}
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 space-y-3">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2">
                Actions
              </h3>
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="w-full flex items-center justify-center gap-2 py-2.5 bg-indigo-600 text-white font-medium text-sm rounded-lg hover:bg-indigo-700 transition"
              >
                <Edit3 className="w-4 h-4" />
                <span>Edit Book Record</span>
              </button>

              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="w-full flex items-center justify-center gap-2 py-2.5 border border-red-200 text-red-600 hover:bg-red-50 font-medium text-sm rounded-lg transition"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete Book</span>
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Edit Modal */}
      <BookFormModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handleUpdateBook}
        initialData={book}
      />

      {/* Delete Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 mb-2">
              Delete Book Record
            </h3>
            <p className="text-sm text-slate-600 mb-6">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-slate-900">
                "{book.title}"
              </span>
              ? This will permanently remove it from the catalog.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
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

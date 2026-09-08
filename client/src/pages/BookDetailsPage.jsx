import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { useParams, Link } from "react-router-dom";
import { catalogService } from "../services/api";
import BookDetails from "../components/details/BookDetails";
import { ArrowLeft, AlertCircle, BookOpen } from "lucide-react";

export default function BookDetailsPage({ onAddToCart }) {
  const { id } = useParams();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    async function loadBook() {
      if (!id) return;
      setLoading(true);
      setError("");
      try {
        const data = await catalogService.getBookById(id);
        setBook(data);
      } catch (err) {
        const msg =
          err.response?.data?.detail || "Book not found or failed to load.";
        setError(typeof msg === "string" ? msg : "Error loading book details.");
        setBook(null);
      } finally {
        setLoading(false);
      }
    }
    loadBook();
  }, [id]);

  const handleAddToCart = async (item, quantity = 1) => {
    setIsAdding(true);
    try {
      await onAddToCart(item, quantity);
    } finally {
      setIsAdding(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="bg-white rounded-2xl border border-slate-200 p-8 animate-pulse space-y-6">
          <div className="h-6 bg-slate-200 w-32 rounded" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="h-96 bg-slate-200 rounded-xl" />
            <div className="space-y-4">
              <div className="h-8 bg-slate-200 w-3/4 rounded" />
              <div className="h-4 bg-slate-200 w-1/2 rounded" />
              <div className="h-6 bg-slate-200 w-24 rounded" />
              <div className="h-32 bg-slate-200 rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 text-center">
        <div className="bg-white rounded-2xl border border-slate-200 p-12 shadow-sm">
          <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-serif font-bold text-slate-900 mb-2">
            Book Not Available
          </h2>
          <p className="text-sm text-slate-500 mb-6">
            {error || "The requested book could not be found in our catalog."}
          </p>
          <Link
            to="/"
            className="inline-flex items-center space-x-2 bg-brand-950 hover:bg-brand-900 text-white font-bold px-6 py-2.5 rounded-lg text-sm transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Catalog</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <BookDetails
      book={book}
      onAddToCart={handleAddToCart}
      isAdding={isAdding}
    />
  );
}

BookDetailsPage.propTypes = {
  onAddToCart: PropTypes.func.isRequired,
};

import React, { useState } from "react";
import {
  Book as BookIcon,
  CheckCircle2,
  AlertCircle,
  BookmarkPlus,
  Hash,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { loansApi } from "../services/api";

export const BookCard = ({ book, onCheckoutSuccess, onSelectBook }) => {
  const { user, isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const isAvailable = (book.available_copies ?? 0) > 0;

  const handleCheckout = async (e) => {
    e.stopPropagation();
    setError(null);
    setSuccessMsg(null);

    if (!isAuthenticated) {
      setError("Please sign in to checkout books.");
      return;
    }

    setLoading(true);
    try {
      await loansApi.checkout({
        book_id: book.id,
        patron_id: user.id,
      });
      setSuccessMsg("Book successfully checked out! Due in 14 days.");
      if (onCheckoutSuccess) {
        onCheckoutSuccess(book.id);
      }
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err) {
      const msg =
        err.response?.data?.detail ||
        "Failed to checkout book. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  // Generate deterministic gentle background color based on genre
  const getGenreColor = (genre) => {
    const map = {
      "Software Engineering": "bg-blue-50 text-blue-700 border-blue-200",
      "Computer Science": "bg-indigo-50 text-indigo-700 border-indigo-200",
      Fiction: "bg-emerald-50 text-emerald-700 border-emerald-200",
      Dystopian: "bg-purple-50 text-purple-700 border-purple-200",
      History: "bg-amber-50 text-amber-700 border-amber-200",
      Science: "bg-cyan-50 text-cyan-700 border-cyan-200",
    };
    return map[genre] || "bg-slate-50 text-slate-700 border-slate-200";
  };

  return (
    <div
      onClick={() => onSelectBook && onSelectBook(book)}
      className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden group"
    >
      <div className="p-5">
        {/* Top bar: Genre & Availability Badge */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <span
            className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getGenreColor(
              book.genre,
            )}`}
          >
            {book.genre}
          </span>
          <span
            className={`inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-md ${
              isAvailable
                ? "bg-emerald-50 text-[#0d6847] border border-emerald-200"
                : "bg-rose-50 text-[#ba1a1a] border border-rose-200"
            }`}
          >
            {isAvailable ? `${book.available_copies} Available` : "Checked Out"}
          </span>
        </div>

        {/* Book Title & Author */}
        <div className="flex gap-3">
          <div className="w-12 h-16 bg-[#122338]/5 rounded-md border border-gray-100 flex items-center justify-center flex-shrink-0 group-hover:bg-[#122338]/10 transition">
            <BookIcon className="w-6 h-6 text-[#122338]/60" />
          </div>
          <div className="flex-1 min-w-0">
            <h3
              className="font-serif text-lg font-semibold text-[#111c2d] leading-snug line-clamp-2 group-hover:text-[#122338] transition"
              title={book.title}
            >
              {book.title}
            </h3>
            <p className="text-xs text-[#566070] mt-1 font-medium">
              {book.author}
            </p>
          </div>
        </div>

        {/* ISBN & Stock Metadata */}
        <div className="mt-4 pt-3 border-t border-gray-100 grid grid-cols-2 gap-2 text-xs text-[#566070]">
          <div className="flex items-center space-x-1 font-mono">
            <Hash className="w-3.5 h-3.5 text-gray-400" />
            <span className="truncate" title={book.isbn}>
              {book.isbn}
            </span>
          </div>
          <div className="text-right">
            Total Copies:{" "}
            <strong className="text-[#111c2d]">{book.total_copies}</strong>
          </div>
        </div>

        {/* Inline Alerts */}
        {error && (
          <div className="mt-3 p-2 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-lg flex items-center space-x-1.5">
            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 text-[#ba1a1a]" />
            <span className="truncate">{error}</span>
          </div>
        )}
        {successMsg && (
          <div className="mt-3 p-2 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg flex items-center space-x-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0 text-[#0d6847]" />
            <span className="truncate">{successMsg}</span>
          </div>
        )}
      </div>

      {/* Card Footer: Action */}
      <div className="px-5 py-3.5 bg-gray-50/70 border-t border-gray-100 flex items-center justify-between">
        <span className="text-xs text-gray-500">
          {isAvailable ? "Ready for borrow" : "All copies currently out"}
        </span>
        <button
          onClick={handleCheckout}
          disabled={!isAvailable || loading}
          className={`inline-flex items-center px-3.5 py-1.5 rounded-lg text-xs font-semibold shadow-sm transition ${
            isAvailable
              ? "bg-[#122338] hover:bg-[#1f3552] text-white cursor-pointer active:scale-95"
              : "bg-gray-200 text-gray-400 cursor-not-allowed"
          }`}
        >
          <BookmarkPlus className="w-3.5 h-3.5 mr-1.5" />
          <span>
            {loading
              ? "Processing..."
              : isAvailable
                ? "Borrow Book"
                : "Unavailable"}
          </span>
        </button>
      </div>
    </div>
  );
};

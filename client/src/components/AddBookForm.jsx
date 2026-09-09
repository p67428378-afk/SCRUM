import React, { useState } from "react";
import {
  PlusCircle,
  CheckCircle,
  AlertCircle,
  Book,
  Layers,
  Tag,
  UserCheck,
  Hash,
} from "lucide-react";
import { booksApi } from "../services/api";

const DEFAULT_GENRES = [
  "Software Engineering",
  "Computer Science",
  "Fiction",
  "Dystopian",
  "Non-Fiction",
  "Science",
  "History",
  "Philosophy",
  "Biography",
];

export const AddBookForm = ({ onBookAdded }) => {
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    isbn: "",
    genre: "Software Engineering",
    customGenre: "",
    total_copies: 1,
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "total_copies" ? parseInt(value, 10) || 1 : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const finalGenre =
      formData.genre === "CUSTOM"
        ? formData.customGenre.trim()
        : formData.genre;

    if (!formData.title.trim()) {
      setErrorMsg("Book title is required.");
      return;
    }
    if (!formData.author.trim()) {
      setErrorMsg("Author name is required.");
      return;
    }
    if (!formData.isbn.trim()) {
      setErrorMsg("ISBN is required.");
      return;
    }
    if (!finalGenre) {
      setErrorMsg("Please specify a genre.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        title: formData.title.trim(),
        author: formData.author.trim(),
        isbn: formData.isbn.trim(),
        genre: finalGenre,
        total_copies: Math.max(1, formData.total_copies),
      };

      const newBook = await booksApi.createBook(payload);
      setSuccessMsg(`Successfully added "${newBook.title}" to the catalog!`);
      setFormData({
        title: "",
        author: "",
        isbn: "",
        genre: "Software Engineering",
        customGenre: "",
        total_copies: 1,
      });

      if (onBookAdded) {
        onBookAdded(newBook);
      }
      setTimeout(() => setSuccessMsg(null), 5000);
    } catch (err) {
      const msg =
        err.response?.data?.detail ||
        "Failed to add book to catalog. Please verify ISBN uniqueness.";
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
      <div className="flex items-center space-x-2.5 pb-4 border-b border-gray-100 mb-6">
        <div className="p-2 bg-[#122338]/5 rounded-lg text-[#122338]">
          <Book className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-serif text-lg font-bold text-[#111c2d]">
            Add New Book to Catalog
          </h3>
          <p className="text-xs text-[#566070]">
            Catalog Ingestion & Inventory Setup
          </p>
        </div>
      </div>

      {errorMsg && (
        <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-lg flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 text-[#ba1a1a] flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg flex items-center space-x-2">
          <CheckCircle className="w-4 h-4 text-[#0d6847] flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title */}
        <div>
          <label className="block text-xs font-semibold text-[#566070] uppercase mb-1">
            Book Title <span className="text-rose-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
              <Book className="w-4 h-4" />
            </div>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. Clean Architecture: A Craftsman's Guide"
              required
              className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-[#111c2d] focus:ring-2 focus:ring-[#122338] focus:bg-white transition"
            />
          </div>
        </div>

        {/* Author & ISBN Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#566070] uppercase mb-1">
              Author <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <UserCheck className="w-4 h-4" />
              </div>
              <input
                type="text"
                name="author"
                value={formData.author}
                onChange={handleChange}
                placeholder="e.g. Robert C. Martin"
                required
                className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-[#111c2d] focus:ring-2 focus:ring-[#122338] focus:bg-white transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#566070] uppercase mb-1">
              ISBN <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <Hash className="w-4 h-4" />
              </div>
              <input
                type="text"
                name="isbn"
                value={formData.isbn}
                onChange={handleChange}
                placeholder="e.g. 9780134494166"
                required
                className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm font-mono text-[#111c2d] focus:ring-2 focus:ring-[#122338] focus:bg-white transition"
              />
            </div>
          </div>
        </div>

        {/* Genre & Total Copies Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#566070] uppercase mb-1">
              Genre <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <Tag className="w-4 h-4" />
              </div>
              <select
                name="genre"
                value={formData.genre}
                onChange={handleChange}
                className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-[#111c2d] focus:ring-2 focus:ring-[#122338] focus:bg-white transition"
              >
                {DEFAULT_GENRES.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
                <option value="CUSTOM">+ Custom Genre...</option>
              </select>
            </div>
            {formData.genre === "CUSTOM" && (
              <input
                type="text"
                name="customGenre"
                value={formData.customGenre}
                onChange={handleChange}
                placeholder="Enter custom genre name"
                className="mt-2 w-full px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs text-[#111c2d] focus:ring-2 focus:ring-[#122338]"
              />
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#566070] uppercase mb-1">
              Total Copies <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <Layers className="w-4 h-4" />
              </div>
              <input
                type="number"
                name="total_copies"
                min="1"
                max="1000"
                value={formData.total_copies}
                onChange={handleChange}
                required
                className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-[#111c2d] focus:ring-2 focus:ring-[#122338] focus:bg-white transition"
              />
            </div>
          </div>
        </div>

        {/* Submit button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex items-center justify-center px-4 py-2.5 border border-transparent rounded-lg text-sm font-semibold text-white bg-[#122338] hover:bg-[#1f3552] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#122338] shadow-sm transition disabled:opacity-50"
          >
            <PlusCircle className="w-4 h-4 mr-2" />
            <span>
              {loading ? "Adding to Catalog..." : "Save Book to Catalog"}
            </span>
          </button>
        </div>
      </form>
    </div>
  );
};

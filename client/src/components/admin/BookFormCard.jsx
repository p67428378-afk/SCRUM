import React, { useState, useEffect } from "react";
import { PlusCircle, Save, X } from "lucide-react";
import Button from "../common/Button";

export const BookFormCard = ({
  initialData,
  onSubmit,
  onCancel,
  isLoading,
}) => {
  const [formData, setFormData] = useState({
    title: "",
    author: "",
    isbn: "",
    genre: "",
    total_copies: 1,
  });

  const [error, setError] = useState("");

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || "",
        author: initialData.author || "",
        isbn: initialData.isbn || "",
        genre: initialData.genre || "",
        total_copies: initialData.total_copies || 1,
      });
    } else {
      setFormData({
        title: "",
        author: "",
        isbn: "",
        genre: "",
        total_copies: 1,
      });
    }
    setError("");
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "total_copies" ? Math.max(1, parseInt(value, 10) || 1) : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (
      !formData.title ||
      !formData.author ||
      (!initialData && !formData.isbn)
    ) {
      setError("Please fill in all required fields (Title, Author, and ISBN).");
      return;
    }
    setError("");
    onSubmit(formData);
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
        <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
          {initialData ? (
            <Save size={18} className="text-blue-600" />
          ) : (
            <PlusCircle size={18} className="text-blue-600" />
          )}
          <span>
            {initialData ? "Edit Catalog Entry" : "Add New Book to Inventory"}
          </span>
        </h3>
        {onCancel && (
          <button
            onClick={onCancel}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-md"
          >
            <X size={18} />
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. The Clean Coder"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Author <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="author"
              value={formData.author}
              onChange={handleChange}
              placeholder="e.g. Robert C. Martin"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              ISBN <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="isbn"
              value={formData.isbn}
              onChange={handleChange}
              disabled={!!initialData}
              placeholder="e.g. 978-0137081073"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100 disabled:text-slate-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Genre / Category
            </label>
            <input
              type="text"
              name="genre"
              value={formData.genre}
              onChange={handleChange}
              placeholder="e.g. Software Engineering, Fiction, Science"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Total Copies <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="total_copies"
              min="1"
              value={formData.total_copies}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onCancel}
            >
              Cancel
            </Button>
          )}
          <Button
            type="submit"
            variant="primary"
            size="sm"
            disabled={isLoading}
          >
            {isLoading ? "Saving..." : initialData ? "Update Book" : "Add Book"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default BookFormCard;

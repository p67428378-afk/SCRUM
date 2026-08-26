import React, { useState } from "react";
import PropTypes from "prop-types";
import { Plus, CheckCircle2, AlertCircle } from "lucide-react";
import { createCategory, formatApiError } from "../../services/api";

export default function AddCategoryForm({ onCategoryCreated }) {
  const [name, setName] = useState("");
  const [type, setType] = useState("expense");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    const trimmedName = name.trim();
    if (!trimmedName) {
      setError("Category name is required.");
      return;
    }

    setLoading(true);
    try {
      const created = await createCategory({
        name: trimmedName,
        type,
        is_predefined: false,
      });
      setName("");
      setType("expense");
      setSuccessMsg(`Category "${created.name}" created successfully!`);
      if (onCategoryCreated) {
        onCategoryCreated(created);
      }
    } catch (err) {
      setError(formatApiError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-blue-50 text-[#2663EB] flex items-center justify-center">
          <Plus className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-base font-bold text-[#171C29]">
            Create Custom Category
          </h3>
          <p className="text-xs text-[#707A8C]">
            Add a new category to organize your transactions
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="category-name-input"
            className="block text-xs font-semibold text-[#171C29] mb-1.5"
          >
            Category Name <span className="text-red-500">*</span>
          </label>
          <input
            id="category-name-input"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Freelance Work, Online Shopping..."
            maxLength={100}
            className="w-full px-3.5 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2663EB] focus:border-transparent transition"
            required
          />
        </div>

        <div>
          <label
            htmlFor="category-type-select"
            className="block text-xs font-semibold text-[#171C29] mb-1.5"
          >
            Transaction Type <span className="text-red-500">*</span>
          </label>
          <select
            id="category-type-select"
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full px-3.5 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2663EB] focus:border-transparent transition text-[#171C29]"
          >
            <option value="expense">Expense Only</option>
            <option value="income">Income Only</option>
            <option value="both">Both (Income & Expense)</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 px-4 rounded-xl bg-[#2663EB] text-white text-sm font-semibold hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 transition shadow-sm flex items-center justify-center gap-2"
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <Plus className="w-4 h-4" />
              <span>Save Category</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}

AddCategoryForm.propTypes = {
  onCategoryCreated: PropTypes.func,
};

AddCategoryForm.defaultProps = {
  onCategoryCreated: null,
};

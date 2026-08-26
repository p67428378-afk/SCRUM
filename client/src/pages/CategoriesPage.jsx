import React, { useState, useEffect, useCallback } from "react";
import { Tags, AlertCircle } from "lucide-react";
import AddCategoryForm from "../components/categories/AddCategoryForm";
import CategoryDirectoryTable from "../components/categories/CategoryDirectoryTable";
import { getCategories, formatApiError } from "../services/api";

export default function CategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getCategories();
      setCategories(data);
    } catch (err) {
      setError(formatApiError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleCategoryCreated = (_newCategory) => {
    fetchCategories();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#2663EB] flex items-center justify-center shadow-sm">
            <Tags className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#171C29] tracking-tight">
              Category Management
            </h1>
            <p className="text-sm text-[#707A8C]">
              Define custom categories and view all predefined budget
              categories.
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Two Column Layout: Form and Directory */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-4 w-full">
          <AddCategoryForm onCategoryCreated={handleCategoryCreated} />
        </div>

        <div className="lg:col-span-8 w-full">
          <CategoryDirectoryTable categories={categories} loading={loading} />
        </div>
      </div>
    </div>
  );
}

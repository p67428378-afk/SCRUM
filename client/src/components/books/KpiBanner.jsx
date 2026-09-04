import React from "react";
import { BookOpen, Layers, DollarSign, AlertTriangle } from "lucide-react";

export default function KpiBanner({ books, totalCount }) {
  const totalTitles = totalCount !== undefined ? totalCount : books.length;

  const categories = new Set(books.map((b) => b.category).filter(Boolean));
  const activeCategoriesCount = categories.size;

  const totalValue = books.reduce((acc, b) => {
    const p = parseFloat(b.price) || 0;
    const q = parseInt(b.stock_quantity, 10) || 0;
    return acc + p * q;
  }, 0);

  const lowStockCount = books.filter(
    (b) => (parseInt(b.stock_quantity, 10) || 0) <= 5,
  ).length;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Total Titles
          </p>
          <p className="text-2xl font-bold text-slate-900 mt-1">
            {totalTitles.toLocaleString()}
          </p>
        </div>
        <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
          <BookOpen className="w-6 h-6" />
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Active Categories
          </p>
          <p className="text-2xl font-bold text-slate-900 mt-1">
            {activeCategoriesCount}
          </p>
        </div>
        <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
          <Layers className="w-6 h-6" />
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Inventory Value
          </p>
          <p className="text-2xl font-bold text-slate-900 mt-1">
            ${totalValue.toFixed(2)}
          </p>
        </div>
        <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
          <DollarSign className="w-6 h-6" />
        </div>
      </div>

      <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Low Stock Warnings
          </p>
          <p className="text-2xl font-bold text-slate-900 mt-1">
            {lowStockCount}
          </p>
        </div>
        <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
          <AlertTriangle className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
}

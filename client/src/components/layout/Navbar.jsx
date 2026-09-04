import React from "react";
import { Link } from "react-router-dom";
import { BookOpen, Library, Plus } from "lucide-react";

export default function Navbar({ onOpenAddModal }) {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="flex items-center gap-2 text-indigo-600 font-bold text-xl hover:text-indigo-700 transition"
            >
              <div className="p-2 bg-indigo-50 rounded-lg">
                <BookOpen className="w-6 h-6 text-indigo-600" />
              </div>
              <span>BookVerse Manager</span>
            </Link>
            <span className="hidden sm:inline-block px-2.5 py-0.5 text-xs font-semibold bg-indigo-50 text-indigo-700 rounded-full border border-indigo-100">
              Inventory v1.0
            </span>
          </div>

          <div className="flex items-center gap-4">
            <Link
              to="/"
              className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-700 hover:text-indigo-600 hover:bg-slate-50 rounded-lg transition"
            >
              <Library className="w-4 h-4" />
              <span>Catalog</span>
            </Link>

            {onOpenAddModal && (
              <button
                onClick={onOpenAddModal}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-medium text-sm rounded-lg hover:bg-indigo-700 active:bg-indigo-800 transition shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Add Book</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

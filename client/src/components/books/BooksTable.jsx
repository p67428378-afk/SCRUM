import React from "react";
import { Link } from "react-router-dom";
import { Eye, Edit3, Trash2, Book } from "lucide-react";
import StockBadge from "../common/StockBadge";

export default function BooksTable({
  books,
  total,
  skip,
  limit,
  onPageChange,
  onEdit,
  onDelete,
  loading,
}) {
  const currentPage = Math.floor(skip / limit) + 1;
  const totalPages = Math.ceil(total / limit) || 1;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <th className="py-3.5 px-4">Title & Author</th>
              <th className="py-3.5 px-4">ISBN</th>
              <th className="py-3.5 px-4">Category</th>
              <th className="py-3.5 px-4">Year</th>
              <th className="py-3.5 px-4">Price</th>
              <th className="py-3.5 px-4">Stock</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-sm text-slate-700">
            {loading ? (
              <tr>
                <td colSpan="7" className="py-12 text-center text-slate-500">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                    <span>Loading book records...</span>
                  </div>
                </td>
              </tr>
            ) : books.length === 0 ? (
              <tr>
                <td colSpan="7" className="py-12 text-center text-slate-500">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Book className="w-10 h-10 text-slate-300" />
                    <p className="text-base font-medium text-slate-700">
                      No books found
                    </p>
                    <p className="text-xs text-slate-500">
                      Try adjusting your search criteria or add a new book.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              books.map((book) => (
                <tr key={book.id} className="hover:bg-slate-50 transition">
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-900">
                      {book.title}
                    </div>
                    <div className="text-xs text-slate-500">
                      by {book.author}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-xs text-slate-600">
                    {book.isbn}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="inline-block px-2.5 py-1 bg-slate-100 text-slate-700 text-xs rounded-md font-medium">
                      {book.category}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">
                    {book.publication_year}
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-900">
                    ${parseFloat(book.price).toFixed(2)}
                  </td>
                  <td className="py-3.5 px-4">
                    <StockBadge stockQuantity={book.stock_quantity} />
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        to={`/books/${book.id}`}
                        title="View Details"
                        className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => onEdit(book)}
                        title="Edit Book"
                        className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDelete(book)}
                        title="Delete Book"
                        className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="bg-slate-50 px-4 py-3 border-t border-slate-200 flex items-center justify-between">
        <div className="text-xs text-slate-500">
          Showing{" "}
          <span className="font-semibold text-slate-700">
            {books.length > 0 ? skip + 1 : 0}
          </span>{" "}
          to{" "}
          <span className="font-semibold text-slate-700">
            {Math.min(skip + limit, total)}
          </span>{" "}
          of <span className="font-semibold text-slate-700">{total}</span>{" "}
          records
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onPageChange(Math.max(0, skip - limit))}
            disabled={skip === 0 || loading}
            className="px-3 py-1.5 text-xs font-medium bg-white border border-slate-300 rounded-md text-slate-700 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            Previous
          </button>
          <span className="text-xs text-slate-600 font-medium">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => onPageChange(skip + limit)}
            disabled={skip + limit >= total || loading}
            className="px-3 py-1.5 text-xs font-medium bg-white border border-slate-300 rounded-md text-slate-700 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

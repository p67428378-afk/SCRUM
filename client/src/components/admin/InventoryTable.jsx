import React from "react";
import { Edit, Trash2, BookOpen } from "lucide-react";
import Button from "../common/Button";
import Badge from "../common/Badge";

export const InventoryTable = ({ books, onEdit, onDelete, deletingId }) => {
  if (!books || books.length === 0) {
    return (
      <div className="bg-white p-8 rounded-xl border border-slate-200 text-center">
        <p className="text-slate-500 font-medium">
          No books found in the inventory.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <th className="py-3.5 px-4">Title & Author</th>
              <th className="py-3.5 px-4">ISBN</th>
              <th className="py-3.5 px-4">Genre</th>
              <th className="py-3.5 px-4">Available / Total</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 text-sm">
            {books.map((book) => {
              const available = book.available_copies ?? 0;
              const total = book.total_copies ?? 0;

              return (
                <tr
                  key={book.id}
                  className="hover:bg-slate-50/80 transition-colors"
                >
                  <td className="py-4 px-4 font-medium text-slate-900">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-50 text-blue-600 rounded-lg shrink-0">
                        <BookOpen size={18} />
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900">
                          {book.title}
                        </div>
                        <div className="text-xs text-slate-500">
                          By {book.author}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-slate-600 font-mono text-xs">
                    {book.isbn}
                  </td>
                  <td className="py-4 px-4">
                    <Badge variant="neutral">{book.genre || "General"}</Badge>
                  </td>
                  <td className="py-4 px-4 font-medium">
                    <span
                      className={
                        available > 0
                          ? "text-emerald-600 font-semibold"
                          : "text-red-500 font-semibold"
                      }
                    >
                      {available}
                    </span>
                    <span className="text-slate-400"> / {total}</span>
                  </td>
                  <td className="py-4 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEdit(book)}
                      >
                        <Edit size={14} />
                        <span>Edit</span>
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        disabled={deletingId === book.id}
                        onClick={() => onDelete(book.id)}
                      >
                        <Trash2 size={14} />
                        <span>Delete</span>
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InventoryTable;

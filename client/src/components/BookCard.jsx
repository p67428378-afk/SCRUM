import React from "react";
import { Book as BookIcon, CheckCircle2, XCircle, Layers } from "lucide-react";

export const BookCard = ({ book, onBorrow, isBorrowing, canBorrow }) => {
  const isAvailable = (book.available_copies ?? 0) > 0;

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
      <div>
        <div className="flex items-start justify-between gap-2 mb-3">
          <span className="bg-indigo-50 text-indigo-700 text-[11px] font-semibold px-2.5 py-1 rounded-full border border-indigo-100">
            {book.category || "General"}
          </span>
          <span
            className={`text-xs px-2.5 py-1 rounded-full font-medium border flex items-center gap-1 ${
              isAvailable
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : "bg-rose-50 text-rose-700 border-rose-200"
            }`}
          >
            {isAvailable ? (
              <>
                <CheckCircle2 className="w-3 h-3" />
                {book.available_copies} Available / {book.total_copies} Total
              </>
            ) : (
              <>
                <XCircle className="w-3 h-3" />
                Unavailable (0/{book.total_copies})
              </>
            )}
          </span>
        </div>

        <div className="flex gap-3.5 my-2">
          <div className="w-12 h-16 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 group-hover:border-indigo-100 transition-colors flex-shrink-0">
            <BookIcon className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 text-base leading-snug line-clamp-2">
              {book.title}
            </h4>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              by {book.author}
            </p>
            <div className="text-[11px] text-slate-400 font-mono mt-1 flex items-center gap-1">
              <Layers className="w-3 h-3" /> ISBN: {book.isbn}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100">
        <button
          onClick={() => onBorrow(book)}
          disabled={!isAvailable || isBorrowing || !canBorrow}
          className={`w-full py-2.5 px-4 rounded-xl font-semibold text-xs transition-all flex items-center justify-center gap-2 ${
            isAvailable && canBorrow
              ? "bg-[#4F46E5] text-white hover:bg-indigo-700 active:scale-[0.98] shadow-sm shadow-indigo-100"
              : "bg-slate-100 text-slate-400 cursor-not-allowed"
          }`}
        >
          {isBorrowing
            ? "Processing..."
            : isAvailable
              ? "Borrow / Issue Book"
              : "Currently Out of Stock"}
        </button>
      </div>
    </div>
  );
};

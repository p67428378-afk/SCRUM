import React from "react";
import { Book, CheckCircle, XCircle, ArrowRight } from "lucide-react";
import Button from "../common/Button";
import Badge from "../common/Badge";

export const BookCard = ({
  book,
  onCheckout,
  isCheckingOut = false,
  userRole,
}) => {
  const { title, author, isbn, genre, available_copies, total_copies } = book;
  const isAvailable = available_copies > 0;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs hover:shadow-md transition-all p-5 flex flex-col justify-between h-full">
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <Badge variant={isAvailable ? "success" : "danger"}>
            {isAvailable
              ? `${available_copies} of ${total_copies} Available`
              : "Out of Stock"}
          </Badge>
          {genre && <Badge variant="neutral">{genre}</Badge>}
        </div>

        <div className="flex items-start gap-3 mb-3">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg shrink-0">
            <Book size={24} />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-lg leading-snug line-clamp-2">
              {title}
            </h3>
            <p className="text-sm text-slate-600 font-medium mt-0.5">
              By {author}
            </p>
          </div>
        </div>

        <div className="text-xs text-slate-500 font-mono space-y-1 mb-4 bg-slate-50 p-2.5 rounded-md border border-slate-100">
          <p>
            <span className="text-slate-400 font-sans">ISBN:</span> {isbn}
          </p>
        </div>
      </div>

      <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-medium">
          {isAvailable ? (
            <span className="text-emerald-600 flex items-center gap-1">
              <CheckCircle size={14} /> Ready for checkout
            </span>
          ) : (
            <span className="text-rose-500 flex items-center gap-1">
              <XCircle size={14} /> Currently unavailable
            </span>
          )}
        </div>

        <Button
          variant="primary"
          size="sm"
          disabled={!isAvailable || isCheckingOut}
          onClick={() => onCheckout(book)}
        >
          {isCheckingOut ? (
            <span>Processing...</span>
          ) : (
            <>
              <span>Checkout</span>
              <ArrowRight size={14} />
            </>
          )}
        </Button>
      </div>
    </div>
  );
};

export default BookCard;

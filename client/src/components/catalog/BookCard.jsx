import React, { useState } from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { Star, ShoppingCart, BookOpen } from "lucide-react";

export default function BookCard({ book, onAddToCart, isAdding = false }) {
  const [imgError, setImgError] = useState(false);
  const isOutOfStock = book.stock_quantity <= 0;
  const isLowStock = book.stock_quantity > 0 && book.stock_quantity <= 5;

  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 border border-slate-200/80 overflow-hidden flex flex-col justify-between group">
      <div>
        {/* Book Cover Image */}
        <Link
          to={`/books/${book.id}`}
          className="block relative h-56 bg-slate-100 overflow-hidden cursor-pointer"
        >
          {book.cover_image && !imgError ? (
            <img
              src={book.cover_image}
              alt={book.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-brand-950 to-brand-800 text-white p-4 text-center">
              <BookOpen className="w-12 h-12 text-accent/80 mb-2" />
              <span className="font-serif font-bold text-sm line-clamp-2">
                {book.title}
              </span>
              <span className="text-xs text-slate-300 mt-1">{book.author}</span>
            </div>
          )}

          {/* Stock Badge Overlay */}
          <div className="absolute top-2 right-2">
            {isOutOfStock ? (
              <span className="bg-red-500 text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded shadow">
                Out of Stock
              </span>
            ) : isLowStock ? (
              <span className="bg-amber-500 text-slate-950 text-[10px] uppercase font-bold px-2 py-0.5 rounded shadow">
                Only {book.stock_quantity} left
              </span>
            ) : (
              <span className="bg-emerald-600 text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded shadow">
                In Stock
              </span>
            )}
          </div>

          {/* Category Tag */}
          {book.category && (
            <div className="absolute bottom-2 left-2">
              <span className="bg-slate-900/80 backdrop-blur-sm text-slate-100 text-[11px] font-medium px-2 py-0.5 rounded">
                {book.category.name}
              </span>
            </div>
          )}
        </Link>

        {/* Book Details */}
        <div className="p-4">
          <div className="flex items-center space-x-1 mb-1.5">
            <div className="flex text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={`star-${book.id}-${i}`}
                  className={`w-3.5 h-3.5 ${
                    i < Math.floor(book.rating || 0)
                      ? "fill-current text-amber-400"
                      : "text-slate-300"
                  }`}
                />
              ))}
            </div>
            <span className="text-xs font-semibold text-slate-600 ml-1">
              {Number(book.rating || 0).toFixed(1)}
            </span>
          </div>

          <Link to={`/books/${book.id}`}>
            <h3 className="font-serif font-bold text-base text-slate-900 line-clamp-2 hover:text-brand-900 transition-colors title-clamp">
              {book.title}
            </h3>
          </Link>
          <p className="text-xs text-slate-500 mt-1 line-clamp-1">
            {book.author}
          </p>
        </div>
      </div>

      {/* Pricing & Add to Cart Footer */}
      <div className="p-4 pt-0 border-t border-slate-100 mt-2 flex items-center justify-between">
        <div>
          <span className="text-xs text-slate-400 block font-sans">Price</span>
          <span className="text-lg font-bold text-brand-950 font-sans">
            ${Number(book.price || 0).toFixed(2)}
          </span>
        </div>

        <button
          onClick={() => onAddToCart(book)}
          disabled={isOutOfStock || isAdding}
          className={`px-3.5 py-2 rounded-lg text-xs font-bold flex items-center space-x-1.5 transition-colors shadow-sm ${
            isOutOfStock
              ? "bg-slate-200 text-slate-400 cursor-not-allowed"
              : "bg-accent hover:bg-accent-hover text-slate-950 active:scale-95"
          }`}
          aria-label={`Add ${book.title} to cart`}
        >
          <ShoppingCart className="w-3.5 h-3.5" />
          <span>{isAdding ? "Adding..." : "Add to Cart"}</span>
        </button>
      </div>
    </div>
  );
}

BookCard.propTypes = {
  book: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    author: PropTypes.string.isRequired,
    price: PropTypes.number.isRequired,
    stock_quantity: PropTypes.number.isRequired,
    rating: PropTypes.number,
    cover_image: PropTypes.string,
    category: PropTypes.shape({
      id: PropTypes.string,
      name: PropTypes.string,
    }),
  }).isRequired,
  onAddToCart: PropTypes.func.isRequired,
  isAdding: PropTypes.bool,
};

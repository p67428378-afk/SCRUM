import React, { useState } from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Star,
  ShoppingCart,
  BookOpen,
  Check,
  ShieldCheck,
  Truck,
  RotateCcw,
} from "lucide-react";

export default function BookDetails({ book, onAddToCart, isAdding = false }) {
  const [quantity, setQuantity] = useState(1);
  const [addedMessage, setAddedMessage] = useState(false);
  const [imgError, setImgError] = useState(false);

  const isOutOfStock = book.stock_quantity <= 0;
  const isLowStock = book.stock_quantity > 0 && book.stock_quantity <= 5;

  const handleIncrement = () => {
    if (quantity < book.stock_quantity) {
      setQuantity((prev) => prev + 1);
    }
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  const handleAdd = () => {
    if (isOutOfStock) return;
    onAddToCart(book, quantity);
    setAddedMessage(true);
    setTimeout(() => setAddedMessage(false), 3000);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      {/* Back button */}
      <Link
        to="/"
        className="inline-flex items-center space-x-2 text-sm font-semibold text-brand-950 hover:text-brand-700 mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Catalog</span>
      </Link>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 p-6 sm:p-10">
          {/* Cover image */}
          <div className="md:col-span-5 flex flex-col items-center justify-center">
            <div className="relative w-full max-w-sm rounded-xl overflow-hidden shadow-lg border border-slate-200 bg-slate-100 aspect-[3/4]">
              {book.cover_image && !imgError ? (
                <img
                  src={book.cover_image}
                  alt={book.title}
                  className="w-full h-full object-cover"
                  onError={() => setImgError(true)}
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-brand-950 to-brand-800 text-white p-6 text-center">
                  <BookOpen className="w-16 h-16 text-accent/80 mb-3" />
                  <h3 className="font-serif font-bold text-lg">{book.title}</h3>
                  <p className="text-sm text-slate-300 mt-2">{book.author}</p>
                </div>
              )}
            </div>
          </div>

          {/* Book Info */}
          <div className="md:col-span-7 flex flex-col justify-between space-y-6">
            <div>
              {book.category && (
                <span className="inline-block bg-brand-100 text-brand-950 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-3">
                  {book.category.name}
                </span>
              )}
              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 leading-tight">
                {book.title}
              </h1>
              <p className="text-base text-slate-600 mt-2 font-medium">
                By{" "}
                <span className="text-slate-900 font-semibold">
                  {book.author}
                </span>
              </p>

              {/* Rating & Stock */}
              <div className="flex flex-wrap items-center gap-4 mt-4 pb-4 border-b border-slate-100">
                <div className="flex items-center space-x-1.5">
                  <div className="flex text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={`rating-star-${i}`}
                        className={`w-4 h-4 ${
                          i < Math.floor(book.rating || 0)
                            ? "fill-current text-amber-400"
                            : "text-slate-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-bold text-slate-800">
                    {Number(book.rating || 0).toFixed(1)}
                  </span>
                </div>

                <div className="h-4 w-px bg-slate-200" />

                <div>
                  {isOutOfStock ? (
                    <span className="bg-red-100 text-red-800 text-xs font-bold px-3 py-1 rounded-full">
                      Out of Stock
                    </span>
                  ) : isLowStock ? (
                    <span className="bg-amber-100 text-amber-900 text-xs font-bold px-3 py-1 rounded-full">
                      Low Stock ({book.stock_quantity} remaining)
                    </span>
                  ) : (
                    <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-3 py-1 rounded-full">
                      In Stock ({book.stock_quantity} available)
                    </span>
                  )}
                </div>

                {book.isbn && (
                  <>
                    <div className="h-4 w-px bg-slate-200" />
                    <span className="text-xs text-slate-500">
                      ISBN: <span className="font-mono">{book.isbn}</span>
                    </span>
                  </>
                )}
              </div>

              {/* Price */}
              <div className="my-6">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                  Price
                </span>
                <span className="text-3xl sm:text-4xl font-bold text-brand-950 font-sans">
                  ${Number(book.price || 0).toFixed(2)}
                </span>
              </div>

              {/* Summary / Description */}
              <div>
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-2">
                  Overview & Summary
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">
                  {book.summary || "No description provided for this book."}
                </p>
              </div>
            </div>

            {/* Quantity controls & Add to Cart button */}
            <div className="pt-6 border-t border-slate-100 space-y-4">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center border border-slate-300 rounded-lg overflow-hidden bg-slate-50">
                  <button
                    onClick={handleDecrement}
                    disabled={quantity <= 1 || isOutOfStock}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-colors disabled:opacity-40"
                    aria-label="Decrease quantity"
                  >
                    -
                  </button>
                  <span className="px-5 py-2.5 font-bold text-slate-900 text-sm min-w-[3rem] text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={handleIncrement}
                    disabled={quantity >= book.stock_quantity || isOutOfStock}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold transition-colors disabled:opacity-40"
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>

                <button
                  onClick={handleAdd}
                  disabled={isOutOfStock || isAdding}
                  className={`flex-1 min-w-[200px] py-3 px-6 rounded-lg font-bold text-sm flex items-center justify-center space-x-2 transition-all shadow-md ${
                    isOutOfStock
                      ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                      : "bg-accent hover:bg-accent-hover text-slate-950 active:scale-[0.98]"
                  }`}
                >
                  <ShoppingCart className="w-5 h-5" />
                  <span>{isAdding ? "Adding to Cart..." : "Add to Cart"}</span>
                </button>
              </div>

              {addedMessage && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-sm flex items-center space-x-2 animate-fade-in">
                  <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Added {quantity} copy to your shopping cart!</span>
                  <Link
                    to="/checkout"
                    className="underline font-bold ml-auto hover:text-emerald-950"
                  >
                    View Cart
                  </Link>
                </div>
              )}

              {/* Trust Badges */}
              <div className="grid grid-cols-3 gap-2 pt-4 text-center border-t border-slate-100 text-[11px] text-slate-500">
                <div className="flex items-center justify-center space-x-1">
                  <Truck className="w-4 h-4 text-brand-900" />
                  <span>Free shipping on orders $50+</span>
                </div>
                <div className="flex items-center justify-center space-x-1">
                  <ShieldCheck className="w-4 h-4 text-brand-900" />
                  <span>Secure 256-Bit SSL Checkout</span>
                </div>
                <div className="flex items-center justify-center space-x-1">
                  <RotateCcw className="w-4 h-4 text-brand-900" />
                  <span>30-Day Easy Returns</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

BookDetails.propTypes = {
  book: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    author: PropTypes.string.isRequired,
    isbn: PropTypes.string,
    price: PropTypes.number.isRequired,
    stock_quantity: PropTypes.number.isRequired,
    rating: PropTypes.number,
    summary: PropTypes.string,
    cover_image: PropTypes.string,
    category: PropTypes.shape({
      id: PropTypes.string,
      name: PropTypes.string,
    }),
  }).isRequired,
  onAddToCart: PropTypes.func.isRequired,
  isAdding: PropTypes.bool,
};

import React from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { Trash2, ShoppingBag, BookOpen, Plus, Minus } from "lucide-react";

export default function CartTable({
  items = [],
  subtotal = 0,
  tax = 0,
  shipping = 0,
  total = 0,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onProceedToCheckout,
  updatingItemId = null,
}) {
  if (!items || items.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200/80 p-12 text-center shadow-sm">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-serif font-bold text-slate-800 mb-2">
          Your Cart is Empty
        </h3>
        <p className="text-sm text-slate-500 max-w-sm mx-auto mb-6">
          Looks like you haven&apos;t added any books yet. Explore our curated
          catalog and find your next great read!
        </p>
        <Link
          to="/"
          className="inline-flex items-center space-x-2 bg-accent hover:bg-accent-hover text-slate-950 font-bold px-6 py-2.5 rounded-lg text-sm transition-colors shadow-sm"
        >
          <BookOpen className="w-4 h-4" />
          <span>Browse Catalog</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Items List */}
      <div className="lg:col-span-8 space-y-4">
        <div className="bg-white rounded-xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="p-4 sm:p-6 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-lg font-serif font-bold text-slate-900">
              Shopping Cart (
              {items.reduce((acc, curr) => acc + curr.quantity, 0)} items)
            </h2>
            <button
              onClick={onClearCart}
              className="text-xs text-red-600 hover:text-red-700 font-semibold flex items-center space-x-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Cart</span>
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {items.map((item) => {
              const book = item.book || {};
              const price = book.price || 0;
              const maxStock = book.stock_quantity || 99;
              const isUpdating = updatingItemId === item.id;

              return (
                <div
                  key={item.id}
                  className="p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  {/* Book Image & Info */}
                  <div className="flex items-center space-x-4 flex-1">
                    <div className="w-16 h-20 bg-slate-100 rounded-lg overflow-hidden flex-shrink-0 border border-slate-200">
                      {book.cover_image ? (
                        <img
                          src={book.cover_image}
                          alt={book.title || "Book cover"}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-brand-950 text-accent">
                          <BookOpen className="w-6 h-6" />
                        </div>
                      )}
                    </div>
                    <div>
                      <Link
                        to={`/books/${book.id || item.book_id}`}
                        className="font-serif font-bold text-slate-900 hover:text-brand-900 text-sm sm:text-base line-clamp-1 transition-colors"
                      >
                        {book.title || "Book Title"}
                      </Link>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {book.author || "Author"}
                      </p>
                      <span className="text-xs font-semibold text-brand-950 block mt-1">
                        ${Number(price).toFixed(2)} each
                      </span>
                    </div>
                  </div>

                  {/* Quantity and Actions */}
                  <div className="flex items-center justify-between w-full sm:w-auto sm:space-x-6 border-t sm:border-t-0 pt-2 sm:pt-0">
                    <div className="flex items-center border border-slate-300 rounded-lg overflow-hidden bg-slate-50">
                      <button
                        onClick={() => {
                          if (item.quantity > 1) {
                            onUpdateQuantity(item.id, item.quantity - 1);
                          } else {
                            onRemoveItem(item.id);
                          }
                        }}
                        disabled={isUpdating}
                        className="p-2 text-slate-600 hover:bg-slate-200 disabled:opacity-40 transition-colors"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="px-3 py-1 text-xs font-bold text-slate-800 min-w-[2rem] text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => {
                          if (item.quantity < maxStock) {
                            onUpdateQuantity(item.id, item.quantity + 1);
                          }
                        }}
                        disabled={isUpdating || item.quantity >= maxStock}
                        className="p-2 text-slate-600 hover:bg-slate-200 disabled:opacity-40 transition-colors"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="text-right min-w-[80px]">
                      <span className="text-sm font-bold text-slate-900 block font-sans">
                        $
                        {Number(
                          item.item_total || price * item.quantity,
                        ).toFixed(2)}
                      </span>
                    </div>

                    <button
                      onClick={() => onRemoveItem(item.id)}
                      disabled={isUpdating}
                      className="text-slate-400 hover:text-red-500 p-1 rounded transition-colors"
                      aria-label="Remove item"
                      title="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Order Summary Sidebar */}
      <div className="lg:col-span-4">
        <div className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-sm sticky top-24 space-y-4">
          <h3 className="text-lg font-serif font-bold text-slate-900 pb-3 border-b border-slate-100">
            Order Summary
          </h3>

          <div className="space-y-2.5 text-sm text-slate-600">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-semibold text-slate-900">
                ${Number(subtotal).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Estimated Tax (8%)</span>
              <span className="font-semibold text-slate-900">
                ${Number(tax).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span className="font-semibold text-slate-900">
                {shipping === 0 ? (
                  <span className="text-emerald-600 font-bold">FREE</span>
                ) : (
                  `$${Number(shipping).toFixed(2)}`
                )}
              </span>
            </div>
            {subtotal < 50 && subtotal > 0 && (
              <p className="text-[11px] text-amber-700 bg-amber-50 p-2 rounded">
                Add <strong>${(50 - subtotal).toFixed(2)}</strong> more for FREE
                shipping!
              </p>
            )}
          </div>

          <div className="pt-3 border-t border-slate-200 flex justify-between items-center text-base font-bold text-slate-900">
            <span>Total</span>
            <span className="text-xl text-brand-950 font-serif">
              ${Number(total).toFixed(2)}
            </span>
          </div>

          <button
            onClick={onProceedToCheckout}
            className="w-full py-3 bg-accent hover:bg-accent-hover text-slate-950 font-bold rounded-lg transition-colors shadow-md text-sm mt-4 active:scale-[0.99]"
          >
            Proceed to Checkout (${Number(total).toFixed(2)})
          </button>
        </div>
      </div>
    </div>
  );
}

CartTable.propTypes = {
  items: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      quantity: PropTypes.number.isRequired,
      item_total: PropTypes.number,
      book: PropTypes.shape({
        id: PropTypes.string,
        title: PropTypes.string,
        author: PropTypes.string,
        price: PropTypes.number,
        stock_quantity: PropTypes.number,
        cover_image: PropTypes.string,
      }),
    }),
  ),
  subtotal: PropTypes.number,
  tax: PropTypes.number,
  shipping: PropTypes.number,
  total: PropTypes.number,
  onUpdateQuantity: PropTypes.func.isRequired,
  onRemoveItem: PropTypes.func.isRequired,
  onClearCart: PropTypes.func.isRequired,
  onProceedToCheckout: PropTypes.func.isRequired,
  updatingItemId: PropTypes.string,
};

import React from "react";
import { Link } from "react-router-dom";
import {
  Star,
  ShoppingBag,
  Heart,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import { useCart } from "../context/CartContext";

export default function ProductCard({ product }) {
  const { addToCart, wishlist, toggleWishlist } = useCart();
  const isWishlisted = wishlist.some((item) => item.product_id === product.id);

  const handleQuickAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({
      product_id: product.id,
      quantity: 1,
      selected_finish: product.finish_options?.[0] || "Standard Finish",
      selected_dimension: product.dimension_options?.[0] || "Standard Size",
    });
  };

  const handleWishlistToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product.id);
  };

  const inStock = product.stock_quantity > 0;
  const lowStock = product.stock_quantity > 0 && product.stock_quantity <= 5;

  return (
    <div className="bg-white border border-borderline rounded-xl overflow-hidden hover:shadow-lg transition-all duration-200 flex flex-col group">
      {/* Product Image Container */}
      <div className="relative aspect-square overflow-hidden bg-bgsoft">
        <Link to={`/product/${product.id}`} className="block w-full h-full">
          <img
            src={
              product.image_url ||
              "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80"
            }
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        </Link>

        {/* Stock Badge */}
        <div className="absolute top-3 left-3">
          {inStock ? (
            lowStock ? (
              <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 text-[11px] font-semibold px-2.5 py-1 rounded-full border border-amber-200 shadow-sm">
                <AlertTriangle className="w-3 h-3" />
                Only {product.stock_quantity} left
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 text-[11px] font-semibold px-2.5 py-1 rounded-full border border-emerald-200 shadow-sm">
                <CheckCircle className="w-3 h-3" />
                In Stock
              </span>
            )
          ) : (
            <span className="inline-flex items-center bg-gray-100 text-gray-500 text-[11px] font-semibold px-2.5 py-1 rounded-full border border-gray-200 shadow-sm">
              Out of Stock
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          onClick={handleWishlistToggle}
          className={`absolute top-3 right-3 p-2 rounded-full shadow-md transition-colors ${
            isWishlisted
              ? "bg-rose-50 text-rose-600 hover:bg-rose-100"
              : "bg-white/90 text-textmuted hover:text-rose-600 hover:bg-white"
          }`}
          title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
          aria-label={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
        >
          <Heart className={`w-4 h-4 ${isWishlisted ? "fill-current" : ""}`} />
        </button>
      </div>

      {/* Product Details */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Category & Rating Row */}
          <div className="flex items-center justify-between text-xs text-textmuted mb-1.5">
            <span className="font-medium uppercase tracking-wider text-[11px] text-primary">
              {product.category?.name || product.material || "Furniture"}
            </span>
            <div className="flex items-center gap-1 text-amber-500 font-semibold">
              <Star className="w-3.5 h-3.5 fill-current" />
              <span>{Number(product.rating || 5.0).toFixed(1)}</span>
            </div>
          </div>

          {/* Title */}
          <Link
            to={`/product/${product.id}`}
            className="block text-sm font-semibold text-textmain group-hover:text-primary transition-colors line-clamp-1 mb-1"
          >
            {product.name}
          </Link>

          {/* Material & Color Spec */}
          <p className="text-xs text-textmuted line-clamp-1 mb-3">
            {product.material} &bull; {product.color}
          </p>
        </div>

        {/* Price & Action Row */}
        <div className="pt-3 border-t border-borderline flex items-center justify-between mt-2">
          <div>
            <span className="text-xs text-textmuted block -mb-0.5">Price</span>
            <span className="text-lg font-bold text-textmain">
              ${Number(product.price).toFixed(2)}
            </span>
          </div>

          <button
            onClick={handleQuickAdd}
            disabled={!inStock}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold shadow-sm transition-all ${
              inStock
                ? "bg-primary text-white hover:bg-primary-hover active:scale-95"
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
            }`}
            aria-label="Add to cart"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Add</span>
          </button>
        </div>
      </div>
    </div>
  );
}

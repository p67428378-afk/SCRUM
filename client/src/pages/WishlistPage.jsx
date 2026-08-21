import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/common/Navbar";
import Badge from "../components/common/Badge";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import {
  getWishlist,
  removeFromWishlist,
  moveToCartFromWishlist,
} from "../services/api";
import {
  Heart,
  ShoppingCart,
  Trash2,
  Loader,
  AlertCircle,
  Check,
  ArrowRight,
} from "lucide-react";

export default function WishlistPage() {
  const { user } = useAuth();
  const { refreshCart } = useCart();
  const navigate = useNavigate();

  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState({});
  const [message, setMessage] = useState(null);

  const fetchWishlist = async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const items = await getWishlist();
      setWishlistItems(Array.isArray(items) ? items : []);
    } catch (err) {
      console.error("Failed to load wishlist", err);
      setError("Could not load your wishlist. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, [user]);

  const handleRemove = async (productId) => {
    setActionLoading((prev) => ({ ...prev, [productId]: true }));
    setMessage(null);
    try {
      await removeFromWishlist(productId);
      setWishlistItems((prev) =>
        prev.filter((item) => item.product_id !== productId),
      );
      setMessage({ type: "success", text: "Item removed from your wishlist." });
      setTimeout(() => setMessage(null), 4000);
    } catch (err) {
      const msg = err.response?.data?.detail || "Failed to remove item";
      setMessage({ type: "error", text: msg });
    } finally {
      setActionLoading((prev) => ({ ...prev, [productId]: false }));
    }
  };

  const handleMoveToCart = async (productId) => {
    setActionLoading((prev) => ({ ...prev, [productId]: true }));
    setMessage(null);
    try {
      await moveToCartFromWishlist(productId);
      await refreshCart();
      setWishlistItems((prev) =>
        prev.filter((item) => item.product_id !== productId),
      );
      setMessage({
        type: "success",
        text: "Item moved to your shopping cart!",
      });
      setTimeout(() => setMessage(null), 4000);
    } catch (err) {
      const msg = err.response?.data?.detail || "Failed to move item to cart";
      setMessage({ type: "error", text: msg });
    } finally {
      setActionLoading((prev) => ({ ...prev, [productId]: false }));
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col bg-[#f7fafc]">
        <Navbar />
        <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-16 text-center space-y-6">
          <div className="w-16 h-16 bg-[#ebf5ff] text-[#2663eb] rounded-full flex items-center justify-center mx-auto">
            <Heart className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-[#171c29]">
            Save Your Favorite Clothing &amp; Accessories
          </h1>
          <p className="text-sm text-[#707a8c] max-w-md mx-auto">
            Please sign in to view, manage, and move your saved wishlist items
            directly into your cart.
          </p>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 bg-[#2663eb] text-white px-6 py-2.5 rounded-xl font-medium text-sm hover:bg-[#1d4ed8] transition-colors"
          >
            Sign In to View Wishlist
            <ArrowRight className="w-4 h-4" />
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#f7fafc]">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header Banner */}
        <div className="bg-white border border-[#e3e8f0] rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
          <div>
            <div className="flex items-center gap-2 text-[#2663eb] font-bold text-sm mb-1">
              <Heart className="w-5 h-5 fill-current" />
              <span>SAVED ITEMS</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#171c29]">
              My Personal Wishlist
            </h1>
            <p className="text-xs sm:text-sm text-[#707a8c] mt-1">
              Track items you're interested in and move them to your cart when
              ready.
            </p>
          </div>

          <div className="bg-[#f7fafc] border border-[#e3e8f0] px-4 py-2.5 rounded-xl flex items-center gap-3">
            <span className="text-xs font-semibold text-[#707a8c]">
              Total Saved:
            </span>
            <span className="text-lg font-bold text-[#2663eb]">
              {wishlistItems.length}{" "}
              {wishlistItems.length === 1 ? "Item" : "Items"}
            </span>
          </div>
        </div>

        {/* Message Alert Banner */}
        {message && (
          <div
            className={`p-4 rounded-xl flex items-center gap-2 text-sm font-medium border ${
              message.type === "success"
                ? "bg-[#dcfce7] border-[#17a34a] text-[#17a34a]"
                : "bg-[#fee2e2] border-[#db2626] text-[#db2626]"
            }`}
          >
            {message.type === "success" ? (
              <Check className="w-4 h-4 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-[#707a8c]">
            <Loader className="w-8 h-8 animate-spin text-[#2663eb] mb-2" />
            <p className="text-sm">Loading your saved items...</p>
          </div>
        ) : error ? (
          <div className="bg-[#fee2e2] text-[#db2626] p-6 rounded-xl text-center space-y-3">
            <AlertCircle className="w-8 h-8 mx-auto" />
            <p className="text-base font-bold">{error}</p>
            <button
              onClick={fetchWishlist}
              className="text-xs underline font-semibold"
            >
              Try Again
            </button>
          </div>
        ) : wishlistItems.length === 0 ? (
          /* Empty State */
          <div className="bg-white border border-[#e3e8f0] rounded-2xl p-12 text-center space-y-4 max-w-lg mx-auto">
            <div className="w-16 h-16 bg-[#f7fafc] text-[#707a8c] rounded-full flex items-center justify-center mx-auto">
              <Heart className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-[#171c29]">
              Your Wishlist is Empty
            </h2>
            <p className="text-sm text-[#707a8c]">
              You haven't saved any products to your wishlist yet. Explore our
              catalog and click the heart icon on any item to save it here!
            </p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 bg-[#2663eb] text-white px-6 py-2.5 rounded-xl font-semibold text-sm hover:bg-[#1d4ed8] transition-colors"
            >
              Browse Catalog
            </Link>
          </div>
        ) : (
          /* Wishlist Items Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlistItems.map((item) => {
              const prod = item.product || {};
              const isItemLoading = actionLoading[item.product_id];
              const inStock = prod.in_stock !== false;

              return (
                <div
                  key={item.id || item.product_id}
                  className="bg-white border border-[#e3e8f0] rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
                >
                  <div className="relative aspect-square overflow-hidden bg-[#f7fafc]">
                    <img
                      src={
                        prod.image_url ||
                        "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=600&q=80"
                      }
                      alt={prod.name || "Product"}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-3 left-3">
                      {inStock ? (
                        <Badge variant="success">In Stock</Badge>
                      ) : (
                        <Badge variant="danger">Out of Stock</Badge>
                      )}
                    </div>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <Link
                        to={`/product/${item.product_id}`}
                        className="font-bold text-base text-[#171c29] hover:text-[#2663eb] transition-colors line-clamp-1"
                      >
                        {prod.name || "Clothing Item"}
                      </Link>
                      <p className="font-bold text-lg text-[#2663eb] mt-1">
                        ${Number(prod.price || 0).toFixed(2)}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 pt-3 border-t border-[#f1f5f9]">
                      <button
                        onClick={() => handleMoveToCart(item.product_id)}
                        disabled={isItemLoading || !inStock}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 bg-[#2663eb] text-white hover:bg-[#1d4ed8] disabled:bg-[#cbd5e1] text-xs font-semibold px-3 py-2 rounded-lg transition-colors"
                      >
                        {isItemLoading ? (
                          <Loader className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <ShoppingCart className="w-4 h-4" />
                            <span>Move to Cart</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => handleRemove(item.product_id)}
                        disabled={isItemLoading}
                        aria-label="Remove item from wishlist"
                        className="p-2 text-[#707a8c] hover:text-[#db2626] hover:bg-[#fee2e2] rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

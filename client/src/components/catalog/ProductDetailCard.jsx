import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Star, ShoppingCart, Heart, Check, AlertCircle } from "lucide-react";
import Badge from "../common/Badge";
import VariantSelector from "../detail/VariantSelector";
import ProductGallery from "../detail/ProductGallery";
import { useAuth } from "../../context/AuthContext";
import { addToWishlist, removeFromWishlist } from "../../services/api";

export default function ProductDetailCard({
  product,
  onAddToCart,
  loadingAddToCart = false,
}) {
  const { id, title, price, description, category, image_url, variants } =
    product || {};
  const { user } = useAuth();
  const navigate = useNavigate();

  const [inWishlist, setInWishlist] = useState(false);
  const [loadingWishlist, setLoadingWishlist] = useState(false);
  const [wishlistToast, setWishlistToast] = useState("");
  const [wishlistError, setWishlistError] = useState("");

  const handleWishlistToggle = async () => {
    if (!user) {
      navigate("/login");
      return;
    }

    setLoadingWishlist(true);
    setWishlistToast("");
    setWishlistError("");

    try {
      if (inWishlist) {
        await removeFromWishlist(id);
        setInWishlist(false);
        setWishlistToast("Removed product from your wishlist.");
      } else {
        await addToWishlist(id);
        setInWishlist(true);
        setWishlistToast(
          "Added product to your wishlist! View it anytime on /wishlist.",
        );
      }
      window.dispatchEvent(new Event("wishlist-updated"));
      setTimeout(() => setWishlistToast(""), 4000);
    } catch (err) {
      const msg =
        err.response?.data?.detail || "Could not update wishlist status.";
      setWishlistError(msg);
      setTimeout(() => setWishlistError(""), 4000);
    } finally {
      setLoadingWishlist(false);
    }
  };

  return (
    <div className="bg-white border border-[#e3e8f0] rounded-2xl p-6 lg:p-10 grid grid-cols-1 lg:grid-cols-2 gap-10">
      {/* Gallery Section */}
      <ProductGallery imageUrl={image_url} title={title} />

      {/* Product Details Section */}
      <div className="space-y-6">
        <div>
          {category && (
            <Badge variant="info" className="mb-2">
              {category.name || category}
            </Badge>
          )}
          <h1 className="text-2xl lg:text-3xl font-bold text-[#171c29]">
            {title}
          </h1>

          <div className="flex items-center gap-2 mt-3">
            <div className="flex text-[#eb9917]">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-current" />
              ))}
            </div>
            <span className="text-xs font-semibold text-[#707a8c]">
              4.9 (128 Reviews)
            </span>
          </div>
        </div>

        {/* Price Tag */}
        <div className="text-3xl font-bold text-[#2663eb]">
          ${Number(price || 0).toFixed(2)}
        </div>

        {/* Description */}
        <p className="text-sm text-[#707a8c] leading-relaxed">
          {description ||
            "High quality clothes & accessories designed for daily comfort and timeless style."}
        </p>

        <hr className="border-[#e3e8f0]" />

        {/* Action Buttons: Add to Cart & Add to Wishlist */}
        <div className="space-y-4">
          <VariantSelector
            variants={variants || []}
            onAddToCart={onAddToCart}
            loading={loadingAddToCart}
          />

          <button
            onClick={handleWishlistToggle}
            disabled={loadingWishlist}
            className={`w-full flex items-center justify-center gap-2 border px-6 py-3 rounded-xl font-semibold text-sm transition-colors ${
              inWishlist
                ? "border-[#db2626] text-[#db2626] bg-[#fef2f2] hover:bg-[#fee2e2]"
                : "border-[#e3e8f0] text-[#171c29] bg-white hover:bg-[#f7fafc]"
            }`}
          >
            <Heart
              className={`w-4 h-4 ${
                inWishlist ? "fill-[#db2626] text-[#db2626]" : "text-[#707a8c]"
              }`}
            />
            <span>{inWishlist ? "Saved in Wishlist" : "Add to Wishlist"}</span>
          </button>
        </div>

        {/* Wishlist Status Confirmation Banner / Toast */}
        {wishlistToast && (
          <div className="bg-[#dcfce7] border border-[#17a34a] text-[#17a34a] px-4 py-3 rounded-xl flex items-center justify-between text-sm font-medium">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4" />
              <span>{wishlistToast}</span>
            </div>
            <Link to="/wishlist" className="underline font-bold text-xs">
              View Wishlist
            </Link>
          </div>
        )}

        {wishlistError && (
          <div className="bg-[#fee2e2] border border-[#db2626] text-[#db2626] px-4 py-3 rounded-xl flex items-center gap-2 text-sm font-medium">
            <AlertCircle className="w-4 h-4" />
            <span>{wishlistError}</span>
          </div>
        )}
      </div>
    </div>
  );
}

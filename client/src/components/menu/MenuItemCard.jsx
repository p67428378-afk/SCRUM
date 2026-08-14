import React from "react";
import { Plus, Check, Leaf, Flame, Award } from "lucide-react";

export default function MenuItemCard({ item, onAddToCart, cartQuantity = 0 }) {
  const {
    id,
    name,
    description,
    price,
    image_url,
    dietary_tags,
    is_available = true,
  } = item;

  const getImageSrc = (itemName, url) => {
    const nameLower = (itemName || "").toLowerCase();
    const badUrls = ["1601050690597", "1626074353765", "1546173159"];
    const isBadUrl = url && badUrls.some((b) => url.includes(b));

    if (nameLower.includes("jamun") || nameLower.includes("gulab")) {
      return "https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&q=80&w=600";
    }
    if (nameLower.includes("naan") || nameLower.includes("garlic")) {
      return "https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&q=80&w=600";
    }
    if (nameLower.includes("lassi") || nameLower.includes("mango")) {
      return "https://images.unsplash.com/photo-1570696516188-ade861b84a49?auto=format&fit=crop&q=80&w=600";
    }

    if (!url || isBadUrl) {
      return "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=600";
    }

    return url;
  };

  // Render tag badge
  const renderTagBadge = (tag) => {
    const cleanTag = tag.trim();
    if (cleanTag.toLowerCase() === "veg") {
      return (
        <span
          key={cleanTag}
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span> Veg
        </span>
      );
    }
    if (cleanTag.toLowerCase() === "non-veg") {
      return (
        <span
          key={cleanTag}
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold bg-red-50 text-red-700 border border-red-200"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-red-600"></span> Non-Veg
        </span>
      );
    }
    if (cleanTag.toLowerCase().includes("chef")) {
      return (
        <span
          key={cleanTag}
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200"
        >
          <Award className="w-3 h-3 text-amber-600" /> Chef Special
        </span>
      );
    }
    return (
      <span
        key={cleanTag}
        className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200"
      >
        {cleanTag}
      </span>
    );
  };

  const tagsList = dietary_tags
    ? dietary_tags.split(",").map((t) => t.trim())
    : [];

  return (
    <div
      className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden flex flex-col justify-between ${
        is_available
          ? "border-gray-200 hover:shadow-lg hover:border-amber-200"
          : "border-gray-200 opacity-60 bg-gray-50"
      }`}
    >
      <div>
        {/* Image Container */}
        <div className="relative h-48 w-full bg-amber-50 overflow-hidden">
          <img
            src={getImageSrc(name, image_url)}
            alt={name}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src =
                "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=600";
            }}
          />
          {!is_available && (
            <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px] flex items-center justify-center">
              <span className="bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow">
                Sold Out
              </span>
            </div>
          )}
        </div>

        {/* Details */}
        <div className="p-5">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="font-bold text-gray-900 text-lg leading-snug">
              {name}
            </h3>
            <span className="font-bold text-amber-700 text-lg whitespace-nowrap bg-amber-50 px-2.5 py-0.5 rounded-lg border border-amber-200">
              ${typeof price === "number" ? price.toFixed(2) : price}
            </span>
          </div>

          <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">
            {description ||
              "Delicious gourmet preparation crafted with authentic spices and fresh ingredients."}
          </p>

          {/* Tags */}
          {tagsList.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {tagsList.map(renderTagBadge)}
            </div>
          )}
        </div>
      </div>

      {/* Action Footer */}
      <div className="px-5 pb-5 pt-0">
        <button
          onClick={() => onAddToCart && onAddToCart(item)}
          disabled={!is_available}
          className={`w-full py-2.5 px-4 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition ${
            !is_available
              ? "bg-gray-200 text-gray-400 cursor-not-allowed"
              : cartQuantity > 0
                ? "bg-amber-100 text-amber-900 border border-amber-300 hover:bg-amber-200"
                : "bg-amber-600 text-white hover:bg-amber-700 shadow-sm active:scale-[0.98]"
          }`}
        >
          {cartQuantity > 0 ? (
            <>
              <Check className="w-4 h-4 text-amber-700" />
              <span>In Cart ({cartQuantity}) — Add More</span>
            </>
          ) : (
            <>
              <Plus className="w-4 h-4" />
              <span>Add to Cart</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

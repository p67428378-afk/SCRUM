import React, { useState, useEffect } from "react";
import { Minus, Plus, ShoppingCart, Check, AlertCircle } from "lucide-react";
import Button from "../common/Button";

export default function VariantSelector({
  variants = [],
  onAddToCart,
  loading,
}) {
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState("");

  // Extract available sizes & colors from variants
  const availableSizes = Array.from(
    new Set(variants.map((v) => v.size).filter(Boolean)),
  );
  const availableColors = Array.from(
    new Set(variants.map((v) => v.color).filter(Boolean)),
  );

  // Auto-select first variant
  useEffect(() => {
    if (variants.length > 0) {
      if (variants[0].size) setSelectedSize(variants[0].size);
      if (variants[0].color) setSelectedColor(variants[0].color);
    }
  }, [variants]);

  // Find matching variant
  const selectedVariant =
    variants.find(
      (v) =>
        (!v.size || v.size === selectedSize) &&
        (!v.color || v.color === selectedColor),
    ) || variants[0];

  const stockQuantity = selectedVariant ? selectedVariant.stock_quantity : 0;
  const isOutOfStock = stockQuantity <= 0;

  const handleAdd = () => {
    setError("");
    if (!selectedVariant) {
      setError("Please select size and color options");
      return;
    }
    if (isOutOfStock) {
      setError("Selected variant is currently out of stock");
      return;
    }
    onAddToCart(selectedVariant.id, quantity);
  };

  return (
    <div className="space-y-6">
      {/* Size Selector */}
      {availableSizes.length > 0 && (
        <div>
          <label className="block text-sm font-semibold text-[#171c29] mb-2">
            Select Size:{" "}
            <span className="text-[#2663eb] font-bold">{selectedSize}</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {availableSizes.map((sz) => (
              <button
                key={sz}
                type="button"
                onClick={() => setSelectedSize(sz)}
                className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                  selectedSize === sz
                    ? "bg-[#2663eb] text-white border-[#2663eb]"
                    : "bg-white text-[#171c29] border-[#e3e8f0] hover:border-[#2663eb]"
                }`}
              >
                {sz}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Color Selector */}
      {availableColors.length > 0 && (
        <div>
          <label className="block text-sm font-semibold text-[#171c29] mb-2">
            Select Color:{" "}
            <span className="text-[#2663eb] font-bold">{selectedColor}</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {availableColors.map((cl) => (
              <button
                key={cl}
                type="button"
                onClick={() => setSelectedColor(cl)}
                className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                  selectedColor === cl
                    ? "bg-[#171c29] text-white border-[#171c29]"
                    : "bg-white text-[#707a8c] border-[#e3e8f0] hover:border-[#171c29]"
                }`}
              >
                {cl}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Stock Availability Badge */}
      <div className="flex items-center gap-2">
        {isOutOfStock ? (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#db2626] bg-[#fee2e2] px-3 py-1 rounded-full">
            <AlertCircle className="w-3.5 h-3.5" /> Out of Stock
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#17a34a] bg-[#dcfce7] px-3 py-1 rounded-full">
            <Check className="w-3.5 h-3.5" /> In Stock ({stockQuantity}{" "}
            available)
          </span>
        )}
      </div>

      {/* Quantity & Add to Cart */}
      <div className="flex items-center gap-4 pt-2">
        <div className="flex items-center border border-[#e3e8f0] rounded-lg bg-white overflow-hidden">
          <button
            type="button"
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            disabled={quantity <= 1 || isOutOfStock}
            className="p-2.5 text-[#707a8c] hover:text-[#171c29] disabled:opacity-30"
          >
            <Minus className="w-4 h-4" />
          </button>
          <span className="px-4 py-2 text-sm font-semibold text-[#171c29] min-w-[3rem] text-center">
            {quantity}
          </span>
          <button
            type="button"
            onClick={() => setQuantity(Math.min(stockQuantity, quantity + 1))}
            disabled={quantity >= stockQuantity || isOutOfStock}
            className="p-2.5 text-[#707a8c] hover:text-[#171c29] disabled:opacity-30"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        <Button
          onClick={handleAdd}
          disabled={isOutOfStock || loading}
          className="flex-1 py-3"
        >
          <ShoppingCart className="w-4 h-4 mr-2" />
          {loading ? "Adding..." : "Add to Shopping Cart"}
        </Button>
      </div>

      {error && (
        <p className="text-xs text-[#db2626] font-medium flex items-center gap-1">
          <AlertCircle className="w-3.5 h-3.5" /> {error}
        </p>
      )}
    </div>
  );
}

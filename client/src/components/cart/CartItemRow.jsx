import React from "react";
import { Trash2, Plus, Minus } from "lucide-react";

export default function CartItemRow({ item, onUpdateQuantity, onRemove }) {
  const { id, quantity, product, variant, item_total } = item;

  const title = product?.title || "Clothing Item";
  const price = product?.price || 0;
  const imageUrl =
    product?.image_url ||
    "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=600&q=80";
  const size = variant?.size;
  const color = variant?.color;
  const stock = variant?.stock_quantity || 10;

  return (
    <div className="flex items-center justify-between p-4 bg-white border border-[#e3e8f0] rounded-xl gap-4">
      {/* Thumbnail & Title */}
      <div className="flex items-center gap-4 flex-1 min-w-0">
        <img
          src={imageUrl}
          alt={title}
          className="w-16 h-16 object-cover rounded-lg border border-[#e3e8f0] shrink-0"
        />
        <div className="min-w-0">
          <h4 className="font-bold text-[#171c29] text-sm truncate">{title}</h4>
          <p className="text-xs text-[#707a8c] mt-0.5">
            {size && <span>Size: {size} </span>}
            {color && <span>| Color: {color}</span>}
          </p>
          <p className="text-xs font-semibold text-[#2663eb] mt-1">
            ${Number(price).toFixed(2)} each
          </p>
        </div>
      </div>

      {/* Quantity Increment/Decrement */}
      <div className="flex items-center border border-[#e3e8f0] rounded-lg overflow-hidden bg-[#f7fafc]">
        <button
          onClick={() => onUpdateQuantity(id, Math.max(1, quantity - 1))}
          disabled={quantity <= 1}
          className="p-1.5 text-[#707a8c] hover:text-[#171c29] disabled:opacity-30"
          aria-label="Decrease quantity"
        >
          <Minus className="w-3.5 h-3.5" />
        </button>
        <span className="px-3 text-xs font-semibold text-[#171c29]">
          {quantity}
        </span>
        <button
          onClick={() => onUpdateQuantity(id, Math.min(stock, quantity + 1))}
          disabled={quantity >= stock}
          className="p-1.5 text-[#707a8c] hover:text-[#171c29] disabled:opacity-30"
          aria-label="Increase quantity"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Item Total & Remove */}
      <div className="flex items-center gap-4 text-right">
        <span className="font-bold text-[#171c29] text-base w-20">
          ${Number(item_total).toFixed(2)}
        </span>
        <button
          onClick={() => onRemove(id)}
          className="p-1.5 text-[#707a8c] hover:text-[#db2626] transition-colors"
          title="Remove item"
          aria-label="Remove item"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

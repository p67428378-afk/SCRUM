import React from "react";
import { Link } from "react-router-dom";
import { Star, ShoppingCart } from "lucide-react";
import Badge from "../common/Badge";

export default function ProductCard({ product }) {
  const { id, title, price, image_url, category, variants } = product;

  // Stock status from variants
  const hasVariants = variants && variants.length > 0;
  const inStock = hasVariants
    ? variants.some((v) => v.stock_quantity > 0)
    : true;

  return (
    <div className="bg-white border border-[#e3e8f0] rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between group">
      <Link
        to={`/product/${id}`}
        className="relative block aspect-square overflow-hidden bg-[#f7fafc]"
      >
        <img
          src={
            image_url ||
            "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=600&q=80"
          }
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-3 left-3 flex gap-2">
          {category && <Badge variant="info">{category.name}</Badge>}
          {!inStock && <Badge variant="danger">Out of Stock</Badge>}
        </div>
      </Link>

      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <Link
            to={`/product/${id}`}
            className="font-bold text-[#171c29] hover:text-[#2663eb] transition-colors line-clamp-1 text-base"
          >
            {title}
          </Link>

          <div className="flex items-center gap-1 my-2">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className="w-3.5 h-3.5 fill-[#eb9917] text-[#eb9917]"
              />
            ))}
            <span className="text-xs text-[#707a8c] ml-1">(4.8)</span>
          </div>
        </div>

        <div className="flex items-center justify-between mt-3 pt-3 border-t border-[#f1f5f9]">
          <span className="font-bold text-[#171c29] text-lg">
            ${Number(price).toFixed(2)}
          </span>

          <Link
            to={`/product/${id}`}
            className="inline-flex items-center gap-1.5 bg-[#f7fafc] border border-[#e3e8f0] text-[#171c29] hover:bg-[#2663eb] hover:text-white hover:border-[#2663eb] text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>View Item</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

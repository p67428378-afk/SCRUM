import React from "react";
import { Plus, ShoppingCart } from "lucide-react";

export default function MenuGrid({ menuItems, onAddToCart, cart = {} }) {
  if (!menuItems || menuItems.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
        <p className="text-gray-500 font-medium">
          No menu items available for this restaurant yet.
        </p>
      </div>
    );
  }

  // Group menu items by category
  const categories = menuItems.reduce((acc, item) => {
    const cat = item.category || "Main Course";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {});

  return (
    <div className="space-y-8">
      {Object.entries(categories).map(([category, items]) => (
        <div key={category} className="space-y-4">
          <h3 className="text-lg font-bold text-gray-900 border-b border-gray-200 pb-2 capitalize">
            {category}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {items.map((item) => {
              const cartQty = cart[item.id]?.quantity || 0;
              return (
                <div
                  key={item.id}
                  className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex justify-between items-start hover:shadow-md transition-shadow"
                >
                  <div className="flex-1 pr-4">
                    <h4 className="font-bold text-gray-900">{item.name}</h4>
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                      {item.description || "Delicious freshly prepared dish."}
                    </p>
                    <span className="text-indigo-600 font-bold text-sm mt-2 block">
                      ${parseFloat(item.price).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex flex-col items-end justify-between h-full min-h-[80px]">
                    {cartQty > 0 ? (
                      <span className="bg-indigo-50 text-indigo-700 text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                        <ShoppingCart className="h-3.5 w-3.5" />
                        {cartQty} in Cart
                      </span>
                    ) : (
                      <div />
                    )}
                    <button
                      onClick={() => onAddToCart(item)}
                      className="bg-indigo-50 hover:bg-indigo-100 text-indigo-600 p-2 rounded-lg transition-colors flex items-center gap-1 text-xs font-bold"
                    >
                      <Plus className="h-4 w-4" />
                      Add
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

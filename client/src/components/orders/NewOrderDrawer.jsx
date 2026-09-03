import React, { useState } from "react";
import { X, Plus, Minus, Trash2, ShoppingBag } from "lucide-react";

export default function NewOrderDrawer({
  isOpen,
  onClose,
  menuItems = [],
  tables = [],
  onSubmitOrder,
}) {
  const [selectedTableId, setSelectedTableId] = useState(tables[0]?.id || "t1");
  const [cartItems, setCartItems] = useState([]);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleAddItem = (item) => {
    if (!item.is_available) {
      setError(`"${item.name}" is currently Out of Stock.`);
      return;
    }
    setError("");

    setCartItems((prev) => {
      const existingIndex = prev.findIndex((i) => i.id === item.id);
      if (existingIndex !== -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += 1;
        return updated;
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const handleUpdateQuantity = (itemId, delta) => {
    setCartItems((prev) =>
      prev
        .map((item) => {
          if (item.id === itemId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean),
    );
  };

  const handleRemoveItem = (itemId) => {
    setCartItems((prev) => prev.filter((item) => item.id !== itemId));
  };

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const tax = Math.round(subtotal * 0.08 * 100) / 100;
  const total = Math.round((subtotal + tax) * 100) / 100;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (cartItems.length === 0) {
      setError("Please select at least one menu item.");
      return;
    }

    const selectedTable = tables.find((t) => t.id === selectedTableId) || {
      id: selectedTableId,
      table_number: 1,
    };

    const payload = {
      table_id: selectedTable.id,
      table_number: selectedTable.table_number,
      items: cartItems.map((item) => ({
        menu_item_id: item.id,
        name: item.name,
        quantity: item.quantity,
        unit_price: item.price,
      })),
      subtotal,
      tax,
      total_price: total,
    };

    onSubmitOrder(payload);
    setCartItems([]);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm flex justify-end">
      <div className="bg-white w-full max-w-lg h-full shadow-2xl flex flex-col justify-between overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-amber-600" />
            <h3 className="text-base font-bold text-slate-900">
              Create Customer Order
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-200/50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content area: split into Menu Selection & Cart */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-rose-700">
              {error}
            </div>
          )}

          {/* Table Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Select Table Assignment
            </label>
            <select
              value={selectedTableId}
              onChange={(e) => setSelectedTableId(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 bg-white"
            >
              {tables.map((t) => (
                <option key={t.id} value={t.id}>
                  Table {t.table_number} (Capacity: {t.capacity} | Status:{" "}
                  {t.status})
                </option>
              ))}
            </select>
          </div>

          {/* Available Menu Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Select Menu Items
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1 border border-slate-200 p-2 rounded-xl bg-slate-50">
              {menuItems.map((item) => (
                <button
                  type="button"
                  key={item.id}
                  onClick={() => handleAddItem(item)}
                  disabled={!item.is_available}
                  className={`p-2.5 rounded-xl border text-left flex justify-between items-center transition-all ${
                    item.is_available
                      ? "bg-white border-slate-200 hover:border-amber-500 hover:shadow-sm cursor-pointer"
                      : "bg-slate-100 border-slate-200 opacity-60 cursor-not-allowed"
                  }`}
                >
                  <div>
                    <div className="text-xs font-bold text-slate-900">
                      {item.name}
                    </div>
                    <div className="text-[11px] text-slate-500 font-medium">
                      ${parseFloat(item.price).toFixed(2)}
                    </div>
                  </div>
                  <Plus className="w-4 h-4 text-amber-600" />
                </button>
              ))}
            </div>
          </div>

          {/* Cart items list */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Order Items Summary ({cartItems.length})
            </label>
            {cartItems.length > 0 ? (
              <div className="space-y-2 border border-slate-200 rounded-xl p-3 bg-white">
                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between text-xs py-1.5 border-b border-slate-100 last:border-none"
                  >
                    <div className="flex-1">
                      <span className="font-semibold text-slate-900">
                        {item.name}
                      </span>
                      <span className="text-slate-400 block text-[10px]">
                        ${item.price.toFixed(2)} each
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-slate-50">
                        <button
                          type="button"
                          onClick={() => handleUpdateQuantity(item.id, -1)}
                          className="px-2 py-1 text-slate-600 hover:bg-slate-200"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2 font-bold text-slate-900">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleUpdateQuantity(item.id, 1)}
                          className="px-2 py-1 text-slate-600 hover:bg-slate-200"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <span className="font-bold text-slate-900 w-12 text-right">
                        ${(item.price * item.quantity).toFixed(2)}
                      </span>

                      <button
                        type="button"
                        onClick={() => handleRemoveItem(item.id)}
                        className="text-slate-400 hover:text-rose-600 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 border border-dashed border-slate-200 rounded-xl text-slate-400 text-xs">
                No items added to order yet. Click menu items above to add.
              </div>
            )}
          </div>
        </div>

        {/* Footer with Calculations & Submit */}
        <div className="p-6 bg-slate-50 border-t border-slate-200 space-y-3">
          <div className="space-y-1.5 text-xs text-slate-600">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span className="font-semibold">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax (8%):</span>
              <span className="font-semibold">${tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-base font-bold text-slate-900 pt-2 border-t border-slate-200">
              <span>Total Price:</span>
              <span className="text-amber-600">${total.toFixed(2)}</span>
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={cartItems.length === 0}
            className="w-full py-3 bg-amber-600 hover:bg-amber-700 disabled:bg-slate-300 text-white rounded-xl text-sm font-bold shadow-md transition-all"
          >
            Submit Order
          </button>
        </div>
      </div>
    </div>
  );
}

import React, { useState } from "react";
import { ToggleLeft, ToggleRight, Search, Plus, Utensils } from "lucide-react";

export default function MenuAvailabilityControl({
  menuItems = [],
  onToggleAvailability,
  onCreateItem,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [newItemName, setNewItemName] = useState("");
  const [newItemPrice, setNewItemPrice] = useState("");
  const [newItemCategory, setNewItemCategory] = useState("");
  const [newItemDesc, setNewItemDesc] = useState("");
  const [newItemTag, setNewItemTag] = useState("Veg");

  const filteredItems = menuItems.filter(
    (item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.dietary_tags &&
        item.dietary_tags.toLowerCase().includes(searchTerm.toLowerCase())),
  );

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newItemName || !newItemPrice) return;
    if (onCreateItem) {
      await onCreateItem({
        name: newItemName,
        price: parseFloat(newItemPrice),
        category_id: newItemCategory || "cat-1",
        description: newItemDesc,
        dietary_tags: newItemTag,
        is_available: true,
      });
    }
    setShowAddModal(false);
    setNewItemName("");
    setNewItemPrice("");
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Utensils className="w-5 h-5 text-amber-600" />
            Menu Item Stock & Availability
          </h3>
          <p className="text-xs text-gray-500">
            Toggle live availability for customer ordering
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-xs pl-9 pr-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-amber-500 bg-gray-50"
            />
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-3 py-2 bg-amber-600 text-white rounded-xl text-xs font-semibold hover:bg-amber-700 transition flex items-center gap-1 shadow-sm whitespace-nowrap"
          >
            <Plus className="w-4 h-4" /> Add Item
          </button>
        </div>
      </div>

      {/* Grid of items */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 transition ${
              item.is_available
                ? "border-gray-200 bg-white"
                : "border-red-200 bg-red-50/30"
            }`}
          >
            <div className="min-w-0 flex-1">
              <h4 className="font-bold text-gray-900 text-sm truncate">
                {item.name}
              </h4>
              <p className="text-amber-800 font-semibold text-xs">
                $
                {typeof item.price === "number"
                  ? item.price.toFixed(2)
                  : item.price}
              </p>
            </div>

            <button
              onClick={() => onToggleAvailability(item.id, !item.is_available)}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg font-bold text-xs transition ${
                item.is_available
                  ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                  : "bg-red-100 text-red-800 hover:bg-red-200"
              }`}
            >
              {item.is_available ? (
                <>
                  <ToggleRight className="w-4 h-4 text-emerald-600" />
                  <span>In Stock</span>
                </>
              ) : (
                <>
                  <ToggleLeft className="w-4 h-4 text-red-600" />
                  <span>Sold Out</span>
                </>
              )}
            </button>
          </div>
        ))}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Add New Menu Item
            </h3>
            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Item Name
                </label>
                <input
                  type="text"
                  required
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  placeholder="e.g. Paneer Butter Masala"
                  className="w-full text-xs p-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Price ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={newItemPrice}
                  onChange={(e) => setNewItemPrice(e.target.value)}
                  placeholder="14.99"
                  className="w-full text-xs p-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Dietary Tag
                </label>
                <select
                  value={newItemTag}
                  onChange={(e) => setNewItemTag(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="Veg">Veg</option>
                  <option value="Non-Veg">Non-Veg</option>
                  <option value="Chef Special">Chef Special</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={newItemDesc}
                  onChange={(e) => setNewItemDesc(e.target.value)}
                  placeholder="Short dish description"
                  className="w-full text-xs p-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-amber-600 rounded-lg hover:bg-amber-700"
                >
                  Save Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

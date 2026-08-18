import React, { useEffect, useState } from "react";
import {
  listIngredients,
  createIngredient,
  updateIngredient,
  deleteIngredient,
} from "../../services/api";
import Card from "../common/Card";
import Badge from "../common/Badge";
import StockAdjustmentForm from "./StockAdjustmentForm";
import {
  Plus,
  Edit2,
  Trash2,
  PackagePlus,
  AlertTriangle,
  RefreshCw,
  Search,
} from "lucide-react";

export default function IngredientTable() {
  const [ingredients, setIngredients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lowStockFilter, setLowStockFilter] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState(null);

  // Ingredient Form State
  const [showForm, setShowForm] = useState(false);
  const [editingIngredient, setEditingIngredient] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    unit: "kg",
    stock_quantity: "",
    reorder_threshold: "10.0",
  });

  // Stock Adjust Modal State
  const [activeAdjustIngredient, setActiveAdjustIngredient] = useState(null);

  const fetchIngredients = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listIngredients(lowStockFilter);
      setIngredients(data);
    } catch (err) {
      console.error("Error loading ingredients:", err);
      setError("Failed to load inventory ingredients.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIngredients();
  }, [lowStockFilter]);

  const filteredIngredients = ingredients.filter((ing) =>
    ing.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleOpenAddForm = () => {
    setEditingIngredient(null);
    setFormData({
      name: "",
      unit: "kg",
      stock_quantity: "0.0",
      reorder_threshold: "10.0",
    });
    setShowForm(true);
  };

  const handleOpenEditForm = (ing) => {
    setEditingIngredient(ing);
    setFormData({
      name: ing.name,
      unit: ing.unit,
      stock_quantity: ing.stock_quantity.toString(),
      reorder_threshold: ing.reorder_threshold.toString(),
    });
    setShowForm(true);
  };

  const handleSaveIngredient = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.unit) {
      setError("Name and unit are required.");
      return;
    }

    try {
      if (editingIngredient) {
        await updateIngredient(editingIngredient.id, {
          name: formData.name,
          unit: formData.unit,
          stock_quantity: parseFloat(formData.stock_quantity),
          reorder_threshold: parseFloat(formData.reorder_threshold),
        });
      } else {
        await createIngredient({
          name: formData.name,
          unit: formData.unit,
          stock_quantity: parseFloat(formData.stock_quantity) || 0.0,
          reorder_threshold: parseFloat(formData.reorder_threshold) || 10.0,
        });
      }
      setShowForm(false);
      fetchIngredients();
    } catch (err) {
      console.error("Error saving ingredient:", err);
      setError(err.response?.data?.detail || "Failed to save ingredient.");
    }
  };

  const handleDeleteIngredient = async (id) => {
    if (window.confirm("Are you sure you want to delete this ingredient?")) {
      try {
        await deleteIngredient(id);
        fetchIngredients();
      } catch (err) {
        console.error("Error deleting ingredient:", err);
        setError("Failed to delete ingredient.");
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1F1A14]">
            Ingredient Inventory
          </h1>
          <p className="text-sm text-[#80756B]">
            Track raw baking ingredients, reorder limits, and stock levels
          </p>
        </div>
        <button
          onClick={handleOpenAddForm}
          className="inline-flex items-center space-x-1.5 px-4 py-2 bg-[#D96B1F] text-white text-sm font-medium rounded-md hover:bg-[#B85310] transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Ingredient</span>
        </button>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-[#D92D2D] rounded-md text-xs flex items-center justify-between">
          <span>{error}</span>
          <button
            onClick={() => setError(null)}
            className="text-xs font-bold underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-lg border border-[#E5DED1] shadow-sm">
        {/* Toggle Filter */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setLowStockFilter(!lowStockFilter)}
            className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-medium border transition-colors ${
              lowStockFilter
                ? "bg-red-50 text-[#D92D2D] border-red-300 font-bold"
                : "bg-[#FAF7F2] text-[#80756B] border-[#E5DED1] hover:text-[#1F1A14]"
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Low Stock Items Only</span>
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#80756B]" />
          <input
            type="text"
            placeholder="Search ingredients..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-[#FAF7F2] border border-[#E5DED1] rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-[#D96B1F]"
          />
        </div>
      </div>

      {/* Ingredients List Table */}
      <Card>
        {loading ? (
          <div className="flex items-center justify-center p-8 text-[#80756B]">
            <RefreshCw className="w-5 h-5 animate-spin mr-2 text-[#D96B1F]" />
            <span>Loading ingredient inventory...</span>
          </div>
        ) : filteredIngredients.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-[#E5DED1] text-sm">
              <thead>
                <tr className="bg-[#FAF7F2] text-left text-xs uppercase font-semibold text-[#80756B]">
                  <th className="px-4 py-3">Ingredient</th>
                  <th className="px-4 py-3">Unit</th>
                  <th className="px-4 py-3">Current Stock</th>
                  <th className="px-4 py-3">Reorder Threshold</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5DED1]">
                {filteredIngredients.map((ing) => {
                  const isLow = ing.stock_quantity <= ing.reorder_threshold;
                  return (
                    <tr
                      key={ing.id}
                      className="hover:bg-[#FAF7F2] transition-colors"
                    >
                      <td className="px-4 py-3 font-semibold text-[#1F1A14]">
                        {ing.name}
                      </td>
                      <td className="px-4 py-3 text-[#80756B]">{ing.unit}</td>
                      <td className="px-4 py-3 font-bold text-[#1F1A14]">
                        {ing.stock_quantity} {ing.unit}
                      </td>
                      <td className="px-4 py-3 text-[#80756B]">
                        {ing.reorder_threshold} {ing.unit}
                      </td>
                      <td className="px-4 py-3">
                        {isLow ? (
                          <Badge variant="error" className="animate-pulse">
                            Low Stock Alert
                          </Badge>
                        ) : (
                          <Badge variant="success">In Stock</Badge>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right space-x-2">
                        <button
                          onClick={() => setActiveAdjustIngredient(ing)}
                          className="inline-flex items-center space-x-1 text-xs text-[#1F9E4D] font-medium bg-emerald-50 px-2 py-1 rounded border border-emerald-200 hover:bg-emerald-100"
                          title="Restock / Adjust Quantity"
                        >
                          <PackagePlus className="w-3.5 h-3.5 mr-1" />
                          <span>Adjust</span>
                        </button>
                        <button
                          onClick={() => handleOpenEditForm(ing)}
                          className="text-[#80756B] hover:text-[#1F1A14] p-1"
                          title="Edit Ingredient"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteIngredient(ing.id)}
                          className="text-[#D92D2D] hover:text-red-700 p-1"
                          title="Delete Ingredient"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-[#80756B] italic py-8 text-center">
            No ingredients found in inventory.
          </p>
        )}
      </Card>

      {/* Add / Edit Ingredient Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full border border-[#E5DED1] overflow-hidden">
            <div className="px-6 py-4 bg-[#FAF7F2] border-b border-[#E5DED1] flex items-center justify-between">
              <h3 className="font-bold text-[#1F1A14]">
                {editingIngredient ? "Edit Ingredient" : "Add Raw Ingredient"}
              </h3>
              <button
                onClick={() => setShowForm(false)}
                className="text-[#80756B] hover:text-[#1F1A14]"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveIngredient} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#1F1A14] mb-1">
                  Ingredient Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Organic Bread Flour"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full text-xs p-2 border border-[#E5DED1] rounded-md focus:outline-none focus:ring-1 focus:ring-[#D96B1F]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#1F1A14] mb-1">
                    Unit of Measure
                  </label>
                  <select
                    value={formData.unit}
                    onChange={(e) =>
                      setFormData({ ...formData, unit: e.target.value })
                    }
                    className="w-full text-xs p-2 border border-[#E5DED1] rounded-md focus:outline-none focus:ring-1 focus:ring-[#D96B1F]"
                  >
                    <option value="kg">kg (Kilograms)</option>
                    <option value="g">g (Grams)</option>
                    <option value="L">L (Liters)</option>
                    <option value="ml">ml (Milliliters)</option>
                    <option value="pcs">pcs (Pieces / Units)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#1F1A14] mb-1">
                    Current Stock
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    placeholder="e.g. 50.0"
                    value={formData.stock_quantity}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        stock_quantity: e.target.value,
                      })
                    }
                    className="w-full text-xs p-2 border border-[#E5DED1] rounded-md focus:outline-none focus:ring-1 focus:ring-[#D96B1F]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#1F1A14] mb-1">
                  Reorder Alert Threshold
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  placeholder="e.g. 10.0"
                  value={formData.reorder_threshold}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      reorder_threshold: e.target.value,
                    })
                  }
                  className="w-full text-xs p-2 border border-[#E5DED1] rounded-md focus:outline-none focus:ring-1 focus:ring-[#D96B1F]"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 border border-[#E5DED1] text-xs font-medium text-[#1F1A14] rounded-md hover:bg-[#FAF7F2]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#D96B1F] text-white text-xs font-medium rounded-md hover:bg-[#B85310]"
                >
                  {editingIngredient ? "Save Changes" : "Create Ingredient"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Adjust Stock Modal */}
      {activeAdjustIngredient && (
        <StockAdjustmentForm
          ingredient={activeAdjustIngredient}
          onClose={() => setActiveAdjustIngredient(null)}
          onSuccess={fetchIngredients}
        />
      )}
    </div>
  );
}

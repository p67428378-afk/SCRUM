import React, { useEffect, useState } from "react";
import {
  listProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../../services/api";
import Card from "../common/Card";
import Badge from "../common/Badge";
import RecipeModal from "./RecipeModal";
import {
  Plus,
  Edit2,
  Trash2,
  Utensils,
  Search,
  RefreshCw,
  AlertCircle,
} from "lucide-react";

export default function ProductCatalogTable() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [error, setError] = useState(null);

  // Add/Edit Product Modal State
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    category: "Pastry",
    price: "",
    description: "",
  });

  // Recipe Modal State
  const [activeRecipeProduct, setActiveRecipeProduct] = useState(null);

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listProducts();
      setProducts(data);
    } catch (err) {
      console.error("Error loading products:", err);
      setError("Failed to load product catalog.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const categories = ["All", "Pastry", "Bread", "Cake", "Beverage", "General"];

  const filteredProducts = products.filter((product) => {
    const matchesCategory =
      selectedCategory === "All" || product.category === selectedCategory;
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (product.description &&
        product.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const handleOpenAddForm = () => {
    setEditingProduct(null);
    setFormData({ name: "", category: "Pastry", price: "", description: "" });
    setShowProductForm(true);
  };

  const handleOpenEditForm = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      category: product.category || "Pastry",
      price: product.price,
      description: product.description || "",
    });
    setShowProductForm(true);
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.price || parseFloat(formData.price) <= 0) {
      setError("Please provide a valid product name and price greater than 0.");
      return;
    }

    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, {
          name: formData.name,
          category: formData.category,
          price: parseFloat(formData.price),
          description: formData.description,
        });
      } else {
        await createProduct({
          name: formData.name,
          category: formData.category,
          price: parseFloat(formData.price),
          description: formData.description,
        });
      }
      setShowProductForm(false);
      fetchProducts();
    } catch (err) {
      console.error("Error saving product:", err);
      setError(err.response?.data?.detail || "Failed to save product.");
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await deleteProduct(productId);
        fetchProducts();
      } catch (err) {
        console.error("Error deleting product:", err);
        setError("Failed to delete product.");
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1F1A14]">
            Bakery Product Catalog
          </h1>
          <p className="text-sm text-[#80756B]">
            Manage products, pricing, and recipe ingredient linkages
          </p>
        </div>
        <button
          onClick={handleOpenAddForm}
          className="inline-flex items-center space-x-1.5 px-4 py-2 bg-[#D96B1F] text-white text-sm font-medium rounded-md hover:bg-[#B85310] transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </button>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-[#D92D2D] rounded-md text-xs flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={() => setError(null)}
            className="text-xs font-bold underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Filters & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-lg border border-[#E5DED1] shadow-sm">
        {/* Category Pills */}
        <div className="flex flex-wrap gap-1.5">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                selectedCategory === cat
                  ? "bg-[#D96B1F] text-white"
                  : "bg-[#FAF7F2] text-[#80756B] hover:text-[#1F1A14] border border-[#E5DED1]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#80756B]" />
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-[#FAF7F2] border border-[#E5DED1] rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-[#D96B1F]"
          />
        </div>
      </div>

      {/* Product List Table */}
      <Card>
        {loading ? (
          <div className="flex items-center justify-center p-8 text-[#80756B]">
            <RefreshCw className="w-5 h-5 animate-spin mr-2 text-[#D96B1F]" />
            <span>Loading product catalog...</span>
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-[#E5DED1] text-sm">
              <thead>
                <tr className="bg-[#FAF7F2] text-left text-xs uppercase font-semibold text-[#80756B]">
                  <th className="px-4 py-3">Product</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Price</th>
                  <th className="px-4 py-3">Recipe Ingredients</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5DED1]">
                {filteredProducts.map((product) => (
                  <tr
                    key={product.id}
                    className="hover:bg-[#FAF7F2] transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="font-semibold text-[#1F1A14]">
                        {product.name}
                      </div>
                      {product.description && (
                        <div className="text-xs text-[#80756B] line-clamp-1">
                          {product.description}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="primary">{product.category}</Badge>
                    </td>
                    <td className="px-4 py-3 font-bold text-[#1F1A14]">
                      ${product.price.toFixed(2)}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setActiveRecipeProduct(product)}
                        className="inline-flex items-center space-x-1 text-xs text-[#D96B1F] hover:underline font-medium bg-orange-50 px-2.5 py-1 rounded border border-orange-200"
                      >
                        <Utensils className="w-3.5 h-3.5 mr-1" />
                        <span>
                          {product.recipes && product.recipes.length > 0
                            ? `${product.recipes.length} ingredients mapped`
                            : "Configure Recipe"}
                        </span>
                      </button>
                    </td>
                    <td className="px-4 py-3 text-right space-x-2">
                      <button
                        onClick={() => handleOpenEditForm(product)}
                        className="text-[#80756B] hover:text-[#1F1A14] p-1"
                        title="Edit Product"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product.id)}
                        className="text-[#D92D2D] hover:text-red-700 p-1"
                        title="Delete Product"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-[#80756B] italic py-8 text-center">
            No products found in the catalog.
          </p>
        )}
      </Card>

      {/* Add / Edit Product Modal */}
      {showProductForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full border border-[#E5DED1] overflow-hidden">
            <div className="px-6 py-4 bg-[#FAF7F2] border-b border-[#E5DED1] flex items-center justify-between">
              <h3 className="font-bold text-[#1F1A14]">
                {editingProduct ? "Edit Product" : "Add New Bakery Product"}
              </h3>
              <button
                onClick={() => setShowProductForm(false)}
                className="text-[#80756B] hover:text-[#1F1A14]"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#1F1A14] mb-1">
                  Product Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sourdough Loaf"
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
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    className="w-full text-xs p-2 border border-[#E5DED1] rounded-md focus:outline-none focus:ring-1 focus:ring-[#D96B1F]"
                  >
                    <option value="Pastry">Pastry</option>
                    <option value="Bread">Bread</option>
                    <option value="Cake">Cake</option>
                    <option value="Beverage">Beverage</option>
                    <option value="General">General</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#1F1A14] mb-1">
                    Price ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    placeholder="e.g. 5.50"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: e.target.value })
                    }
                    className="w-full text-xs p-2 border border-[#E5DED1] rounded-md focus:outline-none focus:ring-1 focus:ring-[#D96B1F]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#1F1A14] mb-1">
                  Description
                </label>
                <textarea
                  rows="2"
                  placeholder="e.g. Freshly baked organic artisan sourdough"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full text-xs p-2 border border-[#E5DED1] rounded-md focus:outline-none focus:ring-1 focus:ring-[#D96B1F]"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowProductForm(false)}
                  className="px-4 py-2 border border-[#E5DED1] text-xs font-medium text-[#1F1A14] rounded-md hover:bg-[#FAF7F2]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#D96B1F] text-white text-xs font-medium rounded-md hover:bg-[#B85310]"
                >
                  {editingProduct ? "Save Changes" : "Create Product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Recipe Modal */}
      {activeRecipeProduct && (
        <RecipeModal
          product={activeRecipeProduct}
          onClose={() => setActiveRecipeProduct(null)}
          onRecipeUpdated={fetchProducts}
        />
      )}
    </div>
  );
}

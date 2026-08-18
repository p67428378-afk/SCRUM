import React, { useEffect, useState } from "react";
import { listProducts } from "../../services/api";
import Card from "../common/Card";
import Badge from "../common/Badge";
import { Search, Plus, ShoppingBag, RefreshCw } from "lucide-react";

export default function POSItemSelector({ onAddToCart, cartItems = [] }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    async function loadProducts() {
      setLoading(true);
      try {
        const data = await listProducts();
        setProducts(data);
      } catch (err) {
        console.error("Error loading products for POS:", err);
      } finally {
        setLoading(false);
      }
    }
    loadProducts();
  }, []);

  const categories = ["All", "Pastry", "Bread", "Cake", "Beverage", "General"];

  const filteredProducts = products.filter((p) => {
    const matchesCategory =
      selectedCategory === "All" || p.category === selectedCategory;
    const matchesSearch = p.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getCartQuantity = (productId) => {
    const found = cartItems.find((ci) => ci.product.id === productId);
    return found ? found.quantity : 0;
  };

  return (
    <Card
      title="Bakery Items Selection"
      subtitle="Select products to add to current order"
    >
      <div className="space-y-4">
        {/* Category Pills & Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#E5DED1]">
          <div className="flex flex-wrap gap-1">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                  selectedCategory === cat
                    ? "bg-[#D96B1F] text-white"
                    : "bg-[#FAF7F2] text-[#80756B] hover:text-[#1F1A14] border border-[#E5DED1]"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-[#80756B]" />
            <input
              type="text"
              placeholder="Search items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1 bg-[#FAF7F2] border border-[#E5DED1] rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-[#D96B1F] w-full sm:w-48"
            />
          </div>
        </div>

        {/* Product Grid */}
        {loading ? (
          <div className="flex items-center justify-center p-8 text-[#80756B]">
            <RefreshCw className="w-5 h-5 animate-spin mr-2 text-[#D96B1F]" />
            <span>Loading products...</span>
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredProducts.map((product) => {
              const qtyInCart = getCartQuantity(product.id);
              return (
                <div
                  key={product.id}
                  onClick={() => onAddToCart(product)}
                  className={`p-3 rounded-lg border text-left cursor-pointer transition-all hover:shadow-md flex flex-col justify-between ${
                    qtyInCart > 0
                      ? "bg-orange-50/50 border-[#D96B1F]"
                      : "bg-white border-[#E5DED1] hover:border-[#D96B1F]"
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between">
                      <span className="font-bold text-sm text-[#1F1A14]">
                        {product.name}
                      </span>
                      <span className="text-xs font-bold text-[#D96B1F]">
                        ${product.price.toFixed(2)}
                      </span>
                    </div>
                    {product.description && (
                      <p className="text-xs text-[#80756B] mt-1 line-clamp-2">
                        {product.description}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between mt-3 pt-2 border-t border-[#E5DED1]/50 text-xs">
                    <Badge variant="default">{product.category}</Badge>
                    <button
                      type="button"
                      className="inline-flex items-center space-x-1 px-2 py-1 bg-[#D96B1F] text-white rounded text-xs hover:bg-[#B85310]"
                    >
                      <Plus className="w-3 h-3" />
                      <span>
                        {qtyInCart > 0 ? `In Cart (${qtyInCart})` : "Add"}
                      </span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-xs text-[#80756B] italic py-8 text-center">
            No matching bakery items found.
          </p>
        )}
      </div>
    </Card>
  );
}

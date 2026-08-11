import React, { useState, useEffect } from "react";
import HeaderSearch from "./components/common/HeaderSearch";
import { getProducts, getCategories } from "./services/api";

export function App() {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState(null);

  // Load initial products and categories
  useEffect(() => {
    const loadData = async () => {
      setLoadingProducts(true);
      try {
        const [prodData, catData] = await Promise.all([
          getProducts({ limit: 12 }),
          getCategories(),
        ]);
        setProducts(prodData || []);
        setCategories(catData || []);
      } catch (err) {
        console.error("Failed to load initial shop data:", err);
      } finally {
        setLoadingProducts(false);
      }
    };

    loadData();
  }, []);

  const handleCategoryClick = async (catId) => {
    setActiveCategoryFilter(catId);
    setLoadingProducts(true);
    try {
      const filtered = await getProducts({
        category_id: catId || undefined,
        limit: 12,
      });
      setProducts(filtered || []);
    } catch (err) {
      console.error("Failed to filter products by category:", err);
    } finally {
      setLoadingProducts(false);
    }
  };

  const handleProductSelect = (product) => {
    setSelectedProduct(product);
  };

  return (
    <div className="min-h-screen bg-[#f7fafc] flex flex-col font-sans">
      {/* Navigation Header */}
      <header className="bg-white border-b border-[#e3e8f0] px-6 py-3 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Logo */}
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => {
              setSelectedProduct(null);
              handleCategoryClick(null);
            }}
          >
            <span className="text-2xl">🛍️</span>
            <span className="text-xl font-bold text-[#2663eb]">ShopperHub</span>
          </div>

          {/* Centered Search Bar */}
          <div className="flex-1 flex justify-center max-w-[600px] px-4">
            <HeaderSearch onProductSelect={handleProductSelect} />
          </div>

          {/* Nav Icons */}
          <div className="flex items-center gap-6 text-sm font-medium text-[#707a8c]">
            <button className="hover:text-[#2663eb] transition-colors hidden sm:block">
              Deals
            </button>
            <button className="hover:text-[#2663eb] transition-colors flex items-center gap-1">
              <span>🛒</span>
              <span className="hidden sm:inline">Cart</span>
            </button>
            <button className="hover:text-[#2663eb] transition-colors flex items-center gap-1">
              <span>👤</span>
              <span className="hidden sm:inline">Account</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 flex flex-col gap-6">
        {/* Selected Product Banner (Modal or Selected Card) */}
        {selectedProduct && (
          <div className="bg-white border border-[#2663eb]/30 rounded-xl p-6 shadow-elevation-2 flex flex-col sm:flex-row items-center gap-6 relative">
            <button
              onClick={() => setSelectedProduct(null)}
              className="absolute top-4 right-4 text-[#707a8c] hover:text-[#171c29] text-sm font-bold"
              title="Close details"
            >
              ✕
            </button>
            <div className="w-24 h-24 bg-[#f2f5fa] rounded-lg flex items-center justify-center text-4xl shrink-0">
              {selectedProduct.thumbnail_url ? (
                <img
                  src={selectedProduct.thumbnail_url}
                  alt={selectedProduct.title}
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                "🛍️"
              )}
            </div>
            <div className="flex-1 text-center sm:text-left">
              <span className="text-xs font-semibold uppercase text-[#2663eb] tracking-wider">
                Selected Product
              </span>
              <h2 className="text-xl font-bold text-[#171c29] mt-1">
                {selectedProduct.title}
              </h2>
              {selectedProduct.category_name && (
                <p className="text-sm text-[#707a8c] mt-0.5">
                  Category: {selectedProduct.category_name}
                </p>
              )}
              {selectedProduct.price && (
                <p className="text-lg font-bold text-[#2663eb] mt-2">
                  $
                  {typeof selectedProduct.price === "number"
                    ? selectedProduct.price.toFixed(2)
                    : selectedProduct.price}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Categories Bar */}
        <section className="bg-white p-4 rounded-xl border border-[#e3e8f0] shadow-sm flex flex-col gap-3">
          <h3 className="text-sm font-bold text-[#171c29] uppercase tracking-wider">
            Explore Categories
          </h3>
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <button
              onClick={() => handleCategoryClick(null)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeCategoryFilter === null
                  ? "bg-[#2663eb] text-white"
                  : "bg-[#f2f5fa] text-[#707a8c] hover:bg-[#e3e8f0]"
              }`}
            >
              All Categories
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleCategoryClick(cat.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeCategoryFilter === cat.id
                    ? "bg-[#2663eb] text-white"
                    : "bg-[#f2f5fa] text-[#707a8c] hover:bg-[#e3e8f0]"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </section>

        {/* Product Catalog Grid */}
        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-[#171c29]">
              Featured Products
            </h2>
            <span className="text-xs text-[#707a8c]">
              Real-time Elasticsearch & Vector Search Powered
            </span>
          </div>

          {loadingProducts ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 animate-pulse">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-white h-64 rounded-xl border border-[#e3e8f0] p-4 flex flex-col gap-3"
                >
                  <div className="w-full h-32 bg-[#e3e8f0] rounded-lg"></div>
                  <div className="h-4 bg-[#e3e8f0] rounded w-3/4"></div>
                  <div className="h-4 bg-[#e3e8f0] rounded w-1/4"></div>
                </div>
              ))}
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <div
                  key={product.id}
                  onClick={() => handleProductSelect(product)}
                  className="bg-white rounded-xl border border-[#e3e8f0] p-4 flex flex-col justify-between hover:shadow-elevation-2 hover:border-[#2663eb] transition-all cursor-pointer group"
                >
                  <div className="flex flex-col gap-3">
                    <div className="w-full h-36 bg-[#f2f5fa] rounded-lg flex items-center justify-center text-3xl group-hover:scale-105 transition-transform overflow-hidden">
                      {product.thumbnail_url ? (
                        <img
                          src={product.thumbnail_url}
                          alt={product.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        "👟"
                      )}
                    </div>
                    <div>
                      <span className="text-xs text-[#707a8c] font-medium">
                        {product.category_name || "General"}
                      </span>
                      <h3 className="font-bold text-[#171c29] text-sm group-hover:text-[#2663eb] transition-colors line-clamp-2">
                        {product.title}
                      </h3>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-[#f2f5fa]">
                    <span className="font-extrabold text-[#2663eb] text-base">
                      $
                      {typeof product.price === "number"
                        ? product.price.toFixed(2)
                        : product.price}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleProductSelect(product);
                      }}
                      className="bg-[#f2f5fa] hover:bg-[#2663eb] hover:text-white text-[#2663eb] px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
                    >
                      View
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white p-12 rounded-xl border border-[#e3e8f0] text-center text-[#707a8c]">
              No products found in this category.
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-[#e3e8f0] py-6 px-6 text-center text-xs text-[#707a8c] mt-auto">
        <p>© 2026 ShopperHub. All rights reserved.</p>
      </footer>
    </div>
  );
}

export default App;

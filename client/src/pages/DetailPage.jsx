import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Navbar from "../components/common/Navbar";
import ProductDetailCard from "../components/catalog/ProductDetailCard";
import { getProductById } from "../services/api";
import { useCart } from "../context/CartContext";
import { ArrowLeft, Loader, AlertCircle } from "lucide-react";

export default function DetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getProductById(id);
        setProduct(data);
      } catch (err) {
        console.error("Failed to fetch product details", err);
        setError("Product not found or unavailable.");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchDetail();
  }, [id]);

  const handleAddToCart = async (variantId, quantity) => {
    setAdding(true);
    try {
      await addItem(variantId, quantity);
    } catch (err) {
      setError(err.message || "Could not add item to cart");
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f7fafc]">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Link */}
        <Link
          to="/"
          className="inline-flex items-center text-sm font-medium text-[#707a8c] hover:text-[#2663eb] transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Catalog
        </Link>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-[#707a8c]">
            <Loader className="w-8 h-8 animate-spin text-[#2663eb] mb-2" />
            <p className="text-sm">Loading product details...</p>
          </div>
        ) : error ? (
          <div className="bg-[#fee2e2] text-[#db2626] p-6 rounded-xl text-center space-y-3">
            <AlertCircle className="w-8 h-8 mx-auto" />
            <p className="text-base font-bold">{error}</p>
            <button onClick={() => navigate("/")} className="text-xs underline">
              Return to Catalog
            </button>
          </div>
        ) : product ? (
          <ProductDetailCard
            product={product}
            onAddToCart={handleAddToCart}
            loadingAddToCart={adding}
          />
        ) : null}
      </main>
    </div>
  );
}

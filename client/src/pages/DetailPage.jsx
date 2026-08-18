import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import Navbar from "../components/common/Navbar";
import ProductGallery from "../components/detail/ProductGallery";
import VariantSelector from "../components/detail/VariantSelector";
import { getProductById } from "../services/api";
import { useCart } from "../context/CartContext";
import Badge from "../components/common/Badge";
import { Star, ArrowLeft, Check, Loader, AlertCircle } from "lucide-react";

export default function DetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState(null);
  const [toastMessage, setToastMessage] = useState("");

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
    setToastMessage("");
    try {
      await addItem(variantId, quantity);
      setToastMessage("Item added to your shopping cart!");
      setTimeout(() => setToastMessage(""), 4000);
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
          <div className="bg-white border border-[#e3e8f0] rounded-2xl p-6 lg:p-10 grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* Gallery Section */}
            <ProductGallery
              imageUrl={product.image_url}
              title={product.title}
            />

            {/* Product Details Section */}
            <div className="space-y-6">
              <div>
                {product.category && (
                  <Badge variant="info" className="mb-2">
                    {product.category.name}
                  </Badge>
                )}
                <h1 className="text-2xl lg:text-3xl font-bold text-[#171c29]">
                  {product.title}
                </h1>

                <div className="flex items-center gap-2 mt-3">
                  <div className="flex text-[#eb9917]">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                  <span className="text-xs font-semibold text-[#707a8c]">
                    4.9 (128 Reviews)
                  </span>
                </div>
              </div>

              {/* Price Tag */}
              <div className="text-3xl font-bold text-[#2663eb]">
                ${Number(product.price).toFixed(2)}
              </div>

              {/* Description */}
              <p className="text-sm text-[#707a8c] leading-relaxed">
                {product.description ||
                  "High quality clothes & accessories designed for daily comfort and timeless style."}
              </p>

              <hr className="border-[#e3e8f0]" />

              {/* Variant Selector */}
              <VariantSelector
                variants={product.variants || []}
                onAddToCart={handleAddToCart}
                loading={adding}
              />

              {/* Toast Notification */}
              {toastMessage && (
                <div className="bg-[#dcfce7] border border-[#17a34a] text-[#17a34a] px-4 py-3 rounded-xl flex items-center justify-between text-sm font-medium animate-fade-in">
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4" />
                    <span>{toastMessage}</span>
                  </div>
                  <Link to="/cart" className="underline font-bold text-xs">
                    View Cart
                  </Link>
                </div>
              )}
            </div>
          </div>
        ) : null}
      </main>
    </div>
  );
}

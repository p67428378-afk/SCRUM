import React, { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  Star,
  ShoppingBag,
  Heart,
  Check,
  Truck,
  ShieldCheck,
  RotateCcw,
  ChevronRight,
  AlertCircle,
  ArrowLeft,
} from "lucide-react";
import { productApi } from "../services/api";
import { useCart } from "../context/CartContext";

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart, wishlist, toggleWishlist } = useCart();

  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Customization selection state
  const [selectedFinish, setSelectedFinish] = useState("");
  const [selectedDimension, setSelectedDimension] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [addSuccess, setAddSuccess] = useState(false);

  useEffect(() => {
    async function fetchProduct() {
      setIsLoading(true);
      setError(null);
      try {
        const res = await productApi.getProduct(id);
        const data = res.data;
        setProduct(data);
        if (data.finish_options && data.finish_options.length > 0) {
          setSelectedFinish(data.finish_options[0]);
        }
        if (data.dimension_options && data.dimension_options.length > 0) {
          setSelectedDimension(data.dimension_options[0]);
        }
      } catch (err) {
        setError(err?.response?.data?.detail || "Product not found");
      } finally {
        setIsLoading(false);
      }
    }
    fetchProduct();
  }, [id]);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="animate-pulse grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="aspect-square bg-gray-200 rounded-2xl"></div>
          <div className="space-y-6">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-8 bg-gray-200 rounded w-3/4"></div>
            <div className="h-6 bg-gray-200 rounded w-1/3"></div>
            <div className="h-24 bg-gray-200 rounded"></div>
            <div className="h-12 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-danger mx-auto" />
        <h2 className="text-xl font-bold text-textmain">Furniture Not Found</h2>
        <p className="text-sm text-textmuted">
          {error || "The requested product does not exist."}
        </p>
        <Link
          to="/catalog"
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white text-xs font-semibold rounded-lg hover:bg-primary-hover transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Catalog
        </Link>
      </div>
    );
  }

  const isWishlisted = wishlist.some((item) => item.product_id === product.id);
  const inStock = product.stock_quantity > 0;
  const unitPrice = Number(product.price);
  const totalPrice = unitPrice * quantity;

  const handleAddToCart = async () => {
    if (!inStock) return;
    setIsAdding(true);
    const result = await addToCart({
      product_id: product.id,
      quantity,
      selected_finish: selectedFinish || "Standard",
      selected_dimension: selectedDimension || "Standard",
    });
    setIsAdding(false);
    if (result.success) {
      setAddSuccess(true);
      setTimeout(() => setAddSuccess(false), 3000);
    }
  };

  const handleBuyNow = async () => {
    if (!inStock) return;
    await addToCart({
      product_id: product.id,
      quantity,
      selected_finish: selectedFinish || "Standard",
      selected_dimension: selectedDimension || "Standard",
    });
    navigate("/checkout");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs text-textmuted mb-6">
        <Link to="/" className="hover:text-primary">
          Home
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-borderline" />
        <Link to="/catalog" className="hover:text-primary">
          Catalog
        </Link>
        {product.category && (
          <>
            <ChevronRight className="w-3.5 h-3.5 text-borderline" />
            <Link
              to={`/catalog?category=${product.category.slug}`}
              className="hover:text-primary"
            >
              {product.category.name}
            </Link>
          </>
        )}
        <ChevronRight className="w-3.5 h-3.5 text-borderline" />
        <span className="text-textmain font-medium truncate max-w-[200px]">
          {product.name}
        </span>
      </nav>

      {/* Main Product Showcase Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 bg-white p-6 sm:p-10 rounded-2xl border border-borderline shadow-sm">
        {/* Left: Product Image & Gallery */}
        <div className="space-y-4">
          <div className="relative aspect-square rounded-xl overflow-hidden bg-bgsoft border border-borderline">
            <img
              src={
                product.image_url ||
                "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80"
              }
              alt={product.name}
              className="w-full h-full object-cover"
            />
            {/* Wishlist Button */}
            <button
              onClick={() => toggleWishlist(product.id)}
              className={`absolute top-4 right-4 p-3 rounded-full shadow-md transition-colors ${
                isWishlisted
                  ? "bg-rose-50 text-rose-600 hover:bg-rose-100"
                  : "bg-white text-textmuted hover:text-rose-600"
              }`}
              title={isWishlisted ? "Remove from Wishlist" : "Save to Wishlist"}
            >
              <Heart
                className={`w-5 h-5 ${isWishlisted ? "fill-current" : ""}`}
              />
            </button>
          </div>

          {/* Badges / Guarantees Under Image */}
          <div className="grid grid-cols-3 gap-3 pt-2 text-center text-xs text-textmuted">
            <div className="p-2.5 rounded-lg bg-bgsoft border border-borderline">
              <Truck className="w-4 h-4 text-primary mx-auto mb-1" />
              <span className="font-medium text-textmain block">
                Free Delivery
              </span>
              <span>Over $1,000</span>
            </div>
            <div className="p-2.5 rounded-lg bg-bgsoft border border-borderline">
              <ShieldCheck className="w-4 h-4 text-primary mx-auto mb-1" />
              <span className="font-medium text-textmain block">
                10-Yr Warranty
              </span>
              <span>Solid Wood</span>
            </div>
            <div className="p-2.5 rounded-lg bg-bgsoft border border-borderline">
              <RotateCcw className="w-4 h-4 text-primary mx-auto mb-1" />
              <span className="font-medium text-textmain block">
                30-Day Trial
              </span>
              <span>Easy Returns</span>
            </div>
          </div>
        </div>

        {/* Right: Customization & Purchase Details */}
        <div className="space-y-6">
          {/* Header Info */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-primary bg-primary-light px-2.5 py-1 rounded-full">
                {product.category?.name || "Handcrafted Furniture"}
              </span>
              <div className="flex items-center gap-1 text-amber-500 font-semibold text-sm">
                <Star className="w-4 h-4 fill-current" />
                <span>{Number(product.rating || 5.0).toFixed(1)}</span>
                <span className="text-textmuted text-xs font-normal">
                  (48 verified customer reviews)
                </span>
              </div>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold text-textmain mt-2 mb-3">
              {product.name}
            </h1>

            {/* Price Row */}
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-bold text-textmain">
                ${unitPrice.toFixed(2)}
              </span>
              <span className="text-xs text-textmuted">
                (Inclusive of all standard custom joinery)
              </span>
            </div>
          </div>

          {/* Product Description */}
          <p className="text-sm text-textmuted leading-relaxed">
            {product.description}
          </p>

          {/* Specifications Table */}
          <div className="bg-bgsoft p-4 rounded-xl border border-borderline space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-borderline">
              <span className="text-textmuted font-medium">
                Primary Material:
              </span>
              <span className="font-semibold text-textmain">
                {product.material}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-borderline">
              <span className="text-textmuted font-medium">
                Standard Colorway:
              </span>
              <span className="font-semibold text-textmain">
                {product.color}
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-textmuted font-medium">
                Stock Availability:
              </span>
              <span
                className={`font-semibold ${inStock ? "text-success" : "text-danger"}`}
              >
                {inStock
                  ? `${product.stock_quantity} units ready to ship`
                  : "Out of stock"}
              </span>
            </div>
          </div>

          {/* Customization Options: Finish Selector */}
          {product.finish_options && product.finish_options.length > 0 && (
            <div className="space-y-2">
              <label className="block text-xs font-bold text-textmain uppercase tracking-wider">
                Select Finish:{" "}
                <span className="font-medium text-primary">
                  {selectedFinish}
                </span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {product.finish_options.map((finish) => {
                  const isSelected = selectedFinish === finish;
                  return (
                    <button
                      key={finish}
                      onClick={() => setSelectedFinish(finish)}
                      className={`px-3 py-2 text-xs rounded-lg border text-left font-medium flex items-center justify-between transition-all ${
                        isSelected
                          ? "border-primary bg-primary-light text-primary ring-1 ring-primary"
                          : "border-borderline bg-white text-textmain hover:bg-bgsoft"
                      }`}
                    >
                      <span className="truncate">{finish}</span>
                      {isSelected && (
                        <Check className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Customization Options: Dimension Selector */}
          {product.dimension_options &&
            product.dimension_options.length > 0 && (
              <div className="space-y-2">
                <label className="block text-xs font-bold text-textmain uppercase tracking-wider">
                  Select Dimensions:{" "}
                  <span className="font-medium text-primary">
                    {selectedDimension}
                  </span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {product.dimension_options.map((dimension) => {
                    const isSelected = selectedDimension === dimension;
                    return (
                      <button
                        key={dimension}
                        onClick={() => setSelectedDimension(dimension)}
                        className={`px-3 py-2 text-xs rounded-lg border text-left font-medium flex items-center justify-between transition-all ${
                          isSelected
                            ? "border-primary bg-primary-light text-primary ring-1 ring-primary"
                            : "border-borderline bg-white text-textmain hover:bg-bgsoft"
                        }`}
                      >
                        <span className="truncate">{dimension}</span>
                        {isSelected && (
                          <Check className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

          {/* Quantity & Dynamic Total */}
          <div className="pt-2 flex items-center justify-between">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-textmain uppercase tracking-wider">
                Quantity
              </label>
              <div className="flex items-center border border-borderline rounded-lg bg-white overflow-hidden">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  disabled={quantity <= 1 || !inStock}
                  className="px-3 py-1.5 text-sm font-bold text-textmuted hover:bg-bgsoft disabled:opacity-40"
                >
                  -
                </button>
                <span className="px-4 py-1.5 text-xs font-bold text-textmain min-w-[36px] text-center">
                  {quantity}
                </span>
                <button
                  onClick={() =>
                    setQuantity((q) => Math.min(product.stock_quantity, q + 1))
                  }
                  disabled={quantity >= product.stock_quantity || !inStock}
                  className="px-3 py-1.5 text-sm font-bold text-textmuted hover:bg-bgsoft disabled:opacity-40"
                >
                  +
                </button>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs text-textmuted block">Subtotal</span>
              <span className="text-xl font-bold text-textmain">
                ${totalPrice.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="space-y-2.5 pt-4">
            <div className="flex gap-3">
              <button
                onClick={handleAddToCart}
                disabled={!inStock || isAdding}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-semibold text-sm shadow-sm transition-all ${
                  inStock
                    ? "bg-primary text-white hover:bg-primary-hover active:scale-[0.98]"
                    : "bg-gray-100 text-gray-400 cursor-not-allowed"
                }`}
              >
                <ShoppingBag className="w-4 h-4" />
                <span>
                  {isAdding
                    ? "Adding..."
                    : addSuccess
                      ? "Added to Cart!"
                      : "Add to Cart"}
                </span>
              </button>

              <button
                onClick={handleBuyNow}
                disabled={!inStock}
                className={`flex-1 py-3 px-6 rounded-xl font-semibold text-sm transition-all ${
                  inStock
                    ? "bg-accent text-white hover:bg-accent-hover shadow-sm active:scale-[0.98]"
                    : "bg-gray-100 text-gray-400 cursor-not-allowed"
                }`}
              >
                Buy Now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

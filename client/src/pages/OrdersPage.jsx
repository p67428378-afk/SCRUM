import React, { useState } from "react";
import POSItemSelector from "../components/orders/POSItemSelector";
import OrderSummary from "../components/orders/OrderSummary";
import OrderLifecycleTable from "../components/orders/OrderLifecycleTable";

export default function OrdersPage() {
  const [cartItems, setCartItems] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleAddToCart = (product) => {
    setCartItems((prev) => {
      const existingIndex = prev.findIndex(
        (item) => item.product.id === product.id,
      );
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += 1;
        return updated;
      } else {
        return [...prev, { product, quantity: 1 }];
      }
    });
  };

  const handleUpdateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      handleRemoveItem(productId);
    } else {
      setCartItems((prev) =>
        prev.map((item) =>
          item.product.id === productId
            ? { ...item, quantity: newQuantity }
            : item,
        ),
      );
    }
  };

  const handleRemoveItem = (productId) => {
    setCartItems((prev) =>
      prev.filter((item) => item.product.id !== productId),
    );
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  const handleOrderCreated = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* POS Point of Sale Terminal Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Product Selection Grid */}
        <div className="lg:col-span-7">
          <POSItemSelector
            onAddToCart={handleAddToCart}
            cartItems={cartItems}
          />
        </div>

        {/* Right Column: Order Checkout Summary */}
        <div className="lg:col-span-5 sticky top-20">
          <OrderSummary
            cartItems={cartItems}
            onUpdateQuantity={handleUpdateQuantity}
            onRemoveItem={handleRemoveItem}
            onClearCart={handleClearCart}
            onOrderCreated={handleOrderCreated}
          />
        </div>
      </div>

      {/* Order Status & Lifecycle Tracking Table */}
      <div className="pt-4">
        <OrderLifecycleTable refreshKey={refreshKey} />
      </div>
    </div>
  );
}

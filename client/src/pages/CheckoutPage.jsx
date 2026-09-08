import React, { useState } from "react";
import PropTypes from "prop-types";
import CartTable from "../components/cart/CartTable";
import CheckoutForm from "../components/checkout/CheckoutForm";

export default function CheckoutPage({
  user,
  cart,
  onUpdateCartQuantity,
  onRemoveCartItem,
  onClearCart,
  onOpenAuth,
  onOrderCompleted,
  updatingItemId = null,
}) {
  const [inCheckoutMode, setInCheckoutMode] = useState(false);

  const handleProceedToCheckout = () => {
    if (!user) {
      onOpenAuth("login");
      return;
    }
    setInCheckoutMode(true);
  };

  const handleOrderSuccess = (order) => {
    if (onOrderCompleted) {
      onOrderCompleted(order);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {!inCheckoutMode ? (
        <div>
          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900">
              Shopping Cart & Review
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Review your selected book titles, adjust quantities, and proceed
              to secure checkout.
            </p>
          </div>

          <CartTable
            items={cart?.items || []}
            subtotal={cart?.subtotal || 0}
            tax={cart?.estimated_tax || 0}
            shipping={cart?.estimated_shipping || 0}
            total={cart?.total_amount || 0}
            onUpdateQuantity={onUpdateCartQuantity}
            onRemoveItem={onRemoveCartItem}
            onClearCart={onClearCart}
            onProceedToCheckout={handleProceedToCheckout}
            updatingItemId={updatingItemId}
          />
        </div>
      ) : (
        <CheckoutForm
          user={user}
          cart={cart}
          onOrderCompleted={handleOrderSuccess}
          onBackToCart={() => setInCheckoutMode(false)}
        />
      )}
    </div>
  );
}

CheckoutPage.propTypes = {
  user: PropTypes.shape({
    id: PropTypes.string,
    email: PropTypes.string,
    full_name: PropTypes.string,
  }),
  cart: PropTypes.shape({
    id: PropTypes.string,
    items: PropTypes.array,
    item_count: PropTypes.number,
    subtotal: PropTypes.number,
    estimated_tax: PropTypes.number,
    estimated_shipping: PropTypes.number,
    total_amount: PropTypes.number,
  }),
  onUpdateCartQuantity: PropTypes.func.isRequired,
  onRemoveCartItem: PropTypes.func.isRequired,
  onClearCart: PropTypes.func.isRequired,
  onOpenAuth: PropTypes.func.isRequired,
  onOrderCompleted: PropTypes.func,
  updatingItemId: PropTypes.string,
};

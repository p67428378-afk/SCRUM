import React, { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import {
  Truck,
  Package,
  Clock,
  Heart,
  MapPin,
  CheckCircle,
  Plus,
  Trash2,
  ArrowRight,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { orderApi } from "../services/api";

export default function Orders() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTabParam = searchParams.get("tab") || "orders";
  const [activeTab, setActiveTab] = useState(activeTabParam);

  const { user, isAuthenticated, addresses, addAddress, deleteAddress } =
    useAuth();
  const { wishlist, toggleWishlist, addToCart } = useCart();

  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // New address form modal state
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [newAddress, setNewAddress] = useState({
    full_name: "",
    address_line1: "",
    address_line2: "",
    city: "",
    state: "",
    postal_code: "",
    phone: "",
  });

  useEffect(() => {
    setActiveTab(searchParams.get("tab") || "orders");
  }, [searchParams]);

  useEffect(() => {
    async function fetchUserOrders() {
      if (!isAuthenticated) {
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      try {
        const res = await orderApi.getOrders();
        setOrders(res.data || []);
      } catch (err) {
        setError(err?.response?.data?.detail || "Failed to load order history");
      } finally {
        setIsLoading(false);
      }
    }
    fetchUserOrders();
  }, [isAuthenticated]);

  const handleTabChange = (tabKey) => {
    setActiveTab(tabKey);
    setSearchParams({ tab: tabKey });
  };

  const handleAddAddressSubmit = async (e) => {
    e.preventDefault();
    if (
      !newAddress.full_name ||
      !newAddress.address_line1 ||
      !newAddress.city ||
      !newAddress.state ||
      !newAddress.postal_code
    ) {
      return;
    }
    await addAddress(newAddress);
    setShowAddressModal(false);
    setNewAddress({
      full_name: "",
      address_line1: "",
      address_line2: "",
      city: "",
      state: "",
      postal_code: "",
      phone: "",
    });
  };

  if (!isAuthenticated && !isLoading) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white border border-borderline rounded-2xl p-10 text-center space-y-6 shadow-sm">
          <div className="w-16 h-16 bg-bgsoft text-primary rounded-full flex items-center justify-center mx-auto">
            <Package className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-textmain">
              Sign In to View Your Account
            </h1>
            <p className="text-xs text-textmuted max-w-md mx-auto">
              Track active furniture shipments, view detailed order receipts,
              and manage your saved wishlist items.
            </p>
          </div>
          <div className="bg-bgsoft p-4 rounded-xl max-w-sm mx-auto text-xs text-textmuted border border-borderline space-y-1">
            <span className="font-semibold text-textmain">
              Quick Demo Credentials:
            </span>
            <p>test@example.com / testpassword</p>
          </div>
          <div className="flex justify-center gap-3">
            <Link
              to="/login"
              className="px-6 py-2.5 bg-primary text-white text-xs font-semibold rounded-xl hover:bg-primary-hover transition-colors shadow-sm"
            >
              Sign In to Account
            </Link>
            <Link
              to="/register"
              className="px-6 py-2.5 bg-bgsoft text-textmain text-xs font-semibold rounded-xl hover:bg-borderline border border-borderline"
            >
              Create New Account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const latestOrder = orders.length > 0 ? orders[0] : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Account Profile Header */}
      <div className="bg-white p-6 rounded-2xl border border-borderline shadow-sm mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-primary-light text-primary flex items-center justify-center font-bold text-lg">
              {user?.full_name?.charAt(0) || "U"}
            </div>
            <div>
              <h1 className="text-xl font-bold text-textmain">
                {user?.full_name || "Customer Profile"}
              </h1>
              <p className="text-xs text-textmuted">
                {user?.email} &bull; Member since{" "}
                {new Date(user?.created_at || Date.now()).getFullYear()}
              </p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 bg-bgsoft p-1 rounded-xl border border-borderline overflow-x-auto">
          <button
            onClick={() => handleTabChange("orders")}
            className={`px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === "orders"
                ? "bg-white text-primary shadow-sm"
                : "text-textmuted hover:text-textmain"
            }`}
          >
            Order History ({orders.length})
          </button>
          <button
            onClick={() => handleTabChange("tracking")}
            className={`px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === "tracking"
                ? "bg-white text-primary shadow-sm"
                : "text-textmuted hover:text-textmain"
            }`}
          >
            Live Shipment Tracking
          </button>
          <button
            onClick={() => handleTabChange("wishlist")}
            className={`px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === "wishlist"
                ? "bg-white text-primary shadow-sm"
                : "text-textmuted hover:text-textmain"
            }`}
          >
            Wishlist ({wishlist.length})
          </button>
          <button
            onClick={() => handleTabChange("addresses")}
            className={`px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === "addresses"
                ? "bg-white text-primary shadow-sm"
                : "text-textmuted hover:text-textmain"
            }`}
          >
            Saved Addresses
          </button>
        </div>
      </div>

      {error && (
        <div
          className="bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-xl text-xs mb-6"
          role="alert"
        >
          {error}
        </div>
      )}

      {/* TAB 1: ORDER HISTORY */}
      {activeTab === "orders" && (
        <div className="space-y-6">
          {orders.length === 0 ? (
            <div className="bg-white rounded-2xl border border-borderline p-12 text-center space-y-4">
              <Package className="w-12 h-12 text-textmuted mx-auto" />
              <h3 className="text-base font-bold text-textmain">
                No Orders Placed Yet
              </h3>
              <p className="text-xs text-textmuted">
                Your future furniture purchases will appear here with full
                invoice breakdowns.
              </p>
              <Link
                to="/catalog"
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white text-xs font-semibold rounded-lg"
              >
                Browse Furniture
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="bg-white rounded-xl border border-borderline shadow-sm overflow-hidden"
                >
                  {/* Order Card Header */}
                  <div className="p-4 bg-bgsoft border-b border-borderline flex flex-wrap items-center justify-between gap-4 text-xs">
                    <div className="flex items-center gap-4">
                      <div>
                        <span className="text-textmuted block">
                          Order Placed
                        </span>
                        <span className="font-semibold text-textmain">
                          {new Date(order.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <div>
                        <span className="text-textmuted block">Total Paid</span>
                        <span className="font-semibold text-textmain">
                          ${Number(order.total_amount).toFixed(2)}
                        </span>
                      </div>
                      <div>
                        <span className="text-textmuted block">
                          Tracking ID
                        </span>
                        <span className="font-mono font-semibold text-accent">
                          {order.tracking_id}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-800 text-[11px] font-semibold px-2.5 py-1 rounded-full border border-amber-200">
                        <Clock className="w-3 h-3" />
                        {order.status}
                      </span>
                    </div>
                  </div>

                  {/* Order Items List */}
                  <div className="p-4 sm:p-6 divide-y divide-borderline">
                    {order.items?.map((item) => (
                      <div
                        key={item.id}
                        className="py-3 first:pt-0 last:pb-0 flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded bg-bgsoft flex items-center justify-center font-bold text-primary border border-borderline">
                            🪑
                          </div>
                          <div>
                            <div className="font-semibold text-textmain">
                              {item.product_name}
                            </div>
                            <div className="text-textmuted text-[11px]">
                              {item.selected_finish || "Standard"} &bull;{" "}
                              {item.selected_dimension || "Standard"} &bull;
                              Qty: {item.quantity}
                            </div>
                          </div>
                        </div>
                        <span className="font-bold text-textmain">
                          ${Number(item.total_price).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Order Footer */}
                  <div className="px-6 py-3 bg-white border-t border-borderline flex flex-wrap items-center justify-between gap-2 text-xs text-textmuted">
                    <span>Paid with {order.payment_method}</span>
                    <span>
                      Delivering to: {order.shipping_address?.city},{" "}
                      {order.shipping_address?.state}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: LIVE SHIPMENT TRACKING BANNER */}
      {activeTab === "tracking" && (
        <div className="space-y-6">
          {latestOrder ? (
            <div className="bg-white rounded-2xl border border-borderline p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-borderline">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-primary bg-primary-light px-2.5 py-1 rounded-full">
                    Active White-Glove Freight
                  </span>
                  <h2 className="text-xl font-bold text-textmain mt-2">
                    Shipment Tracking:{" "}
                    <span className="font-mono text-accent">
                      {latestOrder.tracking_id}
                    </span>
                  </h2>
                  <p className="text-xs text-textmuted mt-1">
                    Carrier: Premier Home Freight Logistics
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-textmuted block">
                    Estimated In-Room Delivery
                  </span>
                  <span className="text-base font-bold text-primary">
                    In 4-6 Business Days
                  </span>
                </div>
              </div>

              {/* Progress Stepper */}
              <div className="py-6">
                <div className="relative">
                  <div className="absolute top-1/2 left-0 right-0 h-1 bg-borderline -translate-y-1/2"></div>
                  <div className="absolute top-1/2 left-0 w-2/3 h-1 bg-primary -translate-y-1/2"></div>

                  <div className="relative flex justify-between">
                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold shadow">
                        ✓
                      </div>
                      <span className="text-xs font-bold text-textmain mt-2">
                        Order Confirmed
                      </span>
                      <span className="text-[10px] text-textmuted">
                        Specs Verified
                      </span>
                    </div>

                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold shadow">
                        ✓
                      </div>
                      <span className="text-xs font-bold text-textmain mt-2">
                        Crafted & Packed
                      </span>
                      <span className="text-[10px] text-textmuted">
                        Quality Checked
                      </span>
                    </div>

                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 rounded-full bg-accent text-white flex items-center justify-center text-xs font-bold shadow animate-pulse">
                        <Truck className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-bold text-accent mt-2">
                        In Transit
                      </span>
                      <span className="text-[10px] text-textmuted">
                        Regional Hub
                      </span>
                    </div>

                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center text-xs font-bold">
                        4
                      </div>
                      <span className="text-xs font-medium text-textmuted mt-2">
                        Out for Delivery
                      </span>
                      <span className="text-[10px] text-textmuted">
                        Appointment Set
                      </span>
                    </div>

                    <div className="flex flex-col items-center">
                      <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-500 flex items-center justify-center text-xs font-bold">
                        5
                      </div>
                      <span className="text-xs font-medium text-textmuted mt-2">
                        Delivered & Assembled
                      </span>
                      <span className="text-[10px] text-textmuted">
                        White-Glove
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Destination Address */}
              <div className="p-4 bg-bgsoft rounded-xl border border-borderline flex items-center gap-3 text-xs">
                <MapPin className="w-5 h-5 text-primary flex-shrink-0" />
                <div>
                  <span className="font-bold text-textmain block">
                    Destination Delivery Address
                  </span>
                  <span className="text-textmuted">
                    {latestOrder.shipping_address?.full_name} &bull;{" "}
                    {latestOrder.shipping_address?.address_line1},{" "}
                    {latestOrder.shipping_address?.city},{" "}
                    {latestOrder.shipping_address?.state}{" "}
                    {latestOrder.shipping_address?.postal_code}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-borderline p-12 text-center space-y-4">
              <Truck className="w-12 h-12 text-textmuted mx-auto" />
              <h3 className="text-base font-bold text-textmain">
                No Active Shipments
              </h3>
              <p className="text-xs text-textmuted">
                When you place an order, live tracking details will appear here.
              </p>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: SAVED WISHLIST */}
      {activeTab === "wishlist" && (
        <div className="space-y-6">
          {wishlist.length === 0 ? (
            <div className="bg-white rounded-2xl border border-borderline p-12 text-center space-y-4">
              <Heart className="w-12 h-12 text-textmuted mx-auto" />
              <h3 className="text-base font-bold text-textmain">
                Your Wishlist is Empty
              </h3>
              <p className="text-xs text-textmuted">
                Save your favorite chairs, tables, and sofas to purchase later.
              </p>
              <Link
                to="/catalog"
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white text-xs font-semibold rounded-lg"
              >
                Explore Catalog
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {wishlist.map((item) => {
                const prod = item.product || {};
                return (
                  <div
                    key={item.id}
                    className="bg-white border border-borderline rounded-xl overflow-hidden p-4 flex flex-col justify-between shadow-sm"
                  >
                    <div className="aspect-square rounded-lg overflow-hidden bg-bgsoft mb-3 relative">
                      <img
                        src={
                          prod.image_url ||
                          "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80"
                        }
                        alt={prod.name}
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={() => toggleWishlist(item.product_id)}
                        className="absolute top-2 right-2 p-1.5 bg-white/90 text-danger rounded-full shadow"
                        title="Remove from Wishlist"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="space-y-1 mb-3">
                      <Link
                        to={`/product/${item.product_id}`}
                        className="font-semibold text-xs text-textmain hover:text-primary line-clamp-1"
                      >
                        {prod.name}
                      </Link>
                      <p className="text-[11px] text-textmuted">
                        {prod.material} &bull; {prod.color}
                      </p>
                      <p className="text-sm font-bold text-textmain">
                        ${Number(prod.price || 0).toFixed(2)}
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        addToCart({
                          product_id: item.product_id,
                          quantity: 1,
                          selected_finish:
                            prod.finish_options?.[0] || "Standard",
                          selected_dimension:
                            prod.dimension_options?.[0] || "Standard",
                        });
                      }}
                      className="w-full py-2 bg-primary text-white text-xs font-semibold rounded-lg hover:bg-primary-hover transition-colors"
                    >
                      Move to Cart
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: SAVED ADDRESSES */}
      {activeTab === "addresses" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-sm font-bold text-textmain">
              Delivery Addresses
            </h2>
            <button
              onClick={() => setShowAddressModal(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white text-xs font-semibold rounded-lg hover:bg-primary-hover shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add New Address</span>
            </button>
          </div>

          {addresses.length === 0 ? (
            <div className="bg-white rounded-2xl border border-borderline p-10 text-center space-y-3">
              <MapPin className="w-10 h-10 text-textmuted mx-auto" />
              <p className="text-xs text-textmuted">
                No saved addresses on file.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {addresses.map((addr) => (
                <div
                  key={addr.id}
                  className="bg-white p-5 rounded-xl border border-borderline shadow-sm relative flex flex-col justify-between"
                >
                  <div className="space-y-1 text-xs">
                    <div className="font-bold text-textmain text-sm">
                      {addr.full_name}
                    </div>
                    <div className="text-textmuted">
                      {addr.address_line1} {addr.address_line2}
                    </div>
                    <div className="text-textmuted">
                      {addr.city}, {addr.state} {addr.postal_code}
                    </div>
                    <div className="text-textmuted">
                      Phone: {addr.phone || "N/A"}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-borderline mt-4 flex justify-end">
                    <button
                      onClick={() => deleteAddress(addr.id)}
                      className="text-xs text-danger hover:underline flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Add Address Modal */}
      {showAddressModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-xl">
            <h3 className="text-base font-bold text-textmain">
              Add New Delivery Address
            </h3>
            <form
              onSubmit={handleAddAddressSubmit}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="block font-semibold mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={newAddress.full_name}
                  onChange={(e) =>
                    setNewAddress({ ...newAddress, full_name: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-borderline rounded-lg outline-none"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">
                  Street Address *
                </label>
                <input
                  type="text"
                  required
                  value={newAddress.address_line1}
                  onChange={(e) =>
                    setNewAddress({
                      ...newAddress,
                      address_line1: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-borderline rounded-lg outline-none"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">
                  Apt, Suite, Unit
                </label>
                <input
                  type="text"
                  value={newAddress.address_line2}
                  onChange={(e) =>
                    setNewAddress({
                      ...newAddress,
                      address_line2: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-borderline rounded-lg outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold mb-1">City *</label>
                  <input
                    type="text"
                    required
                    value={newAddress.city}
                    onChange={(e) =>
                      setNewAddress({ ...newAddress, city: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-borderline rounded-lg outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">State *</label>
                  <input
                    type="text"
                    required
                    value={newAddress.state}
                    onChange={(e) =>
                      setNewAddress({ ...newAddress, state: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-borderline rounded-lg outline-none"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold mb-1">
                    Postal Code *
                  </label>
                  <input
                    type="text"
                    required
                    value={newAddress.postal_code}
                    onChange={(e) =>
                      setNewAddress({
                        ...newAddress,
                        postal_code: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-borderline rounded-lg outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Phone</label>
                  <input
                    type="text"
                    value={newAddress.phone}
                    onChange={(e) =>
                      setNewAddress({ ...newAddress, phone: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-borderline rounded-lg outline-none"
                  />
                </div>
              </div>

              <div className="pt-3 flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setShowAddressModal(false)}
                  className="px-4 py-2 border border-borderline rounded-lg text-textmuted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-primary text-white font-semibold rounded-lg"
                >
                  Save Address
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

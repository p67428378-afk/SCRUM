import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Package,
  MapPin,
  RefreshCw,
  ShoppingBag,
  Plus,
  Trash2,
  ArrowRight,
} from "lucide-react";
import ProfileHeader from "../components/profile/ProfileHeader";
import {
  getCurrentUser,
  updateCurrentUser,
  getAddresses,
  addAddress,
  deleteAddress,
  getMyOrders,
} from "../services/api";

export default function ProfilePage({ currentUser, onUserChange, onReorder }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(currentUser || null);
  const [addresses, setAddresses] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newStreet, setNewStreet] = useState("");
  const [newCity, setNewCity] = useState("Bandra West, Mumbai");
  const [newPostal, setNewPostal] = useState("400050");
  const [showAddAddr, setShowAddModal] = useState(false);

  // Fallbacks
  const fallbackOrders = [
    {
      id: "ord-101",
      order_number: "#BD-1042",
      status: "Delivered",
      total_amount: 53.49,
      delivery_address_text:
        "102 Sea View Apartments, Hill Road, Bandra West, Mumbai - 400050",
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
      items: [
        {
          id: "1",
          menu_item_name: "Hyderabadi Dum Biryani",
          quantity: 2,
          unit_price: 12.5,
          price: 12.5,
        },
        {
          id: "2",
          menu_item_name: "Butter Chicken",
          quantity: 1,
          unit_price: 14.99,
          price: 14.99,
        },
        {
          id: "3",
          menu_item_name: "Garlic Butter Naan",
          quantity: 2,
          unit_price: 3.5,
          price: 3.5,
        },
      ],
    },
  ];

  const fallbackAddresses = [
    {
      id: "addr-1",
      street_address: "102 Sea View Apartments, Hill Road",
      city: "Bandra West, Mumbai",
      postal_code: "400050",
      is_default: true,
    },
  ];

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    setLoading(true);
    try {
      const [uRes, addrRes, ordRes] = await Promise.all([
        getCurrentUser().catch(() => currentUser),
        getAddresses().catch(() => null),
        getMyOrders().catch(() => null),
      ]);

      if (uRes) {
        setUser(uRes);
        if (onUserChange) onUserChange(uRes);
      }
      setAddresses(addrRes && addrRes.length > 0 ? addrRes : fallbackAddresses);
      setOrders(ordRes && ordRes.length > 0 ? ordRes : fallbackOrders);
    } catch (err) {
      console.warn("API error loading profile:", err);
      setAddresses(fallbackAddresses);
      setOrders(fallbackOrders);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (updatedData) => {
    try {
      const res = await updateCurrentUser(updatedData);
      setUser(res);
      if (onUserChange) onUserChange(res);
    } catch (err) {
      console.warn("Profile update error, updating local state:", err);
      setUser((prev) => ({ ...prev, ...updatedData }));
    }
  };

  const handleAddAddress = async (e) => {
    e.preventDefault();
    if (!newStreet) return;
    try {
      const created = await addAddress({
        street_address: newStreet,
        city: newCity,
        postal_code: newPostal,
        is_default: addresses.length === 0,
      });
      setAddresses((prev) => [...prev, created]);
    } catch (err) {
      const mockCreated = {
        id: `addr-${Date.now()}`,
        street_address: newStreet,
        city: newCity,
        postal_code: newPostal,
        is_default: addresses.length === 0,
      };
      setAddresses((prev) => [...prev, mockCreated]);
    }
    setShowAddModal(false);
    setNewStreet("");
  };

  const handleDeleteAddress = async (id) => {
    try {
      await deleteAddress(id);
      setAddresses((prev) => prev.filter((a) => a.id !== id));
    } catch (err) {
      setAddresses((prev) => prev.filter((a) => a.id !== id));
    }
  };

  const handle1ClickReorder = (pastOrder) => {
    if (onReorder && pastOrder.items) {
      const itemsToReorder = pastOrder.items.map((i) => ({
        id: i.menu_item_id || i.id,
        name: i.menu_item_name || "Food Item",
        price: i.unit_price || i.price || 12.0,
        quantity: i.quantity || 1,
      }));
      onReorder(itemsToReorder);
      navigate("/");
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* Profile Header */}
      <ProfileHeader user={user} onUpdateProfile={handleUpdateProfile} />

      {/* Saved Addresses Section */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
              <MapPin className="w-4 h-4" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">
              Saved Delivery Addresses
            </h3>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-3 py-1.5 bg-amber-50 text-amber-800 border border-amber-200 rounded-xl text-xs font-semibold hover:bg-amber-100 transition flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5 text-amber-600" /> Add Address
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {addresses.map((addr) => (
            <div
              key={addr.id}
              className="p-4 rounded-xl border border-gray-200 bg-gray-50/50 flex items-start justify-between gap-3"
            >
              <div>
                <p className="text-xs font-bold text-gray-900">
                  {addr.street_address}
                </p>
                <p className="text-xs text-gray-600">
                  {addr.city} - {addr.postal_code}
                </p>
                {addr.is_default && (
                  <span className="inline-block mt-1 text-[10px] font-bold text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded">
                    Default
                  </span>
                )}
              </div>
              <button
                onClick={() => handleDeleteAddress(addr.id)}
                className="text-gray-400 hover:text-red-600 transition"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Add Address Modal */}
      {showAddAddr && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-gray-900">
              Add Delivery Address
            </h3>
            <form onSubmit={handleAddAddress} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Street Address
                </label>
                <input
                  type="text"
                  required
                  value={newStreet}
                  onChange={(e) => setNewStreet(e.target.value)}
                  placeholder="Building, Street, Landmark"
                  className="w-full text-xs p-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    required
                    value={newCity}
                    onChange={(e) => setNewCity(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Postal Code
                  </label>
                  <input
                    type="text"
                    required
                    value={newPostal}
                    onChange={(e) => setNewPostal(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3 py-1.5 text-xs font-semibold text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold text-white bg-amber-600 rounded-lg hover:bg-amber-700"
                >
                  Save Address
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Order History Table */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="p-5 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-amber-600" />
            <h3 className="text-lg font-bold text-gray-900">Order History</h3>
          </div>
          <span className="text-xs font-bold text-gray-500">
            {orders.length} {orders.length === 1 ? "Past Order" : "Past Orders"}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-100/80 border-b border-gray-200 text-xs font-bold uppercase tracking-wider text-gray-600">
                <th className="py-3.5 px-4">Order #</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4">Items Summary</th>
                <th className="py-3.5 px-4">Total</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs">
              {orders.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="text-center py-12 text-gray-500 font-medium"
                  >
                    No past orders found. Place your first gourmet meal order
                    today!
                  </td>
                </tr>
              ) : (
                orders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-amber-50/30 transition">
                    <td className="py-4 px-4 font-bold text-gray-900 whitespace-nowrap">
                      <Link
                        to={`/orders/${ord.id}`}
                        className="text-amber-800 hover:underline"
                      >
                        {ord.order_number || `#${ord.id.substring(0, 8)}`}
                      </Link>
                    </td>

                    <td className="py-4 px-4 text-gray-600 whitespace-nowrap">
                      {ord.created_at
                        ? new Date(ord.created_at).toLocaleDateString()
                        : "Recent"}
                    </td>

                    <td className="py-4 px-4 max-w-xs truncate text-gray-700 font-medium">
                      {ord.items
                        ? ord.items
                            .map(
                              (i) =>
                                `${i.quantity}x ${i.menu_item_name || "Item"}`,
                            )
                            .join(", ")
                        : "Order Items"}
                    </td>

                    <td className="py-4 px-4 font-bold text-amber-900 whitespace-nowrap">
                      $
                      {typeof ord.total_amount === "number"
                        ? ord.total_amount.toFixed(2)
                        : ord.total_amount}
                    </td>

                    <td className="py-4 px-4 whitespace-nowrap">
                      <span className="px-2.5 py-1 text-[11px] font-bold bg-emerald-100 text-emerald-800 rounded-full border border-emerald-200">
                        {ord.status}
                      </span>
                    </td>

                    <td className="py-4 px-4 text-right whitespace-nowrap space-x-2">
                      <Link
                        to={`/orders/${ord.id}`}
                        className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 hover:text-amber-800 bg-amber-50 px-2.5 py-1.5 rounded-lg border border-amber-200"
                      >
                        Track
                      </Link>
                      <button
                        onClick={() => handle1ClickReorder(ord)}
                        className="inline-flex items-center gap-1 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 px-3 py-1.5 rounded-lg shadow-sm"
                      >
                        <RefreshCw className="w-3 h-3" /> Re-Order
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

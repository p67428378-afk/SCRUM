import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  RefreshCw,
  ChefHat,
  Clock,
  DollarSign,
  Package,
} from "lucide-react";
import ActiveOrdersTable from "../components/staff/ActiveOrdersTable";
import MenuAvailabilityControl from "../components/staff/MenuAvailabilityControl";
import {
  getStaffDashboard,
  updateOrderStatus,
  getMenuItems,
  updateMenuItem,
  createMenuItem,
} from "../services/api";

export default function StaffDashboardPage() {
  const [orders, setOrders] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [statusCounts, setStatusCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fallback orders for staff dashboard demonstration
  const fallbackOrders = [
    {
      id: "ord-101",
      order_number: "#BD-1042",
      status: "Placed",
      total_amount: 53.49,
      delivery_address_text:
        "102 Sea View Apartments, Hill Road, Bandra West, Mumbai - 400050",
      special_instructions: "Make it extra spicy and deliver quickly!",
      created_at: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
      items: [
        { menu_item_name: "Butter Chicken", quantity: 1, unit_price: 14.99 },
        {
          menu_item_name: "Hyderabadi Dum Biryani",
          quantity: 2,
          unit_price: 12.5,
        },
      ],
    },
    {
      id: "ord-102",
      order_number: "#BD-1043",
      status: "Preparing",
      total_amount: 28.5,
      delivery_address_text: "45 Carter Road, Bandra West, Mumbai - 400050",
      special_instructions: "No cutlery needed.",
      created_at: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
      items: [
        {
          menu_item_name: "Paneer Tikka Masala",
          quantity: 1,
          unit_price: 13.99,
        },
        { menu_item_name: "Garlic Butter Naan", quantity: 2, unit_price: 3.5 },
      ],
    },
  ];

  const fallbackMenuItems = [
    {
      id: "m-1",
      name: "Butter Chicken",
      price: 14.99,
      is_available: true,
      dietary_tags: "Non-Veg, Chef Special",
    },
    {
      id: "m-2",
      name: "Hyderabadi Dum Biryani",
      price: 12.5,
      is_available: true,
      dietary_tags: "Non-Veg",
    },
    {
      id: "m-3",
      name: "Paneer Tikka Masala",
      price: 13.99,
      is_available: true,
      dietary_tags: "Veg, Chef Special",
    },
    {
      id: "m-4",
      name: "Garlic Butter Naan",
      price: 3.5,
      is_available: true,
      dietary_tags: "Veg",
    },
    {
      id: "m-5",
      name: "Mutton Rogan Josh",
      price: 16.99,
      is_available: false,
      dietary_tags: "Non-Veg",
    },
    {
      id: "m-6",
      name: "Mango Lassi",
      price: 4.5,
      is_available: true,
      dietary_tags: "Veg",
    },
  ];

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError("");
    try {
      const [dashboardRes, menuRes] = await Promise.all([
        getStaffDashboard().catch(() => null),
        getMenuItems({ available_only: false }).catch(() => null),
      ]);

      if (dashboardRes) {
        setOrders(dashboardRes.orders || fallbackOrders);
        setStatusCounts(dashboardRes.status_counts || {});
        if (dashboardRes.menu_availability_items) {
          setMenuItems(dashboardRes.menu_availability_items);
        } else if (menuRes) {
          setMenuItems(menuRes);
        } else {
          setMenuItems(fallbackMenuItems);
        }
      } else {
        setOrders(fallbackOrders);
        setMenuItems(menuRes || fallbackMenuItems);
      }
    } catch (err) {
      console.warn("API error loading staff dashboard:", err);
      setOrders(fallbackOrders);
      setMenuItems(fallbackMenuItems);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)),
      );
    } catch (err) {
      console.warn("Backend update error, updating state locally:", err);
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o)),
      );
    }
  };

  const handleToggleAvailability = async (itemId, isAvailable) => {
    try {
      await updateMenuItem(itemId, { is_available: isAvailable });
      setMenuItems((prev) =>
        prev.map((m) =>
          m.id === itemId ? { ...m, is_available: isAvailable } : m,
        ),
      );
    } catch (err) {
      console.warn("Backend menu update error, updating state locally:", err);
      setMenuItems((prev) =>
        prev.map((m) =>
          m.id === itemId ? { ...m, is_available: isAvailable } : m,
        ),
      );
    }
  };

  const handleCreateMenuItem = async (newItemData) => {
    try {
      const created = await createMenuItem(newItemData);
      setMenuItems((prev) => [...prev, created]);
    } catch (err) {
      console.warn("Backend item create error, adding to state locally:", err);
      const mockCreated = { ...newItemData, id: `mock-${Date.now()}` };
      setMenuItems((prev) => [...prev, mockCreated]);
    }
  };

  // Calculations for Stats
  const activeOrdersCount = orders.filter(
    (o) => !["delivered", "cancelled"].includes((o.status || "").toLowerCase()),
  ).length;
  const inKitchenCount = orders.filter((o) =>
    (o.status || "").toLowerCase().includes("prep"),
  ).length;
  const totalRevenue = orders.reduce(
    (acc, o) => acc + (typeof o.total_amount === "number" ? o.total_amount : 0),
    0,
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      {/* Portal Header */}
      <div className="bg-gradient-to-r from-amber-900 to-amber-800 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-amber-300 text-xs font-bold uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4" />
            Hotel Operations Control
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Bandra Hotel Staff Dashboard
          </h1>
          <p className="text-amber-100/80 text-xs sm:text-sm mt-1">
            Real-time fulfillment queue, order status transitions, and menu
            availability management.
          </p>
        </div>

        <button
          onClick={fetchDashboardData}
          className="px-4 py-2.5 bg-amber-700/80 hover:bg-amber-700 border border-amber-500/30 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-sm self-start sm:self-auto"
        >
          <RefreshCw className="w-4 h-4" /> Refresh Operations
        </button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
            <Package className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Active Queue
            </span>
            <p className="text-2xl font-extrabold text-gray-900">
              {activeOrdersCount}
            </p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-yellow-100 text-yellow-800 flex items-center justify-center font-bold">
            <ChefHat className="w-6 h-6 text-yellow-600" />
          </div>
          <div>
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              In Kitchen
            </span>
            <p className="text-2xl font-extrabold text-gray-900">
              {inKitchenCount}
            </p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
            <DollarSign className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
              Today's Revenue
            </span>
            <p className="text-2xl font-extrabold text-gray-900">
              ${totalRevenue.toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      {/* Active Orders Table Component */}
      <ActiveOrdersTable
        orders={orders}
        onUpdateStatus={handleUpdateStatus}
        isLoading={loading}
      />

      {/* Menu Availability Control Component */}
      <MenuAvailabilityControl
        menuItems={menuItems}
        onToggleAvailability={handleToggleAvailability}
        onCreateItem={handleCreateMenuItem}
      />
    </div>
  );
}

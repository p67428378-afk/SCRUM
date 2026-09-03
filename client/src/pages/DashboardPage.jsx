import React, { useState, useEffect } from "react";
import KPICards from "../components/dashboard/KPICards";
import LiveOrderQueue from "../components/orders/LiveOrderQueue";
import TableFloorPlan from "../components/tables/TableFloorPlan";
import NewOrderDrawer from "../components/orders/NewOrderDrawer";
import ReservationForm from "../components/tables/ReservationForm";
import {
  getDashboardSummary,
  getOrders,
  getMenuItems,
  getTables,
  updateOrderStatus,
  createOrder,
  createReservation,
} from "../services/api";
import { TrendingUp, ShoppingBag, Coffee } from "lucide-react";

export default function DashboardPage() {
  const [summary, setSummary] = useState(null);
  const [orders, setOrders] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [tables, setTables] = useState([]);

  const [isOrderDrawerOpen, setIsOrderDrawerOpen] = useState(false);
  const [isReservationOpen, setIsReservationOpen] = useState(false);

  const fetchData = async () => {
    try {
      const [sumData, ordData, menuData, tblData] = await Promise.all([
        getDashboardSummary(),
        getOrders(),
        getMenuItems(),
        getTables(),
      ]);
      setSummary(sumData);
      setOrders(ordData);
      setMenuItems(menuData);
      setTables(tblData);
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpdateStatus = async (orderId, newStatus) => {
    await updateOrderStatus(orderId, newStatus);
    fetchData();
  };

  const handleCreateOrder = async (orderPayload) => {
    await createOrder(orderPayload);
    fetchData();
  };

  const handleBookReservation = async (reservationPayload) => {
    await createReservation(reservationPayload);
    fetchData();
  };

  return (
    <div className="space-y-8">
      {/* KPI Cards Header */}
      <KPICards
        summary={summary}
        onNewOrderClick={() => setIsOrderDrawerOpen(true)}
        onReserveTableClick={() => setIsReservationOpen(true)}
      />

      {/* Top Menu Items & Quick Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <LiveOrderQueue
            orders={orders}
            onUpdateStatus={handleUpdateStatus}
            onNewOrderClick={() => setIsOrderDrawerOpen(true)}
          />
        </div>

        {/* Side Panel: Popular Items & Quick Floor Plan Status */}
        <div className="space-y-6">
          {/* Top Selling Items Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Coffee className="w-4 h-4 text-amber-600" />
                Popular Menu Items
              </h3>
              <span className="text-[10px] font-bold text-slate-400 uppercase">
                Today
              </span>
            </div>

            <div className="space-y-3">
              {(summary?.top_items || []).map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="font-bold text-slate-900">{item.name}</div>
                    <div className="text-[10px] text-slate-400">
                      {item.sales_count} orders today
                    </div>
                  </div>
                  <div className="font-extrabold text-amber-600">
                    ${item.revenue.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Table Floor Plan Mini Preview */}
          <TableFloorPlan
            tables={tables}
            onReserveTableClick={() => setIsReservationOpen(true)}
          />
        </div>
      </div>

      {/* Drawers and Modals */}
      <NewOrderDrawer
        isOpen={isOrderDrawerOpen}
        onClose={() => setIsOrderDrawerOpen(false)}
        menuItems={menuItems}
        tables={tables}
        onSubmitOrder={handleCreateOrder}
      />

      <ReservationForm
        isOpen={isReservationOpen}
        onClose={() => setIsReservationOpen(false)}
        tables={tables}
        onBookReservation={handleBookReservation}
      />
    </div>
  );
}

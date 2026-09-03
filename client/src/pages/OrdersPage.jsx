import React, { useState, useEffect } from "react";
import LiveOrderQueue from "../components/orders/LiveOrderQueue";
import NewOrderDrawer from "../components/orders/NewOrderDrawer";
import {
  getOrders,
  getMenuItems,
  getTables,
  updateOrderStatus,
  createOrder,
} from "../services/api";

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [tables, setTables] = useState([]);
  const [isOrderDrawerOpen, setIsOrderDrawerOpen] = useState(false);

  const fetchData = async () => {
    try {
      const [ordData, menuData, tblData] = await Promise.all([
        getOrders(),
        getMenuItems(),
        getTables(),
      ]);
      setOrders(ordData);
      setMenuItems(menuData);
      setTables(tblData);
    } catch (err) {
      console.error("Failed to load orders page data:", err);
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

  return (
    <div className="space-y-6">
      <LiveOrderQueue
        orders={orders}
        onUpdateStatus={handleUpdateStatus}
        onNewOrderClick={() => setIsOrderDrawerOpen(true)}
      />

      <NewOrderDrawer
        isOpen={isOrderDrawerOpen}
        onClose={() => setIsOrderDrawerOpen(false)}
        menuItems={menuItems}
        tables={tables}
        onSubmitOrder={handleCreateOrder}
      />
    </div>
  );
}

import React, { useState } from "react";
import { Routes, Route } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import DashboardPage from "../../pages/DashboardPage";
import ItemCatalogPage from "../../pages/ItemCatalogPage";
import StockAdjustmentsPage from "../../pages/StockAdjustmentsPage";
import LowStockAlertsPage from "../../pages/LowStockAlertsPage";

const AppLayout = () => {
  const [selectedWarehouse, setSelectedWarehouse] = useState("ALL");
  const [activeAlertsCount, setActiveAlertsCount] = useState(0);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-900 text-slate-100">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header
          selectedWarehouse={selectedWarehouse}
          onWarehouseChange={setSelectedWarehouse}
          activeAlertsCount={activeAlertsCount}
        />
        <main className="flex-1 overflow-y-auto p-6 bg-slate-900">
          <Routes>
            <Route
              path="/"
              element={
                <DashboardPage
                  selectedWarehouse={selectedWarehouse}
                  setAlertsCount={setActiveAlertsCount}
                />
              }
            />
            <Route path="/catalog" element={<ItemCatalogPage />} />
            <Route path="/adjustments" element={<StockAdjustmentsPage />} />
            <Route
              path="/alerts"
              element={
                <LowStockAlertsPage setAlertsCount={setActiveAlertsCount} />
              }
            />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default AppLayout;

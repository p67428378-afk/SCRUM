import React, { useState, useEffect } from "react";
import TeaSelectionGrid from "../components/pos/TeaSelectionGrid";
import DrinkCustomizer from "../components/pos/DrinkCustomizer";
import OrderCartTicket from "../components/pos/OrderCartTicket";
import { getTeas, createOrder } from "../services/api";

export default function PosPage() {
  const [teas, setTeas] = useState([]);
  const [selectedTea, setSelectedTea] = useState(null);
  const [cartItems, setCartItems] = useState([]);

  const mockDefaultTeas = [
    {
      id: "1",
      name: "Jasmine Milk Tea",
      category: "Milk Tea",
      current_stock_grams: 1200,
      unit_price: 6.0,
    },
    {
      id: "2",
      name: "Dragonwell Green",
      category: "Green Tea",
      current_stock_grams: 350,
      unit_price: 5.5,
    },
    {
      id: "3",
      name: "Earl Grey Lavender",
      category: "Black Tea",
      current_stock_grams: 2400,
      unit_price: 5.0,
    },
    {
      id: "4",
      name: "Ti Kuan Yin Oolong",
      category: "Oolong",
      current_stock_grams: 420,
      unit_price: 6.5,
    },
    {
      id: "5",
      name: "Matcha Latte",
      category: "Green Tea",
      current_stock_grams: 800,
      unit_price: 6.75,
    },
    {
      id: "6",
      name: "Taro Pearl Milk Tea",
      category: "Milk Tea",
      current_stock_grams: 1500,
      unit_price: 6.25,
    },
  ];

  useEffect(() => {
    const fetchTeasData = async () => {
      try {
        const data = await getTeas();
        if (Array.isArray(data) && data.length > 0) {
          setTeas(data);
          setSelectedTea(data[0]);
        } else {
          setTeas(mockDefaultTeas);
          setSelectedTea(mockDefaultTeas[0]);
        }
      } catch {
        setTeas(mockDefaultTeas);
        setSelectedTea(mockDefaultTeas[0]);
      }
    };
    fetchTeasData();
  }, []);

  const handleAddToCart = (customizedItem) => {
    setCartItems((prev) => [...prev, customizedItem]);
  };

  const handleRemoveCartItem = (indexToRemove) => {
    setCartItems((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  const handleCheckout = async (orderPayload) => {
    try {
      return await createOrder(orderPayload);
    } catch {
      // Mock order fallback if backend offline
      return {
        id: String(Date.now()),
        order_number: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
        status: "COMPLETED",
      };
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* POS Top Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-xl font-extrabold text-gray-900 tracking-tight">
            ZenTea POS Entry Portal
          </h1>
          <p className="text-xs text-gray-500">
            Log custom customer orders, calculate add-on prices, and trigger
            automatic inventory deductions.
          </p>
        </div>
        <div className="flex items-center space-x-3 text-xs font-semibold">
          <span className="px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full">
            Terminal #POS-01
          </span>
          <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full">
            Staff: Alex M.
          </span>
        </div>
      </div>

      {/* POS Workspace Layout: 3 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-[600px]">
        {/* Column 1: Tea Selection Grid */}
        <div className="lg:col-span-1 h-full">
          <TeaSelectionGrid
            teas={teas}
            selectedTea={selectedTea}
            onSelectTea={(tea) => setSelectedTea(tea)}
          />
        </div>

        {/* Column 2: Drink Customizer */}
        <div className="lg:col-span-1 h-full">
          <DrinkCustomizer
            selectedTea={selectedTea}
            onAddToCart={handleAddToCart}
          />
        </div>

        {/* Column 3: Order Ticket Cart */}
        <div className="lg:col-span-1 h-full">
          <OrderCartTicket
            cartItems={cartItems}
            onRemoveItem={handleRemoveCartItem}
            onClearCart={handleClearCart}
            onCheckout={handleCheckout}
          />
        </div>
      </div>
    </div>
  );
}

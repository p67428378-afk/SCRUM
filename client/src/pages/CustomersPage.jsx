import React, { useState, useEffect } from "react";
import CustomerCard from "../components/CustomerCard";
import LoyaltyRedemption from "../components/LoyaltyRedemption";
import { getCustomers, getCustomerHistory } from "../services/api";

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [selectedCustomerId, setSelectedCustomer] = useState("");
  const [history, setHistory] = useState([]);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const data = await getCustomers().catch(() => [
        {
          id: "cst-1",
          full_name: "Jane Doe",
          email: "test@example.com",
          phone: "555-0199",
          loyalty_points: 150,
          notes: "Color Formula: Wella Illumina 7/81 + 20vol. Sensitive scalp.",
          preferred_staff_name: "Sarah Jenkins (Styling)",
        },
        {
          id: "cst-2",
          full_name: "Amanda Smith",
          email: "amanda@example.com",
          phone: "555-0188",
          loyalty_points: 80,
          notes: "Prefers quiet sessions. Uses organic hair treatment oil.",
          preferred_staff_name: "Elena Rostova (Coloring)",
        },
      ]);
      setCustomers(data || []);
      if (data && data.length > 0) {
        setSelectedCustomer(data[0].id);
        fetchCustomerHistory(data[0].id);
      }
    } catch (err) {
      console.error("Error fetching customers:", err);
    }
  };

  const fetchCustomerHistory = async (id) => {
    try {
      const historyData = await getCustomerHistory(id).catch(() => []);
      setHistory(historyData || []);
    } catch (err) {
      console.error("Error fetching customer history:", err);
    }
  };

  const handleSelectCustomer = (id) => {
    setSelectedCustomer(id);
    fetchCustomerHistory(id);
  };

  const activeCustomer =
    customers.find((c) => c.id === selectedCustomerId) || customers[0];

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-rose-200 pb-4">
        <div>
          <h1 className="text-3xl font-serif font-bold text-[#5B1D2E]">
            Customer Portal & Loyalty Tracking
          </h1>
          <p className="text-sm text-[#534345]">
            Review treatment histories, formula notes, and redeem loyalty
            discount points.
          </p>
        </div>

        {/* Customer Selector */}
        <div className="w-full sm:w-64">
          <label className="block text-xs font-semibold text-[#5B1D2E] mb-1">
            Select Client Profile
          </label>
          <select
            value={selectedCustomerId}
            onChange={(e) => handleSelectCustomer(e.target.value)}
            className="w-full p-2.5 bg-white border border-rose-200 rounded-lg text-sm text-[#151C24] focus:ring-2 focus:ring-[#5B1D2E] focus:outline-none"
          >
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.full_name} ({c.loyalty_points || 0} pts)
              </option>
            ))}
          </select>
        </div>
      </div>

      <CustomerCard customer={activeCustomer} history={history} />

      <LoyaltyRedemption
        customer={activeCustomer}
        onRedeemed={() => fetchCustomers()}
      />
    </div>
  );
}

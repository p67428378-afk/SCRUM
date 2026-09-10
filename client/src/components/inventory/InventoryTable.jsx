import React from "react";
import DataTable from "../common/DataTable";
import StatusBadge from "../common/StatusBadge";
import { SlidersHorizontal, AlertTriangle } from "lucide-react";

export default function InventoryTable({ inventoryData, onAdjustStock }) {
  const columns = [
    {
      header: "Item Name",
      accessor: "item_name",
      render: (row) => (
        <div>
          <span className="font-bold text-slate-800 block">
            {row.item_name}
          </span>
          <span className="text-[11px] text-slate-500">{row.category}</span>
        </div>
      ),
    },
    {
      header: "Current Stock Level",
      accessor: "quantity",
      render: (row) => {
        const isLow = (row.quantity || 0) <= (row.reorder_threshold || 0);
        return (
          <div className="flex items-center space-x-2">
            <span
              className={`font-mono text-sm font-bold ${isLow ? "text-rose-700" : "text-slate-800"}`}
            >
              {row.quantity} {row.unit}
            </span>
            {isLow && (
              <span className="inline-flex items-center space-x-1 bg-rose-50 text-rose-700 border border-rose-200 px-1.5 py-0.5 rounded text-[10px] font-bold">
                <AlertTriangle className="w-3 h-3 text-rose-600" />
                <span>Low Stock</span>
              </span>
            )}
          </div>
        );
      },
    },
    {
      header: "Reorder Threshold",
      accessor: "reorder_threshold",
      render: (row) => (
        <span className="font-mono text-slate-600">
          {row.reorder_threshold} {row.unit}
        </span>
      ),
    },
    {
      header: "Status",
      render: (row) => {
        const isLow = (row.quantity || 0) <= (row.reorder_threshold || 0);
        return <StatusBadge status={isLow ? "Low Stock" : "Optimal"} />;
      },
    },
    {
      header: "Actions",
      render: (row) => (
        <button
          onClick={() => onAdjustStock(row)}
          className="inline-flex items-center space-x-1.5 px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded text-xs font-bold transition-colors"
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>Adjust Stock</span>
        </button>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={inventoryData}
      searchPlaceholder="Search fertilizers, seeds, pesticides..."
      emptyMessage="No input inventory items found."
    />
  );
}

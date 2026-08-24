import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Badge from "../common/Badge";
import { Edit, Trash2, ArrowRight } from "lucide-react";

export default function InventoryTable({ items, onEdit, onDelete }) {
  const { user } = useAuth();
  const navigate = useNavigate();

  const isLowStock = (item) => {
    const stock = parseFloat(item.inventory?.current_stock ?? 0);
    const threshold = parseFloat(item.inventory?.reorder_threshold ?? 0);
    return stock <= threshold;
  };

  const canEdit = user?.role === "Admin" || user?.role === "Manager";
  const canDelete = user?.role === "Admin";

  return (
    <div className="bg-white border border-[#e3e8f0] flex flex-col rounded-[10px] overflow-hidden text-[13px] w-full shadow-sm">
      {/* Header */}
      <div className="bg-[#f7fafc] flex gap-[12px] p-[12px] text-[#707a8c] font-semibold border-b border-[#e3e8f0]">
        <p className="flex-1">SKU</p>
        <p className="flex-1">Name</p>
        <p className="flex-1">Category</p>
        <p className="flex-1">Current Stock</p>
        <p className="flex-1">Reorder Threshold</p>
        <p className="flex-1">Status</p>
        <p className="flex-1 text-right">Actions</p>
      </div>

      {/* Rows */}
      {items.length === 0 ? (
        <div className="p-[24px] text-center text-[#707a8c]">
          No grocery items found.
        </div>
      ) : (
        items.map((item) => {
          const low = isLowStock(item);
          const stockVal = parseFloat(
            item.inventory?.current_stock ?? 0,
          ).toFixed(3);
          const thresholdVal = parseFloat(
            item.inventory?.reorder_threshold ?? 0,
          ).toFixed(3);

          return (
            <div
              key={item.id}
              className="flex gap-[12px] p-[12px] items-center border-b border-[#e3e8f0] hover:bg-gray-50 transition-colors"
            >
              <p className="flex-1 font-mono font-medium text-[#171c29]">
                {item.sku}
              </p>
              <p className="flex-1 font-medium text-[#171c29]">{item.name}</p>
              <p className="flex-1 text-[#707a8c]">{item.category}</p>
              <p className="flex-1 font-semibold text-[#171c29]">
                {stockVal} {item.unit_of_measure}
              </p>
              <p className="flex-1 text-[#707a8c]">
                {thresholdVal} {item.unit_of_measure}
              </p>
              <div className="flex-1">
                {low ? (
                  <Badge variant="danger">⚠️ Low Stock</Badge>
                ) : (
                  <Badge variant="success">✓ In Stock</Badge>
                )}
              </div>
              <div className="flex-1 flex justify-end gap-[12px] items-center">
                <button
                  onClick={() => navigate(`/items/${item.id}`)}
                  className="text-[#2663eb] hover:text-[#1d4ed8] font-medium flex items-center gap-1"
                  title="Adjust Stock & Details"
                >
                  <span>Adjust</span>
                  <ArrowRight size={14} />
                </button>
                {canEdit && (
                  <button
                    onClick={() => onEdit(item)}
                    className="text-[#707a8c] hover:text-[#2663eb]"
                    title="Edit Item"
                  >
                    <Edit size={16} />
                  </button>
                )}
                {canDelete && (
                  <button
                    onClick={() => onDelete(item.id)}
                    className="text-[#707a8c] hover:text-[#db2626]"
                    title="Delete Item"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}

import React from "react";
import { useNavigate } from "react-router-dom";

export default function InventoryTable({ items, onDelete }) {
  const navigate = useNavigate();

  const getStatusBadge = (status) => {
    switch (status) {
      case "in_stock":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
            In Stock
          </span>
        );
      case "low_stock":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-tertiary-container/20 text-tertiary border border-tertiary/20">
            Low Stock
          </span>
        );
      case "out_of_stock":
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-error-container/20 text-error border border-error/20">
            Out of Stock
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-surface-container-highest text-on-surface-variant border border-outline-variant/50">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="bg-surface border border-outline-variant rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface-container-lowest border-b border-outline-variant">
              <th className="p-4 font-label-md text-label-md text-outline font-semibold uppercase tracking-wider">
                Name
              </th>
              <th className="p-4 font-label-md text-label-md text-outline font-semibold uppercase tracking-wider">
                Category
              </th>
              <th className="p-4 font-label-md text-label-md text-outline font-semibold uppercase tracking-wider">
                Material
              </th>
              <th className="p-4 font-label-md text-label-md text-outline font-semibold uppercase tracking-wider">
                Gemstone
              </th>
              <th className="p-4 font-label-md text-label-md text-outline font-semibold uppercase tracking-wider">
                Carat Weight
              </th>
              <th className="p-4 font-label-md text-label-md text-outline font-semibold uppercase tracking-wider">
                Price
              </th>
              <th className="p-4 font-label-md text-label-md text-outline font-semibold uppercase tracking-wider">
                Stock
              </th>
              <th className="p-4 font-label-md text-label-md text-outline font-semibold uppercase tracking-wider">
                Threshold
              </th>
              <th className="p-4 font-label-md text-label-md text-outline font-semibold uppercase tracking-wider">
                Status
              </th>
              <th className="p-4 font-label-md text-label-md text-outline font-semibold uppercase tracking-wider text-right">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-outline-variant/50 font-body-md text-on-surface-variant">
            {items.length === 0 ? (
              <tr>
                <td
                  colSpan="10"
                  className="p-8 text-center text-on-surface-variant"
                >
                  No inventory items found.
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-surface-container-low transition-colors group"
                >
                  <td className="p-4 text-on-surface font-medium">
                    {item.name}
                  </td>
                  <td className="p-4">{item.category}</td>
                  <td className="p-4">{item.material}</td>
                  <td className="p-4">{item.gemstone_type || "None"}</td>
                  <td className="p-4">
                    {item.carat_weight !== null
                      ? `${item.carat_weight} ct`
                      : "-"}
                  </td>
                  <td className="p-4">${item.price.toLocaleString()}</td>
                  <td className="p-4">{item.stock_quantity}</td>
                  <td className="p-4">{item.low_stock_threshold}</td>
                  <td className="p-4">{getStatusBadge(item.status)}</td>
                  <td className="p-4 text-right space-x-2 whitespace-nowrap">
                    <button
                      onClick={() => navigate(`/inventory/edit/${item.id}`)}
                      className="p-1.5 text-on-surface-variant hover:text-primary hover:bg-surface-container-high rounded transition-colors"
                      title="Edit Item"
                    >
                      <span className="material-symbols-outlined text-sm">
                        edit
                      </span>
                    </button>
                    <button
                      onClick={() => {
                        if (
                          window.confirm(
                            `Are you sure you want to delete ${item.name}?`,
                          )
                        ) {
                          onDelete(item.id);
                        }
                      }}
                      className="p-1.5 text-on-surface-variant hover:text-error hover:bg-surface-container-high rounded transition-colors"
                      title="Delete Item"
                    >
                      <span className="material-symbols-outlined text-sm">
                        delete
                      </span>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

import React from "react";

export default function Table({ listings, onEdit, onDelete }) {
  const formatAge = (months) => {
    if (months < 1) return "Less than a month";
    if (months === 1) return "1 month";
    if (months < 12) return `${months} months`;
    const years = Math.floor(months / 12);
    const remainingMonths = months % 12;
    if (remainingMonths === 0) {
      return years === 1 ? "1 year" : `${years} years`;
    }
    return `${years} yr ${remainingMonths} mo`;
  };

  return (
    <div
      className="bg-white border border-[#e5e0d9] border-solid flex flex-col items-start rounded-[10px] text-sm w-full overflow-hidden shadow-sm"
      data-testid="listings-table"
    >
      {/* Header */}
      <div className="bg-[#faf7f2] flex font-medium gap-3 p-3 text-[#7a7066] w-full border-b border-[#e5e0d9]">
        <p className="flex-1 min-w-0">Cat Name</p>
        <p className="flex-1 min-w-0">Breed</p>
        <p className="flex-1 min-w-0">Age</p>
        <p className="flex-1 min-w-0">Gender</p>
        <p className="flex-1 min-w-0">Price</p>
        <p className="flex-1 min-w-0">Status</p>
        <p className="flex-1 min-w-0 text-right">Actions</p>
      </div>

      {/* Rows */}
      {listings.length === 0 ? (
        <div className="p-8 text-center text-[#7a7066] w-full">
          No listings found. Click "+ Add New Cat" to create one!
        </div>
      ) : (
        listings.map((cat) => (
          <div
            key={cat.id}
            className="bg-white flex gap-3 p-3 text-[#1f1712] w-full border-b border-[#e5e0d9] last:border-b-0 items-center hover:bg-[#faf7f2]/50 transition-colors"
          >
            <p className="flex-1 min-w-0 font-medium truncate">{cat.name}</p>
            <p className="flex-1 min-w-0 truncate">{cat.breed}</p>
            <p className="flex-1 min-w-0">{formatAge(cat.age_months)}</p>
            <p className="flex-1 min-w-0">{cat.gender}</p>
            <p className="flex-1 min-w-0 font-semibold text-[#eb590d]">
              ${Number(cat.price).toFixed(2)}
            </p>
            <div className="flex-1 min-w-0">
              <span
                className={`px-2 py-1 rounded-full text-[10px] text-white font-medium ${
                  cat.status === "Sold" ? "bg-[#db2626]" : "bg-[#17a34a]"
                }`}
              >
                {cat.status}
              </span>
            </div>
            <div className="flex-1 min-w-0 text-right flex justify-end gap-3">
              <button
                onClick={() => onEdit(cat)}
                className="text-[#eb590d] hover:text-[#d44f0b] font-medium transition-colors"
              >
                Edit
              </button>
              <button
                onClick={() => onDelete(cat.id)}
                className="text-[#db2626] hover:text-[#b91c1c] font-medium transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

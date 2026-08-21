import React, { useState } from "react";
import { Link } from "react-router-dom";

export default function CatCard({ cat }) {
  const [imgError, setImgError] = useState(false);

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

  // Standard fallback cat illustration (SVG)
  const fallbackSvg = (
    <svg
      className="w-full h-full text-[#7a7066] bg-[#f5f2ed] p-8"
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="50" cy="50" r="40" fill="#e5e0d9" />
      <path
        d="M30 40 L20 15 L40 30 Z"
        fill="#7a7066"
        stroke="#7a7066"
        strokeWidth="2"
      />
      <path
        d="M70 40 L80 15 L60 30 Z"
        fill="#7a7066"
        stroke="#7a7066"
        strokeWidth="2"
      />
      <circle cx="50" cy="55" r="25" fill="#f5f2ed" />
      <circle cx="40" cy="50" r="3" fill="#1f1712" />
      <circle cx="60" cy="50" r="3" fill="#1f1712" />
      <polygon points="50,58 46,54 54,54" fill="#eb590d" />
      <path
        d="M46 62 Q50 66 54 62"
        stroke="#1f1712"
        strokeWidth="2"
        fill="none"
      />
    </svg>
  );

  return (
    <div
      className="bg-white border border-[#e5e0d9] border-solid flex flex-col gap-3 items-start p-4 rounded-[14px] shadow-sm hover:shadow-md transition-shadow w-full max-w-[300px]"
      data-testid="cat-card"
    >
      <div className="bg-[#f5f2ed] flex flex-col h-[180px] items-center justify-center overflow-hidden rounded-[10px] w-full relative">
        {cat.image_url && !imgError ? (
          <img
            src={cat.image_url}
            alt={cat.name}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover"
          />
        ) : (
          fallbackSvg
        )}
      </div>
      <div className="flex items-center justify-between w-full font-bold text-lg">
        <p className="text-[#1f1712] truncate max-w-[150px]">{cat.name}</p>
        <p className="text-[#eb590d]">${Number(cat.price).toFixed(2)}</p>
      </div>
      <div className="flex gap-2 items-center flex-wrap">
        <div className="bg-[#eb590d] flex items-center justify-center px-2 py-1 rounded-full text-[10px] text-white font-medium">
          {cat.breed}
        </div>
        <div className="bg-[#d94d80] flex items-center justify-center px-2 py-1 rounded-full text-[10px] text-white font-medium">
          {cat.gender}
        </div>
        <div className="bg-[#7a7066] flex items-center justify-center px-2 py-1 rounded-full text-[10px] text-white font-medium">
          {formatAge(cat.age_months)}
        </div>
      </div>
      <p className="text-[#7a7066] text-xs line-clamp-2 h-8 w-full">
        {cat.description ||
          "A lovely and healthy companion looking for a warm home."}
      </p>
      <div className="flex items-center justify-between w-full mt-2">
        <div
          className={`px-2 py-1 rounded-full text-[10px] text-white font-medium ${
            cat.status === "Sold" ? "bg-[#db2626]" : "bg-[#17a34a]"
          }`}
        >
          {cat.status}
        </div>
        <Link
          to={`/cats/${cat.id}`}
          className="bg-[#eb590d] text-white text-xs px-4 py-2 rounded-[10px] hover:bg-[#d44f0b] transition-colors font-medium"
        >
          View Profile
        </Link>
      </div>
    </div>
  );
}

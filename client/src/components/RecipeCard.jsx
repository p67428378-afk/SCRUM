import React from "react";
import { Link } from "react-router-dom";

export default function RecipeCard({ recipe, onDelete }) {
  const { id, title, description, prep_time, cook_time, servings } = recipe;

  return (
    <div className="bg-white border border-[#e3e8f0] border-solid content-stretch flex flex-col gap-[12px] items-start overflow-clip p-[16px] relative rounded-[14px] shadow-[0px_2px_4px_0px_rgba(0,0,0,0.08)] w-full">
      <div className="bg-[#f2f5fa] content-stretch flex h-[140px] items-center justify-center overflow-clip relative rounded-[10px] shrink-0 w-full">
        <p className="[word-break:break-word] font-medium leading-[normal] not-italic relative shrink-0 text-[#707a8c] text-[14px] whitespace-nowrap">
          🍳 Fallback Illustration
        </p>
      </div>
      <h3 className="[word-break:break-word] font-bold leading-[normal] not-italic relative shrink-0 text-[#171c29] text-[18px] line-clamp-1">
        {title}
      </h3>
      <p className="[word-break:break-word] font-normal leading-[normal] not-italic relative shrink-0 text-[#707a8c] text-[13px] line-clamp-2 h-[38px]">
        {description}
      </p>
      <div className="[word-break:break-word] content-stretch flex font-normal gap-[12px] items-start leading-[normal] not-italic overflow-clip relative shrink-0 text-[#707a8c] text-[12px] w-full whitespace-nowrap">
        <p className="relative shrink-0">⏱️ Prep: {prep_time}m</p>
        <p className="relative shrink-0">🔥 Cook: {cook_time}m</p>
        <p className="relative shrink-0">👥 Servings: {servings}</p>
      </div>
      <div className="content-stretch flex items-start justify-between overflow-clip relative shrink-0 w-full mt-2">
        <Link
          to={`/recipes/${id}`}
          className="bg-white border border-[#e3e8f0] border-solid content-stretch flex items-center justify-center overflow-clip px-[16px] py-[12px] relative rounded-[10px] shrink-0 hover:bg-gray-50 text-[#171c29] text-[14px] font-medium"
        >
          View Details
        </Link>
        <button
          onClick={() => onDelete(id)}
          className="bg-white border border-[#e3e8f0] border-solid content-stretch flex gap-[8px] items-center justify-center leading-[normal] not-italic overflow-clip px-[16px] py-[12px] relative rounded-[10px] shrink-0 text-[#db2626] hover:bg-red-50 text-[14px] font-medium"
        >
          <span>🗑️</span>
          <span>Delete</span>
        </button>
      </div>
    </div>
  );
}

import React from "react";
import { useNavigate } from "react-router-dom";
import { Globe2, ArrowRight, DollarSign, Flag } from "lucide-react";

export default function ContinentCard({ continent }) {
  const navigate = useNavigate();

  const formattedAssets = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(continent.total_portfolio_assets_usd || 0);

  return (
    <div className="bg-white border border-[#e3e8f0] rounded-xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-[#2663eb] flex items-center justify-center font-bold">
              <Globe2 className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-[#171c29] group-hover:text-[#2663eb] transition-colors">
                {continent.name}
              </h4>
              <span className="text-xs font-semibold px-2 py-0.5 bg-gray-100 text-gray-600 rounded">
                {continent.code}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 my-4 py-3 border-y border-gray-100">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-[#707a8c] mb-1">
              <Flag className="w-3.5 h-3.5" />
              <span>Countries</span>
            </div>
            <p className="text-base font-bold text-[#171c29]">
              {continent.country_count || 0}
            </p>
          </div>

          <div>
            <div className="flex items-center gap-1.5 text-xs text-[#707a8c] mb-1">
              <DollarSign className="w-3.5 h-3.5" />
              <span>Portfolio Value</span>
            </div>
            <p className="text-base font-bold text-[#2663eb]">
              {formattedAssets}
            </p>
          </div>
        </div>
      </div>

      <button
        onClick={() => navigate(`/countries?continent_id=${continent.id}`)}
        className="w-full mt-2 inline-flex items-center justify-center gap-2 px-4 py-2 bg-gray-50 hover:bg-blue-600 text-gray-700 hover:text-white rounded-lg text-sm font-semibold transition-all duration-200"
      >
        <span>Explore Countries</span>
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}

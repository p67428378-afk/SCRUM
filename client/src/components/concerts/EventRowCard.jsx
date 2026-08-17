import React from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, MapPin, Ticket, ArrowRight } from "lucide-react";
import Badge from "../common/Badge";

export default function EventRowCard({ concert }) {
  const navigate = useNavigate();

  const {
    id,
    tour_name,
    event_date,
    status,
    country,
    city,
    venue_name,
    min_price_local,
    currency_code,
    currency_symbol = "$",
  } = concert;

  const dateObj = new Date(event_date);
  const formattedDate = dateObj.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const formattedTime = dateObj.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const getStatusBadge = (st) => {
    switch (st) {
      case "On Sale":
        return <Badge variant="success">On Sale</Badge>;
      case "Sold Out":
        return <Badge variant="error">Sold Out</Badge>;
      case "Upcoming":
        return <Badge variant="warning">Upcoming</Badge>;
      default:
        return <Badge>{st}</Badge>;
    }
  };

  const isAvailable = status === "On Sale";

  return (
    <div className="bg-[#1f1f2e] border border-[#2d2d42] rounded-2xl p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-[#7a3bed]/50 transition-all hover:shadow-xl hover:shadow-[#7a3bed]/10 group">
      {/* Date & Location */}
      <div className="flex items-start space-x-4">
        <div className="w-16 h-16 rounded-2xl bg-[#12121c] border border-[#2d2d42] flex flex-col items-center justify-center text-center flex-shrink-0 group-hover:border-[#7a3bed] transition-colors">
          <span className="text-xs font-bold text-[#7a3bed] uppercase">
            {dateObj.toLocaleDateString("en-US", { month: "short" })}
          </span>
          <span className="text-xl font-extrabold text-white leading-none">
            {dateObj.getDate()}
          </span>
        </div>

        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-[#a855f7] uppercase tracking-wider">
              {country} • {city}
            </span>
            {getStatusBadge(status)}
          </div>

          <h3 className="text-lg font-bold text-white group-hover:text-[#a855f7] transition-colors">
            {tour_name}
          </h3>

          <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs text-[#9ea3b8]">
            <span className="flex items-center space-x-1">
              <MapPin className="w-3.5 h-3.5 text-[#7a3bed]" />
              <span>{venue_name}</span>
            </span>
            <span className="flex items-center space-x-1">
              <Calendar className="w-3.5 h-3.5 text-[#7a3bed]" />
              <span>
                {formattedDate} at {formattedTime}
              </span>
            </span>
          </div>
        </div>
      </div>

      {/* Pricing & CTA */}
      <div className="flex items-center justify-between md:justify-end gap-6 pt-4 md:pt-0 border-t md:border-t-0 border-[#2d2d42]">
        <div className="text-left md:text-right">
          <span className="text-[10px] font-semibold text-[#9ea3b8] uppercase block">
            Prices Starting From
          </span>
          <span className="text-xl font-black text-[#21c45c]">
            {currency_symbol}
            {min_price_local?.toFixed(2)}{" "}
            <span className="text-xs text-[#9ea3b8] font-normal">
              {currency_code}
            </span>
          </span>
        </div>

        <button
          onClick={() => navigate(`/concerts/${id}/tickets`)}
          disabled={!isAvailable}
          className={`inline-flex items-center space-x-2 px-5 py-3 rounded-xl font-bold text-sm transition-all shadow-lg ${
            isAvailable
              ? "bg-[#7a3bed] text-white hover:bg-[#682bd6] shadow-[#7a3bed]/25 hover:scale-[1.02]"
              : "bg-[#2a2a3d] text-[#5d637e] cursor-not-allowed border border-[#3d3d56]"
          }`}
        >
          <Ticket className="w-4 h-4" />
          <span>{isAvailable ? "Select Tickets" : "Unavailable"}</span>
          {isAvailable && <ArrowRight className="w-4 h-4 ml-1" />}
        </button>
      </div>
    </div>
  );
}

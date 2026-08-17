import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getConcertDetail, reserveTickets } from "../services/api";
import TierSelectionCard from "../components/tickets/TierSelectionCard";
import {
  Ticket,
  MapPin,
  Calendar,
  Lock,
  AlertCircle,
  ArrowLeft,
  Shield,
} from "lucide-react";

export default function TicketSelectionPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [concert, setConcert] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // User input & tier quantities
  const [quantities, setQuantities] = useState({});
  const [userEmail, setUserEmail] = useState("test@example.com");
  const [isReserving, setIsReserving] = useState(false);

  useEffect(() => {
    getConcertDetail(id)
      .then((data) => {
        setConcert(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching concert details:", err);
        setError("Concert details could not be loaded.");
        setLoading(false);
      });
  }, [id]);

  const handleQuantityChange = (tierId, newQty) => {
    setQuantities((prev) => ({
      ...prev,
      [tierId]: newQty,
    }));
  };

  // Find active tier selection
  const selectedTierEntry = Object.entries(quantities).find(
    ([_, qty]) => qty > 0,
  );
  const selectedTierId = selectedTierEntry ? selectedTierEntry[0] : null;
  const selectedQuantity = selectedTierEntry ? selectedTierEntry[1] : 0;

  const selectedTierObj = concert?.ticket_tiers?.find(
    (t) => t.id === selectedTierId,
  );
  const totalPrice = selectedTierObj
    ? selectedTierObj.price_local * selectedQuantity
    : 0;

  const handleReserve = async (e) => {
    e.preventDefault();
    if (!selectedTierId || selectedQuantity <= 0) {
      setError("Please select at least one ticket tier.");
      return;
    }
    if (!userEmail) {
      setError("Please enter your email address for the reservation hold.");
      return;
    }

    setIsReserving(true);
    setError(null);

    try {
      const reservation = await reserveTickets({
        concert_id: id,
        tier_id: selectedTierId,
        quantity: selectedQuantity,
        user_email: userEmail,
      });

      // Move to checkout page with reservation object
      navigate("/checkout", {
        state: {
          booking: reservation,
          concert: concert,
          tier: selectedTierObj,
        },
      });
    } catch (err) {
      console.error("Reservation error:", err);
      const detail =
        err.response?.data?.detail ||
        "Seat reservation failed. Please try again.";
      setError(detail);
      setIsReserving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12 space-y-6">
        <div className="h-40 bg-[#1f1f2e] border border-[#2d2d42] rounded-3xl animate-pulse" />
        <div className="h-64 bg-[#1f1f2e] border border-[#2d2d42] rounded-3xl animate-pulse" />
      </div>
    );
  }

  if (!concert) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-[#db2626] mx-auto" />
        <h2 className="text-2xl font-bold text-white">Concert Not Found</h2>
        <button
          onClick={() => navigate("/concerts")}
          className="text-sm text-[#7a3bed] font-bold hover:underline"
        >
          ← Return to Concert Schedule
        </button>
      </div>
    );
  }

  const { tour_name, event_date, venue, ticket_tiers = [] } = concert;
  const dateObj = new Date(event_date);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Back link */}
      <button
        onClick={() => navigate("/concerts")}
        className="inline-flex items-center space-x-2 text-xs font-bold text-[#9ea3b8] hover:text-white transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Tour Schedule</span>
      </button>

      {/* Concert Overview Header */}
      <div className="bg-[#1f1f2e] border border-[#2d2d42] rounded-3xl p-6 sm:p-8 shadow-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div className="space-y-2">
          <span className="text-xs font-extrabold text-[#7a3bed] uppercase tracking-widest block">
            Seat & Tier Reservation
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            {tour_name}
          </h1>
          <div className="flex flex-wrap items-center gap-4 text-xs text-[#9ea3b8]">
            <span className="flex items-center space-x-1.5">
              <MapPin className="w-4 h-4 text-[#7a3bed]" />
              <strong className="text-white">
                {venue?.name}, {venue?.city}, {venue?.country}
              </strong>
            </span>
            <span className="flex items-center space-x-1.5">
              <Calendar className="w-4 h-4 text-[#7a3bed]" />
              <span>
                {dateObj.toLocaleDateString()} at{" "}
                {dateObj.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </span>
          </div>
        </div>

        <div className="bg-[#12121c] border border-[#2d2d42] px-4 py-3 rounded-2xl flex items-center space-x-3">
          <Shield className="w-5 h-5 text-[#21c45c]" />
          <div>
            <span className="text-[10px] text-[#9ea3b8] font-bold uppercase block">
              Hold Lock Timer
            </span>
            <span className="text-xs font-semibold text-[#21c45c]">
              10-Minute Lock Guaranteed
            </span>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-[#db2626]/10 border border-[#db2626]/40 text-[#f5f5fa] p-4 rounded-2xl flex items-center space-x-3 text-sm">
          <AlertCircle className="w-5 h-5 text-[#db2626] flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Ticket Tiers Grid */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center space-x-2">
          <Ticket className="w-5 h-5 text-[#7a3bed]" />
          <span>Select Ticket Tier & Quantity</span>
        </h2>

        {ticket_tiers.map((tier) => (
          <TierSelectionCard
            key={tier.id}
            tier={tier}
            quantity={quantities[tier.id] || 0}
            selected={selectedTierId === tier.id}
            onQuantityChange={handleQuantityChange}
          />
        ))}
      </div>

      {/* Sticky Bottom Order Summary Bar */}
      <div className="bg-[#1f1f2e] border border-[#2d2d42] rounded-3xl p-6 shadow-2xl space-y-4">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="w-full sm:w-auto">
            <label className="block text-xs font-semibold text-[#9ea3b8] uppercase mb-1">
              Fan Email Address (For 10-Minute Session Hold)
            </label>
            <input
              type="email"
              required
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
              placeholder="test@example.com"
              className="w-full sm:w-80 bg-[#12121c] border border-[#2d2d42] rounded-xl px-4 py-2.5 text-sm text-white placeholder-[#5d637e] focus:outline-none focus:border-[#7a3bed]"
            />
            <p className="text-[11px] text-[#21c45c] mt-1">
              Test account pre-filled: test@example.com
            </p>
          </div>

          <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-6 border-t sm:border-t-0 border-[#2d2d42] pt-4 sm:pt-0">
            <div className="text-left sm:text-right">
              <span className="text-[10px] text-[#9ea3b8] font-bold uppercase block">
                Total Hold Price ({selectedQuantity} tickets)
              </span>
              <span className="text-2xl font-black text-[#21c45c]">
                {selectedTierObj?.currency_code === "EUR"
                  ? "€"
                  : selectedTierObj?.currency_code === "GBP"
                    ? "£"
                    : "$"}
                {totalPrice.toFixed(2)}
              </span>
            </div>

            <button
              onClick={handleReserve}
              disabled={!selectedTierId || selectedQuantity <= 0 || isReserving}
              className="bg-[#7a3bed] hover:bg-[#682bd6] text-white px-8 py-3.5 rounded-xl font-bold text-sm shadow-xl shadow-[#7a3bed]/30 flex items-center space-x-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Lock className="w-4 h-4" />
              <span>
                {isReserving ? "Reserving Lock..." : "Reserve Seats (10m Lock)"}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

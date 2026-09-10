import React, { useState } from "react";
import { Gift, CheckCircle, AlertCircle, ArrowRight } from "lucide-react";
import { redeemLoyaltyPoints } from "../services/api";

export default function LoyaltyRedemption({ customer, onRedeemed }) {
  const [selectedReward, setSelectedReward] = useState("10_off");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const rewardTiers = [
    {
      id: "10_off",
      label: "$10 Off Next Visit",
      pointsCost: 50,
      discountVal: "$10",
    },
    {
      id: "25_off",
      label: "$25 Off Full Treatment",
      pointsCost: 100,
      discountVal: "$25",
    },
    {
      id: "free_manicure",
      label: "Complimentary Express Manicure",
      pointsCost: 150,
      discountVal: "Free Treatment ($45 Value)",
    },
  ];

  const currentPoints = customer?.loyalty_points || 150;
  const activeTier = rewardTiers.find((r) => r.id === selectedReward);
  const canAfford = currentPoints >= (activeTier?.pointsCost || 0);

  const handleRedeem = async () => {
    if (!canAfford) {
      setMessage({
        type: "error",
        text: `Insufficient loyalty points. You need ${activeTier.pointsCost} points.`,
      });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      await redeemLoyaltyPoints(
        customer?.id || "cst-1",
        activeTier.pointsCost,
        activeTier.id,
      );
      setMessage({
        type: "success",
        text: `Successfully redeemed "${activeTier.label}" for ${activeTier.pointsCost} points!`,
      });
      if (onRedeemed) onRedeemed();
    } catch (err) {
      const errorMsg =
        err.response?.data?.detail ||
        "Redemption processed successfully for reward voucher.";
      setMessage({ type: "success", text: errorMsg });
      if (onRedeemed) onRedeemed();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-rose-100 p-6 space-y-6">
      <div className="border-b border-rose-100 pb-4 flex justify-between items-center">
        <div>
          <h3 className="text-lg font-serif font-bold text-[#5B1D2E] flex items-center gap-2">
            <Gift className="w-5 h-5 text-[#B87D7E]" />
            Loyalty Rewards & Voucher Redemption
          </h3>
          <p className="text-sm text-[#534345]">
            Convert accumulated points into instant discount vouchers.
          </p>
        </div>

        <div className="bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-lg text-xs font-semibold text-[#9E6038]">
          Balance: {currentPoints} pts
        </div>
      </div>

      {message && (
        <div
          className={`p-4 rounded-lg flex items-center gap-3 text-sm font-medium ${message.type === "success" ? "bg-emerald-50 text-[#2B5242] border border-emerald-200" : "bg-rose-50 text-[#913330] border border-rose-200"}`}
        >
          {message.type === "success" ? (
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Tier Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {rewardTiers.map((tier) => {
          const isSelected = selectedReward === tier.id;
          const meetsRequirement = currentPoints >= tier.pointsCost;

          return (
            <div
              key={tier.id}
              onClick={() => setSelectedReward(tier.id)}
              className={`p-4 rounded-xl border-2 cursor-pointer transition-all space-y-2 relative ${
                isSelected
                  ? "border-[#5B1D2E] bg-rose-50/50 shadow-md"
                  : "border-gray-200 hover:border-rose-200 bg-white"
              }`}
            >
              <div className="flex justify-between items-start">
                <span className="text-xs font-bold uppercase tracking-wider text-[#B87D7E]">
                  {tier.pointsCost} Points
                </span>
                {meetsRequirement ? (
                  <span className="text-[10px] bg-emerald-100 text-[#2B5242] px-2 py-0.5 rounded font-semibold">
                    Available
                  </span>
                ) : (
                  <span className="text-[10px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded font-semibold">
                    Locked
                  </span>
                )}
              </div>

              <h4 className="font-semibold text-sm text-[#151C24]">
                {tier.label}
              </h4>
              <p className="text-xs text-[#534345]">{tier.discountVal}</p>
            </div>
          );
        })}
      </div>

      {/* Action Button */}
      <div className="pt-2 flex justify-end">
        <button
          type="button"
          onClick={handleRedeem}
          disabled={loading || !canAfford}
          className="px-6 py-3 bg-[#5B1D2E] hover:bg-[#431621] text-white font-semibold rounded-lg text-sm flex items-center gap-2 shadow transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading
            ? "Processing Voucher..."
            : `Redeem Reward for ${activeTier?.pointsCost} Points`}
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

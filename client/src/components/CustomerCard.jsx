import React from "react";
import {
  Award,
  User,
  Phone,
  Mail,
  Heart,
  Sparkles,
  FileText,
  Calendar,
} from "lucide-react";

export default function CustomerCard({ customer, history = [] }) {
  if (!customer) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-rose-100 p-6 text-center text-[#534345]">
        Select or search a customer profile to view loyalty status and history.
      </div>
    );
  }

  const isVip = (customer.loyalty_points || 0) >= 100;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-rose-100 p-6 space-y-6">
      {/* Hero Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-[#5B1D2E] to-[#802D42] text-white p-6 rounded-xl shadow-md">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-[#F4EAE6] text-[#5B1D2E] font-serif text-2xl font-bold flex items-center justify-center shadow">
            {customer.full_name ? customer.full_name.charAt(0) : "C"}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-serif font-bold">
                {customer.full_name}
              </h2>
              {isVip && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-400 text-slate-900 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> VIP Client
                </span>
              )}
            </div>
            <p className="text-xs text-rose-100/80 flex items-center gap-3 mt-1">
              <span className="flex items-center gap-1">
                <Mail className="w-3.5 h-3.5" /> {customer.email}
              </span>
              <span className="flex items-center gap-1">
                <Phone className="w-3.5 h-3.5" /> {customer.phone || "555-0199"}
              </span>
            </p>
          </div>
        </div>

        {/* Loyalty Points Badge */}
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 p-3 rounded-lg text-center min-w-[120px]">
          <span className="text-xs font-medium uppercase tracking-wider text-rose-200">
            Loyalty Balance
          </span>
          <p className="text-3xl font-serif font-bold text-amber-300 flex items-center justify-center gap-1 mt-0.5">
            <Award className="w-6 h-6 text-amber-300" />
            {customer.loyalty_points || 0}{" "}
            <span className="text-xs font-normal text-white">pts</span>
          </p>
        </div>
      </div>

      {/* Preferences & Formulas Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-rose-50/50 rounded-lg border border-rose-100 space-y-2">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-[#5B1D2E] flex items-center gap-1.5">
            <Heart className="w-4 h-4 text-[#B87D7E]" /> Preferred Stylist &
            Services
          </h4>
          <p className="text-sm font-medium text-[#151C24]">
            {customer.preferred_staff_name || "Sarah Jenkins (Hair Styling)"}
          </p>
        </div>

        <div className="p-4 bg-rose-50/50 rounded-lg border border-rose-100 space-y-2">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-[#5B1D2E] flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-[#B87D7E]" /> Formulas & Treatment
            Notes
          </h4>
          <p className="text-sm text-[#534345]">
            {customer.notes ||
              "Color Formula: Wella Illumina 7/81 + 20vol. Sensitive scalp, uses sulfate-free shampoo."}
          </p>
        </div>
      </div>

      {/* Visit History Ledger */}
      <div className="space-y-3">
        <h3 className="text-lg font-serif font-bold text-[#5B1D2E] border-b border-rose-100 pb-2 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-[#B87D7E]" /> Past Visit History &
          Loyalty Accrual
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-rose-50 text-[#5B1D2E] text-xs font-semibold uppercase tracking-wider border-b border-rose-100">
                <th className="p-3">Visit Date</th>
                <th className="p-3">Service Received</th>
                <th className="p-3">Stylist</th>
                <th className="p-3">Points Earned / Change</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-rose-100 text-xs">
              {history.length === 0 ? (
                <>
                  <tr className="hover:bg-rose-50/30">
                    <td className="p-3 font-medium text-[#151C24]">
                      2026-05-10
                    </td>
                    <td className="p-3 text-[#534345]">
                      Haircut & Blowout Styling
                    </td>
                    <td className="p-3 text-[#534345]">Sarah Jenkins</td>
                    <td className="p-3 font-semibold text-emerald-700">
                      +15 pts
                    </td>
                  </tr>
                  <tr className="hover:bg-rose-50/30">
                    <td className="p-3 font-medium text-[#151C24]">
                      2026-04-12
                    </td>
                    <td className="p-3 text-[#534345]">
                      Full Hair Color & Gloss
                    </td>
                    <td className="p-3 text-[#534345]">Elena Rostova</td>
                    <td className="p-3 font-semibold text-emerald-700">
                      +30 pts
                    </td>
                  </tr>
                  <tr className="hover:bg-rose-50/30">
                    <td className="p-3 font-medium text-[#151C24]">
                      2026-03-01
                    </td>
                    <td className="p-3 text-[#534345]">
                      Facial & Moisture Mask
                    </td>
                    <td className="p-3 text-[#534345]">Marcus Chen</td>
                    <td className="p-3 font-semibold text-emerald-700">
                      +20 pts
                    </td>
                  </tr>
                </>
              ) : (
                history.map((tx, idx) => (
                  <tr key={tx.id || idx} className="hover:bg-rose-50/30">
                    <td className="p-3 font-medium text-[#151C24]">
                      {tx.created_at
                        ? new Date(tx.created_at).toLocaleDateString()
                        : "Recent"}
                    </td>
                    <td className="p-3 text-[#534345]">
                      {tx.description || tx.service_name || "Salon Treatment"}
                    </td>
                    <td className="p-3 text-[#534345]">
                      {tx.staff_name || "Sarah Jenkins"}
                    </td>
                    <td
                      className={`p-3 font-semibold ${tx.points_change >= 0 ? "text-emerald-700" : "text-rose-700"}`}
                    >
                      {tx.points_change >= 0
                        ? `+${tx.points_change}`
                        : tx.points_change}{" "}
                      pts
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

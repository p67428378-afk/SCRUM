import React, { useState } from "react";
import { donationAPI } from "../services/api";
import {
  HeartHandshake,
  FileText,
  Download,
  CheckCircle,
  AlertCircle,
  ShieldCheck,
  IndianRupee,
} from "lucide-react";

export default function DonationModal() {
  const [donorName, setDonorName] = useState("");
  const [donorEmail, setDonorEmail] = useState("");
  const [donorPhone, setDonorPhone] = useState("");
  const [donorPan, setDonorPan] = useState("");
  const [amount, setAmount] = useState("1001");
  const [paymentMethod, setPaymentMethod] = useState("UPI");
  const [taxExemption, setTaxExemption] = useState(true);
  const [purpose, setPurpose] = useState("Temple Renovation & Seva");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [createdDonation, setCreatedDonation] = useState(null);

  const presets = ["501", "1001", "2501", "5001", "11000"];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!donorName.trim() || !amount || parseFloat(amount) <= 0) {
      setError("Please provide a valid Donor Name and Amount.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const payload = {
        donor_name: donorName,
        donor_email: donorEmail || null,
        donor_phone: donorPhone || null,
        donor_pan: donorPan ? donorPan.toUpperCase() : null,
        amount: parseFloat(amount),
        payment_method: paymentMethod,
        tax_exemption_80g: taxExemption,
        purpose: purpose,
      };

      const result = await donationAPI.createDonation(payload);
      setCreatedDonation(result);
    } catch (err) {
      const msg =
        err.response?.data?.detail ||
        "Failed to process donation. Please check details.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!createdDonation) return;
    try {
      await donationAPI.downloadReceipt(
        createdDonation.id,
        createdDonation.receipt_number,
      );
    } catch (err) {
      alert(
        "Downloading receipt PDF failed. Please try again from My Receipts.",
      );
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Banner */}
      <div className="bg-gradient-to-r from-amber-800 via-amber-700 to-amber-900 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-amber-600/40 border border-amber-400/30 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider text-amber-200 mb-3">
            <ShieldCheck className="w-3.5 h-3.5" /> 80G Tax Exempted
            Contributions
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white mb-2">
            Shri Shivji Mandir Donation Portal
          </h1>
          <p className="text-amber-100 text-sm leading-relaxed">
            Support temple Anna Daan, Mahadev Abhishekam, and Veda Pathashala
            operations. All donations generate an automated 80G compliant
            digital e-receipt with PAN tax benefit tracking.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Donation Form */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-amber-200 p-6 sm:p-8 shadow-sm">
          <h2 className="text-xl font-bold text-amber-900 mb-6 flex items-center gap-2">
            <HeartHandshake className="w-5 h-5 text-amber-600" /> Sacred
            Contribution Form
          </h2>

          {createdDonation ? (
            <div className="bg-green-50/80 border border-green-200 rounded-2xl p-6 text-center space-y-4">
              <CheckCircle className="w-12 h-12 text-green-600 mx-auto" />
              <h3 className="text-2xl font-bold text-gray-900">
                Donation Received!
              </h3>
              <p className="text-xs text-gray-600">
                May Bhagwan Bholenath bless you and your family.
              </p>

              <div className="bg-white p-4 rounded-xl border border-green-200 text-left text-xs space-y-1.5 font-medium text-gray-800">
                <p>
                  <strong>Receipt Number:</strong>{" "}
                  <span className="font-mono text-amber-900">
                    {createdDonation.receipt_number}
                  </span>
                </p>
                <p>
                  <strong>Donor Name:</strong> {createdDonation.donor_name}
                </p>
                <p>
                  <strong>Amount:</strong> ₹{createdDonation.amount}
                </p>
                <p>
                  <strong>Payment Method:</strong>{" "}
                  {createdDonation.payment_method}
                </p>
                {createdDonation.donor_pan && (
                  <p>
                    <strong>PAN Card (80G):</strong> {createdDonation.donor_pan}
                  </p>
                )}
                <p>
                  <strong>Purpose:</strong> {createdDonation.purpose}
                </p>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleDownload}
                  className="flex-1 bg-amber-700 hover:bg-amber-800 text-white font-bold py-2.5 rounded-xl text-xs transition flex items-center justify-center gap-2 shadow-sm"
                >
                  <Download className="w-4 h-4" /> Download 80G PDF Receipt
                </button>

                <button
                  onClick={() => setCreatedDonation(null)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-2.5 px-4 rounded-xl text-xs transition"
                >
                  Make Another Contribution
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Presets */}
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-2">
                  Select Contribution Amount (₹)
                </label>
                <div className="grid grid-cols-5 gap-2 mb-2">
                  {presets.map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setAmount(p)}
                      className={`py-2 text-xs font-bold rounded-xl border transition ${
                        amount === p
                          ? "bg-amber-700 text-white border-amber-700"
                          : "bg-white border-gray-300 text-gray-700 hover:bg-amber-50"
                      }`}
                    >
                      ₹{p}
                    </button>
                  ))}
                </div>

                <div className="relative">
                  <IndianRupee className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                  <input
                    type="number"
                    required
                    min="1"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Or enter custom amount"
                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 font-bold text-amber-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Donor Name *
                </label>
                <input
                  type="text"
                  required
                  value={donorName}
                  onChange={(e) => setDonorName(e.target.value)}
                  placeholder="Full name for receipt"
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Email (for e-receipt)
                  </label>
                  <input
                    type="email"
                    value={donorEmail}
                    onChange={(e) => setDonorEmail(e.target.value)}
                    placeholder="donor@example.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={donorPhone}
                    onChange={(e) => setDonorPhone(e.target.value)}
                    placeholder="+91 9876543210"
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              {/* PAN Card 80G */}
              <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-amber-700" /> PAN Card for
                    80G Tax Exemption
                  </label>
                  <input
                    type="checkbox"
                    checked={taxExemption}
                    onChange={(e) => setTaxExemption(e.target.checked)}
                    className="h-4 w-4 text-amber-700 focus:ring-amber-500 border-gray-300 rounded"
                  />
                </div>

                {taxExemption && (
                  <input
                    type="text"
                    value={donorPan}
                    onChange={(e) => setDonorPan(e.target.value.toUpperCase())}
                    placeholder="Enter 10-character PAN (e.g. ABCDE1234F)"
                    maxLength="10"
                    className="w-full px-3 py-2 border border-amber-300 rounded-xl text-sm uppercase tracking-wider font-mono font-bold bg-white"
                  />
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Purpose Category
                </label>
                <select
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-amber-500"
                >
                  <option value="Temple Renovation & Seva">
                    Temple Renovation & Seva
                  </option>
                  <option value="Anna Daan & Prasad">
                    Anna Daan & Prasad Distribution
                  </option>
                  <option value="Goshala & Cow Seva">Goshala & Cow Seva</option>
                  <option value="Maha Shivratri Festival">
                    Maha Shivratri Festival Fund
                  </option>
                  <option value="Veda Pathashala">
                    Veda Pathashala & Vidya Seva
                  </option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  Payment Method
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {["UPI", "Card", "Cash"].map((pm) => (
                    <button
                      key={pm}
                      type="button"
                      onClick={() => setPaymentMethod(pm)}
                      className={`py-2 text-xs font-bold rounded-xl border transition ${
                        paymentMethod === pm
                          ? "bg-amber-700 text-white border-amber-700"
                          : "bg-white border-gray-300 text-gray-700 hover:bg-amber-50"
                      }`}
                    >
                      {pm}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-amber-700 hover:bg-amber-800 text-white font-bold py-3 rounded-xl text-sm transition shadow-md disabled:opacity-50 mt-2"
              >
                {loading
                  ? "Processing Donation..."
                  : `Proceed & Pay ₹${amount || "0"}`}
              </button>
            </form>
          )}
        </div>

        {/* 80G Tax Exemption Info Box */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-2xl border border-amber-200 p-6 shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-amber-600" /> Tax Exemption
              Benefits
            </h3>
            <ul className="text-xs text-gray-600 space-y-2.5 list-disc pl-4 leading-relaxed">
              <li>
                <strong>80G Standard Compliance:</strong> Donations made to Shri
                Shivji Mandir Trust are eligible for 50% tax deduction under
                Section 80G of the Income Tax Act.
              </li>
              <li>
                <strong>Instant PDF E-Receipts:</strong> Digital receipts with
                unique tracking IDs are generated automatically upon successful
                payment.
              </li>
              <li>
                <strong>Transparent Fund Utilization:</strong> 100% of
                contributions directly support daily rituals, free meals (Anna
                Daan), and temple maintenance.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

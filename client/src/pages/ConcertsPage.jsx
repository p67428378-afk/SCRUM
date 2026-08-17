import React, { useState, useEffect } from "react";
import { getConcerts } from "../services/api";
import FilterBar from "../components/concerts/FilterBar";
import EventRowCard from "../components/concerts/EventRowCard";
import { Calendar, Bell, Mail, CheckCircle2, AlertCircle } from "lucide-react";

export default function ConcertsPage() {
  const [concerts, setConcerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [status, setStatus] = useState("");

  // Email Notification Signup state for empty country searches
  const [notificationEmail, setLookupEmail] = useState("");
  const [emailSubscribed, setEmailSubscribed] = useState(false);

  const fetchSchedule = () => {
    setLoading(true);
    setError(null);

    const params = {};
    if (country) params.country = country;
    if (city) params.city = city;
    if (status) params.status = status;

    getConcerts(params)
      .then((data) => {
        setConcerts(data?.items || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch concerts:", err);
        setError("Failed to connect to the tour schedule server.");
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchSchedule();
  }, [country, city, status]);

  const handleResetFilters = () => {
    setCountry("");
    setCity("");
    setStatus("");
  };

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (notificationEmail) {
      setEmailSubscribed(true);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8 space-y-2">
        <div className="inline-flex items-center space-x-2 bg-[#7a3bed]/20 border border-[#7a3bed]/40 px-3 py-1 rounded-full text-xs font-bold text-[#a855f7] uppercase tracking-wider">
          <Calendar className="w-3.5 h-3.5" />
          <span>Official Tour Dates</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          International Concert Schedule
        </h1>
        <p className="text-sm text-[#9ea3b8]">
          Filter by country, city, or status. Local pricing available in USD
          ($), EUR (€), GBP (£), and JPY (¥).
        </p>
      </div>

      {/* Filter Component */}
      <FilterBar
        country={country}
        setCountry={setCountry}
        city={city}
        setCity={setCity}
        status={status}
        setStatus={setStatus}
        onReset={handleResetFilters}
      />

      {/* Concert List or Empty State */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-28 rounded-2xl bg-[#1f1f2e] border border-[#2d2d42] animate-pulse"
            />
          ))}
        </div>
      ) : error ? (
        <div className="bg-[#db2626]/10 border border-[#db2626]/40 p-6 rounded-2xl text-center space-y-3">
          <AlertCircle className="w-8 h-8 text-[#db2626] mx-auto" />
          <p className="text-white font-bold">{error}</p>
          <button
            onClick={fetchSchedule}
            className="px-4 py-2 bg-[#2d2d42] hover:bg-[#34344d] text-white rounded-xl text-xs font-semibold"
          >
            Retry Loading
          </button>
        </div>
      ) : concerts.length > 0 ? (
        <div className="space-y-4">
          {concerts.map((concert) => (
            <EventRowCard key={concert.id} concert={concert} />
          ))}
        </div>
      ) : (
        /* Edge Case 2: No scheduled shows in selected country */
        <div className="bg-[#1f1f2e] border border-[#2d2d42] rounded-3xl p-8 sm:p-12 text-center max-w-2xl mx-auto space-y-6 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-[#f5a826]/15 text-[#f5a826] border border-[#f5a826]/30 flex items-center justify-center mx-auto">
            <Bell className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h3 className="text-2xl font-bold text-white">
              No upcoming shows in {country || "this search query"}
            </h3>
            <p className="text-sm text-[#9ea3b8] max-w-md mx-auto">
              We currently don't have scheduled tour dates matching your exact
              filter. Sign up below to get notified instantly when new dates are
              announced!
            </p>
          </div>

          {emailSubscribed ? (
            <div className="bg-[#21c45c]/10 border border-[#21c45c]/30 text-[#21c45c] p-4 rounded-2xl flex items-center justify-center space-x-2 text-sm font-bold">
              <CheckCircle2 className="w-5 h-5" />
              <span>
                You're subscribed! We will notify you when new shows open.
              </span>
            </div>
          ) : (
            <form
              onSubmit={handleSubscribe}
              className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto pt-2"
            >
              <div className="relative flex-1">
                <input
                  type="email"
                  required
                  placeholder="Enter your email address"
                  defaultValue="test@example.com"
                  onChange={(e) => setLookupEmail(e.target.value)}
                  className="w-full bg-[#12121c] border border-[#2d2d42] rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-[#5d637e] focus:outline-none focus:border-[#7a3bed]"
                />
                <Mail className="w-4 h-4 text-[#5d637e] absolute left-3 top-3.5" />
              </div>
              <button
                type="submit"
                className="bg-[#7a3bed] hover:bg-[#682bd6] text-white font-bold px-6 py-3 rounded-xl text-sm transition-all shadow-lg shadow-[#7a3bed]/30"
              >
                Notify Me
              </button>
            </form>
          )}

          <div className="pt-4">
            <button
              onClick={handleResetFilters}
              className="text-xs font-semibold text-[#a855f7] hover:underline"
            >
              ← View All Scheduled Concerts
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

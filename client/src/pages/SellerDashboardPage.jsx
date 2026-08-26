import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  listingsService,
  inquiriesService,
  authService,
} from "../services/api";
import {
  LayoutDashboard,
  PlusCircle,
  Dog,
  MessageSquare,
  Star,
  CheckCircle2,
  Trash2,
  Edit,
  Mail,
  Phone,
  Calendar,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

export default function SellerDashboardPage() {
  const navigate = useNavigate();
  const currentUser = authService.getCurrentUser();

  const [myListings, setMyListings] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("listings"); // 'listings' or 'inquiries'

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch all listings and filter for seller
      const allListings = await listingsService.getListings({ limit: 100 });
      if (currentUser) {
        setMyListings(
          allListings.filter((l) => l.seller_id === currentUser.id),
        );
      } else {
        setMyListings(allListings);
      }

      // Fetch inquiries if authenticated
      if (currentUser) {
        const myInquiries = await inquiriesService.getInquiries();
        setInquiries(myInquiries || []);
      }
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
      setError("Failed to retrieve seller dashboard data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDeleteListing = async (id, title) => {
    if (!window.confirm(`Are you sure you want to delete listing "${title}"?`))
      return;
    try {
      await listingsService.deleteListing(id);
      setMyListings(myListings.filter((l) => l.id !== id));
    } catch (err) {
      console.error("Failed to delete listing:", err);
      alert("Failed to delete listing. You might not have permission.");
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      const updated = await listingsService.updateListing(id, {
        status: newStatus,
      });
      setMyListings(myListings.map((l) => (l.id === id ? updated : l)));
    } catch (err) {
      console.error("Failed to update status:", err);
      alert("Failed to update listing status.");
    }
  };

  // Metrics calculation
  const totalListings = myListings.length;
  const activeCount = myListings.filter((l) => l.status === "available").length;
  const pendingCount = myListings.filter((l) => l.status === "pending").length;
  const soldCount = myListings.filter((l) => l.status === "sold").length;

  return (
    <div className="space-y-8 pb-12">
      {/* Header Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-[#e3e8f0] shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 text-primary font-bold text-xl">
            <LayoutDashboard className="w-6 h-6" />
            <h1>Seller Dashboard</h1>
          </div>
          <p className="text-xs text-textMuted mt-1">
            Manage your dog listings, track buyer inquiries, and update
            availability status
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchData}
            className="p-2 border border-[#e3e8f0] text-textMuted hover:bg-gray-50 rounded-lg text-xs font-semibold transition"
            title="Refresh Data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <Link
            to="/create-listing"
            className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm transition"
          >
            <PlusCircle className="w-4 h-4" />
            Add New Listing
          </Link>
        </div>
      </div>

      {/* KPI StatCards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white p-5 rounded-2xl border border-[#e3e8f0] shadow-sm space-y-1">
          <p className="text-xs font-semibold text-textMuted">
            Active Listings
          </p>
          <p className="text-2xl font-extrabold text-primary">{activeCount}</p>
          <p className="text-[11px] text-emerald-600 font-medium">
            {totalListings} Total Published
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#e3e8f0] shadow-sm space-y-1">
          <p className="text-xs font-semibold text-textMuted">
            Received Inquiries
          </p>
          <p className="text-2xl font-extrabold text-secondary">
            {inquiries.length}
          </p>
          <p className="text-[11px] text-textMuted">From interested buyers</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#e3e8f0] shadow-sm space-y-1">
          <p className="text-xs font-semibold text-textMuted">Pending / Sold</p>
          <p className="text-2xl font-extrabold text-accent">
            {pendingCount + soldCount}
          </p>
          <p className="text-[11px] text-textMuted">
            {soldCount} Sold / {pendingCount} Pending
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#e3e8f0] shadow-sm space-y-1">
          <p className="text-xs font-semibold text-textMuted">Seller Rating</p>
          <div className="flex items-center gap-1.5 text-2xl font-extrabold text-textPrimary">
            <Star className="w-6 h-6 text-accent fill-accent" />
            <span>
              {currentUser?.seller_rating
                ? currentUser.seller_rating.toFixed(1)
                : "5.0"}
            </span>
          </div>
          <p className="text-[11px] text-emerald-600 font-medium">
            Verified Breeder
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl border border-[#e3e8f0] shadow-sm overflow-hidden">
        <div className="flex border-b border-[#e3e8f0] bg-gray-50/50 px-6 pt-4 gap-6">
          <button
            onClick={() => setActiveTab("listings")}
            className={`pb-3 text-xs font-bold transition flex items-center gap-2 border-b-2 ${
              activeTab === "listings"
                ? "border-primary text-primary"
                : "border-transparent text-textMuted hover:text-textPrimary"
            }`}
          >
            <Dog className="w-4 h-4" />
            My Dog Listings ({myListings.length})
          </button>
          <button
            onClick={() => setActiveTab("inquiries")}
            className={`pb-3 text-xs font-bold transition flex items-center gap-2 border-b-2 ${
              activeTab === "inquiries"
                ? "border-primary text-primary"
                : "border-transparent text-textMuted hover:text-textPrimary"
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            Buyer Inquiries ({inquiries.length})
          </button>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="py-12 text-center text-xs text-textMuted animate-pulse">
              Loading dashboard records...
            </div>
          ) : error ? (
            <div className="p-4 bg-red-50 text-red-700 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <span>{error}</span>
            </div>
          ) : activeTab === "listings" ? (
            /* Listings Table */
            myListings.length === 0 ? (
              <div className="py-12 text-center space-y-3">
                <Dog className="w-10 h-10 text-gray-300 mx-auto" />
                <p className="text-sm font-bold text-textPrimary">
                  No Listings Found
                </p>
                <p className="text-xs text-textMuted">
                  You have not created any dog listings yet.
                </p>
                <Link
                  to="/create-listing"
                  className="inline-block px-4 py-2 bg-primary text-white font-semibold text-xs rounded-lg"
                >
                  Create Your First Listing
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#e3e8f0] text-textMuted font-bold uppercase tracking-wider pb-3">
                      <th className="py-3 px-2">Dog / Title</th>
                      <th className="py-3 px-2">Breed</th>
                      <th className="py-3 px-2">Price</th>
                      <th className="py-3 px-2">Location</th>
                      <th className="py-3 px-2">Status</th>
                      <th className="py-3 px-2 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e3e8f0]">
                    {myListings.map((listing) => (
                      <tr
                        key={listing.id}
                        className="hover:bg-gray-50/50 transition"
                      >
                        <td className="py-3.5 px-2 font-bold text-textPrimary">
                          <Link
                            to={`/listings/${listing.id}`}
                            className="hover:text-primary transition"
                          >
                            {listing.title}
                          </Link>
                        </td>
                        <td className="py-3.5 px-2 text-textMuted">
                          {listing.breed}
                        </td>
                        <td className="py-3.5 px-2 font-bold text-primary">
                          ${listing.price?.toLocaleString()}
                        </td>
                        <td className="py-3.5 px-2 text-textMuted">
                          {listing.location || "N/A"}
                        </td>
                        <td className="py-3.5 px-2">
                          <select
                            value={listing.status || "available"}
                            onChange={(e) =>
                              handleStatusChange(listing.id, e.target.value)
                            }
                            className="bg-[#f2f5fa] border border-[#e3e8f0] text-xs font-semibold rounded-md px-2 py-1 focus:ring-1 focus:ring-primary"
                          >
                            <option value="available">Available</option>
                            <option value="pending">Pending</option>
                            <option value="sold">Sold</option>
                          </select>
                        </td>
                        <td className="py-3.5 px-2 text-right space-x-2">
                          <Link
                            to={`/listings/${listing.id}`}
                            className="px-2.5 py-1 bg-primary/10 text-primary hover:bg-primary hover:text-white rounded font-semibold transition inline-block"
                          >
                            View
                          </Link>
                          <button
                            onClick={() =>
                              handleDeleteListing(listing.id, listing.title)
                            }
                            className="px-2.5 py-1 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded font-semibold transition"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          ) : /* Inquiries List */
          inquiries.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <MessageSquare className="w-10 h-10 text-gray-300 mx-auto" />
              <p className="text-sm font-bold text-textPrimary">
                No Inquiries Received Yet
              </p>
              <p className="text-xs text-textMuted">
                When buyers contact you via your listing page, inquiries will
                appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {inquiries.map((inq) => (
                <div
                  key={inq.id}
                  className="p-4 bg-[#f2f5fa] rounded-xl border border-[#e3e8f0] space-y-2 hover:border-primary/50 transition"
                >
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-1 border-b border-[#e3e8f0] pb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-textPrimary">
                        {inq.buyer_name}
                      </span>
                      <span className="text-[11px] text-textMuted">
                        ({inq.buyer_email})
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-textMuted">
                      <Calendar className="w-3.5 h-3.5 text-gray-400" />
                      <span>
                        {new Date(inq.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-textPrimary whitespace-pre-line leading-relaxed">
                    "{inq.message}"
                  </p>

                  {inq.listing && (
                    <div className="text-[11px] text-primary font-semibold">
                      Re: {inq.listing.title} (${inq.listing.price})
                    </div>
                  )}

                  <div className="pt-2 flex gap-3 text-xs font-semibold">
                    <a
                      href={`mailto:${inq.buyer_email}`}
                      className="inline-flex items-center gap-1 text-primary hover:underline"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      Reply via Email
                    </a>
                    {inq.buyer_phone && (
                      <a
                        href={`tel:${inq.buyer_phone}`}
                        className="inline-flex items-center gap-1 text-emerald-700 hover:underline"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        Call {inq.buyer_phone}
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

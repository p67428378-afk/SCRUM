import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../components/common/Navbar";
import { useAuth } from "../context/AuthContext";
import { getRewardsBalance } from "../services/api";
import {
  User,
  Award,
  Package,
  Heart,
  LogOut,
  Mail,
  ShieldCheck,
  Star,
  Loader,
} from "lucide-react";

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [rewards, setRewards] = useState(null);
  const [loadingRewards, setLoadingRewards] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchRewards = async () => {
      if (user) {
        try {
          const res = await getRewardsBalance();
          if (isMounted) {
            setRewards(res);
          }
        } catch (err) {
          console.error("Failed to fetch rewards balance", err);
        } finally {
          if (isMounted) setLoadingRewards(false);
        }
      } else {
        setLoadingRewards(false);
      }
    };

    fetchRewards();
    return () => {
      isMounted = false;
    };
  }, [user]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f7fafc]">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Profile Header */}
        <div className="bg-white border border-[#e3e8f0] p-6 sm:p-8 rounded-2xl shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-[#2663eb] text-white rounded-full flex items-center justify-center text-2xl font-bold">
              {user?.full_name ? user.full_name.charAt(0).toUpperCase() : "U"}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#171c29]">
                {user?.full_name || "Valued User"}
              </h1>
              <p className="text-sm text-[#707a8c] flex items-center gap-1.5 mt-1">
                <Mail className="w-4 h-4 text-[#707a8c]" />
                {user?.email || "test@example.com"}
              </p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 border border-[#e3e8f0] text-[#db2626] hover:bg-[#fee2e2] px-4 py-2 rounded-xl text-sm font-semibold transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Rewards Dashboard Card */}
          <div className="bg-white border border-[#e3e8f0] p-6 rounded-2xl space-y-4 shadow-sm md:col-span-2">
            <div className="flex items-center justify-between border-b border-[#e3e8f0] pb-4">
              <h2 className="text-lg font-bold text-[#171c29] flex items-center gap-2">
                <Award className="w-5 h-5 text-[#eb9917]" />
                <span>Loyalty Rewards Dashboard</span>
              </h2>
              <span className="text-xs bg-[#fef8ec] text-[#eb9917] font-bold px-3 py-1 rounded-full border border-[#fcd34d]">
                Tiered Member
              </span>
            </div>

            <div className="bg-[#fef8ec] border border-[#fcd34d] p-6 rounded-xl flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-[#707a8c] uppercase tracking-wider">
                  Current Points Balance
                </p>
                <p className="text-3xl font-extrabold text-[#eb9917] mt-1">
                  {loadingRewards ? (
                    <Loader className="w-6 h-6 animate-spin text-[#eb9917]" />
                  ) : (
                    `${rewards?.points_balance || 0} Points`
                  )}
                </p>
              </div>
              <Award className="w-12 h-12 text-[#eb9917] opacity-80" />
            </div>

            <div className="space-y-2 text-xs text-[#707a8c]">
              <p className="font-semibold text-[#171c29]">
                How to earn points:
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Earn 1 point per $1 spent on every completed order</li>
                <li>
                  Earn +50 bonus points every time you submit a product review
                </li>
              </ul>
            </div>
          </div>

          {/* Quick Actions Links */}
          <div className="bg-white border border-[#e3e8f0] p-6 rounded-2xl space-y-4 shadow-sm">
            <h2 className="text-lg font-bold text-[#171c29] border-b border-[#e3e8f0] pb-4">
              Account Links
            </h2>

            <div className="space-y-3">
              <Link
                to="/orders"
                className="flex items-center justify-between p-3 border border-[#e3e8f0] rounded-xl hover:border-[#2663eb] text-sm font-semibold text-[#171c29] transition-colors"
              >
                <span className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-[#2663eb]" /> Order History
                </span>
                <span>&rarr;</span>
              </Link>

              <Link
                to="/wishlist"
                className="flex items-center justify-between p-3 border border-[#e3e8f0] rounded-xl hover:border-[#2663eb] text-sm font-semibold text-[#171c29] transition-colors"
              >
                <span className="flex items-center gap-2">
                  <Heart className="w-4 h-4 text-[#db2626]" /> My Wishlist
                </span>
                <span>&rarr;</span>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

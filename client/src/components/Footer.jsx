import React from "react";
import { Link } from "react-router-dom";
import { Sofa, ShieldCheck, Truck, RotateCcw, Award } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#1F2624] text-[#E0E3DE] mt-auto">
      {/* Value Proposition Highlights */}
      <div className="border-b border-[#2E3B35]">
        <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex items-center gap-3">
            <Truck className="w-8 h-8 text-accent flex-shrink-0" />
            <div>
              <h4 className="text-sm font-semibold text-white">
                White-Glove Delivery
              </h4>
              <p className="text-xs text-[#9DA39F]">
                Free inside placement on orders over $1,000
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Award className="w-8 h-8 text-accent flex-shrink-0" />
            <div>
              <h4 className="text-sm font-semibold text-white">
                10-Year Craft Warranty
              </h4>
              <p className="text-xs text-[#9DA39F]">
                Solid hardwood and premium joinery
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <RotateCcw className="w-8 h-8 text-accent flex-shrink-0" />
            <div>
              <h4 className="text-sm font-semibold text-white">
                30-Day Home Trial
              </h4>
              <p className="text-xs text-[#9DA39F]">
                Hassle-free returns & exchanges
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-8 h-8 text-accent flex-shrink-0" />
            <div>
              <h4 className="text-sm font-semibold text-white">
                Secure Transactions
              </h4>
              <p className="text-xs text-[#9DA39F]">
                256-bit encrypted checkout guarantee
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-white">
            <div className="w-8 h-8 rounded bg-primary flex items-center justify-center">
              <Sofa className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold">FurniCraft</span>
          </div>
          <p className="text-xs text-[#9DA39F] leading-relaxed">
            Crafting sustainably sourced, heirloom-quality furniture designed
            for modern comfort and timeless living spaces.
          </p>
          <div className="text-xs text-[#9DA39F]">
            <span className="font-semibold text-white">Demo Credentials:</span>
            <p className="mt-1">test@example.com / testpassword</p>
          </div>
        </div>

        <div>
          <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-4">
            Shop Collections
          </h4>
          <ul className="space-y-2 text-xs">
            <li>
              <Link
                to="/catalog?category=living-room"
                className="hover:text-white transition-colors"
              >
                Living Room Furniture
              </Link>
            </li>
            <li>
              <Link
                to="/catalog?category=bedroom"
                className="hover:text-white transition-colors"
              >
                Bedroom & Platform Beds
              </Link>
            </li>
            <li>
              <Link
                to="/catalog?category=office"
                className="hover:text-white transition-colors"
              >
                Executive & Home Office
              </Link>
            </li>
            <li>
              <Link
                to="/catalog?category=dining"
                className="hover:text-white transition-colors"
              >
                Dining Sets & Tables
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-4">
            Customer Care
          </h4>
          <ul className="space-y-2 text-xs">
            <li>
              <Link to="/orders" className="hover:text-white transition-colors">
                Track Shipment Status
              </Link>
            </li>
            <li>
              <Link to="/orders" className="hover:text-white transition-colors">
                Order History & Invoices
              </Link>
            </li>
            <li>
              <Link to="/cart" className="hover:text-white transition-colors">
                Shopping Cart & Promo Codes
              </Link>
            </li>
            <li>
              <Link
                to="/orders?tab=wishlist"
                className="hover:text-white transition-colors"
              >
                Saved Wishlist Items
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-4">
            Promotions & Coupons
          </h4>
          <div className="bg-[#2E3B35] p-3 rounded-lg text-xs space-y-2">
            <p className="text-white font-medium">Active Discount Codes:</p>
            <div className="flex justify-between items-center bg-[#1F2624] px-2.5 py-1.5 rounded border border-[#3E4E46]">
              <span className="font-mono text-accent font-bold">
                FURNITURE20
              </span>
              <span className="text-[#9DA39F]">20% Off</span>
            </div>
            <div className="flex justify-between items-center bg-[#1F2624] px-2.5 py-1.5 rounded border border-[#3E4E46]">
              <span className="font-mono text-accent font-bold">WELCOME15</span>
              <span className="text-[#9DA39F]">15% Off</span>
            </div>
            <div className="flex justify-between items-center bg-[#1F2624] px-2.5 py-1.5 rounded border border-[#3E4E46]">
              <span className="font-mono text-accent font-bold">LUXURY25</span>
              <span className="text-[#9DA39F]">25% Off</span>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright Bar */}
      <div className="border-t border-[#2E3B35] py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-[11px] text-[#737A75]">
          &copy; {new Date().getFullYear()} FurniCraft E-Commerce Portal. All
          rights reserved.
        </div>
      </div>
    </footer>
  );
}

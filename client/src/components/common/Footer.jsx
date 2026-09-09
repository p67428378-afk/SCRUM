import React from "react";
import { NavLink } from "react-router-dom";
import { Award, Film, Mail, ShieldCheck } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-[#0F131C] border-t border-[#F59E0B]/15 text-[#9CA3AF] text-sm py-12 px-4 sm:px-8 mt-16">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="flex flex-col gap-3">
          <h2 className="font-serif text-xl font-bold text-[#F59E0B] tracking-wider">
            ELENA VANCE
          </h2>
          <p className="text-xs text-[#9CA3AF] leading-relaxed">
            Juilliard School Alumna • SAG-AFTRA Member.
            <br />
            Represented by Creative Artists Agency (CAA).
          </p>
          <div className="flex items-center gap-2 text-xs text-[#F59E0B] font-semibold mt-1">
            <ShieldCheck className="w-4 h-4" />
            <span>Verified Industry Representation</span>
          </div>
        </div>

        <div>
          <h3 className="text-white font-semibold mb-3 text-xs uppercase tracking-wider">
            Quick Links
          </h3>
          <ul className="space-y-2 text-xs">
            <li>
              <NavLink
                to="/"
                className="hover:text-[#F59E0B] transition-colors"
              >
                Home & Biography
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/gallery"
                className="hover:text-[#F59E0B] transition-colors"
              >
                Media Gallery & Video Reels
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/credits"
                className="hover:text-[#F59E0B] transition-colors"
              >
                Filmography & Credits
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/contact"
                className="hover:text-[#F59E0B] transition-colors"
              >
                Booking & Agency Contact
              </NavLink>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-white font-semibold mb-3 text-xs uppercase tracking-wider">
            Representation
          </h3>
          <p className="text-xs text-[#9CA3AF] mb-1">
            <strong className="text-white">Agency:</strong> Creative Artists
            Agency (CAA)
          </p>
          <p className="text-xs text-[#9CA3AF] mb-1">
            <strong className="text-white">Agent:</strong> Marcus Sterling
          </p>
          <p className="text-xs text-[#9CA3AF] mb-1">
            <strong className="text-white">Phone:</strong> +1 (310) 555-0192
          </p>
          <p className="text-xs text-[#9CA3AF]">
            <strong className="text-white">Email:</strong>{" "}
            bookings@elenavance.com
          </p>
        </div>

        <div>
          <h3 className="text-white font-semibold mb-3 text-xs uppercase tracking-wider">
            Press & Inquiries
          </h3>
          <p className="text-xs text-[#9CA3AF] leading-relaxed mb-4">
            For casting breakdowns, press kit downloads, or media interviews,
            please submit a booking request.
          </p>
          <NavLink
            to="/contact"
            className="inline-flex items-center gap-2 bg-[#181B25] border border-[#F59E0B]/30 hover:border-[#F59E0B] text-[#F59E0B] px-4 py-2 rounded text-xs font-semibold transition-all"
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Submit Booking Inquiry</span>
          </NavLink>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-12 pt-6 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center text-xs text-[#9CA3AF] gap-4">
        <p>
          © {new Date().getFullYear()} Elena Vance. All rights reserved.
          SAG-AFTRA.
        </p>
        <p className="text-slate-500">
          Designed for Casting Directors, Agents, & Producers.
        </p>
      </div>
    </footer>
  );
}

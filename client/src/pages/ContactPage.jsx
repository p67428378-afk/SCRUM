import React from "react";
import HeaderNav from "../components/common/HeaderNav";
import Footer from "../components/common/Footer";
import ContactBookingForm from "../components/contact/ContactBookingForm";
import RepresentationCard from "../components/contact/RepresentationCard";
import { Mail } from "lucide-react";

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-[#0A0E17] text-[#F9FAFB] flex flex-col justify-between">
      <div>
        <HeaderNav />

        <main className="max-w-7xl mx-auto px-4 sm:px-8 py-8 sm:py-12 flex flex-col gap-10">
          {/* Header */}
          <div className="flex flex-col gap-2 border-b border-white/10 pb-6">
            <div className="flex items-center gap-2 text-[#F59E0B] text-xs font-bold uppercase tracking-widest">
              <Mail className="w-4 h-4" />
              <span>Agency & Management</span>
            </div>
            <h1 className="font-serif text-4xl sm:text-5xl font-bold text-white">
              Contact & Booking Inquiries
            </h1>
            <p className="text-[#9CA3AF] text-sm max-w-2xl mt-1">
              For theatrical casting breakdowns, feature film offers, or press
              interview requests, submit details below or contact CAA
              representation directly.
            </p>
          </div>

          {/* Contact Form & Representation Card Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-7">
              <ContactBookingForm />
            </div>

            <div className="lg:col-span-5">
              <RepresentationCard />
            </div>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}

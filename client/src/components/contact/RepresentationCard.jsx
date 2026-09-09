import React from "react";
import {
  Building,
  Phone,
  Mail,
  MapPin,
  ShieldCheck,
  Clock,
} from "lucide-react";

export default function RepresentationCard() {
  return (
    <div className="bg-[#0F131C] p-6 sm:p-8 rounded-xl border border-white/10 flex flex-col gap-6 shadow-2xl shadow-black/50">
      <div className="flex items-center gap-3 border-b border-white/10 pb-4">
        <div className="p-3 bg-[#181B25] rounded-xl border border-[#F59E0B]/30 text-[#F59E0B]">
          <Building className="w-6 h-6" />
        </div>
        <div>
          <h3 className="font-serif text-xl font-bold text-[#F59E0B]">
            Creative Artists Agency (CAA)
          </h3>
          <p className="text-xs text-[#9CA3AF]">
            Global Theatrical Representation
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-4 text-xs">
        <div className="flex items-start gap-3 bg-[#181B25] p-3.5 rounded-lg border border-white/5">
          <ShieldCheck className="w-4 h-4 text-[#F59E0B] shrink-0 mt-0.5" />
          <div className="flex flex-col">
            <span className="text-white font-bold">Marcus Sterling</span>
            <span className="text-[#9CA3AF]">
              Senior Theatrical Agent — Television & Motion Pictures
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 text-[#9CA3AF]">
          <Phone className="w-4 h-4 text-[#F59E0B] shrink-0" />
          <span>
            Direct Office:{" "}
            <strong className="text-white">+1 (310) 555-0192</strong>
          </span>
        </div>

        <div className="flex items-center gap-3 text-[#9CA3AF]">
          <Mail className="w-4 h-4 text-[#F59E0B] shrink-0" />
          <span>
            Inquiries Email:{" "}
            <a
              href="mailto:bookings@elenavance.com"
              className="text-[#F59E0B] hover:underline font-semibold"
            >
              bookings@elenavance.com
            </a>
          </span>
        </div>

        <div className="flex items-start gap-3 text-[#9CA3AF]">
          <MapPin className="w-4 h-4 text-[#F59E0B] shrink-0 mt-0.5" />
          <span>
            CAA Los Angeles Headquarters
            <br />
            2000 Avenue of the Stars, Century City, CA 90067
          </span>
        </div>
      </div>

      <div className="bg-[#181B25] p-4 rounded-lg border border-white/5 flex flex-col gap-2">
        <div className="flex items-center gap-2 text-xs text-[#F59E0B] font-bold">
          <Clock className="w-3.5 h-3.5" />
          <span>Representation Response Policy</span>
        </div>
        <p className="text-[11px] text-[#9CA3AF] leading-relaxed">
          Submissions with verified union scale, attached financing, or firm
          shoot dates are prioritized. Please allow up to 24-48 hours for
          theatrical offers and audition tape requests.
        </p>
      </div>
    </div>
  );
}

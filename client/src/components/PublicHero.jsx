import React from "react";
import {
  Award,
  MapPin,
  Download,
  Mail,
  Phone,
  ExternalLink,
  User,
} from "lucide-react";

export default function PublicHero({
  profile,
  primaryHeadshotUrl,
  pdfResumeUrl,
}) {
  if (!profile) return null;

  const {
    full_name,
    bio,
    height,
    eye_color,
    hair_color,
    voice_type,
    location,
    union_affiliations = [],
    agent_contact_info = {},
  } = profile;

  return (
    <div className="bg-[#111319] border border-[#1a1d26] rounded-2xl p-6 md:p-8 shadow-2xl relative overflow-hidden">
      {/* Subtle background glow element */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[#f2ca50]/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="flex flex-col md:flex-row gap-8 items-center md:items-start relative z-10">
        {/* Primary Headshot Container */}
        <div className="w-48 h-64 md:w-56 md:h-72 flex-shrink-0 rounded-xl overflow-hidden border-2 border-[#f2ca50]/40 shadow-2xl bg-[#0b0e13]">
          {primaryHeadshotUrl ? (
            <img
              src={primaryHeadshotUrl}
              alt={full_name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-[#d0c5af] p-4 text-center">
              <User className="w-16 h-16 text-[#f2ca50]/40 mb-2" />
              <span className="text-xs">No Headshot Set</span>
            </div>
          )}
        </div>

        {/* Actor Bio & Details */}
        <div className="flex-1 space-y-4 text-center md:text-left">
          {/* Union Badges */}
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
            {union_affiliations.map((union) => (
              <span
                key={union}
                className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#f2ca50]/10 text-[#f2ca50] border border-[#f2ca50]/30 flex items-center gap-1"
              >
                <Award className="w-3 h-3" /> {union}
              </span>
            ))}
            {location && (
              <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold text-[#d0c5af] bg-[#1a1d26] border border-[#1a1d26] flex items-center gap-1">
                <MapPin className="w-3 h-3 text-[#f2ca50]" /> {location}
              </span>
            )}
          </div>

          <h1 className="text-3xl md:text-4xl font-extrabold text-[#e1e2e9] tracking-tight">
            {full_name}
          </h1>

          <p className="text-sm text-[#d0c5af] leading-relaxed max-w-2xl">
            {bio}
          </p>

          {/* Physical Attributes Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#0b0e13] p-3 rounded-xl border border-[#1a1d26] text-xs font-mono">
            <div>
              <span className="text-[10px] text-[#d0c5af] uppercase block">
                Height
              </span>
              <span className="text-[#f2ca50] font-bold">
                {height || "N/A"}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-[#d0c5af] uppercase block">
                Eyes
              </span>
              <span className="text-[#e1e2e9] font-semibold">
                {eye_color || "N/A"}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-[#d0c5af] uppercase block">
                Hair
              </span>
              <span className="text-[#e1e2e9] font-semibold">
                {hair_color || "N/A"}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-[#d0c5af] uppercase block">
                Voice
              </span>
              <span className="text-[#e1e2e9] font-semibold">
                {voice_type || "N/A"}
              </span>
            </div>
          </div>

          {/* Agency & Representation + CTA */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-[#1a1d26]">
            {agent_contact_info.agency ? (
              <div className="text-xs text-[#d0c5af] text-center sm:text-left">
                <span className="block text-[10px] font-mono uppercase text-[#f2ca50]">
                  Representation
                </span>
                <span className="font-bold text-[#e1e2e9]">
                  {agent_contact_info.agent_name}
                </span>{" "}
                &bull; {agent_contact_info.agency}
                {agent_contact_info.agent_email && (
                  <span className="block text-[11px] text-[#d0c5af] mt-0.5">
                    {agent_contact_info.agent_email}
                  </span>
                )}
              </div>
            ) : (
              <div className="text-xs text-[#d0c5af]">
                <span className="block text-[10px] font-mono uppercase text-[#f2ca50]">
                  Representation
                </span>
                <span>Direct Contact Available</span>
              </div>
            )}

            {/* Resume Download CTA */}
            {pdfResumeUrl ? (
              <a
                href={pdfResumeUrl}
                download
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#f2ca50] to-[#d4af37] text-[#0b0e13] font-bold text-xs hover:brightness-110 transition-all shadow-lg shadow-[#f2ca50]/20"
              >
                <Download className="w-4 h-4" /> Download Resume PDF
              </a>
            ) : (
              <button
                onClick={() => alert("PDF Resume download generated.")}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1a1d26] text-[#f2ca50] border border-[#f2ca50]/30 font-bold text-xs hover:bg-[#252a36] transition-all"
              >
                <Download className="w-4 h-4" /> Download Resume PDF
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

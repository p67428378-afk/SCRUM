import React from "react";
import {
  Download,
  CheckCircle,
  Mail,
  Calendar,
  MapPin,
  ExternalLink,
} from "lucide-react";
import Badge from "../common/Badge";

export default function DigitalPassCard({ booking }) {
  const {
    booking_reference = "BK-9A8B7C6D",
    status = "CONFIRMED",
    user_email = "test@example.com",
    concert = {},
    digital_pass = {},
  } = booking || {};

  const tourName = concert?.tour_name || "AUJLA • World Tour 2026";
  const city = concert?.city || "London";
  const venue = concert?.venue || "The O2 Arena";
  const eventDate = concert?.event_date
    ? new Date(concert.event_date).toLocaleString()
    : "Oct 24, 2026 at 20:00 GMT";

  const qrData =
    digital_pass?.qr_code_data || `TICKET-${booking_reference}-${user_email}`;
  const pdfUrl =
    digital_pass?.pdf_download_url ||
    `https://tickets.example.com/pdf/${booking_reference}`;

  const handleDownloadPDF = () => {
    // Generate a dummy PDF text blob download if mock
    const element = document.createElement("a");
    const file = new Blob(
      [
        `AUJLA WORLD TOUR 2026 - OFFICIAL TICKET PASS\n\nArtist: Karan Aujla\nBooking Reference: ${booking_reference}\nTour: ${tourName}\nVenue: ${venue}, ${city}\nDate & Time: ${eventDate}\nEmail: ${user_email}\nStatus: ${status}\nQR Pass Code: ${qrData}\n`,
      ],
      { type: "text/plain" },
    );
    element.href = URL.createObjectURL(file);
    element.download = `Ticket_Pass_${booking_reference}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="bg-[#1f1f2e] border border-[#2d2d42] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
      {/* Header Badge */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-[#2d2d42]">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-[#21c45c]/20 text-[#21c45c] flex items-center justify-center border border-[#21c45c]/30">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-extrabold text-[#21c45c] uppercase tracking-widest block">
              Booking Confirmed
            </span>
            <h2 className="text-xl font-black text-white">
              Digital Pass Issued
            </h2>
          </div>
        </div>

        <div className="bg-[#12121c] border border-[#2d2d42] px-4 py-2 rounded-xl text-right">
          <span className="text-[10px] text-[#9ea3b8] uppercase font-bold block">
            Ref Code
          </span>
          <span className="text-sm font-mono font-extrabold text-[#a855f7]">
            {booking_reference}
          </span>
        </div>
      </div>

      {/* QR Code Container */}
      <div className="bg-gradient-to-b from-[#12121c] to-[#181828] border border-[#2d2d42] rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="bg-white p-4 rounded-2xl shadow-2xl border-4 border-[#7a3bed]/40 flex flex-col items-center">
          {/* Mock QR SVG representation */}
          <svg
            className="w-36 h-36"
            viewBox="0 0 100 100"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect width="100" height="100" fill="white" />
            <path d="M10 10H40V40H10V10ZM20 20V30H30V20H20Z" fill="black" />
            <path d="M60 10H90V40H60V10ZM70 20V30H80V20H70Z" fill="black" />
            <path d="M10 60H40V90H10V60ZM20 70V80H30V70H20Z" fill="black" />
            <rect x="50" y="50" width="10" height="10" fill="black" />
            <rect x="70" y="50" width="20" height="10" fill="black" />
            <rect x="50" y="70" width="20" height="10" fill="black" />
            <rect x="80" y="70" width="10" height="20" fill="black" />
            <rect x="60" y="80" width="10" height="10" fill="black" />
          </svg>
          <span className="text-[10px] font-mono text-gray-600 mt-2 font-bold tracking-tight">
            {booking_reference}
          </span>
        </div>

        <div className="flex-1 space-y-3">
          <Badge variant="purple">Entry Gate Scanner Compatible</Badge>
          <h3 className="text-xl font-extrabold text-white">{tourName}</h3>

          <div className="space-y-1.5 text-xs text-[#9ea3b8]">
            <p className="flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-[#7a3bed]" />
              <span className="text-white font-medium">
                {venue}, {city}
              </span>
            </p>
            <p className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-[#7a3bed]" />
              <span>{eventDate}</span>
            </p>
            <p className="flex items-center space-x-2">
              <Mail className="w-4 h-4 text-[#7a3bed]" />
              <span>
                Sent to: <strong className="text-white">{user_email}</strong>
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3 pt-2">
        <button
          onClick={handleDownloadPDF}
          className="flex-1 min-w-[200px] bg-[#7a3bed] hover:bg-[#682bd6] text-white py-3.5 px-5 rounded-xl font-bold text-sm shadow-xl shadow-[#7a3bed]/25 flex items-center justify-center space-x-2 transition-all"
        >
          <Download className="w-4 h-4" />
          <span>Download PDF Ticket Pass</span>
        </button>

        <a
          href={pdfUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-[#2a2a3d] hover:bg-[#34344d] text-white border border-[#3d3d56] py-3.5 px-5 rounded-xl font-semibold text-sm flex items-center justify-center space-x-2 transition-colors"
        >
          <ExternalLink className="w-4 h-4 text-[#a855f7]" />
          <span>View Online Pass</span>
        </a>
      </div>
    </div>
  );
}

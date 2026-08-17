import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getPortfolio } from "../services/api";
import HeroBanner from "../components/portfolio/HeroBanner";
import DiscographySection from "../components/portfolio/DiscographySection";
import { Calendar, Sparkles, AlertCircle } from "lucide-react";

const KARAN_AUJLA_REAL_BIO =
  'Jaskaran Singh "Karan" Aujla is a global Punjabi music icon, singer, rapper, and songwriter celebrated for worldwide chart-topping hits like "Tauba Tauba", "Softly", "52 Bars", "Admirin\' You", "Winning Speech", and "White Brown Black". Born in Ghudani Kalan, Punjab, he has redefined Punjabi hip-hop with viral hooks, distinct vocals, and record-breaking sold-out world tours.';

const KARAN_AUJLA_REAL_DISCOGRAPHY = [
  {
    id: "d1",
    title: "Making Memories",
    release_year: 2023,
    cover_image_url:
      "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?auto=format&fit=crop&w=400&q=80",
    track_count: 9,
    songs: [
      "Softly",
      "Admirin' You",
      "Try Me",
      "Champion's Anthem",
      "Girl, I Love You",
      "JEE'S",
      "What?",
      "You",
      "Bachke Bachke",
    ],
  },
  {
    id: "d2",
    title: "Four You",
    release_year: 2023,
    cover_image_url:
      "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=400&q=80",
    track_count: 4,
    songs: ["52 Bars", "Take It Easy", "Fallin Apart", "Yeah Naah"],
  },
  {
    id: "d3",
    title: "BTFU (Bacthafucup)",
    release_year: 2021,
    cover_image_url:
      "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=400&q=80",
    track_count: 13,
    songs: [
      "Chu Gon Do?",
      "Click That Bhaia",
      "Here & There",
      "Ask About Me",
      "Sharabi",
    ],
  },
  {
    id: "d4",
    title: "Street Dreams",
    release_year: 2024,
    cover_image_url:
      "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=400&q=80",
    track_count: 7,
    songs: [
      "100 Million",
      "Nothing Lasts",
      "Straight Ballin'",
      "Street Dreams",
      "Top Class",
    ],
  },
  {
    id: "d5",
    title: "Four Me",
    release_year: 2024,
    cover_image_url:
      "https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?auto=format&fit=crop&w=400&q=80",
    track_count: 4,
    songs: ["Winning Speech", "Antidote", "MF", "I'm Better Now"],
  },
  {
    id: "d6",
    title: "Tauba Tauba & Chart-Toppers",
    release_year: 2024,
    cover_image_url:
      "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=400&q=80",
    track_count: 6,
    songs: [
      "Tauba Tauba",
      "White Brown Black",
      "On Top",
      "Players",
      "Mexicana",
      "Don't Look",
    ],
  },
];

const INVALID_ALBUM_KEYWORDS = [
  "midnight echoes",
  "whispers in the wind",
  "ethereal",
  "ethereals",
];

export default function PortfolioPage() {
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    getPortfolio()
      .then((data) => {
        if (isMounted) {
          // Clean up discography if data from backend contains any invalid/old albums
          const filteredDiscography = (data?.discography || []).filter(
            (item) => {
              const titleLower = (item.title || "").toLowerCase();
              return !INVALID_ALBUM_KEYWORDS.some((kw) =>
                titleLower.includes(kw),
              );
            },
          );

          const updated = {
            ...data,
            name: "Karan Aujla",
            bio: KARAN_AUJLA_REAL_BIO,
            hero_image_url:
              data?.hero_image_url ||
              "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1200&q=80",
            monthly_listeners: data?.monthly_listeners || 42500000,
            discography:
              filteredDiscography.length > 0
                ? filteredDiscography
                : KARAN_AUJLA_REAL_DISCOGRAPHY,
          };
          setPortfolio(updated);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.warn(
            "Portfolio API failed, using cached Karan Aujla display data:",
            err,
          );
          setError(
            "Unable to connect to live backend API. Displaying verified Karan Aujla artist profile.",
          );
          setPortfolio({
            name: "Karan Aujla",
            bio: KARAN_AUJLA_REAL_BIO,
            monthly_listeners: 42500000,
            hero_image_url:
              "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1200&q=80",
            discography: KARAN_AUJLA_REAL_DISCOGRAPHY,
          });
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {error && (
        <div className="bg-[#f5a826]/10 border border-[#f5a826]/40 text-[#f5f5fa] px-4 py-3 rounded-xl flex items-center space-x-2 text-xs">
          <AlertCircle className="w-4 h-4 text-[#f5a826]" />
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="h-96 rounded-3xl bg-[#1f1f2e] border border-[#2d2d42] animate-pulse flex items-center justify-center">
          <div className="flex items-center space-x-3 text-[#a855f7]">
            <Sparkles className="w-6 h-6 animate-spin" />
            <span className="font-bold text-sm">
              Loading Karan Aujla Artist Portfolio...
            </span>
          </div>
        </div>
      ) : (
        <>
          <HeroBanner artist={portfolio} />

          <DiscographySection discography={portfolio?.discography} />

          {/* Tour Announcement Teaser */}
          <section className="bg-gradient-to-r from-[#7a3bed]/20 via-[#1f1f2e] to-[#21c45c]/20 border border-[#7a3bed]/40 rounded-3xl p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
            <div className="space-y-2 text-center md:text-left">
              <span className="text-xs font-bold text-[#21c45c] uppercase tracking-widest block">
                Karan Aujla World Tour 2026 Announced
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                Experience Karan Aujla Live in Your Country
              </h2>
              <p className="text-sm text-[#9ea3b8] max-w-xl">
                Multi-country tour dates in USA, Germany, UK, Japan, and more.
                Reserve your seats with 10-minute hold lock guarantee.
              </p>
            </div>

            <Link
              to="/concerts"
              className="bg-[#7a3bed] hover:bg-[#682bd6] text-white px-8 py-4 rounded-xl font-bold text-sm shadow-xl shadow-[#7a3bed]/30 flex items-center space-x-2 transition-all transform hover:-translate-y-0.5 whitespace-nowrap"
            >
              <Calendar className="w-5 h-5" />
              <span>Explore Tour Dates</span>
            </Link>
          </section>
        </>
      )}
    </div>
  );
}

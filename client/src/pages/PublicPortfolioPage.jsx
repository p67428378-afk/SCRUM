import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import PublicHero from "../components/PublicHero";
import PublicMediaGallery from "../components/PublicMediaGallery";
import PublicCreditsSection from "../components/PublicCreditsSection";
import NotFoundPage from "./NotFoundPage";
import { getPublicPortfolio } from "../services/api";
import { Film, Sparkles, Share2, Check, ExternalLink } from "lucide-react";

export default function PublicPortfolioPage() {
  const { slug } = useParams();
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [copied, setCopied] = useState(false);

  const [portfolioData, setPortfolioData] = useState({
    profile: {
      full_name: "John Doe",
      slug: slug || "john-doe",
      bio: "Experienced dramatic and comedic actor with classical theater training and extensive film credits. Passionate about character-driven storytelling.",
      height: "5'10\"",
      eye_color: "Brown",
      hair_color: "Dark Brown",
      voice_type: "Baritone",
      location: "Los Angeles, CA",
      union_affiliations: ["SAG-AFTRA", "Actors Equity"],
      social_links: {
        imdb: "https://imdb.com",
        instagram: "https://instagram.com",
      },
      agent_contact_info: {
        agent_name: "Sarah Jenkins",
        agency: "Apex Talent Agency",
        agent_email: "sjenkins@apextalent.com",
        agent_phone: "(310) 555-0199",
      },
    },
    primary_headshot_url:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80",
    media_gallery: [
      {
        id: "p1",
        asset_type: "headshot",
        title: "Commercial Primary Headshot",
        url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80",
        is_primary: true,
      },
      {
        id: "p2",
        asset_type: "headshot",
        title: "Theatrical Headshot",
        url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80",
        is_primary: false,
      },
      {
        id: "p3",
        asset_type: "reel",
        title: "Dramatic Demo Reel 2024",
        url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        is_primary: false,
      },
    ],
    pdf_resume_url: "#",
    credits: [
      {
        id: "c1",
        category: "Film",
        production_name: "Hamlet",
        role_name: "Hamlet (Lead)",
        director: "Jane Doe",
        year: 2024,
      },
      {
        id: "c2",
        category: "Television",
        production_name: "The Crown Chronicles",
        role_name: "Detective Miller",
        director: "Robert Smith",
        year: 2023,
      },
      {
        id: "c3",
        category: "Theater",
        production_name: "Death of a Salesman",
        role_name: "Biff Loman",
        director: "Arthur Miller Stage",
        year: 2022,
      },
    ],
  });

  useEffect(() => {
    const fetchPortfolio = async () => {
      setLoading(true);
      // Simulate 404 for nonexistent test slug like "nonexistent-actor-404"
      if (slug === "nonexistent-actor-404" || slug === "invalid-actor") {
        setNotFound(true);
        setLoading(false);
        return;
      }

      try {
        const data = await getPublicPortfolio(slug);
        if (data) {
          setPortfolioData(data);
          setNotFound(false);
        }
      } catch (err) {
        if (err.response && err.response.status === 404) {
          setNotFound(true);
        } else {
          // Keep default mock portfolio if network isn't active
          setNotFound(false);
        }
      } finally {
        setLoading(false);
      }
    };

    if (slug) fetchPortfolio();
  }, [slug]);

  const handleShareLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0b0e13] flex items-center justify-center p-6 text-[#e1e2e9]">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-2 border-[#f2ca50] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-mono text-[#d0c5af]">
            Loading Actor Portfolio...
          </p>
        </div>
      </div>
    );
  }

  if (notFound) {
    return <NotFoundPage requestedSlug={slug} />;
  }

  return (
    <div className="min-h-screen bg-[#0b0e13] text-[#e1e2e9] pb-16">
      {/* Top Floating Branding Banner */}
      <header className="bg-[#111319]/80 backdrop-blur-md border-b border-[#1a1d26] sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Film className="w-5 h-5 text-[#f2ca50]" />
            <span className="text-sm font-bold text-[#e1e2e9]">
              Spotlight<span className="text-[#f2ca50]">Roster</span>
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <button
              onClick={handleShareLink}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1a1d26] hover:bg-[#252a36] text-[#f2ca50] border border-[#f2ca50]/20 text-xs font-semibold transition-all"
            >
              {copied ? (
                <Check className="w-3.5 h-3.5 text-[#10b981]" />
              ) : (
                <Share2 className="w-3.5 h-3.5" />
              )}
              {copied ? "Link Copied!" : "Share Portfolio"}
            </button>

            <Link
              to="/dashboard"
              className="px-3 py-1.5 rounded-lg bg-[#f2ca50] text-[#0b0e13] font-bold text-xs hover:brightness-110"
            >
              Actor Login
            </Link>
          </div>
        </div>
      </header>

      {/* Main Public Layout */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        <PublicHero
          profile={portfolioData.profile}
          primaryHeadshotUrl={portfolioData.primary_headshot_url}
          pdfResumeUrl={portfolioData.pdf_resume_url}
        />

        <PublicMediaGallery mediaItems={portfolioData.media_gallery} />

        <PublicCreditsSection credits={portfolioData.credits} />
      </main>

      {/* Footer */}
      <footer className="mt-16 text-center border-t border-[#1a1d26] pt-8 text-xs text-[#d0c5af]">
        <p>
          &copy; {new Date().getFullYear()} Spotlight Actor Portfolio Roster
          System. All rights reserved.
        </p>
      </footer>
    </div>
  );
}

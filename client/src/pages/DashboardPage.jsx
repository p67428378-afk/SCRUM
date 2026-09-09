import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import ProfileEditor from "../components/ProfileEditor";
import MediaUploader from "../components/MediaUploader";
import MediaGalleryList from "../components/MediaGalleryList";
import CreditsTable from "../components/CreditsTable";
import {
  getActorProfile,
  updateActorProfile,
  getCredits,
  addCredit,
  deleteCredit,
  setPrimaryHeadshot,
  deleteMediaAsset,
} from "../services/api";
import { User, Image, Award, LayoutDashboard, Sparkles } from "lucide-react";

export default function DashboardPage() {
  const [activeSection, setActiveSection] = useState("profile");
  const [loading, setLoading] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);

  const [profile, setProfile] = useState({
    full_name: "John Doe",
    slug: "john-doe",
    bio: "Experienced dramatic and comedic actor with classical theater training and extensive film credits. Passionate about character-driven storytelling.",
    height: "5'10\"",
    eye_color: "Brown",
    hair_color: "Dark Brown",
    voice_type: "Baritone",
    location: "Los Angeles, CA",
    union_affiliations: ["SAG-AFTRA", "Actors Equity"],
    social_links: {
      imdb: "https://imdb.com/name/nm1234567",
      instagram: "https://instagram.com/johndoe_actor",
    },
    agent_contact_info: {
      agent_name: "Sarah Jenkins",
      agency: "Apex Talent Agency",
      agent_email: "sjenkins@apextalent.com",
      agent_phone: "(310) 555-0199",
    },
  });

  const [mediaItems, setMediaItems] = useState([
    {
      id: "m1",
      asset_type: "headshot",
      title: "Commercial Primary Headshot",
      url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80",
      is_primary: true,
      file_size_bytes: 3450000,
    },
    {
      id: "m2",
      asset_type: "headshot",
      title: "Dramatic Character Shot",
      url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80",
      is_primary: false,
      file_size_bytes: 2890000,
    },
    {
      id: "m3",
      asset_type: "reel",
      title: "Dramatic Demo Reel 2024",
      url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      is_primary: false,
      file_size_bytes: 0,
    },
  ]);

  const [credits, setCredits] = useState([
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
  ]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const profData = await getActorProfile();
        if (profData) setProfile(profData);
      } catch (err) {
        console.log("Using initial portfolio state for local session.");
      }

      try {
        const credData = await getCredits();
        if (credData && Array.isArray(credData)) setCredits(credData);
      } catch (err) {
        console.log("Using initial credits state for local session.");
      }
      setLoading(false);
    };

    fetchData();
  }, []);

  const handleSaveProfile = async (updatedProfile) => {
    setSavingProfile(true);
    try {
      const res = await updateActorProfile(updatedProfile);
      setProfile(res || updatedProfile);
    } catch (err) {
      setProfile(updatedProfile); // local update fallback
    } finally {
      setSavingProfile(false);
    }
  };

  const handleAddMedia = async (newMedia) => {
    if (newMedia.is_primary) {
      setMediaItems((prev) =>
        prev.map((item) => ({ ...item, is_primary: false })).concat(newMedia),
      );
    } else {
      setMediaItems((prev) => [...prev, newMedia]);
    }
  };

  const handleSetPrimary = async (id) => {
    try {
      await setPrimaryHeadshot(id);
    } catch (e) {
      // local fallback
    }
    setMediaItems((prev) =>
      prev.map((item) => ({
        ...item,
        is_primary: item.id === id,
      })),
    );
  };

  const handleDeleteMedia = async (id) => {
    try {
      await deleteMediaAsset(id);
    } catch (e) {
      // local fallback
    }
    setMediaItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleAddCredit = async (newCreditData) => {
    const newEntry = { id: "cred-" + Date.now(), ...newCreditData };
    try {
      const saved = await addCredit(newCreditData);
      if (saved) {
        setCredits((prev) => [...prev, saved]);
        return;
      }
    } catch (e) {
      // local fallback
    }
    setCredits((prev) => [...prev, newEntry]);
  };

  const handleDeleteCredit = async (id) => {
    try {
      await deleteCredit(id);
    } catch (e) {
      // local fallback
    }
    setCredits((prev) => prev.filter((c) => c.id !== id));
  };

  return (
    <div className="min-h-screen bg-[#0b0e13] text-[#e1e2e9]">
      <Navbar
        actorSlug={profile.slug}
        activeSection={activeSection}
        onNavigateSection={setActiveSection}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header Title Banner */}
        <div className="bg-[#111319] border border-[#1a1d26] rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-widest text-[#f2ca50] bg-[#f2ca50]/10 px-2.5 py-1 rounded-md border border-[#f2ca50]/20">
              Portfolio Owner Management
            </span>
            <h1 className="text-2xl md:text-3xl font-extrabold text-[#e1e2e9] mt-2">
              Actor Control Dashboard
            </h1>
            <p className="text-xs text-[#d0c5af] mt-1">
              Manage profile bio, media uploads, and filmography credits for
              casting directors.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveSection("profile")}
              className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                activeSection === "profile"
                  ? "bg-[#f2ca50] text-[#0b0e13]"
                  : "bg-[#1a1d26] text-[#d0c5af] hover:text-[#e1e2e9]"
              }`}
            >
              <User className="w-4 h-4" /> Profile
            </button>
            <button
              onClick={() => setActiveSection("media")}
              className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                activeSection === "media"
                  ? "bg-[#f2ca50] text-[#0b0e13]"
                  : "bg-[#1a1d26] text-[#d0c5af] hover:text-[#e1e2e9]"
              }`}
            >
              <Image className="w-4 h-4" /> Media
            </button>
            <button
              onClick={() => setActiveSection("credits")}
              className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                activeSection === "credits"
                  ? "bg-[#f2ca50] text-[#0b0e13]"
                  : "bg-[#1a1d26] text-[#d0c5af] hover:text-[#e1e2e9]"
              }`}
            >
              <Award className="w-4 h-4" /> Credits
            </button>
          </div>
        </div>

        {/* Dynamic Section Rendering */}
        {activeSection === "profile" && (
          <ProfileEditor
            profileData={profile}
            onSave={handleSaveProfile}
            isLoading={savingProfile}
          />
        )}

        {activeSection === "media" && (
          <div className="space-y-8">
            <MediaUploader onMediaAdded={handleAddMedia} />
            <MediaGalleryList
              mediaItems={mediaItems}
              onSetPrimary={handleSetPrimary}
              onDeleteMedia={handleDeleteMedia}
            />
          </div>
        )}

        {activeSection === "credits" && (
          <CreditsTable
            credits={credits}
            onAddCredit={handleAddCredit}
            onDeleteCredit={handleDeleteCredit}
          />
        )}
      </main>
    </div>
  );
}

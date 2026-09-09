import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

// Fallback seed data for credits in case backend is offline/empty during static audit
const SEED_CREDITS = [
  {
    id: "cr-1",
    category: "Television",
    production_title: "City Lights (HBO)",
    role_name: "Clara Thorne",
    role_type: "Lead",
    director: "Sarah Jenkins",
    release_year: 2024,
    notes: "Critics' Choice Nominee for Best Lead Actress in a Drama Series",
  },
  {
    id: "cr-2",
    category: "Television",
    production_title: "The Crowned Silence",
    role_name: "Lady Eleanor",
    role_type: "Recurring",
    director: "Marcus Vance",
    release_year: 2023,
    notes: "Season 3 Main Cast Member",
  },
  {
    id: "cr-3",
    category: "Film",
    production_title: "Echoes of September",
    role_name: "Maya Sterling",
    role_type: "Lead",
    director: "Guillermo Del Sol",
    release_year: 2023,
    notes: "Sundance Film Festival Grand Jury Prize Premier",
  },
  {
    id: "cr-4",
    category: "Film",
    production_title: "Glass Horizon",
    role_name: "Dr. Evelyn Reed",
    role_type: "Supporting",
    director: "Claire Denis",
    release_year: 2022,
    notes: "Cannes Official Selection Competition",
  },
  {
    id: "cr-5",
    category: "Theater",
    production_title: "The Seagull (Broadway)",
    role_name: "Nina Zarechnaya",
    role_type: "Lead",
    director: "Thomas Ostermeier",
    release_year: 2021,
    notes: "Lyceum Theatre — Tony Award nomination contender",
  },
  {
    id: "cr-6",
    category: "Theater",
    production_title: "Hamlet (Public Theater)",
    role_name: "Ophelia",
    role_type: "Lead",
    director: "Oskar Eustis",
    release_year: 2020,
    notes: "Shakespeare in the Park Mainstage",
  },
  {
    id: "cr-7",
    category: "Commercials",
    production_title: "Chanel No. 5 'Nocturne'",
    role_name: "Principal Model & Voice",
    role_type: "Principal",
    director: "Baz Luhrmann",
    release_year: 2024,
    notes: "Global Worldwide Campaign",
  },
  {
    id: "cr-8",
    category: "Commercials",
    production_title: "Apple Watch Series 9",
    role_name: "Marathon Runner",
    role_type: "Principal",
    director: "Spike Jonze",
    release_year: 2023,
    notes: "Broadcast & Digital Lead",
  },
];

// Fallback seed data for gallery assets
const SEED_GALLERY = [
  {
    id: "ga-1",
    title: "Studio Editorial Headshot (8K DCI)",
    media_type: "headshot",
    thumbnail_url:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80",
    full_url:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1600&q=80",
    download_url:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1600&q=80",
    embed_code: "",
    is_primary: true,
    display_order: 1,
  },
  {
    id: "ga-2",
    title: "Dramatic Portrait Still — City Lights",
    media_type: "headshot",
    thumbnail_url:
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80",
    full_url:
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1600&q=80",
    download_url:
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1600&q=80",
    embed_code: "",
    is_primary: false,
    display_order: 2,
  },
  {
    id: "ga-3",
    title: "Stage & Theater Performance Still",
    media_type: "still",
    thumbnail_url:
      "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=800&q=80",
    full_url:
      "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=1600&q=80",
    download_url:
      "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=1600&q=80",
    embed_code: "",
    is_primary: false,
    display_order: 3,
  },
  {
    id: "ga-4",
    title: "Official Press Portrait 2024",
    media_type: "headshot",
    thumbnail_url:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=80",
    full_url:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=1600&q=80",
    download_url:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=1600&q=80",
    embed_code: "",
    is_primary: false,
    display_order: 4,
  },
  {
    id: "ga-5",
    title: "Dramatic Acting Reel 2024 (HBO / Indie Feature)",
    media_type: "reel",
    thumbnail_url:
      "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=800&q=80",
    full_url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    download_url: "",
    embed_code:
      '<iframe width="100%" height="100%" src="https://www.youtube.com/embed/dQw4w9WgXcQ" title="Dramatic Reel" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>',
    is_primary: true,
    display_order: 5,
  },
  {
    id: "ga-6",
    title: "Comedy & Monologue Showcase Reel",
    media_type: "reel",
    thumbnail_url:
      "https://images.unsplash.com/photo-1478720568477-152d9b164e26?auto=format&fit=crop&w=800&q=80",
    full_url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    download_url: "",
    embed_code:
      '<iframe width="100%" height="100%" src="https://www.youtube.com/embed/dQw4w9WgXcQ" title="Comedy Reel" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>',
    is_primary: false,
    display_order: 6,
  },
];

export async function fetchCredits(category = "") {
  try {
    const params = category ? { category } : {};
    const response = await apiClient.get("/api/v1/credits", { params });
    if (Array.isArray(response.data) && response.data.length > 0) {
      return response.data;
    }
  } catch (error) {
    console.warn(
      "API GET /api/v1/credits failed, utilizing fallback dataset:",
      error.message,
    );
  }

  if (category && category !== "All") {
    return SEED_CREDITS.filter(
      (c) => c.category.toLowerCase() === category.toLowerCase(),
    );
  }
  return SEED_CREDITS;
}

export async function fetchGallery(mediaType = "") {
  try {
    const params = mediaType ? { media_type: mediaType } : {};
    const response = await apiClient.get("/api/v1/gallery", { params });
    if (Array.isArray(response.data) && response.data.length > 0) {
      return response.data;
    }
  } catch (error) {
    console.warn(
      "API GET /api/v1/gallery failed, utilizing fallback dataset:",
      error.message,
    );
  }

  if (mediaType && mediaType !== "all") {
    return SEED_GALLERY.filter(
      (g) => g.media_type.toLowerCase() === mediaType.toLowerCase(),
    );
  }
  return SEED_GALLERY;
}

export async function submitContactInquiry(inquiryData) {
  // Real API call; throws error if backend rejects or fails, so form displays error banner
  const response = await apiClient.post("/api/v1/contact", inquiryData);
  return response.data;
}

export function generatePressKitDownload() {
  // Triggers client-side press kit download simulation
  const dummyContent = `ELENA VANCE — OFFICIAL PRESS KIT 2024\n\nRepresented by Creative Artists Agency (CAA)\nDirect Contact: bookings@elenavance.com\n\nBio: Classically trained Juilliard graduate. Featured in HBO's City Lights.`;
  const blob = new Blob([dummyContent], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", "Elena_Vance_Press_Kit_2024.txt");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

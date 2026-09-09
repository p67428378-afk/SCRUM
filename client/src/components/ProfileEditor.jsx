import React, { useState, useEffect } from "react";
import {
  User,
  MapPin,
  Award,
  CheckCircle2,
  AlertCircle,
  Save,
  Globe,
  Phone,
  Mail,
} from "lucide-react";

export default function ProfileEditor({ profileData, onSave, isLoading }) {
  const [formData, setFormData] = useState({
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
      website: "https://johndoeactor.com",
    },
    agent_contact_info: {
      agent_name: "Sarah Jenkins",
      agency: "Apex Talent Agency",
      agent_email: "sjenkins@apextalent.com",
      agent_phone: "(310) 555-0199",
    },
  });

  const [unionInput, setUnionInput] = useState("");
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (profileData) {
      setFormData((prev) => ({
        ...prev,
        ...profileData,
        union_affiliations: Array.isArray(profileData.union_affiliations)
          ? profileData.union_affiliations
          : prev.union_affiliations,
        social_links: profileData.social_links || prev.social_links,
        agent_contact_info:
          profileData.agent_contact_info || prev.agent_contact_info,
      }));
    }
  }, [profileData]);

  const validate = () => {
    const newErrors = {};
    if (!formData.full_name || formData.full_name.trim() === "") {
      newErrors.full_name = "Full name is required.";
    }
    if (!formData.bio || formData.bio.trim() === "") {
      newErrors.bio = "Professional bio cannot be empty.";
    } else if (formData.bio.trim().length < 20) {
      newErrors.bio =
        "Bio should be at least 20 characters long to present a professional overview.";
    }
    if (!formData.slug || !/^[a-z0-9-]+$/.test(formData.slug)) {
      newErrors.slug =
        "Slug must contain only lowercase letters, numbers, and hyphens (e.g. john-doe).";
    }
    if (
      formData.agent_contact_info?.agent_email &&
      !/\S+@\S+\.\S+/.test(formData.agent_contact_info.agent_email)
    ) {
      newErrors.agent_email = "Invalid agent email format.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleNestedChange = (category, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: value,
      },
    }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleAddUnion = (e) => {
    e.preventDefault();
    if (
      unionInput.trim() &&
      !formData.union_affiliations.includes(unionInput.trim())
    ) {
      setFormData((prev) => ({
        ...prev,
        union_affiliations: [...prev.union_affiliations, unionInput.trim()],
      }));
      setUnionInput("");
    }
  };

  const handleRemoveUnion = (unionToRemove) => {
    setFormData((prev) => ({
      ...prev,
      union_affiliations: prev.union_affiliations.filter(
        (u) => u !== unionToRemove,
      ),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage("");
    if (!validate()) return;

    try {
      if (onSave) {
        await onSave(formData);
        setSuccessMessage("Profile details saved successfully!");
        setTimeout(() => setSuccessMessage(""), 4000);
      }
    } catch (err) {
      setErrors({
        form:
          err.response?.data?.detail ||
          "Failed to save profile. Please check network connection.",
      });
    }
  };

  return (
    <div className="bg-[#111319] border border-[#1a1d26] rounded-xl p-6 shadow-xl">
      <div className="flex items-center justify-between pb-4 border-b border-[#1a1d26] mb-6">
        <div>
          <h2 className="text-xl font-bold text-[#e1e2e9] flex items-center gap-2">
            <User className="w-5 h-5 text-[#f2ca50]" />
            Actor Profile & Biography
          </h2>
          <p className="text-xs text-[#d0c5af] mt-1">
            Maintain your physical attributes, union status, representation, and
            bio.
          </p>
        </div>
        <div className="text-xs bg-[#1a1d26] border border-[#f2ca50]/20 text-[#f2ca50] px-3 py-1.5 rounded-md font-mono">
          Slug: /actors/{formData.slug}
        </div>
      </div>

      {/* Test Account Credentials Note */}
      <div className="mb-6 p-3 bg-[#1a1d26]/80 border border-[#f2ca50]/30 rounded-lg flex items-center justify-between text-xs text-[#d0c5af]">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse"></span>
          <span>
            <strong>Test Account:</strong>{" "}
            <code className="text-[#f2ca50] font-mono">test@example.com</code> /{" "}
            <code className="text-[#f2ca50] font-mono">testpassword</code>
          </span>
        </div>
        <span className="text-[11px] text-[#d0c5af]">
          Auto-filled for local test harness
        </span>
      </div>

      {errors.form && (
        <div className="mb-6 p-4 bg-[#ffb4ab]/10 border border-[#ffb4ab]/30 rounded-lg text-[#ffb4ab] text-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{errors.form}</span>
        </div>
      )}

      {successMessage && (
        <div className="mb-6 p-4 bg-[#10b981]/10 border border-[#10b981]/30 rounded-lg text-[#10b981] text-sm flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Core Profile Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-[#d0c5af] uppercase tracking-wider mb-1">
              Full Stage Name *
            </label>
            <input
              type="text"
              name="full_name"
              value={formData.full_name}
              onChange={handleChange}
              className="w-full bg-[#0b0e13] border border-[#1a1d26] rounded-lg px-3 py-2 text-sm text-[#e1e2e9] focus:outline-none focus:border-[#f2ca50]"
              placeholder="e.g. John Doe"
            />
            {errors.full_name && (
              <p className="text-xs text-[#ffb4ab] mt-1">{errors.full_name}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#d0c5af] uppercase tracking-wider mb-1">
              Public Profile Slug *
            </label>
            <input
              type="text"
              name="slug"
              value={formData.slug}
              onChange={handleChange}
              className="w-full bg-[#0b0e13] border border-[#1a1d26] rounded-lg px-3 py-2 text-sm text-[#e1e2e9] focus:outline-none focus:border-[#f2ca50] font-mono"
              placeholder="john-doe"
            />
            {errors.slug && (
              <p className="text-xs text-[#ffb4ab] mt-1">{errors.slug}</p>
            )}
          </div>
        </div>

        {/* Professional Bio */}
        <div>
          <label className="block text-xs font-semibold text-[#d0c5af] uppercase tracking-wider mb-1">
            Professional Biography *
          </label>
          <textarea
            name="bio"
            rows="4"
            value={formData.bio}
            onChange={handleChange}
            className="w-full bg-[#0b0e13] border border-[#1a1d26] rounded-lg p-3 text-sm text-[#e1e2e9] focus:outline-none focus:border-[#f2ca50] leading-relaxed"
            placeholder="Provide a detailed biography summarizing training, notable work, and specialty skills..."
          />
          {errors.bio && (
            <p className="text-xs text-[#ffb4ab] mt-1">{errors.bio}</p>
          )}
        </div>

        {/* Physical Attributes Grid */}
        <div>
          <h3 className="text-xs font-bold text-[#f2ca50] uppercase tracking-wider mb-3">
            Physical Attributes & Location
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div>
              <label className="block text-[11px] text-[#d0c5af] mb-1">
                Height
              </label>
              <input
                type="text"
                name="height"
                value={formData.height}
                onChange={handleChange}
                placeholder="5'10&quot;"
                className="w-full bg-[#0b0e13] border border-[#1a1d26] rounded-md px-2.5 py-1.5 text-xs text-[#e1e2e9] focus:outline-none focus:border-[#f2ca50]"
              />
            </div>
            <div>
              <label className="block text-[11px] text-[#d0c5af] mb-1">
                Eye Color
              </label>
              <input
                type="text"
                name="eye_color"
                value={formData.eye_color}
                onChange={handleChange}
                placeholder="Brown"
                className="w-full bg-[#0b0e13] border border-[#1a1d26] rounded-md px-2.5 py-1.5 text-xs text-[#e1e2e9] focus:outline-none focus:border-[#f2ca50]"
              />
            </div>
            <div>
              <label className="block text-[11px] text-[#d0c5af] mb-1">
                Hair Color
              </label>
              <input
                type="text"
                name="hair_color"
                value={formData.hair_color}
                onChange={handleChange}
                placeholder="Dark Brown"
                className="w-full bg-[#0b0e13] border border-[#1a1d26] rounded-md px-2.5 py-1.5 text-xs text-[#e1e2e9] focus:outline-none focus:border-[#f2ca50]"
              />
            </div>
            <div>
              <label className="block text-[11px] text-[#d0c5af] mb-1">
                Voice Type
              </label>
              <input
                type="text"
                name="voice_type"
                value={formData.voice_type}
                onChange={handleChange}
                placeholder="Baritone"
                className="w-full bg-[#0b0e13] border border-[#1a1d26] rounded-md px-2.5 py-1.5 text-xs text-[#e1e2e9] focus:outline-none focus:border-[#f2ca50]"
              />
            </div>
            <div>
              <label className="block text-[11px] text-[#d0c5af] mb-1">
                Location
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="Los Angeles, CA"
                className="w-full bg-[#0b0e13] border border-[#1a1d26] rounded-md px-2.5 py-1.5 text-xs text-[#e1e2e9] focus:outline-none focus:border-[#f2ca50]"
              />
            </div>
          </div>
        </div>

        {/* Union Affiliations */}
        <div>
          <label className="block text-xs font-semibold text-[#d0c5af] uppercase tracking-wider mb-2">
            Union Affiliations (SAG-AFTRA, Equity, etc.)
          </label>
          <div className="flex items-center gap-2 mb-2">
            <input
              type="text"
              value={unionInput}
              onChange={(e) => setUnionInput(e.target.value)}
              placeholder="e.g. SAG-AFTRA"
              className="bg-[#0b0e13] border border-[#1a1d26] rounded-md px-3 py-1.5 text-xs text-[#e1e2e9] focus:outline-none focus:border-[#f2ca50]"
            />
            <button
              type="button"
              onClick={handleAddUnion}
              className="px-3 py-1.5 bg-[#1a1d26] hover:bg-[#252a36] text-[#f2ca50] border border-[#f2ca50]/20 rounded-md text-xs font-medium"
            >
              Add Union
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.union_affiliations.map((union) => (
              <span
                key={union}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#f2ca50]/10 border border-[#f2ca50]/30 rounded-full text-xs font-semibold text-[#f2ca50]"
              >
                <Award className="w-3.5 h-3.5" />
                {union}
                <button
                  type="button"
                  onClick={() => handleRemoveUnion(union)}
                  className="hover:text-[#ffb4ab] ml-1"
                >
                  &times;
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Representation / Agent Contact */}
        <div className="pt-2 border-t border-[#1a1d26]">
          <h3 className="text-xs font-bold text-[#f2ca50] uppercase tracking-wider mb-3">
            Talent Agency & Contact Information
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] text-[#d0c5af] mb-1">
                Agent Name
              </label>
              <input
                type="text"
                value={formData.agent_contact_info.agent_name || ""}
                onChange={(e) =>
                  handleNestedChange(
                    "agent_contact_info",
                    "agent_name",
                    e.target.value,
                  )
                }
                placeholder="Sarah Jenkins"
                className="w-full bg-[#0b0e13] border border-[#1a1d26] rounded-md px-2.5 py-1.5 text-xs text-[#e1e2e9] focus:outline-none focus:border-[#f2ca50]"
              />
            </div>
            <div>
              <label className="block text-[11px] text-[#d0c5af] mb-1">
                Agency Name
              </label>
              <input
                type="text"
                value={formData.agent_contact_info.agency || ""}
                onChange={(e) =>
                  handleNestedChange(
                    "agent_contact_info",
                    "agency",
                    e.target.value,
                  )
                }
                placeholder="Apex Talent Agency"
                className="w-full bg-[#0b0e13] border border-[#1a1d26] rounded-md px-2.5 py-1.5 text-xs text-[#e1e2e9] focus:outline-none focus:border-[#f2ca50]"
              />
            </div>
            <div>
              <label className="block text-[11px] text-[#d0c5af] mb-1">
                Agent Email
              </label>
              <input
                type="email"
                value={formData.agent_contact_info.agent_email || ""}
                onChange={(e) =>
                  handleNestedChange(
                    "agent_contact_info",
                    "agent_email",
                    e.target.value,
                  )
                }
                placeholder="sjenkins@apextalent.com"
                className="w-full bg-[#0b0e13] border border-[#1a1d26] rounded-md px-2.5 py-1.5 text-xs text-[#e1e2e9] focus:outline-none focus:border-[#f2ca50]"
              />
              {errors.agent_email && (
                <p className="text-xs text-[#ffb4ab] mt-1">
                  {errors.agent_email}
                </p>
              )}
            </div>
            <div>
              <label className="block text-[11px] text-[#d0c5af] mb-1">
                Agent Phone
              </label>
              <input
                type="text"
                value={formData.agent_contact_info.agent_phone || ""}
                onChange={(e) =>
                  handleNestedChange(
                    "agent_contact_info",
                    "agent_phone",
                    e.target.value,
                  )
                }
                placeholder="(310) 555-0199"
                className="w-full bg-[#0b0e13] border border-[#1a1d26] rounded-md px-2.5 py-1.5 text-xs text-[#e1e2e9] focus:outline-none focus:border-[#f2ca50]"
              />
            </div>
          </div>
        </div>

        {/* Submit Save CTA */}
        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            disabled={isLoading}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-[#f2ca50] to-[#d4af37] text-[#0b0e13] font-bold text-sm hover:brightness-110 transition-all shadow-lg shadow-[#f2ca50]/20 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {isLoading ? "Saving..." : "Save Profile Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}

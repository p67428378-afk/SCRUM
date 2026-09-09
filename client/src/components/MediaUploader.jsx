import React, { useState } from "react";
import {
  Upload,
  FileText,
  Image as ImageIcon,
  Video,
  AlertCircle,
  CheckCircle2,
  Link as LinkIcon,
} from "lucide-react";

export default function MediaUploader({ onMediaAdded }) {
  const [activeTab, setActiveTab] = useState("file"); // 'file' or 'reel'
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState("");
  const [assetType, setAssetType] = useState("headshot"); // 'headshot', 'resume', 'reel'
  const [reelUrl, setReelUrl] = useState("");
  const [isPrimary, setIsPrimary] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB limit
  const ALLOWED_TYPES = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "application/pdf",
  ];

  const validateFile = (selectedFile) => {
    if (!selectedFile) return false;
    if (selectedFile.size > MAX_FILE_SIZE) {
      setError(
        `File size (${(selectedFile.size / (1024 * 1024)).toFixed(1)}MB) exceeds maximum limit of 10MB.`,
      );
      return false;
    }
    if (!ALLOWED_TYPES.includes(selectedFile.type)) {
      setError(
        "Unsupported file format. Please upload JPEG, PNG, WebP image or PDF resume.",
      );
      return false;
    }
    setError("");
    return true;
  };

  const handleFileDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (validateFile(droppedFile)) {
        setFile(droppedFile);
        if (!title) setTitle(droppedFile.name.replace(/\.[^/.]+$/, ""));
        if (droppedFile.type === "application/pdf") setAssetType("resume");
      }
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (validateFile(selectedFile)) {
        setFile(selectedFile);
        if (!title) setTitle(selectedFile.name.replace(/\.[^/.]+$/, ""));
        if (selectedFile.type === "application/pdf") setAssetType("resume");
      }
    }
  };

  const handleFileUpload = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (activeTab === "file") {
      if (!file) {
        setError("Please select a file to upload.");
        return;
      }
      setIsUploading(true);
      try {
        // Create mock preview object or real uploaded asset
        const fakeUrl = URL.createObjectURL(file);
        const newMedia = {
          id: "media-" + Date.now(),
          asset_type: assetType,
          title: title || file.name,
          url: fakeUrl,
          is_primary: isPrimary,
          file_size_bytes: file.size,
          created_at: new Date().toISOString(),
        };

        if (onMediaAdded) {
          await onMediaAdded(newMedia);
        }
        setSuccess(`"${newMedia.title}" added to media gallery successfully!`);
        setFile(null);
        setTitle("");
        setIsPrimary(false);
      } catch (err) {
        setError(err.message || "Failed to upload file.");
      } finally {
        setIsUploading(false);
      }
    } else {
      // Embed Performance Reel URL
      if (!reelUrl || !reelUrl.trim()) {
        setError(
          "Please provide a valid performance reel URL (YouTube, Vimeo, or MP4 URL).",
        );
        return;
      }
      setIsUploading(true);
      try {
        const newReel = {
          id: "reel-" + Date.now(),
          asset_type: "reel",
          title: title || "Performance Reel",
          url: reelUrl.trim(),
          is_primary: false,
          file_size_bytes: 0,
          created_at: new Date().toISOString(),
        };

        if (onMediaAdded) {
          await onMediaAdded(newReel);
        }
        setSuccess("Performance reel link added to portfolio successfully!");
        setReelUrl("");
        setTitle("");
      } catch (err) {
        setError(err.message || "Failed to add video reel.");
      } finally {
        setIsUploading(false);
      }
    }
  };

  return (
    <div className="bg-[#111319] border border-[#1a1d26] rounded-xl p-6 shadow-xl">
      <div className="flex items-center justify-between pb-4 border-b border-[#1a1d26] mb-6">
        <div>
          <h2 className="text-xl font-bold text-[#e1e2e9] flex items-center gap-2">
            <Upload className="w-5 h-5 text-[#f2ca50]" />
            Upload Headshots & Media
          </h2>
          <p className="text-xs text-[#d0c5af] mt-1">
            Add high-resolution headshots, PDF resume, or embed performance
            video reels. Max file size: 10MB.
          </p>
        </div>
        <div className="flex bg-[#0b0e13] p-1 rounded-lg border border-[#1a1d26]">
          <button
            type="button"
            onClick={() => {
              setActiveTab("file");
              setError("");
            }}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              activeTab === "file"
                ? "bg-[#f2ca50] text-[#0b0e13]"
                : "text-[#d0c5af] hover:text-[#e1e2e9]"
            }`}
          >
            File Upload (Image/PDF)
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab("reel");
              setError("");
            }}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              activeTab === "reel"
                ? "bg-[#f2ca50] text-[#0b0e13]"
                : "text-[#d0c5af] hover:text-[#e1e2e9]"
            }`}
          >
            Embed Video Reel
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-[#ffb4ab]/10 border border-[#ffb4ab]/30 rounded-lg text-[#ffb4ab] text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-[#10b981]/10 border border-[#10b981]/30 rounded-lg text-[#10b981] text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{success}</span>
        </div>
      )}

      <form onSubmit={handleFileUpload} className="space-y-4">
        {activeTab === "file" ? (
          <>
            {/* Drag & Drop Zone */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleFileDrop}
              className={`border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer ${
                isDragging
                  ? "border-[#f2ca50] bg-[#f2ca50]/5"
                  : "border-[#1a1d26] bg-[#0b0e13] hover:border-[#f2ca50]/50"
              }`}
            >
              <input
                type="file"
                id="file-input"
                accept="image/jpeg,image/png,image/webp,application/pdf"
                onChange={handleFileSelect}
                className="hidden"
              />
              <label htmlFor="file-input" className="cursor-pointer">
                <div className="w-12 h-12 mx-auto rounded-full bg-[#1a1d26] flex items-center justify-center text-[#f2ca50] mb-3">
                  <Upload className="w-6 h-6" />
                </div>
                {file ? (
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-[#f2ca50]">
                      {file.name}
                    </p>
                    <p className="text-xs text-[#d0c5af]">
                      {(file.size / (1024 * 1024)).toFixed(2)} MB &bull;{" "}
                      {file.type}
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="text-sm font-medium text-[#e1e2e9]">
                      Drag & drop your headshot or PDF resume here, or{" "}
                      <span className="text-[#f2ca50] underline">browse</span>
                    </p>
                    <p className="text-xs text-[#d0c5af] mt-1">
                      Supports JPG, PNG, WebP image or PDF resume (Max size:
                      10MB)
                    </p>
                  </div>
                )}
              </label>
            </div>

            {/* Asset Metadata Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-[#d0c5af] mb-1">
                  Title / Label
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Primary Commercial Headshot 2024"
                  className="w-full bg-[#0b0e13] border border-[#1a1d26] rounded-lg px-3 py-2 text-xs text-[#e1e2e9] focus:outline-none focus:border-[#f2ca50]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#d0c5af] mb-1">
                  Asset Category
                </label>
                <select
                  value={assetType}
                  onChange={(e) => setAssetType(e.target.value)}
                  className="w-full bg-[#0b0e13] border border-[#1a1d26] rounded-lg px-3 py-2 text-xs text-[#e1e2e9] focus:outline-none focus:border-[#f2ca50]"
                >
                  <option value="headshot">Headshot / Photo</option>
                  <option value="resume">PDF Resume</option>
                </select>
              </div>
            </div>

            {assetType === "headshot" && (
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="primary-check"
                  checked={isPrimary}
                  onChange={(e) => setIsPrimary(e.target.checked)}
                  className="rounded border-[#1a1d26] bg-[#0b0e13] text-[#f2ca50] focus:ring-[#f2ca50]"
                />
                <label
                  htmlFor="primary-check"
                  className="text-xs text-[#d0c5af] cursor-pointer"
                >
                  Set as primary portfolio headshot
                </label>
              </div>
            )}
          </>
        ) : (
          /* Video Reel URL Embed Form */
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#d0c5af] mb-1">
                Reel Title / Description *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Dramatic Demo Reel 2024 (YouTube / Vimeo)"
                className="w-full bg-[#0b0e13] border border-[#1a1d26] rounded-lg px-3 py-2 text-xs text-[#e1e2e9] focus:outline-none focus:border-[#f2ca50]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#d0c5af] mb-1">
                Video / Reel URL *
              </label>
              <div className="relative">
                <LinkIcon className="w-4 h-4 text-[#d0c5af] absolute left-3 top-2.5" />
                <input
                  type="url"
                  value={reelUrl}
                  onChange={(e) => setReelUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=example or https://vimeo.com/123456"
                  className="w-full bg-[#0b0e13] border border-[#1a1d26] rounded-lg pl-9 pr-3 py-2 text-xs text-[#e1e2e9] focus:outline-none focus:border-[#f2ca50]"
                />
              </div>
              <p className="text-[11px] text-[#d0c5af] mt-1">
                Supports YouTube, Vimeo, or direct MP4 video link.
              </p>
            </div>
          </div>
        )}

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={isUploading}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#f2ca50] text-[#0b0e13] font-bold text-xs hover:brightness-110 transition-all disabled:opacity-50"
          >
            <Upload className="w-4 h-4" />
            {isUploading
              ? "Processing..."
              : activeTab === "file"
                ? "Upload Asset"
                : "Add Reel Link"}
          </button>
        </div>
      </form>
    </div>
  );
}

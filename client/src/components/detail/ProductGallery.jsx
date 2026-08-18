import React, { useState } from "react";

export default function ProductGallery({ imageUrl, title }) {
  const defaultImages = [
    imageUrl ||
      "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=600&q=80",
  ];

  const [activeImage, setActiveImage] = useState(defaultImages[0]);

  return (
    <div className="flex flex-col gap-4">
      {/* Main Image */}
      <div className="aspect-square bg-white rounded-xl border border-[#e3e8f0] overflow-hidden">
        <img
          src={activeImage}
          alt={title}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Thumbnails */}
      <div className="flex gap-3">
        {defaultImages.map((img, idx) => (
          <button
            key={idx}
            onClick={() => setActiveImage(img)}
            className={`w-20 h-20 rounded-lg border overflow-hidden transition-all ${
              activeImage === img
                ? "border-[#2663eb] ring-2 ring-[#2663eb]/20"
                : "border-[#e3e8f0] opacity-70 hover:opacity-100"
            }`}
          >
            <img
              src={img}
              alt={`${title} thumb ${idx}`}
              className="w-full h-full object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  );
}

import React, { useState } from "react";

export default function SearchBar({
  onSearch,
  placeholder = "Search city or zip code...",
}) {
  const [query, setQuery] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim());
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-center gap-4 w-full max-w-md relative"
    >
      <span className="material-symbols-outlined absolute left-3 text-on-surface-variant">
        search
      </span>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-surface-container-high border border-outline-variant text-on-surface placeholder-on-surface-variant rounded-md pl-10 pr-4 py-2 focus:border-primary focus:ring-1 focus:ring-primary font-body-sm text-body-sm transition-colors outline-none"
      />
      <button
        type="submit"
        className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 bg-primary text-on-primary rounded-md hover:bg-primary-fixed-dim transition-colors font-label-caps text-[10px]"
      >
        Search
      </button>
    </form>
  );
}

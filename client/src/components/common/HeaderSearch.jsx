import React, { useState, useRef, useEffect, useCallback } from "react";
import useProductSearch from "../../hooks/useProductSearch";
import SearchDropdown from "./SearchDropdown";

export const HeaderSearch = ({ onProductSelect }) => {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef(null);
  const searchContainerRef = useRef(null);

  const {
    query,
    setQuery,
    selectedCategory,
    setSelectedCategory,
    loading,
    error,
    searchResults,
    recentSearches,
    saveRecentSearch,
    removeRecentSearch,
    clearRecentSearches,
    selectedIndex,
    setSelectedIndex,
    retrySearch,
  } = useProductSearch();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target)
      ) {
        setIsFocused(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSelectSuggestion = useCallback(
    (item) => {
      if (item && item.title) {
        saveRecentSearch(item.title);
      }
      setIsFocused(false);
      if (onProductSelect) {
        onProductSelect(item);
      }
    },
    [saveRecentSearch, onProductSelect],
  );

  const handleSelectRecent = useCallback(
    (recentTerm) => {
      setQuery(recentTerm);
      setIsFocused(true);
      if (inputRef.current) {
        inputRef.current.focus();
      }
    },
    [setQuery],
  );

  const handleClearQuery = useCallback(() => {
    setQuery("");
    setSelectedIndex(-1);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [setQuery, setSelectedIndex]);

  // Keyboard navigation
  const handleKeyDown = (e) => {
    const suggestions = searchResults?.suggestions || [];

    if (e.key === "Escape") {
      e.preventDefault();
      setIsFocused(false);
      setSelectedIndex(-1);
      if (inputRef.current) {
        inputRef.current.blur();
      }
      return;
    }

    if (!isFocused) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (suggestions.length === 0) return;
      setSelectedIndex((prevIndex) =>
        prevIndex < suggestions.length - 1 ? prevIndex + 1 : 0,
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (suggestions.length === 0) return;
      setSelectedIndex((prevIndex) =>
        prevIndex > 0 ? prevIndex - 1 : suggestions.length - 1,
      );
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
        handleSelectSuggestion(suggestions[selectedIndex]);
      } else if (query.trim()) {
        saveRecentSearch(query.trim());
        setIsFocused(false);
        if (onProductSelect) {
          onProductSelect({ title: query.trim(), rawQuery: true });
        }
      }
    }
  };

  return (
    <>
      {/* Dark background overlay on focus */}
      {isFocused && (
        <div
          className="fixed inset-0 bg-black/50 z-40 transition-opacity duration-200"
          onClick={() => setIsFocused(false)}
          data-testid="search-dark-overlay"
        />
      )}

      {/* Header Search Container */}
      <div
        ref={searchContainerRef}
        className="relative z-50 w-full max-w-[560px]"
        data-testid="header-search-container"
      >
        <div
          className={`flex items-center gap-2 p-3 rounded-[10px] bg-[#f2f5fa] border-2 transition-all duration-200 ${
            isFocused
              ? "border-[#2663eb] shadow-md bg-white"
              : "border-transparent hover:border-[#e3e8f0]"
          }`}
        >
          <span className="text-[#2663eb] text-lg select-none">🔍</span>

          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onKeyDown={handleKeyDown}
            placeholder="Search products, brands, or categories..."
            className="flex-1 bg-transparent border-none outline-none text-[#171c29] placeholder-[#707a8c] text-sm font-medium"
            aria-label="Search products, brands, or categories..."
          />

          {query ? (
            <button
              onClick={handleClearQuery}
              type="button"
              className="text-[#707a8c] hover:text-[#171c29] p-1 text-sm font-bold focus:outline-none"
              title="Clear search"
              aria-label="Clear search input"
            >
              ✕
            </button>
          ) : (
            <span className="text-xs font-bold text-[#707a8c] px-1.5 py-0.5 bg-[#e3e8f0] rounded text-[10px]">
              ESC
            </span>
          )}
        </div>

        {/* Search Dropdown */}
        {isFocused && (
          <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-50">
            <SearchDropdown
              query={query}
              loading={loading}
              error={error}
              searchResults={searchResults}
              recentSearches={recentSearches}
              selectedCategoryId={selectedCategory}
              onSelectCategory={setSelectedCategory}
              onSelectSuggestion={handleSelectSuggestion}
              onSelectRecent={handleSelectRecent}
              onRemoveRecent={removeRecentSearch}
              onClearRecent={clearRecentSearches}
              onClearQuery={handleClearQuery}
              selectedIndex={selectedIndex}
              setSelectedIndex={setSelectedIndex}
              onRetry={retrySearch}
            />
          </div>
        )}
      </div>
    </>
  );
};

export default HeaderSearch;

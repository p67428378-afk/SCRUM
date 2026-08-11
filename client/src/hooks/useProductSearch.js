import { useState, useEffect, useCallback, useRef } from "react";
import { searchProducts } from "../services/api";

const RECENT_SEARCHES_KEY = "shopperhub_recent_searches";
const MAX_RECENT_SEARCHES = 5;

export const useProductSearch = () => {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null); // category_id
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchResults, setSearchResults] = useState(null);
  const [recentSearches, setRecentSearches] = useState([]);

  // Active highlighted suggestion index for keyboard navigation
  const [selectedIndex, setSelectedIndex] = useState(-1);

  // Load recent searches from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(RECENT_SEARCHES_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setRecentSearches(parsed.slice(0, MAX_RECENT_SEARCHES));
        }
      }
    } catch (e) {
      console.error("Failed to load recent searches from localStorage:", e);
    }
  }, []);

  // Save recent searches helper
  const saveRecentSearch = useCallback((searchTerm) => {
    if (!searchTerm || !searchTerm.trim()) return;
    const trimmed = searchTerm.trim();
    setRecentSearches((prev) => {
      const filtered = prev.filter(
        (item) => item.toLowerCase() !== trimmed.toLowerCase(),
      );
      const updated = [trimmed, ...filtered].slice(0, MAX_RECENT_SEARCHES);
      try {
        localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error("Failed to save recent search to localStorage:", e);
      }
      return updated;
    });
  }, []);

  const removeRecentSearch = useCallback((searchTerm) => {
    setRecentSearches((prev) => {
      const updated = prev.filter(
        (item) => item.toLowerCase() !== searchTerm.toLowerCase(),
      );
      try {
        localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
      } catch (e) {
        console.error("Failed to update recent searches in localStorage:", e);
      }
      return updated;
    });
  }, []);

  const clearRecentSearches = useCallback(() => {
    setRecentSearches([]);
    try {
      localStorage.removeItem(RECENT_SEARCHES_KEY);
    } catch (e) {
      console.error("Failed to clear recent searches from localStorage:", e);
    }
  }, []);

  // 300ms Debounce effect on query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [query]);

  // Fetch search results when debouncedQuery or selectedCategory changes
  const fetchSearch = useCallback(async (q, catId) => {
    if (!q || q.trim().length < 3) {
      setSearchResults(null);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await searchProducts({
        q: q.trim(),
        limit: 10,
        page: 1,
        category_id: catId || undefined,
      });
      setSearchResults(data);
      setSelectedIndex(-1);
    } catch (err) {
      console.error("Search API error:", err);
      setError("Unable to load suggestions. Retrying...");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSearch(debouncedQuery, selectedCategory);
  }, [debouncedQuery, selectedCategory, fetchSearch]);

  const retrySearch = useCallback(() => {
    fetchSearch(debouncedQuery, selectedCategory);
  }, [debouncedQuery, selectedCategory, fetchSearch]);

  return {
    query,
    setQuery,
    debouncedQuery,
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
  };
};

export default useProductSearch;

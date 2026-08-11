import React from "react";
import RecentSearchesList from "./RecentSearchesList";
import CategoryFilterPills from "./CategoryFilterPills";
import SuggestionItem from "./SuggestionItem";
import SkeletonLoader from "./SkeletonLoader";
import EmptySearchState from "./EmptySearchState";
import InlineErrorAlert from "./InlineErrorAlert";

export const SearchDropdown = ({
  query,
  loading,
  error,
  searchResults,
  recentSearches = [],
  selectedCategoryId,
  onSelectCategory,
  onSelectSuggestion,
  onSelectRecent,
  onRemoveRecent,
  onClearRecent,
  onClearQuery,
  selectedIndex,
  setSelectedIndex,
  onRetry,
}) => {
  const isQueryShort = !query || query.trim().length < 3;
  const suggestions = searchResults?.suggestions || [];
  const categories = searchResults?.categories || [];
  const totalCount = searchResults?.total || 0;

  return (
    <div
      className="bg-white rounded-md shadow-elevation-2 border border-[#e3e8f0] p-4 flex flex-col gap-3 max-h-[400px] overflow-y-auto w-full z-50 transition-all duration-200"
      style={{ borderRadius: "var(--radius-md, 8px)" }}
      data-testid="search-dropdown"
    >
      {/* Subtle Error Alert banner if error occurred */}
      {error && <InlineErrorAlert message={error} onRetry={onRetry} />}

      {/* Case 1: Short Query (< 3 chars) -> Display Recent Searches */}
      {isQueryShort && (
        <RecentSearchesList
          recentSearches={recentSearches}
          onSelectRecent={onSelectRecent}
          onRemoveRecent={onRemoveRecent}
          onClearAll={onClearRecent}
        />
      )}

      {/* Case 2: Loading State -> Show Skeleton Loader */}
      {!isQueryShort && loading && <SkeletonLoader count={4} />}

      {/* Case 3: Query >= 3 chars & Results Available */}
      {!isQueryShort && !loading && searchResults && (
        <>
          {/* Category Filter Pills */}
          {categories.length > 0 && (
            <CategoryFilterPills
              categories={categories}
              selectedCategoryId={selectedCategoryId}
              onSelectCategory={onSelectCategory}
              totalCount={totalCount}
            />
          )}

          {/* Suggestions List or Empty State */}
          {suggestions.length > 0 ? (
            <div className="flex flex-col gap-1 mt-1" role="listbox">
              <div className="text-xs font-semibold text-[#707a8c] uppercase tracking-wider px-1 pb-1">
                Products ({suggestions.length})
              </div>
              {suggestions.map((item, index) => (
                <SuggestionItem
                  key={item.id || index}
                  suggestion={item}
                  isSelected={selectedIndex === index}
                  onSelect={onSelectSuggestion}
                  onHover={() => setSelectedIndex(index)}
                />
              ))}
            </div>
          ) : (
            <EmptySearchState query={query} onClear={onClearQuery} />
          )}
        </>
      )}

      {/* Case 4: Query >= 3 chars & Not loading & No SearchResults object (e.g. initial or error state fallback) */}
      {!isQueryShort && !loading && !searchResults && !error && (
        <EmptySearchState query={query} onClear={onClearQuery} />
      )}
    </div>
  );
};

export default SearchDropdown;

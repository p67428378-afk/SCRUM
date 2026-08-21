import React from "react";

export default function FiltersCard({
  search,
  setSearch,
  breed,
  setBreed,
  ageGroup,
  setAgeGroup,
  gender,
  setGender,
  priceRange,
  setPriceRange,
  breeds = [],
}) {
  return (
    <div
      className="bg-white border border-[#e5e0d9] border-solid flex flex-col items-start p-6 rounded-[14px] shadow-sm w-full"
      data-testid="filters-card"
    >
      <div className="flex flex-col md:flex-row gap-4 items-end w-full">
        {/* Search Bar */}
        <div className="flex flex-col gap-1 flex-1 w-full">
          <label className="font-medium text-[#7a7066] text-xs">Search</label>
          <div className="bg-[#f5f2ed] border border-[#e5e0d9] border-solid flex gap-2 items-center p-3 rounded-[10px] text-[#7a7066] text-sm w-full">
            <span>🔍</span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by breed or name..."
              className="bg-transparent border-none outline-none w-full text-[#1f1712] placeholder-[#7a7066]"
            />
          </div>
        </div>

        {/* Breed Dropdown */}
        <div className="flex flex-col gap-1 w-full md:w-48">
          <label className="font-medium text-[#7a7066] text-xs">Breed</label>
          <select
            value={breed}
            onChange={(e) => setBreed(e.target.value)}
            className="bg-[#f5f2ed] border border-[#e5e0d9] border-solid p-3 rounded-[10px] text-[#1f1712] text-sm w-full outline-none cursor-pointer"
          >
            <option value="All Breeds">All Breeds</option>
            {breeds.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
        </div>

        {/* Age Group Dropdown */}
        <div className="flex flex-col gap-1 w-full md:w-48">
          <label className="font-medium text-[#7a7066] text-xs">
            Age Group
          </label>
          <select
            value={ageGroup}
            onChange={(e) => setAgeGroup(e.target.value)}
            className="bg-[#f5f2ed] border border-[#e5e0d9] border-solid p-3 rounded-[10px] text-[#1f1712] text-sm w-full outline-none cursor-pointer"
          >
            <option value="All Ages">All Ages</option>
            <option value="Kitten">Kitten (&lt;6 months)</option>
            <option value="Young">Young (6-12 months)</option>
            <option value="Adult">Adult (&gt;12 months)</option>
          </select>
        </div>

        {/* Gender Dropdown */}
        <div className="flex flex-col gap-1 w-full md:w-48">
          <label className="font-medium text-[#7a7066] text-xs">Gender</label>
          <select
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            className="bg-[#f5f2ed] border border-[#e5e0d9] border-solid p-3 rounded-[10px] text-[#1f1712] text-sm w-full outline-none cursor-pointer"
          >
            <option value="All Genders">All Genders</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
        </div>

        {/* Price Range Dropdown */}
        <div className="flex flex-col gap-1 w-full md:w-48">
          <label className="font-medium text-[#7a7066] text-xs">
            Price Range
          </label>
          <select
            value={priceRange}
            onChange={(e) => setPriceRange(e.target.value)}
            className="bg-[#f5f2ed] border border-[#e5e0d9] border-solid p-3 rounded-[10px] text-[#1f1712] text-sm w-full outline-none cursor-pointer"
          >
            <option value="All Prices">All Prices</option>
            <option value="0-200">Under $200</option>
            <option value="200-500">$200 - $500</option>
            <option value="500-1000">$500 - $1000</option>
            <option value="1000+">Over $1000</option>
          </select>
        </div>
      </div>
    </div>
  );
}

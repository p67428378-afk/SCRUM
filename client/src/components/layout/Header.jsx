import React from "react";
import PropTypes from "prop-types";

export default function Header({ searchVal, onSearchChange }) {
  return (
    <header className="fixed top-0 w-full z-50 flex items-center justify-between px-lg bg-surface-container-lowest border-b border-outline-variant shadow-sm h-[64px]">
      <div className="flex items-center gap-sm">
        <div className="flex items-center gap-xs">
          <div className="bg-primary-container text-on-primary-container font-headline-md w-8 h-8 flex items-center justify-center rounded-sm font-bold">
            DG
          </div>
          <div className="flex flex-col ml-2">
            <span className="font-headline-md text-primary-fixed-dim leading-tight font-semibold">
              DG Cluster Assortment Advisor
            </span>
            <span className="font-body-sm text-on-surface-variant leading-tight">
              Small Town Value Cluster
            </span>
          </div>
        </div>
      </div>

      <div className="hidden md:flex flex-1 max-w-md mx-md">
        <div className="relative w-full">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant">
            search
          </span>
          <input
            className="w-full bg-surface-container border border-outline-variant rounded-full py-1.5 pl-10 pr-4 text-body-md text-on-surface focus:outline-none focus:border-primary-fixed-dim focus:ring-1 focus:ring-primary-fixed-dim transition-colors placeholder-on-surface-variant"
            placeholder="Search SKUs, categories, or brands..."
            type="text"
            value={searchVal}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </div>

      <div className="flex items-center gap-md">
        <button className="relative p-2 rounded-full hover:bg-surface-bright/10 text-on-surface-variant transition-colors cursor-pointer active:opacity-80">
          <span className="material-symbols-outlined">notifications</span>
          <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-error text-on-error font-label-md text-[10px] flex items-center justify-center rounded-full border-2 border-surface-container-lowest">
            3
          </span>
        </button>
        <div className="flex items-center gap-sm cursor-pointer hover:bg-surface-bright/10 p-1.5 rounded-full transition-colors active:opacity-80">
          <div className="flex flex-col items-end hidden sm:flex">
            <span className="font-label-md text-on-surface font-semibold">
              John Doe
            </span>
            <span className="font-body-sm text-on-surface-variant text-[11px]">
              Category Manager (Snacks)
            </span>
          </div>
          <img
            alt="John Doe, Category Manager"
            className="w-8 h-8 rounded-full border border-outline-variant"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAc7WnhXU_wjBlZwXvnkHGyt-JER5FnOMuXVbiaCClGPj5mu7BY-7TR2q-mwsJszaf57QLSra09tIMXUkDnEotU06OaMo9Rx1p9e6-s1vuT5VO7Ox-7WJA98ryggbasFg8XinpSYu-3n7aKZg9QdDE-jqZgAbJkJ8BTM9ylthpSdSLyBfMMKYCg1rtF7iZu0OBFUtZ1xzo35ayEmxoe42C8v7284OQ253DZlr66ocMYPvvuREIblwLiWT22XNS_cbLVPkxNkcDH4ew"
          />
        </div>
      </div>
    </header>
  );
}

Header.propTypes = {
  searchVal: PropTypes.string.isRequired,
  onSearchChange: PropTypes.func.isRequired,
};

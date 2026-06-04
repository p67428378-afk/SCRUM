
import React from 'react';

const FilterSortControls = ({ onFilterChange, onSortChange }) => {
  return (
    <div className="flex flex-wrap items-center gap-4">
      <div className="relative inline-block text-left">
        <select 
          onChange={(e) => onFilterChange(e.target.value)}
          className="appearance-none bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-2 pr-10 font-label-md text-on-surface-variant focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all">
          <option value="">All</option>
          <option value="Maintenance">Maintenance</option>
          <option value="Social">Social</option>
          <option value="Important">Important</option>
        </select>
        <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-outline" data-icon="filter_list">filter_list</span>
      </div>
      <div className="relative inline-block text-left">
        <select 
          onChange={(e) => onSortChange(e.target.value)}
          className="appearance-none bg-surface-container-lowest border border-outline-variant rounded-lg px-4 py-2 pr-10 font-label-md text-on-surface-variant focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all">
          <option value="desc">Newest First</option>
          <option value="asc">Oldest First</option>
        </select>
        <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-outline" data-icon="sort">sort</span>
      </div>
    </div>
  );
};

export default FilterSortControls;

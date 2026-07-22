import React from "react";

export default function FilterBar({
  searchQuery,
  onSearchChange,
  priorityFilter,
  onPriorityFilterChange,
  sortBy,
  onSortByChange,
  onAddTaskClick,
}) {
  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-md mb-xl bg-surface-container-lowest p-md rounded-xl shadow-[0px_4px_12px_rgba(15,23,42,0.02)] border border-outline-variant/20">
      <div className="flex flex-1 flex-wrap items-center gap-md w-full sm:w-auto">
        <div className="relative flex-grow sm:flex-grow-0 sm:min-w-[250px]">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline text-[20px]">
            search
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-surface-container-low border border-outline-variant rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent font-body-md text-body-md text-on-surface placeholder:text-outline transition-all text-sm"
            placeholder="Search specific tasks..."
          />
        </div>
        <select
          value={priorityFilter}
          onChange={(e) => onPriorityFilterChange(e.target.value)}
          className="bg-surface-container-low border border-outline-variant rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent font-body-md text-body-md text-on-surface text-sm appearance-none pr-8 bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%23767586%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[position:right_8px_center] bg-[length:16px]"
        >
          <option value="">Priority: All</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>
        <select
          value={sortBy}
          onChange={(e) => onSortByChange(e.target.value)}
          className="bg-surface-container-low border border-outline-variant rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent font-body-md text-body-md text-on-surface text-sm appearance-none pr-8 bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%23767586%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[position:right_8px_center] bg-[length:16px]"
        >
          <option value="due_date">Sort by: Due Date</option>
          <option value="priority">Priority</option>
          <option value="created_at">Created</option>
        </select>
      </div>
      <button
        onClick={onAddTaskClick}
        className="bg-primary text-on-primary py-2 px-6 rounded-lg font-label-sm text-label-sm flex items-center justify-center gap-2 hover:bg-primary-container transition-all shadow-[0px_4px_12px_rgba(99,102,241,0.2)] whitespace-nowrap w-full sm:w-auto mt-md sm:mt-0"
      >
        <span className="material-symbols-outlined text-[18px]">add</span>
        Add Task
      </button>
    </div>
  );
}

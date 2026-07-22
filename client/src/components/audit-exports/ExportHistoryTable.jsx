import React, { useState } from "react";

export default function ExportHistoryTable({ history, searchQuery }) {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Filter history based on search query
  const filteredHistory = history.filter((item) => {
    const query = searchQuery.toLowerCase();
    return (
      item.job_id.toLowerCase().includes(query) ||
      item.status.toLowerCase().includes(query) ||
      (item.error_message && item.error_message.toLowerCase().includes(query))
    );
  });

  // Pagination calculations
  const totalItems = filteredHistory.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredHistory.slice(indexOfFirstItem, indexOfLastItem);

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const formatDate = (dateString) => {
    if (!dateString || dateString === "--") return "--";
    try {
      const date = new Date(dateString);
      return date.toISOString().replace("T", " ").substring(0, 19);
    } catch (e) {
      return dateString;
    }
  };

  return (
    <div className="glass-panel rounded-xl overflow-hidden flex flex-col">
      <div className="px-6 py-4 border-b border-[#334155] bg-[#1E293B] flex justify-between items-center">
        <h3 className="font-title-lg text-lg font-medium text-on-surface">
          Job History
        </h3>
        <div className="flex gap-2">
          <button className="text-on-surface-variant hover:text-on-surface p-1 rounded transition-colors">
            <span className="material-symbols-outlined">filter_list</span>
          </button>
          <button className="text-on-surface-variant hover:text-on-surface p-1 rounded transition-colors">
            <span className="material-symbols-outlined">more_vert</span>
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#1E293B] border-b border-[#334155] font-label-md text-xs text-on-surface-variant uppercase tracking-wider">
              <th className="px-6 py-3 font-medium">Job ID</th>
              <th className="px-6 py-3 font-medium">Started At (UTC)</th>
              <th className="px-6 py-3 font-medium">Status</th>
              <th className="px-6 py-3 font-medium">Details / Error</th>
              <th className="px-6 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="font-body-md text-sm text-on-surface divide-y divide-[#334155]">
            {currentItems.length === 0 ? (
              <tr>
                <td
                  colSpan="5"
                  className="px-6 py-8 text-center text-on-surface-variant"
                >
                  No export jobs found.
                </td>
              </tr>
            ) : (
              currentItems.map((item) => (
                <tr
                  key={item.job_id}
                  className="hover:bg-[#334155]/30 transition-colors group cursor-default"
                >
                  <td className="px-6 py-4 font-code text-xs text-secondary group-hover:text-primary transition-colors">
                    {item.job_id.substring(0, 13)}...
                  </td>
                  <td className="px-6 py-4 font-code text-xs text-on-surface-variant">
                    {formatDate(item.started_at)}
                  </td>
                  <td className="px-6 py-4">
                    {item.status === "SUCCESS" ? (
                      <span className="bg-primary/10 border border-primary text-primary px-2 py-0.5 rounded text-xs font-medium flex items-center gap-1 w-max">
                        <span className="material-symbols-outlined text-[14px]">
                          check_circle
                        </span>{" "}
                        SUCCESS
                      </span>
                    ) : item.status === "FAILED" ? (
                      <span className="bg-error/10 border border-error text-error px-2 py-0.5 rounded text-xs font-medium flex items-center gap-1 w-max">
                        <span className="material-symbols-outlined text-[14px]">
                          error
                        </span>{" "}
                        FAILED
                      </span>
                    ) : (
                      <span className="bg-secondary-container/30 border border-secondary text-secondary px-2 py-0.5 rounded text-xs font-medium flex items-center gap-1 w-max animate-pulse">
                        <span className="material-symbols-outlined text-[14px] animate-spin">
                          sync
                        </span>{" "}
                        IN_PROGRESS
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-on-surface-variant truncate max-w-[250px]">
                    {item.status === "FAILED" ? (
                      <span className="text-error">
                        {item.error_message || "Unknown error"}
                      </span>
                    ) : (
                      "Uploaded successfully."
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {item.status === "SUCCESS" ? (
                      <button
                        className="text-on-surface-variant hover:text-primary transition-colors"
                        title="Download Export"
                      >
                        <span className="material-symbols-outlined text-[20px]">
                          download
                        </span>
                      </button>
                    ) : (
                      <button
                        className="text-on-surface-variant hover:text-primary transition-colors"
                        title="View Logs"
                      >
                        <span className="material-symbols-outlined text-[20px]">
                          visibility
                        </span>
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {/* Pagination */}
      <div className="px-6 py-4 border-t border-[#334155] bg-[#1E293B] flex justify-between items-center">
        <span className="font-body-md text-sm text-on-surface-variant">
          Showing {totalItems === 0 ? 0 : indexOfFirstItem + 1}-
          {Math.min(indexOfLastItem, totalItems)} of {totalItems} entries
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevPage}
            disabled={currentPage === 1}
            className="w-8 h-8 flex items-center justify-center rounded border border-[#334155] text-on-surface-variant hover:border-primary hover:text-primary transition-colors disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-[18px]">
              chevron_left
            </span>
          </button>
          <button
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            className="w-8 h-8 flex items-center justify-center rounded border border-[#334155] text-on-surface-variant hover:border-primary hover:text-primary transition-colors disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-[18px]">
              chevron_right
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}


import React from 'react';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const pageNumbers = [];
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i);
  }

  return (
    <div className="mt-12 flex items-center justify-center">
      <nav className="flex items-center gap-1 bg-surface-container-low p-1 rounded-xl">
        <button 
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="w-10 h-10 flex items-center justify-center text-outline hover:bg-surface-variant rounded-lg transition-colors disabled:opacity-50">
          <span className="material-symbols-outlined" data-icon="chevron_left">chevron_left</span>
        </button>
        {pageNumbers.map(number => (
          <button 
            key={number} 
            onClick={() => onPageChange(number)}
            className={`w-10 h-10 flex items-center justify-center rounded-lg font-label-md transition-colors ${currentPage === number ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:bg-surface-variant'}`}>
            {number}
          </button>
        ))}
        <button 
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="w-10 h-10 flex items-center justify-center text-outline hover:bg-surface-variant rounded-lg transition-colors disabled:opacity-50">
          <span className="material-symbols-outlined" data-icon="chevron_right">chevron_right</span>
        </button>
      </nav>
    </div>
  );
};

export default Pagination;

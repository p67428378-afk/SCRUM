import React from 'react';

const Header = () => {
  return (
    <nav className="bg-white border-b border-gray-200 w-full">
      <div className="flex justify-between items-center px-6 py-4 max-w-7xl mx-auto">
        <div className="text-xl font-bold text-blue-600">Simple Todo App</div>
        <div className="flex items-center gap-4">
          <a href="#" className="text-blue-600 border-b-2 border-blue-600 pb-1 font-semibold text-sm">Dashboard</a>
          <a href="#" className="text-gray-500 hover:text-blue-600 transition-colors duration-200 font-semibold text-sm">Calendar</a>
          <a href="#" className="text-gray-500 hover:text-blue-600 transition-colors duration-200 font-semibold text-sm">Projects</a>
        </div>
      </div>
    </nav>
  );
};

export default Header;

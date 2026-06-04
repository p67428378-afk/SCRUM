
import React from 'react';

const Button = ({ children, onClick, className, icon }) => {
  return (
    <button
      onClick={onClick}
      className={`bg-primary text-on-primary py-3 rounded-xl font-label-md flex items-center justify-center gap-2 hover:opacity-90 transition-opacity ${className}`}>
      {icon && <span className="material-symbols-outlined" data-icon={icon}>{icon}</span>}
      {children}
    </button>
  );
};

export default Button;

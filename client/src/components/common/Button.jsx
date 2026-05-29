
import React from 'react';

const Button = ({ children, onClick, type = 'button', className = '' }) => {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`bg-primary text-white px-xl py-3 rounded-lg font-label-md text-label-md hover:brightness-110 active:scale-95 transition-all shadow-md ${className}`}>
      {children}
    </button>
  );
};

export default Button;

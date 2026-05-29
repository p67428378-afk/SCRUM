
import React from 'react';

const Input = ({ label, id, name, type, value, onChange, required = false, autoComplete = 'off', placeholder = '' }) => {
  return (
    <div>
      <label htmlFor={id} className='block text-sm font-medium text-gray-700'>
        {label}
      </label>
      <div className='mt-1'>
        <input
          id={id}
          name={name}
          type={type}
          autoComplete={autoComplete}
          required={required}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className='w-full px-4 py-3 bg-surface-container-low border border-outline-variant rounded-lg focus:outline-none focus:border-primary font-body-md text-body-md'
        />
      </div>
    </div>
  );
};

export default Input;


import React from 'react';

const ErrorMessage = ({ message }) => {
  return (
    <div className='bg-error-container text-on-error-container p-4 rounded-lg'>
      <p>{message}</p>
    </div>
  );
};

export default ErrorMessage;

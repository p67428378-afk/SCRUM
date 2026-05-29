
import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage = () => {
  return (
    <div className='min-h-screen flex flex-col items-center justify-center bg-gray-100'>
      <h1 className='text-6xl font-bold text-primary mb-4'>404</h1>
      <h2 className='text-2xl font-semibold mb-8'>Page Not Found</h2>
      <p className='text-gray-600 mb-8'>Sorry, the page you are looking for does not exist.</p>
      <Link to='/'>
        <button className='bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700'>
          Go to Homepage
        </button>
      </Link>
    </div>
  );
};

export default NotFoundPage;

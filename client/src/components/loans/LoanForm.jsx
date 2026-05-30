import React, { useState } from 'react';
import { lendBook } from '../../services/api';
import { useNavigate } from 'react-router-dom';

const LoanForm = () => {
  const [bookId, setBookId] = useState('');
  const [patronId, setPatronId] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await lendBook({ book_id: bookId, patron_id: patronId });
      navigate('/loans');
    } catch (error) {
      console.error('Error lending book:', error);
    }
  };

  return (
    <div className='bg-surface-container-lowest border border-outline-variant rounded-xl p-lg shadow-[0px_1px_3px_rgba(0,0,0,0.1)]'>
      <h2 className='text-headline-sm font-headline-sm text-on-surface mb-lg'>Lend Book</h2>
      <form onSubmit={handleSubmit} className='space-y-md'>
        <div>
          <label htmlFor='bookId' className='block text-label-md font-medium text-on-surface-variant mb-xs'>Book ID</label>
          <input type='text' id='bookId' value={bookId} onChange={(e) => setBookId(e.target.value)} className='w-full px-md py-sm border border-outline-variant rounded-lg' required />
        </div>
        <div>
          <label htmlFor='patronId' className='block text-label-md font-medium text-on-surface-variant mb-xs'>Patron ID</label>
          <input type='text' id='patronId' value={patronId} onChange={(e) => setPatronId(e.target.value)} className='w-full px-md py-sm border border-outline-variant rounded-lg' required />
        </div>
        <button type='submit' className='bg-primary text-on-primary px-lg py-md rounded-lg font-label-md hover:opacity-90 transition-all'>Lend Book</button>
      </form>
    </div>
  );
};

export default LoanForm;

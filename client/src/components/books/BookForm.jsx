import React, { useState } from 'react';
import { addBook } from '../../services/api';
import { useNavigate } from 'react-router-dom';

const BookForm = () => {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [isbn, setIsbn] = useState('');
  const [publicationYear, setPublicationYear] = useState('');
  const [genre, setGenre] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addBook({ title, author, isbn, publication_year: parseInt(publicationYear), genre });
      navigate('/books');
    } catch (error) {
      console.error('Error adding book:', error);
    }
  };

  return (
    <div className='bg-surface-container-lowest border border-outline-variant rounded-xl p-lg shadow-[0px_1px_3px_rgba(0,0,0,0.1)]'>
      <h2 className='text-headline-sm font-headline-sm text-on-surface mb-lg'>Add New Book</h2>
      <form onSubmit={handleSubmit} className='space-y-md'>
        <div>
          <label htmlFor='title' className='block text-label-md font-medium text-on-surface-variant mb-xs'>Title</label>
          <input type='text' id='title' value={title} onChange={(e) => setTitle(e.target.value)} className='w-full px-md py-sm border border-outline-variant rounded-lg' required />
        </div>
        <div>
          <label htmlFor='author' className='block text-label-md font-medium text-on-surface-variant mb-xs'>Author</label>
          <input type='text' id='author' value={author} onChange={(e) => setAuthor(e.target.value)} className='w-full px-md py-sm border border-outline-variant rounded-lg' required />
        </div>
        <div>
          <label htmlFor='isbn' className='block text-label-md font-medium text-on-surface-variant mb-xs'>ISBN</label>
          <input type='text' id='isbn' value={isbn} onChange={(e) => setIsbn(e.target.value)} className='w-full px-md py-sm border border-outline-variant rounded-lg' required />
        </div>
        <div>
          <label htmlFor='publicationYear' className='block text-label-md font-medium text-on-surface-variant mb-xs'>Publication Year</label>
          <input type='number' id='publicationYear' value={publicationYear} onChange={(e) => setPublicationYear(e.target.value)} className='w-full px-md py-sm border border-outline-variant rounded-lg' required />
        </div>
        <div>
          <label htmlFor='genre' className='block text-label-md font-medium text-on-surface-variant mb-xs'>Genre</label>
          <input type='text' id='genre' value={genre} onChange={(e) => setGenre(e.target.value)} className='w-full px-md py-sm border border-outline-variant rounded-lg' />
        </div>
        <button type='submit' className='bg-primary text-on-primary px-lg py-md rounded-lg font-label-md hover:opacity-90 transition-all'>Add Book</button>
      </form>
    </div>
  );
};

export default BookForm;

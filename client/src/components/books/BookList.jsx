import React, { useState, useEffect } from 'react';
import { getBooks } from '../../services/api';

const BookList = () => {
  const [books, setBooks] = useState([]);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const response = await getBooks();
        setBooks(response.data);
      } catch (error) {
        console.error('Error fetching books:', error);
      }
    };
    fetchBooks();
  }, []);

  return (
    <div className='bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-[0px_1px_3px_rgba(0,0,0,0.1)]'>
      <div className='p-lg border-b border-outline-variant flex justify-between items-center'>
        <h2 className='text-headline-sm font-headline-sm text-on-surface'>Books</h2>
        <a href="/add-book" className='bg-primary text-on-primary px-lg py-md rounded-lg font-label-md hover:opacity-90 transition-all flex items-center gap-sm'>
          <span className='material-symbols-outlined' data-icon='add'>add</span>
          Add Book
        </a>
      </div>
      <div className='overflow-x-auto'>
        <table className='w-full text-left border-collapse'>
          <thead>
            <tr className='bg-surface-container text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider'>
              <th className='px-lg py-md font-semibold'>Title</th>
              <th className='px-lg py-md font-semibold'>Author</th>
              <th className='px-lg py-md font-semibold'>ISBN</th>
              <th className='px-lg py-md font-semibold'>Publication Year</th>
              <th className='px-lg py-md font-semibold'>Genre</th>
              <th className='px-lg py-md font-semibold'>Available</th>
            </tr>
          </thead>
          <tbody className='divide-y divide-outline-variant'>
            {books.map((book) => (
              <tr key={book.book_id} className='hover:bg-surface-container-low transition-colors group'>
                <td className='px-lg py-md'>{book.title}</td>
                <td className='px-lg py-md'>{book.author}</td>
                <td className='px-lg py-md'>{book.isbn}</td>
                <td className='px-lg py-md'>{book.publication_year}</td>
                <td className='px-lg py-md'>{book.genre}</td>
                <td className='px-lg py-md'>{book.is_available ? 'Yes' : 'No'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BookList;

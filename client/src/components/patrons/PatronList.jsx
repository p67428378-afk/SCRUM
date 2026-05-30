import React, { useState, useEffect } from 'react';
import { getPatrons } from '../../services/api';

const PatronList = () => {
  const [patrons, setPatrons] = useState([]);

  useEffect(() => {
    const fetchPatrons = async () => {
      try {
        const response = await getPatrons();
        setPatrons(response.data);
      } catch (error) {
        console.error('Error fetching patrons:', error);
      }
    };
    fetchPatrons();
  }, []);

  return (
    <div className='bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-[0px_1px_3px_rgba(0,0,0,0.1)]'>
      <div className='p-lg border-b border-outline-variant flex justify-between items-center'>
        <h2 className='text-headline-sm font-headline-sm text-on-surface'>Patrons</h2>
        <a href="/add-patron" className='bg-primary text-on-primary px-lg py-md rounded-lg font-label-md hover:opacity-90 transition-all flex items-center gap-sm'>
          <span className='material-symbols-outlined' data-icon='add'>add</span>
          Add Patron
        </a>
      </div>
      <div className='overflow-x-auto'>
        <table className='w-full text-left border-collapse'>
          <thead>
            <tr className='bg-surface-container text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider'>
              <th className='px-lg py-md font-semibold'>Name</th>
              <th className='px-lg py-md font-semibold'>Contact Info</th>
            </tr>
          </thead>
          <tbody className='divide-y divide-outline-variant'>
            {patrons.map((patron) => (
              <tr key={patron.patron_id} className='hover:bg-surface-container-low transition-colors group'>
                <td className='px-lg py-md'>{patron.name}</td>
                <td className='px-lg py-md'>{patron.contact_info}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PatronList;

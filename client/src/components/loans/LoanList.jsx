import React, { useState, useEffect } from 'react';
import { getLoans } from '../../services/api'; // Assuming getLoans exists in api.js

const LoanList = () => {
  const [loans, setLoans] = useState([]);

  useEffect(() => {
    const fetchLoans = async () => {
      try {
        // Replace with actual API call
        // const response = await getLoans(); 
        // setLoans(response.data);
        setLoans([]); // Mock data for now
      } catch (error) {
        console.error('Error fetching loans:', error);
      }
    };
    fetchLoans();
  }, []);

  return (
    <div className='bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-[0px_1px_3px_rgba(0,0,0,0.1)]'>
      <div className='p-lg border-b border-outline-variant flex justify-between items-center'>
        <h2 className='text-headline-sm font-headline-sm text-on-surface'>Loans</h2>
        <a href="/add-loan" className='bg-primary text-on-primary px-lg py-md rounded-lg font-label-md hover:opacity-90 transition-all flex items-center gap-sm'>
          <span className='material-symbols-outlined' data-icon='add'>add</span>
          Add Loan
        </a>
      </div>
      <div className='overflow-x-auto'>
        <table className='w-full text-left border-collapse'>
          <thead>
            <tr className='bg-surface-container text-label-sm font-label-sm text-on-surface-variant uppercase tracking-wider'>
              <th className='px-lg py-md font-semibold'>Book ID</th>
              <th className='px-lg py-md font-semibold'>Patron ID</th>
              <th className='px-lg py-md font-semibold'>Loan Date</th>
              <th className='px-lg py-md font-semibold'>Return Date</th>
            </tr>
          </thead>
          <tbody className='divide-y divide-outline-variant'>
            {loans.map((loan) => (
              <tr key={loan.loan_id} className='hover:bg-surface-container-low transition-colors group'>
                <td className='px-lg py-md'>{loan.book_id}</td>
                <td className='px-lg py-md'>{loan.patron_id}</td>
                <td className='px-lg py-md'>{loan.loan_date}</td>
                <td className='px-lg py-md'>{loan.return_date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LoanList;

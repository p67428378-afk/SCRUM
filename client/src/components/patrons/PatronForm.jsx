import React, { useState } from 'react';
import { addPatron } from '../../services/api';
import { useNavigate } from 'react-router-dom';

const PatronForm = () => {
  const [name, setName] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addPatron({ name, contact_info: contactInfo });
      navigate('/patrons');
    } catch (error) {
      console.error('Error adding patron:', error);
    }
  };

  return (
    <div className='bg-surface-container-lowest border border-outline-variant rounded-xl p-lg shadow-[0px_1px_3px_rgba(0,0,0,0.1)]'>
      <h2 className='text-headline-sm font-headline-sm text-on-surface mb-lg'>Add New Patron</h2>
      <form onSubmit={handleSubmit} className='space-y-md'>
        <div>
          <label htmlFor='name' className='block text-label-md font-medium text-on-surface-variant mb-xs'>Name</label>
          <input type='text' id='name' value={name} onChange={(e) => setName(e.target.value)} className='w-full px-md py-sm border border-outline-variant rounded-lg' required />
        </div>
        <div>
          <label htmlFor='contactInfo' className='block text-label-md font-medium text-on-surface-variant mb-xs'>Contact Info</label>
          <input type='text' id='contactInfo' value={contactInfo} onChange={(e) => setContactInfo(e.target.value)} className='w-full px-md py-sm border border-outline-variant rounded-lg' required />
        </div>
        <button type='submit' className='bg-primary text-on-primary px-lg py-md rounded-lg font-label-md hover:opacity-90 transition-all'>Add Patron</button>
      </form>
    </div>
  );
};

export default PatronForm;

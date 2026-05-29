
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createBooking } from '../../services/api';
import Button from '../common/Button';
import Input from '../common/Input';
import ErrorMessage from '../common/ErrorMessage';

const RentalForm = ({ carId }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ 
    pickup_location_id: '', 
    start_date: '', 
    end_date: '' 
  });
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const bookingData = { 
        ...formData, 
        car_id: carId, 
        renter_id: 'c8a9a3b4-2f0e-4b1a-9b0a-2b0c3e1f4d8e' // Hardcoded for now
      };
      const response = await createBooking(bookingData);
      navigate(`/booking/${response.rental_id}`);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create booking.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className='p-6 bg-gray-50 rounded-lg shadow-inner'>
      <h3 className='text-xl font-semibold mb-4'>Book this Car</h3>
      {error && <ErrorMessage message={error} />}
      <div className='space-y-4'>
        <Input
          label='Pickup Location'
          id='pickup_location_id'
          name='pickup_location_id'
          type='text'
          required
          value={formData.pickup_location_id}
          onChange={handleChange}
          placeholder='Enter a pickup location'
        />
        <div className='grid grid-cols-2 gap-4'>
          <Input
            label='Start Date'
            id='start_date'
            name='start_date'
            type='date'
            required
            value={formData.start_date}
            onChange={handleChange}
          />
          <Input
            label='End Date'
            id='end_date'
            name='end_date'
            type='date'
            required
            value={formData.end_date}
            onChange={handleChange}
          />
        </div>
        <Button type='submit' className='w-full'>
          Request to Book
        </Button>
      </div>
    </form>
  );
};

export default RentalForm;

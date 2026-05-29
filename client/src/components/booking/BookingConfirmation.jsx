
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getBookingConfirmation } from '../../services/api';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorMessage from '../common/ErrorMessage';

const BookingConfirmation = () => {
  const { rental_id } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const data = await getBookingConfirmation(rental_id);
        setBooking(data);
      } catch (err) {
        setError('Failed to fetch booking details.');
      }
      setLoading(false);
    };

    fetchBooking();
  }, [rental_id]);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;
  if (!booking) return <p>No booking found.</p>;

  return (
    <div className='bg-white p-8 rounded-xl shadow-lg max-w-2xl mx-auto my-12'>
      <h2 className='text-3xl font-bold text-center text-primary mb-6'>Booking Confirmed!</h2>
      <div className='space-y-4'>
        <div className='flex justify-between'>
          <span className='font-semibold text-gray-600'>Rental ID:</span>
          <span className='font-mono text-gray-800'>{booking.rental_id}</span>
        </div>
        <div className='flex justify-between'>
          <span className='font-semibold text-gray-600'>Car ID:</span>
          <span className='font-mono text-gray-800'>{booking.car_id}</span>
        </div>
        <div className='flex justify-between'>
          <span className='font-semibold text-gray-600'>Pickup Location:</span>
          <span className='text-gray-800'>{booking.pickup_location_id}</span>
        </div>
        <div className='flex justify-between'>
          <span className='font-semibold text-gray-600'>Start Date:</span>
          <span className='text-gray-800'>{new Date(booking.start_date).toLocaleDateString()}</span>
        </div>
        <div className='flex justify-between'>
          <span className='font-semibold text-gray-600'>End Date:</span>
          <span className='text-gray-800'>{new Date(booking.end_date).toLocaleDateString()}</span>
        </div>
        <div className='border-t pt-4 mt-4 flex justify-between items-center'>
          <span className='text-xl font-bold text-gray-800'>Total Price:</span>
          <span className='text-xl font-bold text-secondary'>${booking.total_price.toFixed(2)}</span>
        </div>
        <div className='flex justify-between'>
          <span className='font-semibold text-gray-600'>Payment Status:</span>
          <span className={`font-bold ${booking.payment_status === 'Paid' ? 'text-green-600' : 'text-red-600'}`}>
            {booking.payment_status}
          </span>
        </div>
        <div className='flex justify-between'>
          <span className='font-semibold text-gray-600'>Rental Status:</span>
          <span className='font-semibold text-blue-600'>{booking.rental_status}</span>
        </div>
      </div>
      <div className='mt-8 text-center'>
        <p className='text-gray-600'>Thank you for your booking. You can manage your rental and chat with the owner from the 'My Rentals' page.</p>
      </div>
    </div>
  );
};

export default BookingConfirmation;

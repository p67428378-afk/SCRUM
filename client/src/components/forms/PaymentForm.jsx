
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { processPayment } from '../../services/api';
import Button from '../common/Button';
import Input from '../common/Input';
import ErrorMessage from '../common/ErrorMessage';

const PaymentForm = ({ rentalId, amount }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ payment_token: '' });
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const paymentData = { 
        ...formData, 
        rental_id: rentalId, 
        amount 
      };
      await processPayment(paymentData);
      navigate(`/booking/${rentalId}`);
    } catch (err) {
      setError(err.response?.data?.detail || 'Payment failed.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className='p-6 bg-gray-50 rounded-lg shadow-inner'>
      <h3 className='text-xl font-semibold mb-4'>Complete Your Payment</h3>
      {error && <ErrorMessage message={error} />}
      <div className='space-y-4'>
        <p className='text-lg font-semibold'>Total Amount: ${amount.toFixed(2)}</p>
        <Input
          label='Card Number (use dummy token)'
          id='payment_token'
          name='payment_token'
          type='text'
          required
          value={formData.payment_token}
          onChange={handleChange}
          placeholder='tok_visa'
        />
        <Button type='submit' className='w-full'>
          Pay Now
        </Button>
      </div>
    </form>
  );
};

export default PaymentForm;

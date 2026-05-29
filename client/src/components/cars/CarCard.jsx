
import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../common/Button';

const CarCard = ({ car }) => {
  const { car_id, make, model, year, daily_rate, status, image_urls } = car;

  const getStatusBadge = () => {
    switch (status.toLowerCase()) {
      case 'available':
        return (
          <div className='absolute top-4 right-4 bg-on-secondary-container/90 backdrop-blur-md px-3 py-1 rounded-full flex items-center gap-1'>
            <div className='w-2 h-2 rounded-full bg-secondary'></div>
            <span className='text-[10px] font-bold text-secondary uppercase tracking-wider'>Available</span>
          </div>
        );
      case 'rented':
        return (
          <div className='absolute top-4 right-4 bg-tertiary-container/90 backdrop-blur-md px-3 py-1 rounded-full flex items-center gap-1'>
            <div className='w-2 h-2 rounded-full bg-tertiary'></div>
            <span className='text-[10px] font-bold text-tertiary-fixed-dim uppercase tracking-wider'>Rented</span>
          </div>
        );
      case 'maintenance':
        return (
          <div className='absolute top-4 right-4 bg-error-container/90 backdrop-blur-md px-3 py-1 rounded-full flex items-center gap-1'>
            <div className='w-2 h-2 rounded-full bg-error'></div>
            <span className='text-[10px] font-bold text-error uppercase tracking-wider'>Maintenance</span>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className='bg-white rounded-xl border border-outline-variant overflow-hidden shadow-md hover:shadow-lg transition-shadow group'>
      <div className='h-48 overflow-hidden relative'>
        <img 
          alt={`${make} ${model}`}
          className='w-full h-full object-cover group-hover:scale-105 transition-transform duration-500' 
          src={image_urls[0] || 'https://via.placeholder.com/400x200'} 
        />
        {getStatusBadge()}
      </div>
      <div className='p-md space-y-md'>
        <div className='flex justify-between items-start'>
          <div>
            <h3 className='font-headline-sm text-headline-sm text-on-surface'>{`${make} ${model} ${year}`}</h3>
            <p className='text-on-surface-variant font-body-sm text-body-sm'>Sedan • Hybrid • Automatic</p>
          </div>
          <p className='font-headline-sm text-headline-sm text-secondary'>${daily_rate}/day</p>
        </div>
        <Link to={`/cars/${car_id}`}>
          <Button className='w-full'>
            View Details
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default CarCard;


import React, { useState, useEffect } from 'react';
import { getAvailableCars } from '../../services/api';
import CarCard from './CarCard';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorMessage from '../common/ErrorMessage';

const CarList = () => {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({ search: '', status: '', price: '' });

  useEffect(() => {
    const fetchCars = async () => {
      try {
        const data = await getAvailableCars();
        setCars(data.cars);
      } catch (err) {
        setError('Failed to fetch cars.');
      }
      setLoading(false);
    };

    fetchCars();
  }, []);

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const filteredCars = cars.filter(car => {
    return (
      (filters.search === '' || car.make.toLowerCase().includes(filters.search.toLowerCase()) || car.model.toLowerCase().includes(filters.search.toLowerCase())) &&
      (filters.status === '' || car.status.toLowerCase() === filters.status.toLowerCase()) &&
      (filters.price === '' || 
        (filters.price === '0-50' && car.daily_rate <= 50) ||
        (filters.price === '50-100' && car.daily_rate > 50 && car.daily_rate <= 100) ||
        (filters.price === '100+' && car.daily_rate > 100))
    );
  });

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div>
      <header className='py-xl'>
        <div className='flex flex-col gap-lg'>
          <h1 className='font-display-lg text-display-lg text-on-surface'>Find Your Perfect Drive</h1>
          <div className='bg-white p-md rounded-xl border border-outline-variant shadow-sm flex flex-wrap items-center gap-md'>
            <div className='flex-grow min-w-[300px] relative'>
              <span className='material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline'>search</span>
              <input className='w-full pl-12 pr-4 py-3 bg-surface-container-low border border-outline-variant rounded-lg focus:outline-none focus:border-primary font-body-md text-body-md' placeholder='Search by make, model...' type='text' name='search' value={filters.search} onChange={handleFilterChange} />
            </div>
            <div className='relative min-w-[180px]'>
              <select className='w-full appearance-none bg-surface-container-low border border-outline-variant rounded-lg px-4 py-3 font-body-md text-body-md focus:outline-none focus:border-primary pr-10 cursor-pointer' name='status' value={filters.status} onChange={handleFilterChange}>
                <option value=''>Availability Status</option>
                <option value='available'>Available</option>
                <option value='rented'>Rented</option>
                <option value='maintenance'>Maintenance</option>
              </select>
              <span className='material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-outline pointer-events-none'>expand_more</span>
            </div>
            <div className='relative min-w-[180px]'>
              <select className='w-full appearance-none bg-surface-container-low border border-outline-variant rounded-lg px-4 py-3 font-body-md text-body-md focus:outline-none focus:border-primary pr-10 cursor-pointer' name='price' value={filters.price} onChange={handleFilterChange}>
                <option value=''>Price Range</option>
                <option value='0-50'>$0-50</option>
                <option value='50-100'>$50-100</option>
                <option value='100+'>$100+</option>
              </select>
              <span className='material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-outline pointer-events-none'>expand_more</span>
            </div>
          </div>
        </div>
      </header>
      <section className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-lg'>
        {filteredCars.map(car => (
          <CarCard key={car.car_id} car={car} />
        ))}
      </section>
    </div>
  );
};

export default CarList;


import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getCarDetails } from '../../services/api';
import CarImageCarousel from './CarImageCarousel';
import RentalForm from '../forms/RentalForm';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorMessage from '../common/ErrorMessage';

const CarDetailsSection = () => {
  const { car_id } = useParams();
  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCarDetails = async () => {
      try {
        const data = await getCarDetails(car_id);
        setCar(data);
      } catch (err) {
        setError('Failed to fetch car details.');
      }
      setLoading(false);
    };

    fetchCarDetails();
  }, [car_id]);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;
  if (!car) return <p>Car not found.</p>;

  return (
    <div className='container mx-auto py-12'>
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-12'>
        <div>
          <CarImageCarousel images={car.image_urls} />
        </div>
        <div>
          <h1 className='text-4xl font-bold mb-2'>{`${car.make} ${car.model} (${car.year})`}</h1>
          <p className='text-2xl font-semibold text-primary mb-6'>${car.daily_rate}/day</p>
          
          <div className='mb-6'>
            <h3 className='text-xl font-semibold mb-2'>Description</h3>
            <p className='text-gray-600'>{car.description}</p>
          </div>

          <div className='mb-6'>
            <h3 className='text-xl font-semibold mb-2'>Specifications</h3>
            <ul className='list-disc list-inside text-gray-600'>
              <li>VIN: {car.vin}</li>
              <li>License Plate: {car.license_plate}</li>
              <li>Status: <span className='font-semibold'>{car.status}</span></li>
            </ul>
          </div>

          <RentalForm carId={car.car_id} />
        </div>
      </div>
    </div>
  );
};

export default CarDetailsSection;

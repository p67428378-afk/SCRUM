
import React from 'react';
import Header from '../components/common/Header';
import Sidebar from '../components/common/Sidebar';
import CarDetailsSection from '../components/cars/CarDetailsSection';

const CarDetailPage = () => {
  return (
    <div className='relative min-h-screen bg-background'>
      <Header />
      <Sidebar />
      <main className='ml-[240px] pt-[64px] min-h-screen px-lg pb-xl'>
        <CarDetailsSection />
      </main>
    </div>
  );
};

export default CarDetailPage;

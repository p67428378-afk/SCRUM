
import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const CarImageCarousel = ({ images }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const goToPrevious = () => {
    const isFirstImage = currentIndex === 0;
    const newIndex = isFirstImage ? images.length - 1 : currentIndex - 1;
    setCurrentIndex(newIndex);
  };

  const goToNext = () => {
    const isLastImage = currentIndex === images.length - 1;
    const newIndex = isLastImage ? 0 : currentIndex + 1;
    setCurrentIndex(newIndex);
  };

  return (
    <div className='relative w-full h-96'>
      <div className='w-full h-full rounded-lg overflow-hidden'>
        <img src={images[currentIndex]} alt='Car' className='w-full h-full object-cover' />
      </div>
      <div className='absolute top-1/2 left-4 transform -translate-y-1/2'>
        <button onClick={goToPrevious} className='bg-black bg-opacity-50 text-white p-2 rounded-full'>
          <ChevronLeft size={24} />
        </button>
      </div>
      <div className='absolute top-1/2 right-4 transform -translate-y-1/2'>
        <button onClick={goToNext} className='bg-black bg-opacity-50 text-white p-2 rounded-full'>
          <ChevronRight size={24} />
        </button>
      </div>
      <div className='absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2'>
        {images.map((_, index) => (
          <div
            key={index}
            className={`w-2 h-2 rounded-full ${currentIndex === index ? 'bg-white' : 'bg-gray-400'}`}
          ></div>
        ))}
      </div>
    </div>
  );
};

export default CarImageCarousel;

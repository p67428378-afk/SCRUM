
import React from 'react';

const ChatHeader = ({ partnerName }) => {
  return (
    <div className='p-4 border-b flex items-center'>
      <img src={`https://i.pravatar.cc/40?u=${partnerName}`} alt={partnerName} className='w-10 h-10 rounded-full mr-4' />
      <h2 className='text-xl font-semibold'>{partnerName}</h2>
    </div>
  );
};

export default ChatHeader;


import React, { useState } from 'react';
import { Send } from 'lucide-react';

const MessageInput = ({ onSendMessage }) => {
  const [message, setMessage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() !== '') {
      onSendMessage(message);
      setMessage('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className='p-4 border-t flex items-center'>
      <input
        type='text'
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder='Type a message...'
        className='flex-grow px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-primary'
      />
      <button type='submit' className='ml-4 p-2 bg-primary text-white rounded-full hover:bg-blue-700'>
        <Send size={20} />
      </button>
    </form>
  );
};

export default MessageInput;

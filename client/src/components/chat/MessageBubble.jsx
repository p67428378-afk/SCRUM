
import React from 'react';

const MessageBubble = ({ message, isSender }) => {
  const { content, timestamp } = message;

  return (
    <div className={`flex ${isSender ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`rounded-lg p-3 max-w-xs lg:max-w-md ${isSender ? 'bg-primary text-white' : 'bg-gray-200 text-gray-800'}`}>
        <p>{content}</p>
        <span className={`text-xs ${isSender ? 'text-blue-200' : 'text-gray-500'} mt-1 block`}>
          {new Date(timestamp).toLocaleTimeString()}
        </span>
      </div>
    </div>
  );
};

export default MessageBubble;


import React, { useRef, useEffect } from 'react';
import MessageBubble from './MessageBubble';

const MessageList = ({ messages, userId }) => {
  const endOfMessagesRef = useRef(null);

  const scrollToBottom = () => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages]);

  return (
    <div className='flex-grow p-4 overflow-y-auto'>
      {messages.map((msg) => (
        <MessageBubble key={msg.message_id} message={msg} isSender={msg.sender_id === userId} />
      ))}
      <div ref={endOfMessagesRef} />
    </div>
  );
};

export default MessageList;

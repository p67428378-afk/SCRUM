
import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import Header from '../components/common/Header';
import Sidebar from '../components/common/Sidebar';
import ChatHeader from '../components/chat/ChatHeader';
import MessageList from '../components/chat/MessageList';
import MessageInput from '../components/chat/MessageInput';

const ChatPage = () => {
  const { rental_id } = useParams();
  const [messages, setMessages] = useState([]);
  const [userId, setUserId] = useState('c8a9a3b4-2f0e-4b1a-9b0a-2b0c3e1f4d8e'); // Hardcoded for now
  const ws = useRef(null);

  useEffect(() => {
    ws.current = new WebSocket(`ws://localhost:8000/api/v1/chat/${rental_id}`);

    ws.current.onopen = () => console.log("ws opened");
    ws.current.onclose = () => console.log("ws closed");

    ws.current.onmessage = (e) => {
      const message = JSON.parse(e.data);
      setMessages((prevMessages) => [...prevMessages, message]);
    };

    return () => {
      ws.current.close();
    };
  }, [rental_id]);

  const sendMessage = (message) => {
    const messageData = {
      content: message,
      sender_id: userId,
      recipient_id: 'd9b9a3b4-2f0e-4b1a-9b0a-2b0c3e1f4d8f', // Hardcoded for now
      rental_id: rental_id,
      timestamp: new Date().toISOString()
    };
    ws.current.send(JSON.stringify(messageData));
    setMessages((prevMessages) => [...prevMessages, { ...messageData, message_id: Date.now() }]);
  };

  return (
    <div className='relative min-h-screen bg-background'>
      <Header />
      <Sidebar />
      <main className='ml-[240px] pt-[64px] h-screen flex flex-col'>
        <ChatHeader partnerName="Car Owner" />
        <MessageList messages={messages} userId={userId} />
        <MessageInput onSendMessage={sendMessage} />
      </main>
    </div>
  );
};

export default ChatPage;

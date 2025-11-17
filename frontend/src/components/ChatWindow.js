import React, { useRef, useEffect } from 'react';
import MessageList from './MessageList';
import MessageInput from './MessageInput';

const ChatWindow = ({ socket, username, messages, typingUsers, onLogout }) => {
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (message) => {
    if (socket && message.trim()) {
      socket.emit('sendMessage', {
        sender: username,
        message: message.trim()
      });
    }
  };

  const handleTyping = (isTyping) => {
    if (socket) {
      if (isTyping) {
        socket.emit('typing', { sender: username });
      } else {
        socket.emit('stopTyping');
      }
    }
  };

  return (
    <div className="flex flex-col h-screen max-h-screen bg-white md:rounded-lg md:shadow-2xl md:m-4 md:max-w-4xl md:mx-auto w-full overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-600 text-white p-4 shadow-md flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center font-bold text-lg">
            {username.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="font-semibold text-lg">Chat Room</h2>
            <p className="text-xs text-primary-100">Logged in as {username}</p>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="px-4 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg transition-all text-sm font-medium"
        >
          Logout
        </button>
      </div>

      {/* Typing Indicator */}
      {typingUsers.length > 0 && (
        <div className="bg-primary-50 px-4 py-2 text-sm text-gray-600 border-b">
          {typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
        </div>
      )}

      {/* Messages */}
      <MessageList messages={messages} currentUser={username} messagesEndRef={messagesEndRef} />

      {/* Input */}
      <MessageInput onSendMessage={handleSendMessage} onTyping={handleTyping} />
    </div>
  );
};

export default ChatWindow;



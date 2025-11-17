import React, { useRef, useEffect, useState } from 'react';
import MessageList from './MessageList';
import MessageInput from './MessageInput';

const ChatWindow = ({ socket, username, roomCode, roomCreator, messages, typingUsers, onLogout }) => {
  const messagesEndRef = useRef(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (message) => {
    if (socket && message.trim() && roomCode) {
      socket.emit('sendMessage', {
        roomCode: roomCode,
        sender: username,
        message: message.trim()
      });
    }
  };

  const handleTyping = (isTyping) => {
    if (socket && roomCode) {
      if (isTyping) {
        socket.emit('typing', { roomCode: roomCode, sender: username });
      } else {
        socket.emit('stopTyping', { roomCode: roomCode });
      }
    }
  };

  const handleDeleteRoom = async () => {
    if (!window.confirm('Are you sure you want to delete this room? All messages will be permanently deleted.')) {
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch(`${process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000'}/api/delete-room`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          roomCode: roomCode,
          creator: roomCreator
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert('Room deleted successfully');
        onLogout();
      } else {
        alert(data.message || 'Failed to delete room');
      }
    } catch (error) {
      console.error('Error deleting room:', error);
      alert('Failed to delete room. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const isCreator = username === roomCreator;

  return (
    <div className="flex flex-col h-screen max-h-screen bg-white md:rounded-lg md:shadow-2xl md:m-4 md:max-w-4xl md:mx-auto w-full overflow-hidden relative">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-600 text-white p-4 shadow-md flex justify-between items-center flex-shrink-0 z-10">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center font-bold text-lg">
            {username.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="font-semibold text-lg">Chat Room</h2>
            <p className="text-xs text-primary-100">Logged in as {username}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {isCreator && (
            <button
              onClick={handleDeleteRoom}
              disabled={isDeleting}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 disabled:bg-red-300 rounded-lg transition-all text-sm font-medium"
            >
              {isDeleting ? 'Deleting...' : 'Delete Room'}
            </button>
          )}
          <button
            onClick={onLogout}
            className="px-4 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg transition-all text-sm font-medium"
          >
            Logout
          </button>
        </div>
      </div>

      {/* Typing Indicator */}
      {typingUsers.length > 0 && (
        <div className="bg-primary-50 px-4 py-2 text-sm text-gray-600 border-b flex-shrink-0">
          {typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing...
        </div>
      )}

      {/* Messages Container - Only scrolls when content overflows */}
      <div className="flex-1 min-h-0 overflow-hidden pb-24 md:pb-0">
        <MessageList 
          messages={messages} 
          currentUser={username} 
          roomCode={roomCode}
          messagesEndRef={messagesEndRef}
          socket={socket}
        />
      </div>

      {/* Input - Fixed at bottom on mobile */}
      <MessageInput onSendMessage={handleSendMessage} onTyping={handleTyping} />
    </div>
  );
};

export default ChatWindow;



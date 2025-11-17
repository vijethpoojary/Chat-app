import React, { useState, useRef, useEffect } from 'react';

const MessageList = ({ messages, currentUser, roomCode, messagesEndRef, socket }) => {
  const [selectedMessages, setSelectedMessages] = useState([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [longPressTimer, setLongPressTimer] = useState(null);
  const touchStartRef = useRef(null);
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString();
    }
  };

  const groupMessagesByDate = (messages) => {
    const grouped = {};
    messages.forEach((msg) => {
      const date = new Date(msg.timestamp).toDateString();
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(msg);
    });
    return grouped;
  };

  const groupedMessages = groupMessagesByDate(messages);

  // Handle long press for mobile
  const handleTouchStart = (e, messageId) => {
    touchStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY, messageId };
    const timer = setTimeout(() => {
      setIsSelectionMode(true);
      setSelectedMessages([messageId]);
    }, 500); // 500ms long press
    setLongPressTimer(timer);
  };

  const handleTouchEnd = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
  };

  const handleTouchMove = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
  };

  const toggleMessageSelection = (messageId) => {
    if (!isSelectionMode) return;
    
    setSelectedMessages(prev => {
      if (prev.includes(messageId)) {
        return prev.filter(id => id !== messageId);
      } else {
        return [...prev, messageId];
      }
    });
  };

  const handleDeleteMessages = async () => {
    if (selectedMessages.length === 0) return;

    if (!window.confirm(`Delete ${selectedMessages.length} message(s)?`)) {
      return;
    }

    try {
      const response = await fetch(`${process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000'}/api/delete-messages`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          roomCode: roomCode,
          messageIds: selectedMessages
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Emit socket event to notify other users
        if (socket) {
          socket.emit('messagesDeleted', { roomCode, messageIds: selectedMessages });
          // Request updated messages
          socket.emit('requestMessages', { roomCode });
        }
        setSelectedMessages([]);
        setIsSelectionMode(false);
      } else {
        alert(data.message || 'Failed to delete messages');
      }
    } catch (error) {
      console.error('Error deleting messages:', error);
      alert('Failed to delete messages. Please try again.');
    }
  };

  const cancelSelection = () => {
    setSelectedMessages([]);
    setIsSelectionMode(false);
  };

  useEffect(() => {
    // Listen for deleted messages from socket
    if (socket) {
      const handleMessagesDeleted = (data) => {
        if (data.roomCode === roomCode.toUpperCase()) {
          // Request updated messages
          socket.emit('requestMessages', { roomCode });
        }
      };
      socket.on('messagesDeleted', handleMessagesDeleted);
      return () => socket.off('messagesDeleted', handleMessagesDeleted);
    }
  }, [socket, roomCode]);

  if (messages.length === 0) {
    return (
      <div className="flex-1 overflow-y-auto p-2 md:p-4 bg-gray-50 flex items-center justify-center">
        <div className="text-center text-gray-400">
          <p className="text-xl mb-2">👋</p>
          <p>No messages yet. Start the conversation!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-2 md:p-4 bg-gray-50">
      {/* Selection Mode Header */}
      {isSelectionMode && (
        <div className="sticky top-0 z-10 bg-primary-500 text-white p-3 mb-2 flex justify-between items-center shadow-md">
          <span className="font-semibold">{selectedMessages.length} selected</span>
          <div className="flex space-x-2">
            <button
              onClick={handleDeleteMessages}
              className="px-4 py-1 bg-red-500 hover:bg-red-600 rounded-lg text-sm font-medium"
            >
              Delete
            </button>
            <button
              onClick={cancelSelection}
              className="px-4 py-1 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg text-sm font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
      {Object.keys(groupedMessages).map((date, dateIndex) => (
        <div key={dateIndex}>
          {/* Date Separator */}
          <div className="flex items-center justify-center my-4">
            <div className="bg-white px-3 py-1 rounded-full text-xs text-gray-500 shadow-sm">
              {formatDate(groupedMessages[date][0].timestamp)}
            </div>
          </div>

          {/* Messages for this date */}
          {groupedMessages[date].map((message, msgIndex) => {
            const isCurrentUser = message.sender === currentUser;
            const isSelected = selectedMessages.includes(message._id);
            return (
              <div
                key={message._id || msgIndex}
                className={`flex mb-2 md:mb-4 ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                onTouchStart={(e) => handleTouchStart(e, message._id)}
                onTouchEnd={handleTouchEnd}
                onTouchMove={handleTouchMove}
                onClick={() => toggleMessageSelection(message._id)}
              >
                <div className={`max-w-[75%] md:max-w-[60%] ${isCurrentUser ? 'order-2' : 'order-1'} ${isSelected ? 'ring-2 ring-primary-500' : ''}`}>
                  {!isCurrentUser && (
                    <div className="text-xs text-gray-600 mb-1 px-2">
                      {message.sender}
                    </div>
                  )}
                  <div
                    className={`rounded-2xl px-3 py-1.5 md:px-4 md:py-2 shadow-sm ${
                      isCurrentUser
                        ? 'bg-primary-500 text-white rounded-tr-sm'
                        : 'bg-white text-gray-800 rounded-tl-sm border border-gray-200'
                    } ${isSelected ? 'opacity-70' : ''}`}
                  >
                    <p className="break-words whitespace-pre-wrap text-sm md:text-base">{message.message}</p>
                    <span
                      className={`text-xs mt-1 block ${
                        isCurrentUser ? 'text-primary-100' : 'text-gray-500'
                      }`}
                    >
                      {formatTime(message.timestamp)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;



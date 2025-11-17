import React from 'react';

const MessageList = ({ messages, currentUser, messagesEndRef }) => {
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

  if (messages.length === 0) {
    return (
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50 flex items-center justify-center">
        <div className="text-center text-gray-400">
          <p className="text-xl mb-2">👋</p>
          <p>No messages yet. Start the conversation!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
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
            return (
              <div
                key={message._id || msgIndex}
                className={`flex mb-4 ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[75%] md:max-w-[60%] ${isCurrentUser ? 'order-2' : 'order-1'}`}>
                  {!isCurrentUser && (
                    <div className="text-xs text-gray-600 mb-1 px-2">
                      {message.sender}
                    </div>
                  )}
                  <div
                    className={`rounded-2xl px-4 py-2 shadow-sm ${
                      isCurrentUser
                        ? 'bg-primary-500 text-white rounded-tr-sm'
                        : 'bg-white text-gray-800 rounded-tl-sm border border-gray-200'
                    }`}
                  >
                    <p className="break-words whitespace-pre-wrap">{message.message}</p>
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



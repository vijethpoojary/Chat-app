import React, { useState, useRef, useEffect } from 'react';

const MessageInput = ({ onSendMessage, onTyping }) => {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef(null);
  const textareaRef = useRef(null);

  const handleChange = (e) => {
    const value = e.target.value;
    setMessage(value);

    // Handle typing indicator
    if (value.trim() && !isTyping) {
      setIsTyping(true);
      onTyping(true);
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      onTyping(false);
      typingTimeoutRef.current = null;
    }, 1000);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (message.trim()) {
      const messageToSend = message.trim();
      
      // Clear message immediately but keep focus
      setMessage('');
      setIsTyping(false);
      onTyping(false);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        // Keep focus immediately to prevent keyboard from closing
        textareaRef.current.focus();
      }
      
      // Send message after a tiny delay to ensure focus is maintained
      setTimeout(() => {
        onSendMessage(messageToSend);
        // Ensure focus is still maintained after sending
        if (textareaRef.current) {
          textareaRef.current.focus();
        }
      }, 10);
    }
    
    // Prevent form from submitting (which would cause keyboard to close)
    return false;
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);

  // Auto-focus textarea on mount (for better mobile UX)
  useEffect(() => {
    // Small delay to ensure component is fully rendered
    const timer = setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  const handleButtonClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    handleSubmit(e);
  };

  return (
    <div className="border-t border-gray-200 bg-white p-2 md:p-4 fixed bottom-0 left-0 right-0 md:relative md:bottom-auto md:left-auto md:right-auto z-20 safe-area-inset-bottom shadow-lg md:shadow-none">
      <form onSubmit={handleSubmit} className="flex items-end space-x-2">
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleChange}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            className="w-full px-3 py-2 md:px-4 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none resize-none max-h-32 overflow-y-auto text-sm md:text-base"
            rows="1"
          />
        </div>
        <button
          type="button"
          onClick={handleButtonClick}
          disabled={!message.trim()}
          className="bg-primary-500 text-white px-4 py-2 md:px-6 md:py-3 rounded-lg font-semibold hover:bg-primary-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg text-sm md:text-base flex-shrink-0"
        >
          <span className="hidden sm:inline">Send</span>
          <span className="sm:hidden">📤</span>
        </button>
      </form>
    </div>
  );
};

export default MessageInput;


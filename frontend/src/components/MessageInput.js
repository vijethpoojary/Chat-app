import React, { useState, useRef, useEffect } from 'react';

const MessageInput = ({ onSendMessage, onTyping }) => {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showKeyboard, setShowKeyboard] = useState(false);
  const typingTimeoutRef = useRef(null);
  const textareaRef = useRef(null);

  // Initialize Google Indic Keyboard
  useEffect(() => {
    const initIndicKeyboard = () => {
      if (window.google && window.google.load) {
        // Use inputtools instead of elements to avoid warning
        window.google.load('inputtools', '1', {
          packages: ['transliteration']
        }, () => {
          if (window.google.elements && window.google.elements.transliteration && textareaRef.current) {
            const options = {
              sourceLanguage: window.google.elements.transliteration.LanguageCode.ENGLISH,
              destinationLanguage: [
                window.google.elements.transliteration.LanguageCode.HINDI,
                window.google.elements.transliteration.LanguageCode.TAMIL,
                window.google.elements.transliteration.LanguageCode.TELUGU,
                window.google.elements.transliteration.LanguageCode.MARATHI,
                window.google.elements.transliteration.LanguageCode.BENGALI,
                window.google.elements.transliteration.LanguageCode.GUJARATI,
                window.google.elements.transliteration.LanguageCode.KANNADA,
                window.google.elements.transliteration.LanguageCode.MALAYALAM,
                window.google.elements.transliteration.LanguageCode.PUNJABI,
                window.google.elements.transliteration.LanguageCode.URDU,
              ],
              shortcutKey: 'ctrl+g',
              transliterationEnabled: true
            };

            try {
              const control = new window.google.elements.transliteration.TransliterationControl(options);
              if (textareaRef.current) {
                control.makeTransliteratable([textareaRef.current]);
              }
            } catch (error) {
              console.log('Google Indic Keyboard initialization:', error);
            }
          }
        });
      } else if (!window.google) {
        // If Google API is not loaded yet, wait a bit and retry
        setTimeout(initIndicKeyboard, 500);
      }
    };

    // Wait for Google API to be available
    if (document.readyState === 'complete') {
      initIndicKeyboard();
    } else {
      window.addEventListener('load', initIndicKeyboard);
      return () => window.removeEventListener('load', initIndicKeyboard);
    }
  }, []);

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
    if (message.trim()) {
      onSendMessage(message);
      setMessage('');
      setIsTyping(false);
      onTyping(false);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
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

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="border-t border-gray-200 bg-white p-4">
      <form onSubmit={handleSubmit} className="flex items-end space-x-2">
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleChange}
            onKeyPress={handleKeyPress}
            placeholder="Type your message... (Press Ctrl+G for Indic keyboard)"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none resize-none max-h-32 overflow-y-auto"
            rows="1"
          />
          <div className="absolute bottom-2 right-2 text-xs text-gray-400">
            <span className="hidden md:inline">Ctrl+G for Indic keyboard</span>
          </div>
        </div>
        <button
          type="submit"
          disabled={!message.trim()}
          className="bg-primary-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 active:translate-y-0"
        >
          <span className="hidden sm:inline">Send</span>
          <span className="sm:hidden">📤</span>
        </button>
      </form>
      
      {/* Keyboard Toggle Button for Mobile */}
      <div className="mt-2 flex justify-center">
        <button
          type="button"
          onClick={() => {
            setShowKeyboard(!showKeyboard);
            if (textareaRef.current) {
              textareaRef.current.focus();
            }
          }}
          className="text-xs text-primary-600 hover:text-primary-700 underline"
        >
          {showKeyboard ? 'Hide' : 'Show'} Indic Keyboard Toggle
        </button>
      </div>
      
      <div className="mt-2 text-xs text-center text-gray-500">
        <p>💡 Tip: Press <kbd className="px-2 py-1 bg-gray-100 rounded border">Ctrl+G</kbd> to toggle Indic keyboard</p>
      </div>
    </div>
  );
};

export default MessageInput;


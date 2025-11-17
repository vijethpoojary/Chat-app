import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import ChatWindow from './components/ChatWindow';
import LoginScreen from './components/LoginScreen';
import './App.css';

// Backend URL - uses environment variable for production, localhost for development
const SOCKET_SERVER_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';

function App() {
  const [socket, setSocket] = useState(null);
  const [username, setUsername] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [messages, setMessages] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);

  useEffect(() => {
    // Initialize socket connection
    if (isLoggedIn) {
      const newSocket = io(SOCKET_SERVER_URL);
      setSocket(newSocket);

      // Request previous messages
      newSocket.emit('requestMessages');

      // Listen for previous messages
      newSocket.on('previousMessages', (previousMessages) => {
        setMessages(previousMessages);
      });

      // Listen for new messages
      newSocket.on('newMessage', (message) => {
        setMessages((prevMessages) => [...prevMessages, message]);
      });

      // Listen for typing indicators
      newSocket.on('userTyping', (data) => {
        setTypingUsers((prev) => {
          if (!prev.includes(data.sender)) {
            return [...prev, data.sender];
          }
          return prev;
        });
      });

      newSocket.on('userStoppedTyping', () => {
        setTypingUsers([]);
      });

      // Cleanup on unmount
      return () => {
        newSocket.close();
      };
    }
  }, [isLoggedIn]);

  const handleLogin = (name) => {
    if (name.trim()) {
      setUsername(name.trim());
      setIsLoggedIn(true);
      // Save username to localStorage
      localStorage.setItem('chatUsername', name.trim());
    }
  };

  const handleLogout = () => {
    if (socket) {
      socket.close();
    }
    setSocket(null);
    setIsLoggedIn(false);
    setUsername('');
    setMessages([]);
    localStorage.removeItem('chatUsername');
  };

  // Check for saved username on mount
  useEffect(() => {
    const savedUsername = localStorage.getItem('chatUsername');
    if (savedUsername) {
      setUsername(savedUsername);
      setIsLoggedIn(true);
    }
  }, []);

  return (
    <div className="App">
      {!isLoggedIn ? (
        <LoginScreen onLogin={handleLogin} />
      ) : (
        <ChatWindow
          socket={socket}
          username={username}
          messages={messages}
          typingUsers={typingUsers}
          onLogout={handleLogout}
        />
      )}
    </div>
  );
}

export default App;


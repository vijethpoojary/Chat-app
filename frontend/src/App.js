import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import ChatWindow from './components/ChatWindow';
import LoginScreen from './components/LoginScreen';
import RoomCodeScreen from './components/RoomCodeScreen';
import CreateRoomScreen from './components/CreateRoomScreen';
import './App.css';

// Backend URL - uses environment variable for production, localhost for development
const SOCKET_SERVER_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';

function App() {
  const [socket, setSocket] = useState(null);
  const [username, setUsername] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [roomCode, setRoomCode] = useState('');
  const [roomCreator, setRoomCreator] = useState('');
  const [showRoomSelection, setShowRoomSelection] = useState(true);
  const [messages, setMessages] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);

  useEffect(() => {
    // Initialize socket connection
    if (isLoggedIn && roomCode) {
      const newSocket = io(SOCKET_SERVER_URL);
      setSocket(newSocket);

      // Join the room
      newSocket.emit('joinRoom', { roomCode });

      // Request previous messages for this room
      newSocket.emit('requestMessages', { roomCode });

      // Listen for previous messages
      newSocket.on('previousMessages', (previousMessages) => {
        setMessages(previousMessages);
      });

      // Listen for new messages
      newSocket.on('newMessage', (message) => {
        // Only add message if it's for current room
        if (message.roomCode === roomCode.toUpperCase()) {
          setMessages((prevMessages) => [...prevMessages, message]);
        }
      });

      // Listen for typing indicators
      newSocket.on('userTyping', (data) => {
        if (data.roomCode === roomCode.toUpperCase()) {
          setTypingUsers((prev) => {
            if (!prev.includes(data.sender)) {
              return [...prev, data.sender];
            }
            return prev;
          });
        }
      });

      newSocket.on('userStoppedTyping', () => {
        setTypingUsers([]);
      });

      // Listen for deleted messages
      newSocket.on('messagesDeleted', (data) => {
        if (data.roomCode === roomCode.toUpperCase()) {
          // Remove deleted messages from state
          setMessages((prevMessages) => 
            prevMessages.filter(msg => !data.messageIds.includes(msg._id))
          );
        }
      });

      // Cleanup on unmount
      return () => {
        newSocket.close();
      };
    }
  }, [isLoggedIn, roomCode]);

  const handleRoomCreated = (code, creator) => {
    setRoomCode(code);
    setRoomCreator(creator);
    setShowRoomSelection(false);
    localStorage.setItem('roomCode', code);
    localStorage.setItem('roomCreator', creator);
  };

  const handleRoomJoined = (code) => {
    setRoomCode(code);
    setShowRoomSelection(false);
    const savedCreator = localStorage.getItem('roomCreator');
    if (savedCreator) {
      setRoomCreator(savedCreator);
    }
  };

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
    setRoomCode('');
    setRoomCreator('');
    setShowRoomSelection(true);
    localStorage.removeItem('chatUsername');
    localStorage.removeItem('roomCode');
    localStorage.removeItem('roomCreator');
  };

  // Check for saved room and username on mount
  useEffect(() => {
    const savedRoomCode = localStorage.getItem('roomCode');
    const savedCreator = localStorage.getItem('roomCreator');
    const savedUsername = localStorage.getItem('chatUsername');
    
    if (savedRoomCode) {
      setRoomCode(savedRoomCode);
      if (savedCreator) {
        setRoomCreator(savedCreator);
      }
      setShowRoomSelection(false);
      if (savedUsername) {
        setUsername(savedUsername);
        setIsLoggedIn(true);
      }
    }
  }, []);

  return (
    <div className="App">
      {showRoomSelection ? (
        <div className="min-h-screen flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-gray-800 mb-2">💬 Chat App</h1>
              <p className="text-gray-600">Made By Vijeth Poojary</p>
            </div>
            <div className="space-y-4">
              <CreateRoomScreen onRoomCreated={handleRoomCreated} />
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">OR</span>
                </div>
              </div>
              <RoomCodeScreen onRoomCodeVerified={handleRoomJoined} />
            </div>
          </div>
        </div>
      ) : !isLoggedIn ? (
        <LoginScreen onLogin={handleLogin} />
      ) : (
        <ChatWindow
          socket={socket}
          username={username}
          roomCode={roomCode}
          roomCreator={roomCreator}
          messages={messages}
          typingUsers={typingUsers}
          onLogout={handleLogout}
        />
      )}
    </div>
  );
}

export default App;


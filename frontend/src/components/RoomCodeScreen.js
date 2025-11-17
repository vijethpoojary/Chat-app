import React, { useState } from 'react';

const RoomCodeScreen = ({ onRoomCodeVerified }) => {
  const [roomCode, setRoomCode] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!roomCode.trim()) {
      setError('Please enter a room code');
      return;
    }

    try {
      // Verify room code with backend
      const response = await fetch(`${process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000'}/api/verify-room-code`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ roomCode: roomCode.trim() }),
      });

      const data = await response.json();

      if (data.success) {
        // Save room code verification to localStorage
        localStorage.setItem('roomCodeVerified', 'true');
        onRoomCodeVerified();
      } else {
        setError(data.message || 'Invalid room code');
      }
    } catch (error) {
      console.error('Error verifying room code:', error);
      setError('Failed to verify room code. Please try again.');
    }
  };

  // Check if room code is already verified
  React.useEffect(() => {
    const verified = localStorage.getItem('roomCodeVerified');
    if (verified === 'true') {
      onRoomCodeVerified();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">🔐 Chat Room</h1>
          <p className="text-gray-600">Enter room code to access the chat</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="roomCode" className="block text-sm font-medium text-gray-700 mb-2">
              Room Code
            </label>
            <input
              id="roomCode"
              type="text"
              value={roomCode}
              onChange={(e) => {
                setRoomCode(e.target.value);
                setError('');
              }}
              placeholder="Enter room code"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all uppercase"
              autoFocus
              required
              autoComplete="off"
            />
            {error && (
              <p className="mt-2 text-sm text-red-600">{error}</p>
            )}
          </div>
          
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-primary-500 to-primary-600 text-white py-3 rounded-lg font-semibold hover:from-primary-600 hover:to-primary-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            Enter Room
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-500">
          <p>Ask the room admin for the access code</p>
        </div>
      </div>
    </div>
  );
};

export default RoomCodeScreen;


import React, { useState } from 'react';

const CreateRoomScreen = ({ onRoomCreated }) => {
  const [roomCode, setRoomCode] = useState('');
  const [creator, setCreator] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!roomCode.trim()) {
      setError('Please enter a room code');
      setLoading(false);
      return;
    }

    if (!creator.trim()) {
      setError('Please enter your name');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000'}/api/create-room`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          roomCode: roomCode.trim(),
          creator: creator.trim()
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Save room info to localStorage
        localStorage.setItem('roomCode', data.roomCode);
        localStorage.setItem('roomCreator', creator.trim());
        localStorage.setItem('roomCodeVerified', 'true');
        onRoomCreated(data.roomCode, creator.trim());
      } else {
        setError(data.message || 'Failed to create room');
      }
    } catch (error) {
      console.error('Error creating room:', error);
      setError('Failed to create room. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="text-center mb-4">
        <h2 className="text-2xl font-bold text-gray-800 mb-1">➕ Create Room</h2>
        <p className="text-sm text-gray-600">Create a new chat room</p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="creator" className="block text-sm font-medium text-gray-700 mb-1">
            Your Name
          </label>
          <input
            id="creator"
            type="text"
            value={creator}
            onChange={(e) => {
              setCreator(e.target.value);
              setError('');
            }}
            placeholder="Enter your name"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
            required
          />
        </div>

        <div>
          <label htmlFor="roomCode" className="block text-sm font-medium text-gray-700 mb-1">
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
            placeholder="Enter your room code (e.g., Vij10023)"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all uppercase"
            required
            autoComplete="off"
          />
          <p className="mt-1 text-xs text-gray-500">Choose any code you want</p>
        </div>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-sm">
            {error}
          </div>
        )}
        
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-primary-500 to-primary-600 text-white py-2 rounded-lg font-semibold hover:from-primary-600 hover:to-primary-700 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Creating...' : 'Create Room'}
        </button>
      </form>
    </div>
  );
};

export default CreateRoomScreen;


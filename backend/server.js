const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

// Load environment variables from .env.local (for local development)
// Falls back to .env if .env.local doesn't exist
require('dotenv').config({ path: path.resolve(__dirname, '.env.local') });
require('dotenv').config(); // Also load .env as fallback

const app = express();
const server = http.createServer(app);
// CORS configuration - supports localhost and production frontend
const allowedOrigins = [
  "http://localhost:3000",
  process.env.FRONTEND_URL
].filter(Boolean); // Remove undefined values

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like Postman or curl)
    if (!origin) return callback(null, true);
    
    // In production, check if origin matches allowed list
    // In development, allow all origins
    if (process.env.NODE_ENV === 'production') {
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.log('CORS blocked origin:', origin);
        console.log('Allowed origins:', allowedOrigins);
        callback(new Error('Not allowed by CORS'));
      }
    } else {
      // Development: allow all origins
      callback(null, true);
    }
  },
  credentials: true,
  methods: ["GET", "POST", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  exposedHeaders: ["Content-Type"]
};

const io = socketIo(server, {
  cors: {
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (process.env.NODE_ENV === 'production') {
        if (allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      } else {
        callback(null, true);
      }
    },
    credentials: true,
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Handle preflight requests
app.options('*', cors(corsOptions));

// MongoDB Connection - Uses MongoDB Atlas (configured in .env.local)
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI is not set in environment variables!');
  console.error('Please create backend/.env.local file with your MongoDB Atlas connection string.');
  process.exit(1);
}

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ MongoDB Connected'))
.catch(err => console.error('❌ MongoDB Connection Error:', err));

// Room Schema
const roomSchema = new mongoose.Schema({
  roomCode: { type: String, required: true, unique: true, uppercase: true },
  creator: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const Room = mongoose.model('Room', roomSchema);

// Message Schema
const messageSchema = new mongoose.Schema({
  roomCode: { type: String, required: true, uppercase: true },
  sender: { type: String, required: true },
  message: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

const Message = mongoose.model('Message', messageSchema);

// API Routes
app.get('/', (req, res) => {
  res.json({ message: 'Chat App Backend API' });
});

// Create Room
app.post('/api/create-room', async (req, res) => {
  try {
    const { roomCode, creator } = req.body;
    
    if (!roomCode || !roomCode.trim()) {
      return res.status(400).json({ success: false, message: 'Room code is required' });
    }
    
    if (!creator || !creator.trim()) {
      return res.status(400).json({ success: false, message: 'Creator name is required' });
    }
    
    const code = roomCode.trim().toUpperCase();
    
    // Check if room already exists
    const existingRoom = await Room.findOne({ roomCode: code });
    if (existingRoom) {
      return res.status(409).json({ success: false, message: 'Room code already exists' });
    }
    
    // Create new room
    const newRoom = new Room({
      roomCode: code,
      creator: creator.trim()
    });
    
    await newRoom.save();
    
    res.json({ success: true, message: 'Room created successfully', roomCode: code });
  } catch (error) {
    console.error('Error creating room:', error);
    res.status(500).json({ success: false, message: 'Failed to create room' });
  }
});

// Join Room (verify room exists)
app.post('/api/join-room', async (req, res) => {
  try {
    const { roomCode } = req.body;
    
    if (!roomCode || !roomCode.trim()) {
      return res.status(400).json({ success: false, message: 'Room code is required' });
    }
    
    const code = roomCode.trim().toUpperCase();
    
    // Check if room exists
    const room = await Room.findOne({ roomCode: code });
    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }
    
    res.json({ success: true, message: 'Room found', roomCode: code, creator: room.creator });
  } catch (error) {
    console.error('Error joining room:', error);
    res.status(500).json({ success: false, message: 'Failed to join room' });
  }
});

// Delete Room (only creator can delete)
app.delete('/api/delete-room', async (req, res) => {
  try {
    const { roomCode, creator } = req.body;
    
    if (!roomCode || !roomCode.trim()) {
      return res.status(400).json({ success: false, message: 'Room code is required' });
    }
    
    if (!creator || !creator.trim()) {
      return res.status(400).json({ success: false, message: 'Creator name is required' });
    }
    
    const code = roomCode.trim().toUpperCase();
    
    // Find room
    const room = await Room.findOne({ roomCode: code });
    if (!room) {
      return res.status(404).json({ success: false, message: 'Room not found' });
    }
    
    // Verify creator
    if (room.creator !== creator.trim()) {
      return res.status(403).json({ success: false, message: 'Only room creator can delete the room' });
    }
    
    // Delete all messages in the room
    await Message.deleteMany({ roomCode: code });
    
    // Delete the room
    await Room.deleteOne({ roomCode: code });
    
    res.json({ success: true, message: 'Room and all messages deleted successfully' });
  } catch (error) {
    console.error('Error deleting room:', error);
    res.status(500).json({ success: false, message: 'Failed to delete room' });
  }
});

// Get messages for a room
app.get('/api/messages/:roomCode', async (req, res) => {
  try {
    const { roomCode } = req.params;
    const code = roomCode.toUpperCase();
    
    const messages = await Message.find({ roomCode: code }).sort({ timestamp: 1 }).limit(100);
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete messages
app.delete('/api/delete-messages', async (req, res) => {
  try {
    const { roomCode, messageIds } = req.body;
    
    if (!roomCode || !messageIds || !Array.isArray(messageIds) || messageIds.length === 0) {
      return res.status(400).json({ success: false, message: 'Room code and message IDs are required' });
    }
    
    const code = roomCode.toUpperCase();
    
    // Delete messages
    const result = await Message.deleteMany({ 
      _id: { $in: messageIds },
      roomCode: code 
    });
    
    res.json({ success: true, message: `${result.deletedCount} message(s) deleted` });
  } catch (error) {
    console.error('Error deleting messages:', error);
    res.status(500).json({ success: false, message: 'Failed to delete messages' });
  }
});

// Socket.io Connection
io.on('connection', (socket) => {
  console.log('👤 User connected:', socket.id);

  // Join room
  socket.on('joinRoom', async (data) => {
    try {
      const { roomCode } = data;
      if (!roomCode) {
        socket.emit('error', { message: 'Room code is required' });
        return;
      }
      
      const code = roomCode.toUpperCase();
      socket.join(code);
      console.log(`👤 User ${socket.id} joined room: ${code}`);
      
      // Send previous messages for this room
      const messages = await Message.find({ roomCode: code }).sort({ timestamp: 1 }).limit(100);
      socket.emit('previousMessages', messages);
    } catch (error) {
      console.error('Error joining room:', error);
      socket.emit('error', { message: 'Failed to join room' });
    }
  });

  // Send previous messages to newly connected user (for specific room)
  socket.on('requestMessages', async (data) => {
    try {
      const { roomCode } = data || {};
      if (!roomCode) {
        socket.emit('error', { message: 'Room code is required' });
        return;
      }
      
      const code = roomCode.toUpperCase();
      const messages = await Message.find({ roomCode: code }).sort({ timestamp: 1 }).limit(100);
      socket.emit('previousMessages', messages);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  });

  // Handle new message
  socket.on('sendMessage', async (data) => {
    try {
      const { roomCode, sender, message } = data;
      
      if (!roomCode || !sender || !message) {
        socket.emit('error', { message: 'Room code, sender and message are required' });
        return;
      }

      // Security: Input validation and sanitization
      const code = roomCode.trim().toUpperCase();
      const sanitizedSender = sender.trim().substring(0, 50); // Limit length
      const sanitizedMessage = message.trim().substring(0, 1000); // Limit length
      
      // Basic XSS protection - remove script tags
      const cleanMessage = sanitizedMessage.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
      
      if (!sanitizedSender || !cleanMessage) {
        socket.emit('error', { message: 'Invalid input' });
        return;
      }

      // Save message to database
      const newMessage = new Message({
        roomCode: code,
        sender: sanitizedSender,
        message: cleanMessage,
        timestamp: new Date()
      });

      await newMessage.save();

      // Broadcast message to all clients in this room only
      io.to(code).emit('newMessage', {
        _id: newMessage._id,
        roomCode: code,
        sender: newMessage.sender,
        message: newMessage.message,
        timestamp: newMessage.timestamp
      });
    } catch (error) {
      console.error('Error saving message:', error);
      socket.emit('error', { message: 'Failed to send message' });
    }
  });

  // Handle deleted messages
  socket.on('messagesDeleted', async (data) => {
    try {
      const { roomCode, messageIds } = data;
      if (!roomCode || !messageIds) return;
      
      const code = roomCode.toUpperCase();
      // Notify all users in the room
      io.to(code).emit('messagesDeleted', { roomCode: code, messageIds });
    } catch (error) {
      console.error('Error handling deleted messages:', error);
    }
  });

  // Handle user typing indicator (scoped to room)
  socket.on('typing', (data) => {
    const { roomCode } = data;
    if (roomCode) {
      socket.to(roomCode.toUpperCase()).emit('userTyping', data);
    }
  });

  socket.on('stopTyping', (data) => {
    const { roomCode } = data || {};
    if (roomCode) {
      socket.to(roomCode.toUpperCase()).emit('userStoppedTyping');
    }
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('👤 User disconnected:', socket.id);
  });
});

// Auto-delete messages older than 24 hours
const deleteOldMessages = async () => {
  try {
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const result = await Message.deleteMany({
      timestamp: { $lt: twentyFourHoursAgo }
    });
    if (result.deletedCount > 0) {
      console.log(`🗑️  Deleted ${result.deletedCount} message(s) older than 24 hours`);
    }
  } catch (error) {
    console.error('Error deleting old messages:', error);
  }
};

// Run cleanup every hour
setInterval(deleteOldMessages, 60 * 60 * 1000);

// Run cleanup on server start
deleteOldMessages();

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Socket.io server ready`);
  console.log(`🧹 Auto-delete task scheduled (runs every hour)`);
});


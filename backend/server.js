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
  methods: ["GET", "POST"]
};

const io = socketIo(server, {
  cors: corsOptions
});

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

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

// Message Schema
const messageSchema = new mongoose.Schema({
  sender: { type: String, required: true },
  message: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

const Message = mongoose.model('Message', messageSchema);

// API Routes
app.get('/', (req, res) => {
  res.json({ message: 'Chat App Backend API' });
});

// Room code from environment variable
const ROOM_CODE = process.env.ROOM_CODE;

if (!ROOM_CODE) {
  console.error('❌ ROOM_CODE is not set in environment variables!');
  console.error('Please set ROOM_CODE in backend/.env.local or Render environment variables.');
}

// Verify room code
app.post('/api/verify-room-code', (req, res) => {
  const { roomCode } = req.body;
  
  if (!ROOM_CODE) {
    return res.status(500).json({ success: false, message: 'Room code not configured on server' });
  }
  
  if (roomCode === ROOM_CODE) {
    res.json({ success: true, message: 'Room code verified' });
  } else {
    res.status(401).json({ success: false, message: 'Invalid room code' });
  }
});

// Get all messages
app.get('/api/messages', async (req, res) => {
  try {
    const messages = await Message.find().sort({ timestamp: 1 }).limit(100);
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Socket.io Connection
io.on('connection', (socket) => {
  console.log('👤 User connected:', socket.id);

  // Send previous messages to newly connected user
  socket.on('requestMessages', async () => {
    try {
      const messages = await Message.find().sort({ timestamp: 1 }).limit(100);
      socket.emit('previousMessages', messages);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  });

  // Handle new message
  socket.on('sendMessage', async (data) => {
    try {
      const { sender, message } = data;
      
      if (!sender || !message) {
        socket.emit('error', { message: 'Sender and message are required' });
        return;
      }

      // Save message to database
      const newMessage = new Message({
        sender,
        message,
        timestamp: new Date()
      });

      await newMessage.save();

      // Broadcast message to all connected clients
      io.emit('newMessage', {
        _id: newMessage._id,
        sender: newMessage.sender,
        message: newMessage.message,
        timestamp: newMessage.timestamp
      });
    } catch (error) {
      console.error('Error saving message:', error);
      socket.emit('error', { message: 'Failed to send message' });
    }
  });

  // Handle user typing indicator
  socket.on('typing', (data) => {
    socket.broadcast.emit('userTyping', data);
  });

  socket.on('stopTyping', () => {
    socket.broadcast.emit('userStoppedTyping');
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('👤 User disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Socket.io server ready`);
});


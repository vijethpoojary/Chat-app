# 🚀 Quick Setup Guide

## Prerequisites

Make sure you have installed:
- Node.js (v14 or higher) - Download from https://nodejs.org/
- MongoDB (local) or MongoDB Atlas account (free cloud database)

## Step-by-Step Setup

### 1. Install MongoDB (if using locally)

**Windows:**
- Download MongoDB Community Server from https://www.mongodb.com/try/download/community
- Install and run MongoDB as a service

**Mac:**
```bash
brew tap mongodb/brew
brew install mongodb-community
brew services start mongodb-community
```

**Linux:**
```bash
sudo apt-get install mongodb
sudo systemctl start mongod
```

**Or use MongoDB Atlas (Cloud - Free):**
- Sign up at https://www.mongodb.com/cloud/atlas
- Create a free cluster
- Get your connection string

### 2. Backend Setup

```bash
# Navigate to backend folder
cd backend

# Install dependencies
npm install

# Create .env file (copy content below)
```

Create `backend/.env` file:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/chat-app
FRONTEND_URL=http://localhost:3000
```

**If using MongoDB Atlas, replace MONGODB_URI with your Atlas connection string:**
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/chat-app
```

### 3. Frontend Setup

```bash
# Navigate to frontend folder (from project root)
cd frontend

# Install dependencies
npm install
```

**Optional:** Create `frontend/.env` file if backend is on different URL:
```env
REACT_APP_SOCKET_URL=http://localhost:5000
```

### 4. Start MongoDB (if using locally)

**Windows:**
- MongoDB should start automatically as a service
- Or run: `mongod` in terminal

**Mac/Linux:**
```bash
# Already running if you used brew services
# Or start manually:
mongod
```

### 5. Run the Application

**Terminal 1 - Start Backend:**
```bash
cd backend
npm start
```

You should see:
```
✅ MongoDB Connected
🚀 Server running on port 5000
📡 Socket.io server ready
```

**Terminal 2 - Start Frontend:**
```bash
cd frontend
npm start
```

The app will automatically open at `http://localhost:3000`

## 🎉 You're Ready!

1. Open `http://localhost:3000` in your browser
2. Enter your name
3. Share the URL with your girlfriend (if on same network, use your IP: `http://YOUR_IP:3000`)
4. Start chatting!

## 📱 For Mobile Testing on Same Network

1. Find your computer's IP address:
   - **Windows:** `ipconfig` (look for IPv4 Address)
   - **Mac/Linux:** `ifconfig` or `ip addr`
   
2. On your phone, open: `http://YOUR_IP:3000`

3. Make sure both devices are on the same WiFi network

## 🔧 Troubleshooting

**MongoDB Connection Failed:**
- Make sure MongoDB is running
- Check MongoDB URI in `.env` file
- For Atlas: Check your IP is whitelisted

**Socket.io Connection Failed:**
- Make sure backend is running on port 5000
- Check `REACT_APP_SOCKET_URL` in frontend `.env`

**Indic Keyboard Not Working:**
- Make sure you have internet connection (Google API needs internet)
- Press `Ctrl+G` to toggle
- Try refreshing the page

## 🌐 Deploy for Online Access

Check `README.md` for deployment instructions to Vercel, Netlify, Heroku, etc.

---

**Need Help?** Check the full README.md for detailed documentation.



# 💬 Real-Time Chat App

A beautiful, real-time chat application built with React.js, Node.js, Socket.io, and MongoDB. Perfect for chatting with friends with support for Indian language input via Google Indic Keyboard.

## ✨ Features

- ✅ Real-time messaging using Socket.io
- ✅ Google Indic Keyboard support (Press Ctrl+G to toggle)
- ✅ Mobile responsive design
- ✅ Message history persistence
- ✅ Typing indicators
- ✅ Beautiful UI with Tailwind CSS
- ✅ Multiple Indian language support (Hindi, Tamil, Telugu, Marathi, Bengali, Gujarati, Kannada, Malayalam, Punjabi, Urdu)

## 🛠️ Tech Stack

- **Frontend:** React.js, Tailwind CSS
- **Backend:** Node.js, Express.js
- **Real-time:** Socket.io
- **Database:** MongoDB
- **Indic Keyboard:** Google Transliteration API

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- Node.js (v14 or higher)
- npm or yarn
- MongoDB (local installation or MongoDB Atlas account)

## 🚀 Installation & Setup

### Step 1: Clone or Download the Project

```bash
cd Chat
```

### Step 2: Set Up Backend

```bash
# Navigate to backend folder
cd backend

# Install dependencies
npm install

# Create .env file
# Copy .env.example to .env and update if needed
cp .env.example .env
```

Edit `backend/.env`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/chat-app
FRONTEND_URL=http://localhost:3000
```

**Note:** If you're using MongoDB Atlas (cloud), replace `MONGODB_URI` with your Atlas connection string.

### Step 3: Set Up Frontend

```bash
# Navigate to frontend folder (from project root)
cd frontend

# Install dependencies
npm install

# Create .env file (optional, defaults to http://localhost:5000)
echo REACT_APP_SOCKET_URL=http://localhost:5000 > .env
```

### Step 4: Start MongoDB

**If using local MongoDB:**
```bash
# Windows
mongod

# Mac/Linux
sudo systemctl start mongod
# or
brew services start mongodb-community
```

**If using MongoDB Atlas:**
- Just use your connection string in the `.env` file (no local installation needed)

### Step 5: Run the Application

**Terminal 1 - Start Backend:**
```bash
cd backend
npm start
# or for development with auto-reload:
npm run dev
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

The app will open automatically at `http://localhost:3000`

## 📱 How to Use

1. **Enter Your Name:** When you first open the app, enter your name to start chatting.

2. **Share the Link:** Share the app URL with your girlfriend/friend (if deployed) or both use `http://localhost:3000` if running locally on the same network.

3. **Start Chatting:** Type your message and press Enter or click Send.

4. **Use Indic Keyboard:** Press `Ctrl+G` to toggle Google Indic Keyboard for typing in Indian languages.

5. **Supported Languages:** Hindi, Tamil, Telugu, Marathi, Bengali, Gujarati, Kannada, Malayalam, Punjabi, Urdu.

## 🌐 Deployment

### Deploy Backend:

1. **Heroku:**
   ```bash
   cd backend
   heroku create your-chat-app-backend
   heroku addons:create mongolab
   git push heroku main
   ```

2. **Railway:**
   - Connect your GitHub repo
   - Set environment variables
   - Deploy backend folder

3. **Render:**
   - Create a new Web Service
   - Connect your repo
   - Set root directory to `backend`
   - Add MongoDB Atlas connection string

### Deploy Frontend:

1. **Vercel:**
   ```bash
   cd frontend
   npm install -g vercel
   vercel
   ```

2. **Netlify:**
   - Connect your GitHub repo
   - Set build command: `npm run build`
   - Set publish directory: `build`
   - Add environment variable: `REACT_APP_SOCKET_URL` (your backend URL)

3. **Update Environment Variable:**
   - Update `REACT_APP_SOCKET_URL` in frontend `.env` to your deployed backend URL

## 📁 Project Structure

```
chat-app/
├── backend/
│   ├── server.js          # Express + Socket.io server
│   ├── models/            # MongoDB models (if needed)
│   ├── routes/            # API routes (if needed)
│   ├── package.json
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ChatWindow.js
│   │   │   ├── MessageList.js
│   │   │   ├── MessageInput.js
│   │   │   └── LoginScreen.js
│   │   ├── App.js
│   │   ├── App.css
│   │   ├── index.js
│   │   └── index.css
│   ├── public/
│   ├── package.json
│   └── tailwind.config.js
└── README.md
```

## 🎨 Customization

### Change Colors:
Edit `frontend/tailwind.config.js` to customize the color scheme.

### Change Port:
Edit `backend/.env` PORT variable and `frontend/.env` REACT_APP_SOCKET_URL.

## 🐛 Troubleshooting

### MongoDB Connection Issues:
- Ensure MongoDB is running (if using local)
- Check MongoDB connection string in `.env`
- For MongoDB Atlas, whitelist your IP address

### Socket.io Connection Issues:
- Ensure backend is running on the correct port
- Check CORS settings in `backend/server.js`
- Verify `REACT_APP_SOCKET_URL` in frontend `.env`

### Indic Keyboard Not Working:
- Ensure internet connection (Google API needs internet)
- Try pressing `Ctrl+G` multiple times
- Check browser console for errors

## 📝 License

This project is open source and available for personal use.

## 👨‍💻 Development

To contribute or modify:

1. Backend uses Express.js for REST API and Socket.io for WebSocket connections
2. Frontend uses React hooks for state management
3. Messages are stored in MongoDB and synced in real-time
4. Tailwind CSS is used for responsive styling

## 🎉 Enjoy Chatting!

Have fun chatting with your girlfriend! If you face any issues, check the troubleshooting section or create an issue.

---

Made with ❤️ using React, Node.js, Socket.io, and MongoDB



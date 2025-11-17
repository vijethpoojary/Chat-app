# 📊 MongoDB Local Setup Guide

## ✅ Configuration Complete

Your backend is already configured to connect to local MongoDB!
The default connection string is: `mongodb://localhost:27017/chat-app`

## 🔍 How to Check if MongoDB is Running on Windows

### Method 1: Check Windows Services (Easiest)

1. **Press `Windows + R`** to open Run dialog
2. Type: `services.msc` and press Enter
3. Look for **"MongoDB"** or **"MongoDB Server"** in the services list
4. Check the **Status** column:
   - ✅ **Running** = MongoDB is active
   - ❌ **Stopped** = MongoDB is not running

### Method 2: Using Command Prompt

1. **Open Command Prompt** (Press `Windows + X`, then select "Command Prompt" or "Terminal")
2. Run this command:
   ```bash
   sc query MongoDB
   ```
3. Look for `STATE` in the output:
   - `RUNNING` = MongoDB is active ✅
   - `STOPPED` = MongoDB is not running ❌

### Method 3: Check MongoDB Port

1. Open **Command Prompt** or **PowerShell**
2. Run:
   ```bash
   netstat -an | findstr 27017
   ```
3. If you see `LISTENING` on port 27017, MongoDB is running ✅

### Method 4: Test Connection Directly

1. Open **Command Prompt**
2. Navigate to MongoDB bin folder (usually):
   ```bash
   cd "C:\Program Files\MongoDB\Server\<version>\bin"
   ```
3. Run:
   ```bash
   mongo --eval "db.version()"
   ```
   Or if you have MongoDB 6+:
   ```bash
   mongosh --eval "db.version()"
   ```
4. If it shows version number, MongoDB is running ✅

### Method 5: Using MongoDB Compass

1. **Open MongoDB Compass**
2. Try to connect with connection string: `mongodb://localhost:27017`
3. If connection is successful, MongoDB is running ✅

## 🚀 How to Start MongoDB (if not running)

### If Installed as Windows Service:

1. Open **Command Prompt as Administrator**
2. Run:
   ```bash
   net start MongoDB
   ```

### If Not Running as Service:

1. Open **Command Prompt**
2. Navigate to MongoDB bin folder:
   ```bash
   cd "C:\Program Files\MongoDB\Server\<version>\bin"
   ```
3. Start MongoDB:
   ```bash
   mongod --dbpath "C:\data\db"
   ```
   (Make sure `C:\data\db` folder exists, or use your data directory)

## ✅ Test Your Backend Connection

Once MongoDB is running:

1. Navigate to backend folder:
   ```bash
   cd backend
   ```

2. Install dependencies (if not done):
   ```bash
   npm install
   ```

3. Start the server:
   ```bash
   npm start
   ```

4. You should see:
   ```
   ✅ MongoDB Connected
   🚀 Server running on port 5000
   📡 Socket.io server ready
   ```

## 📝 Create .env File (Optional but Recommended)

Create a file named `.env` in the `backend` folder with:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/chat-app
FRONTEND_URL=http://localhost:3000
```

**Note:** Even without this file, the app will use the default values shown above.

## 🎯 Quick Test Commands

**Check MongoDB Service Status:**
```bash
sc query MongoDB
```

**Start MongoDB Service:**
```bash
net start MongoDB
```

**Stop MongoDB Service:**
```bash
net stop MongoDB
```

**Check if Port 27017 is Listening:**
```bash
netstat -an | findstr 27017
```

---

## ❓ Troubleshooting

**If MongoDB is not running:**
1. Start it using `net start MongoDB`
2. Or start manually with `mongod` command

**If connection fails:**
1. Make sure MongoDB is running (check methods above)
2. Check firewall settings (MongoDB uses port 27017)
3. Verify MongoDB is installed correctly

**If you see "Access Denied":**
- Run Command Prompt as Administrator



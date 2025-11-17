# 🚀 Deployment Guide - Render (Backend) + Vercel (Frontend)

This guide will help you deploy your chat app using:
- **Backend:** Render.com (Free tier available)
- **Frontend:** Vercel.com (Free tier available)
- **Database:** MongoDB Atlas (Free tier available)

---

## 📋 Prerequisites

1. GitHub account (for connecting repos)
2. Render account (sign up at https://render.com)
3. Vercel account (sign up at https://vercel.com)
4. MongoDB Atlas account (sign up at https://www.mongodb.com/cloud/atlas)

---

## 🗄️ Step 1: Set Up MongoDB Atlas (Cloud Database)

### 1.1 Create MongoDB Atlas Account
1. Go to https://www.mongodb.com/cloud/atlas
2. Sign up for free (or log in)
3. Click **"Build a Database"**

### 1.2 Create a Free Cluster
1. Choose **"FREE"** (M0) tier
2. Select a cloud provider (AWS is fine)
3. Choose a region closest to you
4. Click **"Create Cluster"** (takes 1-3 minutes)

### 1.3 Configure Database Access
1. Go to **"Database Access"** in left sidebar
2. Click **"Add New Database User"**
3. Choose **"Password"** authentication
4. Create username and password (SAVE THESE!)
5. Set user privileges to **"Atlas admin"** or **"Read and write to any database"**
6. Click **"Add User"**

### 1.4 Configure Network Access
1. Go to **"Network Access"** in left sidebar
2. Click **"Add IP Address"**
3. Click **"Allow Access from Anywhere"** (for easy deployment) or add specific IPs
4. Click **"Confirm"**

### 1.5 Get Your Connection String
1. Go to **"Database"** in left sidebar
2. Click **"Connect"** on your cluster
3. Choose **"Connect your application"**
4. Copy the connection string (looks like):
   ```
   mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
5. Replace `<password>` with your actual password
6. Add database name at the end: `/chat-app`
   ```
   mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/chat-app?retryWrites=true&w=majority
   ```
7. **SAVE THIS CONNECTION STRING!** You'll need it for Render deployment

---

## 🔧 Step 2: Prepare Backend for Render

### 2.1 Create `render.yaml` (Optional but Recommended)

Create `render.yaml` in your project root:

```yaml
services:
  - type: web
    name: chat-app-backend
    env: node
    buildCommand: cd backend && npm install
    startCommand: cd backend && npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 10000
      - key: MONGODB_URI
        sync: false  # Will be set manually
      - key: FRONTEND_URL
        sync: false  # Will be set after Vercel deployment
```

### 2.2 Update Backend Server (if needed)

Your `server.js` already supports environment variables, which is perfect!

---

## 🌐 Step 3: Deploy Backend to Render

### 3.1 Push Code to GitHub
1. Create a new GitHub repository
2. Push your code:
   ```bash
   git init
   git add .
   git commit -m "Initial commit - Chat app"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   git push -u origin main
   ```

### 3.2 Create Render Web Service
1. Go to https://dashboard.render.com
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub account if not already connected
4. Select your repository
5. Configure service:
   - **Name:** `chat-app-backend`
   - **Environment:** `Node`
   - **Region:** Choose closest to you
   - **Branch:** `main`
   - **Root Directory:** `backend`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
6. Click **"Advanced"** and add environment variables:
   - `NODE_ENV` = `production`
   - `PORT` = `10000` (Render auto-assigns, but set for consistency)
   - `MONGODB_URI` = Your MongoDB Atlas connection string (from Step 1.5)
   - `FRONTEND_URL` = Leave blank for now, will update after Vercel deployment
7. Click **"Create Web Service"**

### 3.3 Get Your Backend URL
- Wait for deployment to complete (2-3 minutes)
- Copy your service URL (e.g., `https://chat-app-backend.onrender.com`)
- **SAVE THIS URL!** You'll need it for Vercel

### 3.4 Update Render Environment Variables
1. After deployment, go to your service → **"Environment"**
2. Update `FRONTEND_URL` with your Vercel URL (will do after Vercel deployment)

---

## ⚡ Step 4: Deploy Frontend to Vercel

### 4.1 Create Vercel Configuration (Optional)

Create `vercel.json` in your project root:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "frontend/package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "build"
      }
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/frontend/$1"
    }
  ]
}
```

**OR** set root directory to `frontend` in Vercel dashboard (easier method).

### 4.2 Deploy to Vercel

**Method 1: Using Vercel Dashboard (Recommended)**
1. Go to https://vercel.com
2. Click **"Add New"** → **"Project"**
3. Import your GitHub repository
4. Configure project:
   - **Framework Preset:** `Create React App`
   - **Root Directory:** `frontend` (IMPORTANT!)
   - **Build Command:** `npm run build`
   - **Output Directory:** `build`
   - **Install Command:** `npm install`
5. Add environment variables:
   - `REACT_APP_SOCKET_URL` = Your Render backend URL (from Step 3.3)
     - Example: `https://chat-app-backend.onrender.com`
6. Click **"Deploy"**

**Method 2: Using Vercel CLI**
```bash
npm install -g vercel
cd frontend
vercel
# Follow prompts, set REACT_APP_SOCKET_URL when asked
```

### 4.3 Get Your Frontend URL
- Wait for deployment (1-2 minutes)
- Copy your Vercel URL (e.g., `https://your-chat-app.vercel.app`)
- **SAVE THIS URL!**

---

## 🔄 Step 5: Update Environment Variables

### 5.1 Update Render Backend
1. Go to Render dashboard → Your backend service → **"Environment"**
2. Update `FRONTEND_URL` with your Vercel URL
   - Example: `https://your-chat-app.vercel.app`
3. Save changes (service will redeploy automatically)

### 5.2 Update Vercel Frontend (if needed)
1. Go to Vercel dashboard → Your project → **"Settings"** → **"Environment Variables"**
2. Verify `REACT_APP_SOCKET_URL` is set correctly
3. Redeploy if you changed it

---

## ✅ Step 6: Test Your Deployed App

1. Open your Vercel frontend URL
2. Enter a name to test
3. Open the same URL in an incognito window or another device
4. Enter another name
5. Try sending messages - should work in real-time! 🎉

---

## 🔍 Troubleshooting Deployment

### Backend Issues on Render:

**Issue: "Build Failed"**
- Check Render logs for errors
- Verify `package.json` has correct scripts
- Ensure `backend` folder structure is correct

**Issue: "Cannot connect to MongoDB"**
- Verify MongoDB Atlas connection string
- Check MongoDB Atlas Network Access (should allow all IPs or Render IPs)
- Check MongoDB user credentials

**Issue: "Port error"**
- Render uses `PORT` environment variable automatically
- Your code already uses `process.env.PORT || 5000`, which is correct

### Frontend Issues on Vercel:

**Issue: "Build Failed"**
- Check Vercel build logs
- Verify `REACT_APP_SOCKET_URL` is set correctly
- Ensure `frontend` is set as root directory

**Issue: "Can't connect to backend"**
- Verify `REACT_APP_SOCKET_URL` matches your Render backend URL
- Check CORS settings in backend (should allow Vercel domain)
- Check backend is running on Render

**Issue: "Socket.io connection failed"**
- Make sure backend URL in `REACT_APP_SOCKET_URL` doesn't have trailing slash
- Verify CORS in `backend/server.js` allows your Vercel domain
- Check Render backend logs for connection attempts

### CORS Issues:

If you get CORS errors, update `backend/server.js`:

```javascript
const io = socketIo(server, {
  cors: {
    origin: [
      "http://localhost:3000",
      "https://your-chat-app.vercel.app",
      process.env.FRONTEND_URL
    ],
    methods: ["GET", "POST"]
  }
});
```

---

## 📝 Important Notes

### Render Free Tier:
- Services sleep after 15 minutes of inactivity
- First request after sleep takes ~30 seconds (wake time)
- Perfect for testing and development

### Vercel Free Tier:
- Unlimited deployments
- No sleeping
- Perfect for frontend hosting

### MongoDB Atlas Free Tier:
- 512 MB storage
- Shared cluster
- Perfect for development/testing

---

## 🔄 Updating Your Deployed App

### Backend Updates:
1. Push changes to GitHub
2. Render automatically redeploys (if auto-deploy is enabled)

### Frontend Updates:
1. Push changes to GitHub
2. Vercel automatically redeploys

---

## 📚 Additional Resources

- Render Docs: https://render.com/docs
- Vercel Docs: https://vercel.com/docs
- MongoDB Atlas Docs: https://docs.atlas.mongodb.com

---

## 🎉 Success Checklist

- [ ] MongoDB Atlas cluster created
- [ ] Database user created
- [ ] Network access configured
- [ ] Connection string copied
- [ ] Backend deployed to Render
- [ ] Backend URL copied
- [ ] Frontend deployed to Vercel
- [ ] Frontend URL copied
- [ ] Environment variables updated
- [ ] Chat app tested and working!

---

**Need Help?** Check the logs in Render and Vercel dashboards for specific errors.



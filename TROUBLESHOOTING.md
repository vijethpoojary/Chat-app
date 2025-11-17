# 🔧 Troubleshooting Guide

## ✅ Issue Resolved: ajv/dist/compile/codegen Error

### Problem:
```
Cannot find module 'ajv/dist/compile/codegen'
```

### Solution Applied:
Installed `ajv@^8.12.0` as a dev dependency to fix the module resolution issue with `react-scripts 5.0.1`.

### How to Apply Fix (if needed again):
```bash
cd frontend
npm install ajv@^8.12.0 --save-dev
```

---

## 🐛 Common Issues & Solutions

### 1. Frontend Won't Start (ajv Error)
**Error:** `Cannot find module 'ajv/dist/compile/codegen'`

**Solution:**
```bash
cd frontend
npm install ajv@^8.12.0 --save-dev
npm start
```

---

### 2. MongoDB Connection Failed
**Error:** `❌ MongoDB Connection Error`

**Solutions:**
1. **Check if MongoDB is running:**
   ```bash
   netstat -an | findstr 27017
   ```
   Should show `LISTENING` on port 27017

2. **Start MongoDB (Windows):**
   ```bash
   net start MongoDB
   ```

3. **Check connection string in `backend/.env`:**
   ```env
   MONGODB_URI=mongodb://localhost:27017/chat-app
   ```

---

### 3. Backend Won't Start
**Error:** `Cannot find module 'express'` or similar

**Solution:**
```bash
cd backend
npm install
npm start
```

---

### 4. Port Already in Use
**Error:** `Port 5000 is already in use` or `Port 3000 is already in use`

**Solutions:**

**Windows - Find and kill process:**
```bash
# Find process using port 5000
netstat -ano | findstr :5000

# Kill the process (replace PID with the number from above)
taskkill /PID <PID> /F

# Find process using port 3000
netstat -ano | findstr :3000

# Kill the process
taskkill /PID <PID> /F
```

**Or change ports:**
- Backend: Change `PORT=5000` to `PORT=5001` in `backend/.env`
- Frontend: Create `frontend/.env` with `PORT=3001`

---

### 5. Socket.io Connection Failed
**Error:** Frontend can't connect to backend

**Solutions:**
1. **Make sure backend is running:**
   ```bash
   cd backend
   npm start
   ```
   Should see: `🚀 Server running on port 5000`

2. **Check `frontend/.env`:**
   ```env
   REACT_APP_SOCKET_URL=http://localhost:5000
   ```

3. **Check CORS settings in `backend/server.js`**

---

### 6. Google Indic Keyboard Not Working
**Issue:** Keyboard doesn't appear when pressing Ctrl+G

**Solutions:**
1. **Check internet connection** (Google API needs internet)
2. **Check browser console** for errors
3. **Verify Google API is loaded** in `public/index.html`
4. **Try refreshing the page**
5. **Try different browser** (Chrome works best)

---

### 7. npm install Errors
**Error:** Various npm errors during installation

**Solutions:**
1. **Clear npm cache:**
   ```bash
   npm cache clean --force
   ```

2. **Delete node_modules and reinstall:**
   ```bash
   rm -rf node_modules package-lock.json
   npm install
   ```

3. **Update npm:**
   ```bash
   npm install -g npm@latest
   ```

---

### 8. Tailwind CSS Not Working
**Issue:** Styles not applying

**Solutions:**
1. **Make sure Tailwind is installed:**
   ```bash
   cd frontend
   npm install tailwindcss postcss autoprefixer --save-dev
   ```

2. **Check `tailwind.config.js`** - content paths should include `"./src/**/*.{js,jsx}"`

3. **Verify `index.css`** has Tailwind directives:
   ```css
   @tailwind base;
   @tailwind components;
   @tailwind utilities;
   ```

4. **Restart React app:**
   ```bash
   npm start
   ```

---

### 9. Messages Not Saving
**Issue:** Messages disappear after refresh

**Solutions:**
1. **Check MongoDB connection** (see issue #2)
2. **Check backend logs** for errors
3. **Verify message schema** in `backend/server.js`
4. **Check database in MongoDB Compass** - should see `chat-app` database with `messages` collection

---

### 10. Mobile Responsive Issues
**Issue:** App doesn't look good on mobile

**Solutions:**
1. **Check viewport meta tag** in `public/index.html`:
   ```html
   <meta name="viewport" content="width=device-width, initial-scale=1" />
   ```

2. **Verify Tailwind responsive classes** are being used (e.g., `md:`, `sm:`)

3. **Test in browser dev tools** mobile view

---

## 🔍 Debug Commands

**Check Node.js version:**
```bash
node --version
```
Should be v14 or higher

**Check npm version:**
```bash
npm --version
```

**Check MongoDB version:**
```bash
mongo --version
```
Or in MongoDB Compass: Help > About

**Check all processes:**
```bash
# Windows
tasklist

# Check specific ports
netstat -ano | findstr :5000
netstat -ano | findstr :3000
```

---

## 📝 Still Having Issues?

1. **Check all console logs** (browser and terminal)
2. **Verify all dependencies installed:**
   ```bash
   cd backend && npm install
   cd ../frontend && npm install
   ```
3. **Make sure MongoDB is running**
4. **Check firewall settings** (ports 3000 and 5000)
5. **Try restarting everything:**
   - Stop backend (Ctrl+C)
   - Stop frontend (Ctrl+C)
   - Restart MongoDB
   - Start backend again
   - Start frontend again

---

## 🆘 Getting Help

If none of these solutions work:
1. Check the error message carefully
2. Search for the error on Google/Stack Overflow
3. Check the project README.md
4. Verify your Node.js and MongoDB versions

---

**Last Updated:** After fixing ajv dependency issue



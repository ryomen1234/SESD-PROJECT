# 🎵 Sonic Architect - Audius Playlist Integration

## ✅ What's Been Implemented

I've successfully integrated **Audius API** into your Sonic Architect project! Tumhara backend ab real Audius playlists fetch kar sakta hai aur frontend mein beautiful playlist search interface hai.

### 🚀 Features Added:

1. **🔥 Backend APIs (Node.js - Port 5000):**
   - Trending Playlists: `GET /api/playlists/trending`
   - Search Playlists: `GET /api/playlists/search?query=music`
   - Get Playlist Details: `GET /api/playlists/:id`
   - Get Playlist Tracks: `GET /api/playlists/:id/tracks`
   - Bulk Playlists: `GET /api/playlists`
   - Health Check: `GET /api/playlists/health/check`

2. **🎨 Frontend Features:**
   - New Playlist Search page at `/playlists`
   - Beautiful playlist cards with artwork
   - Search functionality with real-time results
   - Trending playlists display
   - Individual playlist track viewer
   - Updated navigation with playlist link
   - Updated existing pages to use Node.js backend

3. **🔧 Technical Improvements:**
   - Added axios dependency for HTTP requests
   - Created AudiusService for API management
   - Added TypeScript interfaces for playlists
   - Error handling and loading states
   - Proper data formatting and validation

---

## 🚀 Quick Setup Guide

### Step 1: Install Backend Dependencies
```bash
cd sonic-architect-main/nodejs-backend
npm install  # This will install the new axios dependency
```

### Step 2: Start the Backend Server
```bash
cd sonic-architect-main/nodejs-backend
npm run dev
# Backend will run on http://localhost:5000
```

### Step 3: Start the Frontend
```bash
cd sonic-architect-main/audio-soul-mixer
npm run dev
# Frontend will run on http://localhost:5173
```

### Step 4: Test Everything
Open your browser and visit:
- **Homepage:** http://localhost:5173
- **Playlist Search:** http://localhost:5173/playlists
- **Backend Health:** http://localhost:5000/api/playlists/health/check

---

## 🧪 Testing Your Setup

### Quick Test in Browser Console:
```javascript
// Open browser console on your frontend and run:
await quickConnectivityTest()

// Then test all APIs:
await testPlaylistAPIs()
```

### Manual API Testing:
```bash
# Test trending playlists
curl "http://localhost:5000/api/playlists/trending?limit=3"

# Test playlist search
curl "http://localhost:5000/api/playlists/search?query=chill&limit=5"

# Test health check
curl "http://localhost:5000/api/playlists/health/check"
```

---

## 🔍 How to Use the New Features

### 1. Playlist Search Page
- Go to: http://localhost:5173/playlists
- **Search:** Type any music genre, artist, or mood
- **Browse:** View trending playlists without searching
- **Explore:** Click "View Tracks" to see individual songs

### 2. Updated Recommendation Pages
- **Song Recommendations:** http://localhost:5173/recommend-by-song
- **Mood Recommendations:** http://localhost:5173/recommend-by-mood
- Both now use the Node.js backend (port 5000) instead of Python backend

### 3. Navigation
- Added "Playlists" link in the top navigation
- All pages properly connected and working

---

## 📂 File Structure (New/Modified Files)

```
sonic-architect-main/
├── nodejs-backend/
│   ├── package.json ← Added axios dependency
│   ├── services/
│   │   └── audiusService.js ← NEW: Audius API service
│   ├── routes/
│   │   └── playlists.js ← UPDATED: Complete playlist routes
│   └── examples/
│       └── playlist-api-examples.js ← NEW: Usage examples
│
├── audio-soul-mixer/
│   ├── src/
│   │   ├── services/
│   │   │   └── api.ts ← UPDATED: Added playlist APIs
│   │   ├── pages/
│   │   │   ├── PlaylistSearch.tsx ← NEW: Playlist search page
│   │   │   ├── RecommendBySong.tsx ← UPDATED: Uses Node.js backend
│   │   │   └── RecommendByMood.tsx ← UPDATED: Uses Node.js backend
│   │   ├── components/
│   │   │   └── Navigation.tsx ← UPDATED: Added playlist link
│   │   └── App.tsx ← UPDATED: Added playlist route
│   └── test-api.js ← NEW: API testing script
│
└── PLAYLIST_SETUP.md ← THIS FILE
```

---

## 🐛 Troubleshooting

### Backend Not Starting?
```bash
# Make sure you're in the right directory
cd sonic-architect-main/nodejs-backend

# Install dependencies
npm install

# Check if axios is installed
npm list axios

# Start server
npm run dev
```

### Frontend Not Connecting?
```bash
# Check if backend is running on port 5000
curl http://localhost:5000/api/playlists/health/check

# If not, start backend first
# Then start frontend
cd sonic-architect-main/audio-soul-mixer
npm run dev
```

### No Playlists Showing?
1. **Check internet connection** - APIs fetch from Audius servers
2. **Check backend logs** - Look for error messages in terminal
3. **Test API directly** - Use curl commands above
4. **Clear browser cache** - Hard refresh with Ctrl+F5

### Common Error Messages:
- **"Cannot find package 'axios'"** → Run `npm install` in nodejs-backend
- **"Network error"** → Backend not running or wrong port
- **"Failed to fetch"** → CORS issue or backend down

---

## 🎯 API Endpoints Reference

### Trending Playlists
```bash
GET /api/playlists/trending
Query Params:
  - time: 'week' | 'month' | 'year' | 'allTime' (default: 'week')
  - offset: number (default: 0)
  - limit: number (max: 100, default: 10)

Example: /api/playlists/trending?time=week&limit=5
```

### Search Playlists
```bash
GET /api/playlists/search
Query Params:
  - query: string (required) - Search term
  - offset: number (default: 0)
  - limit: number (max: 50, default: 10)

Example: /api/playlists/search?query=chill&limit=10
```

### Get Playlist Tracks
```bash
GET /api/playlists/:id/tracks
Path Params:
  - id: string (required) - Playlist ID
Query Params:
  - offset: number (default: 0)
  - limit: number (max: 100, default: 50)

Example: /api/playlists/DOPRl/tracks?limit=20
```

---

## 🎉 Success Indicators

When everything is working correctly, you should see:

### ✅ Backend Console:
```
🎵 Sonic Architect backend running on port 5000
🎵 Fetching trending playlists: time=week, offset=0, limit=10
✅ Retrieved 10 trending playlists
```

### ✅ Frontend:
- Playlist search page loads without errors
- Trending playlists appear on page load
- Search returns results as you type
- Individual playlist tracks load when clicked

### ✅ Browser Network Tab:
- API calls to `localhost:5000/api/playlists/*`
- Successful 200 responses
- JSON data in response preview

---

## 🔄 What Changed from Original

### Before (Python Backend - Port 8000):
```javascript
// Old API calls in frontend
fetch("http://127.0.0.1:8000/api/recommend/mood/chill")
fetch("http://127.0.0.1:8000/api/songs")
```

### Now (Node.js Backend - Port 5000):
```javascript
// New API calls
fetch("http://localhost:5000/api/recommendations/mood/chill")
fetch("http://localhost:5000/api/songs")
fetch("http://localhost:5000/api/playlists/search?query=chill")
```

### New Features:
- ✅ Real Audius playlist data
- ✅ Beautiful playlist search interface
- ✅ Trending playlists from Audius
- ✅ Individual playlist track viewing
- ✅ Proper error handling and loading states
- ✅ TypeScript support with proper interfaces

---

## 📞 Need Help?

If kuch problem aa rahi hai, check these:

1. **Both servers running?** Backend (port 5000) + Frontend (port 5173)
2. **Dependencies installed?** `npm install` in both directories
3. **Internet connection?** APIs fetch from Audius servers
4. **Browser console errors?** Check for JavaScript errors
5. **API responses?** Use browser Network tab or curl commands

The integration is complete and ready to use! 🎵✨ 
# 🎵 Sonic Architect - MERN Stack Music Recommendation App

![Sonic Architect](https://img.shields.io/badge/Sonic-Architect-purple?style=for-the-badge&logo=music)
![MERN Stack](https://img.shields.io/badge/MERN-Stack-brightgreen?style=for-the-badge)
![AI Powered](https://img.shields.io/badge/AI-Powered-orange?style=for-the-badge)

**Ek amazing MERN stack music recommendation system with AI, 3D graphics, aur modern UI!** 🚀

## ✨ Project Ki Features

- **🎯 AI Music Recommendations** - Song similarity using machine learning
- **🎨 3D Music Visualizations** - Three.js powered interactive graphics
- **📊 Real-time Analytics** - Beautiful charts aur data visualization
- **🎭 Mood-based Playlists** - Different moods ke liye curated music
- **⚡ Modern UI/UX** - Glass morphism design with smooth animations
- **🔥 MERN Stack** - MongoDB, Express.js, React, Node.js

---

## 🛠️ Technologies Used

### Frontend (React)
- **React 18** with TypeScript
- **Vite** - Super fast development
- **Three.js** - 3D graphics aur visualizations
- **Framer Motion** - Smooth animations
- **Recharts** - Interactive charts
- **Tailwind CSS** - Modern styling
- **shadcn/ui** - Beautiful UI components

### Backend (Node.js)
- **Express.js** - Web server
- **MongoDB** - Database (optional for demo)
- **Machine Learning** - Song recommendation algorithms
- **CORS, Helmet** - Security features

---

## 📋 Prerequisites (Pehle Install Karni Hai)

Yeh cheezein install honi chahiye:

1. **Node.js** (v18 ya higher) - [Download here](https://nodejs.org/)
2. **Git** - [Download here](https://git-scm.com/)
3. **MongoDB** (optional) - [Download here](https://www.mongodb.com/try/download/community)

### Node.js Check Karo:
```bash
node --version
npm --version
```

---

## 🚀 Step-by-Step Setup Instructions

### Step 1: Project Download/Clone Karo

```bash
# Agar GitHub se clone kar rahe ho
git clone <your-repo-url>
cd sonic-architect-main

# Ya phir zip download kar ke extract karo
```

### Step 2: Project Structure Samjho

```
sonic-architect-main/
├── sonic-architect-main/          # Main project folder
│   ├── nodejs-backend/            # Backend server (Express.js)
│   ├── audio-soul-mixer/          # Frontend app (React)
│   └── README.md                  # Yeh file
```

### Step 3: Backend Setup (Server) 

**Terminal/PowerShell open karo aur yeh commands run karo:**

```bash
# Main project folder mein jao
cd sonic-architect-main/sonic-architect-main

# Backend folder mein jao
cd nodejs-backend

# Dependencies install karo
npm install

# Environment file check karo (already created hai)
# .env file already hai with default settings

# Backend server start karo
npm start
```

**Backend ready message dikhaiga:** `🚀 Server running on port 5000`

**Backend URL:** http://localhost:5000/api

### Step 4: Frontend Setup (React App)

**NAYA terminal/PowerShell window open karo:**

```bash
# Main project folder mein jao
cd sonic-architect-main/sonic-architect-main

# Frontend folder mein jao  
cd audio-soul-mixer

# Dependencies install karo (agar already nahi hai)
npm install

# React app start karo
npm run dev
```

**Frontend ready message dikhaiga:** `Local: http://localhost:5173`

**Frontend URL:** http://localhost:5173

---

## 🎮 App Kaise Use Kare

### 1. Browser mein jao: `http://localhost:5173`

### 2. App ke Features:

- **🏠 Home Page** - 3D visualizations aur analytics dashboard
- **🎵 Song Recommendations** - AI powered similar songs
- **🎭 Mood-based Music** - Party, Chill, Focus, Workout playlists  
- **🎨 Audio Alchemist** - Custom playlist creation
- **📊 Analytics** - Interactive charts aur statistics

### 3. Navigation:
- **Song Discovery** - Enter song name for recommendations
- **Mood Selection** - Choose mood from 9 different options
- **3D Visualizer** - Interactive music visualization
- **Charts & Analytics** - Real-time data visualization

---

## 🔧 Troubleshooting (Problems & Solutions)

### ❌ Problem: "npm install" mein error
**Solution:**
```bash
# Cache clear karo
npm cache clean --force

# Fir install karo
npm install
```

### ❌ Problem: "Port already in use"
**Solution:**
```bash
# Windows mein port kill karo
netstat -ano | findstr :5000
taskkill /PID <process_id> /F

# Ya different port use karo
npm start -- --port 5001
```

### ❌ Problem: MongoDB connection error
**Solution:**
- MongoDB optional hai demo ke liye
- Backend mock data use karega agar MongoDB nahi hai
- Real database ke liye MongoDB install karo

### ❌ Problem: React compilation errors
**Solution:**
```bash
cd audio-soul-mixer
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### ❌ Problem: 3D graphics not loading
**Solution:**
- Make sure latest browser use kar rahe ho
- Hardware acceleration enable karo browser mein

---

## 📁 Detailed Project Structure

```
sonic-architect-main/
└── sonic-architect-main/
    ├── nodejs-backend/              # 🚀 Backend Server
    │   ├── models/                  # Database models
    │   ├── routes/                  # API routes
    │   │   ├── songs.js            # Songs API
    │   │   ├── recommendations.js  # AI recommendations
    │   │   ├── users.js            # User management
    │   │   └── playlists.js        # Playlist features
    │   ├── utils/                   # Utility functions
    │   │   └── recommendationEngine.js # ML algorithms
    │   ├── scripts/                 # Database scripts
    │   ├── server.js               # Main server file
    │   ├── package.json            # Dependencies
    │   └── .env                    # Environment variables
    │
    ├── audio-soul-mixer/            # ⚛️ React Frontend
    │   ├── src/
    │   │   ├── components/         # React components
    │   │   │   ├── ui/            # shadcn/ui components
    │   │   │   ├── MusicVisualizer3D.tsx # 3D graphics
    │   │   │   └── AnalyticsDashboard.tsx # Charts
    │   │   ├── pages/              # Page components
    │   │   │   ├── Home.tsx        # Homepage with 3D
    │   │   │   ├── RecommendBySong.tsx
    │   │   │   └── RecommendByMood.tsx
    │   │   ├── services/           # API services
    │   │   │   └── api.ts          # Backend communication
    │   │   └── lib/                # Utilities
    │   ├── public/                 # Static files
    │   └── package.json           # Frontend dependencies
    │
    └── README.md                   # Is file! 📖
```

---

## 🎯 API Endpoints (Backend Routes)

### Songs API:
- `GET /api/songs` - All songs with filters
- `GET /api/songs/:id` - Specific song details
- `POST /api/songs/:id/play` - Increment play count
- `POST /api/songs/:id/like` - Like a song

### Recommendations API:
- `GET /api/recommendations/song/:id` - Similar songs
- `GET /api/recommendations/mood/:mood` - Mood-based songs
- `GET /api/recommendations/trending` - Trending music
- `GET /api/recommendations/moods` - Available moods

### Health Check:
- `GET /api/health` - Server status
- `GET /api` - API information

---

## 🎨 UI Features

### 🏠 Homepage:
- **Hero Section** with animated text
- **3D Music Visualizer** with floating spheres
- **Interactive Statistics** cards
- **Feature Cards** with hover effects
- **Analytics Dashboard** with charts

### 🎵 Music Pages:
- **Search Interface** for songs
- **Mood Selection** grid
- **Recommendation Lists** with song cards
- **Audio Feature Analysis**

### 📊 Charts & Analytics:
- **Area Charts** - Music trends over time
- **Pie Charts** - Mood distribution
- **Bar Charts** - Genre popularity
- **Interactive Tooltips**

---

## 🚀 Production Deployment

### Frontend (Vercel/Netlify):
```bash
cd audio-soul-mixer
npm run build
# Upload dist/ folder
```

### Backend (Heroku/Railway):
```bash
cd nodejs-backend
# Set environment variables
# Deploy server.js
```

### Environment Variables:
```env
# Backend .env
PORT=5000
MONGODB_URI=your_mongo_connection_string
JWT_SECRET=your_secret_key
NODE_ENV=production
FRONTEND_URL=your_frontend_url
```

---

## 🤝 Contributing

Contributions welcome hai! Follow karo:

1. Fork the repository
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push branch: `git push origin feature/amazing-feature`
5. Open Pull Request

---

## 📞 Support & Help

### Common Commands:
```bash
# Backend start
cd sonic-architect-main/nodejs-backend
npm start

# Frontend start  
cd sonic-architect-main/audio-soul-mixer
npm run dev

# Install dependencies
npm install

# Clear cache
npm cache clean --force
```

### Quick Links:
- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:5000/api
- **Health Check:** http://localhost:5000/api/health

---

## 🎉 Demo Screenshots

### 🏠 Homepage with 3D Visualizer
- Interactive 3D music spheres
- Real-time analytics dashboard
- Smooth animations aur modern design

### 🎵 Music Recommendations
- AI-powered song suggestions
- Mood-based playlist creation
- Interactive charts aur data visualization

### 📊 Analytics Dashboard
- Music trends analysis
- User engagement metrics  
- Beautiful responsive charts

---

## 📝 License

MIT License - Free to use for personal aur commercial projects!

---

## 🌟 Made With ❤️

**Tech Stack:** MERN (MongoDB, Express.js, React, Node.js)  
**Features:** AI/ML, 3D Graphics, Real-time Analytics  
**UI/UX:** Modern, Responsive, Interactive  

### 🎵 **Happy Coding! Enjoy the music!** 🎵

---

**Questions? Issues? Problems?** 
GitHub issues create karo ya documentation check karo! 

**Project successfully setup hone ke baad aapke paas hoga:**
- ✅ Beautiful 3D music visualizations
- ✅ AI-powered recommendations  
- ✅ Interactive analytics dashboard
- ✅ Modern responsive design
- ✅ Full MERN stack experience 
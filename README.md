# 🎵 Sonic Architect - AI Music Recommendation App

 **Discover your next favorite song with intelligent music recommendations powered by AI and advanced audio analysis.**

## ✨ Features

### 🎯 Core Features
- **AI-Powered Music Recommendations** - Get personalized song suggestions based on your preferences
- **Smart Playlist Generator** - Create custom playlists for any mood or activity
- **Audio Alchemist** - Mix musical attributes to create unique playlists
- **Mood-Based Discovery** - Find music that matches your current mood
- **Song-Based Recommendations** - Discover similar songs to your favorites
- **Real-Time Audio Previews** - Listen to song snippets before adding to playlists

### 🎨 User Experience
- **Modern Glass Morphism UI** - Beautiful, responsive design with smooth animations
- **Interactive Music Visualizer** - 3D graphics and real-time audio visualization
- **User Authentication** - Secure login with Google OAuth and email/password
- **Playlist Management** - Save, organize, and share your favorite playlists
- **Recently Played Tracking** - Keep track of your listening history
- **Responsive Design** - Works perfectly on desktop, tablet, and mobile

### 🔧 Technical Features
- **Real-Time Search** - Instant music discovery with live search results
- **Advanced Filtering** - Filter by genre, mood, energy level, and more
- **Audio Feature Analysis** - Deep analysis of danceability, energy, valence, and acousticness
- **Fallback System** - Reliable music recommendations even when external APIs are unavailable
- **Performance Optimized** - Fast loading times and smooth user experience

## 🏗️ Architecture

### Frontend (React + TypeScript)
```
audio-soul-mixer/
├── src/
│   ├── components/          # Reusable UI components
│   ├── pages/              # Main application pages
│   ├── contexts/           # React contexts (Auth, Toast)
│   ├── services/           # API services and utilities
│   ├── hooks/              # Custom React hooks
│   └── types/              # TypeScript type definitions
```

### Backend (Node.js + Express)
```
nodejs-backend/
├── routes/                 # API route handlers
├── services/               # Business logic services
├── models/                 # Data models
├── utils/                  # Utility functions
└── scripts/                # Database seeding scripts
```

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern UI library with hooks
- **TypeScript** - Type-safe development
- **Vite** - Lightning-fast build tool
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Beautiful, accessible UI components
- **Framer Motion** - Smooth animations and transitions
- **React Router** - Client-side routing
- **React Query** - Server state management
- **Lucide React** - Beautiful icons

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database (optional)
- **Firebase** - Authentication and real-time database
- **JWT** - JSON Web Tokens for authentication
- **Express Validator** - Input validation
- **CORS** - Cross-origin resource sharing
- **Helmet** - Security headers
- **Morgan** - HTTP request logger

### External APIs
- **Music APIs** - Multiple music service integrations
🎵 iTunes API - Music search and metadata
🎶 Deezer API - Music streaming and charts
🔥 Firebase - Real-time features and hosting


## 🚀 Quick Start

### Prerequisites
- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **Git**

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/audio-soul-mixer.git
   cd audio-soul-mixer
   ```

2. **Install frontend dependencies**
   ```bash
   cd audio-soul-mixer
   npm install
   ```

3. **Install backend dependencies**
   ```bash
   cd ../nodejs-backend
   npm install
   ```

4. **Start the development servers**

   **Backend (Terminal 1)**
   ```bash
   cd nodejs-backend
   npm run dev
   ```

   **Frontend (Terminal 2)**
   ```bash
   cd audio-soul-mixer
   npm run dev
   ```

5. **Open your browser**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000/api

## 📱 Features Walkthrough

### 🎵 Music Discovery
- **Search & Browse** - Explore millions of tracks with real-time search
- **Smart Filters** - Filter by genre, mood, energy, and more
- **Audio Previews** - Listen to 30-second previews before adding to playlists

### 🎨 Audio Alchemist
- **Custom Mixing** - Adjust danceability, energy, valence, and acousticness
- **Preset Configurations** - Quick presets for Party, Study, Workout, and more
- **Real-Time Generation** - Create playlists instantly based on your preferences

### 🎭 Mood-Based Recommendations
- **Mood Selection** - Choose from workout, focus, sad, party, chill, and more
- **Activity-Based** - Get music recommendations for specific activities
- **Personalized Results** - AI-powered suggestions based on your mood

### 📊 Smart Playlist Generator
- **Custom Parameters** - Set duration, energy level, genre, and mood
- **AI Integration** - Machine learning recommendations
- **Export Options** - Save playlists to your account or export

### 👤 User Features
- **Authentication** - Secure login with Google OAuth or email/password
- **Profile Management** - View and edit your profile
- **Playlist History** - Track your recently played songs
- **Saved Playlists** - Organize and manage your custom playlists

## 🔧 Development

### Available Scripts

**Frontend**
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

**Backend**
```bash
npm start            # Start production server
npm run dev          # Start development server with nodemon
npm test             # Run tests
npm run seed         # Seed database with sample data
```

### Project Structure

```
audio-soul-mixer/
├── public/                  # Static assets
├── src/
│   ├── components/          # Reusable components
│   │   ├── ui/             # shadcn/ui components
│   │   ├── Layout.tsx      # Main layout component
│   │   ├── Navigation.tsx  # Navigation bar
│   │   └── SongCard.tsx    # Song display component
│   ├── pages/              # Application pages
│   │   ├── Home.tsx        # Landing page
│   │   ├── AudioAlchemist.tsx
│   │   ├── RecommendByMood.tsx
│   │   ├── SmartPlaylistGenerator.tsx
│   │   └── ...
│   ├── contexts/           # React contexts
│   │   ├── AuthContext.tsx # Authentication state
│   │   └── ToastContext.tsx
│   ├── services/           # API services
│   │   ├── musicService.ts
│   │   ├── playlistService.ts
│   │   └── authService.ts
│   └── types/              # TypeScript types
└── package.json

nodejs-backend/
├── routes/                 # API routes
│   ├── songs.js           # Music endpoints
│   ├── playlists.js       # Playlist management
│   └── auth.js            # Authentication
├── services/               # Business logic
│   ├── musicService.js    # Music API integration
│   └── mlService.js       # ML recommendations
├── models/                 # Data models
├── utils/                  # Utilities
└── server.js              # Main server file
```

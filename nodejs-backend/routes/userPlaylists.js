import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const router = express.Router();

// Middleware to verify JWT token
const authenticateToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-jwt-secret');
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Save playlist
router.post('/save', authenticateToken, async (req, res) => {
  try {
    const { name, description, tracks } = req.body;
    
    if (!name || !tracks || tracks.length === 0) {
      return res.status(400).json({ message: 'Playlist name and tracks are required' });
    }
    
    const playlist = {
      id: `playlist_${Date.now()}`,
      name,
      description: description || '',
      tracks: tracks.map(track => ({
        id: track.id,
        title: track.title,
        artist: track.artist,
        artwork: track.artwork,
        duration: track.duration,
        preview_url: track.preview_url,
        deezer_url: track.deezer_url,
        full_song_url: track.full_song_url
      })),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    req.user.savedPlaylists.push(playlist);
    await req.user.save();
    
    res.json({ 
      message: 'Playlist saved successfully',
      playlist 
    });
  } catch (error) {
    console.error('Error saving playlist:', error);
    res.status(500).json({ message: 'Error saving playlist' });
  }
});

// Get user's saved playlists
router.get('/saved', authenticateToken, async (req, res) => {
  try {
    const playlists = req.user.savedPlaylists.sort((a, b) => 
      new Date(b.updatedAt) - new Date(a.updatedAt)
    );
    
    res.json({ playlists });
  } catch (error) {
    console.error('Error fetching playlists:', error);
    res.status(500).json({ message: 'Error fetching playlists' });
  }
});

// Get specific playlist
router.get('/:playlistId', authenticateToken, async (req, res) => {
  try {
    const playlist = req.user.savedPlaylists.find(p => p.id === req.params.playlistId);
    
    if (!playlist) {
      return res.status(404).json({ message: 'Playlist not found' });
    }
    
    res.json({ playlist });
  } catch (error) {
    console.error('Error fetching playlist:', error);
    res.status(500).json({ message: 'Error fetching playlist' });
  }
});

// Update playlist
router.put('/:playlistId', authenticateToken, async (req, res) => {
  try {
    const { name, description, tracks } = req.body;
    
    const playlistIndex = req.user.savedPlaylists.findIndex(p => p.id === req.params.playlistId);
    
    if (playlistIndex === -1) {
      return res.status(404).json({ message: 'Playlist not found' });
    }
    
    req.user.savedPlaylists[playlistIndex] = {
      ...req.user.savedPlaylists[playlistIndex],
      name: name || req.user.savedPlaylists[playlistIndex].name,
      description: description || req.user.savedPlaylists[playlistIndex].description,
      tracks: tracks || req.user.savedPlaylists[playlistIndex].tracks,
      updatedAt: new Date()
    };
    
    await req.user.save();
    
    res.json({ 
      message: 'Playlist updated successfully',
      playlist: req.user.savedPlaylists[playlistIndex]
    });
  } catch (error) {
    console.error('Error updating playlist:', error);
    res.status(500).json({ message: 'Error updating playlist' });
  }
});

// Delete playlist
router.delete('/:playlistId', authenticateToken, async (req, res) => {
  try {
    const playlistIndex = req.user.savedPlaylists.findIndex(p => p.id === req.params.playlistId);
    
    if (playlistIndex === -1) {
      return res.status(404).json({ message: 'Playlist not found' });
    }
    
    req.user.savedPlaylists.splice(playlistIndex, 1);
    await req.user.save();
    
    res.json({ message: 'Playlist deleted successfully' });
  } catch (error) {
    console.error('Error deleting playlist:', error);
    res.status(500).json({ message: 'Error deleting playlist' });
  }
});

export default router; 
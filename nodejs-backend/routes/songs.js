const express = require('express');
const { body, param, query, validationResult } = require('express-validator');

const musicService = require('../services/musicService.js');

const router = express.Router();

// Validation middleware
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: 'error',
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// GET /api/songs
// Get all songs with optional search, mood, and genre filters
router.get('/', [
  query('search').optional().trim(),
  query('mood').optional().trim(),
  query('genre').optional().trim(),
  query('limit').optional().isInt({ min: 1, max: 50000 }).withMessage('Limit must be between 1 and 50000'),
  query('skip').optional().isInt({ min: 0 }).withMessage('Skip must be a non-negative integer'),
  handleValidationErrors
], async (req, res) => {
  try {
    const { search, mood, genre, limit = 100, skip = 0 } = req.query;

    let songs = [];
    if (search) {
      songs = await musicService.searchSongs(search, limit);
          } else {
      songs = await musicService.getPopularTracks(limit);
    }

    res.status(200).json({
        status: 'success',
        message: 'Songs retrieved successfully',
        data: {
          songs,
        total: songs.length,
        limit: parseInt(limit),
        skip: skip
      }
    });
    } catch (error) {
    console.error('❌ API search failed:', error.message);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error while fetching songs'
    });
  }
});

// Fallback songs function for when APIs fail
function getFallbackSongs(searchTerm = '', limit = 20) {
  // Generate realistic songs quickly
  const songs = [];
  const artists = [
    'The Weeknd', 'Ed Sheeran', 'Billie Eilish', 'Dua Lipa', 'Harry Styles', 'Post Malone', 'Ariana Grande', 'Drake', 'Taylor Swift', 'Bad Bunny',
    'Justin Bieber', 'BTS', 'Blackpink', 'The Kid LAROI', 'Doja Cat', 'Olivia Rodrigo', 'Lil Nas X', 'Megan Thee Stallion', 'Cardi B', 'Travis Scott'
  ];
  
  const albums = [
    'After Hours', 'Divide', 'When We All Fall Asleep', 'Future Nostalgia', 'Fine Line', 'Hollywood\'s Bleeding', 'Positions', 'Scorpion', 'Folklore', 'Un Verano Sin Ti',
    'Justice', 'Map of the Soul', 'The Album', 'F*CK LOVE', 'Planet Her', 'SOUR', 'Montero', 'Good News', 'Invasion of Privacy', 'Astroworld'
  ];
  
  const songNames = [
    'Blinding Lights', 'Shape of You', 'Bad Guy', 'Levitating', 'Watermelon Sugar', 'Circles', '34+35', 'God\'s Plan', 'Cardigan', 'Me Porto Bonito',
    'Peaches', 'Dynamite', 'How You Like That', 'Stay', 'Kiss Me More', 'Drivers License', 'Montero', 'Savage', 'WAP', 'SICKO MODE'
  ];
  
  // If no search term, return popular songs
  if (!searchTerm || searchTerm === 'popular') {
    for (let i = 0; i < Math.min(limit, 50); i++) {
      const artist = artists[i % artists.length];
      const album = albums[i % albums.length];
      const songName = songNames[i % songNames.length];
      
      songs.push({
        id: `fallback_popular_${i + 1}`,
        name: songName,
        artist: artist,
        artists: artist,
        album: album,
        albumArt: `https://picsum.photos/300/300?random=${i + 1}`,
        album_art_url: `https://picsum.photos/300/300?random=${i + 1}`,
        preview_url: null,
        duration: Math.floor(Math.random() * 300) + 120,
        popularity: Math.floor(Math.random() * 30) + 70,
        playCount: Math.floor(Math.random() * 100000) + 1000,
        likeCount: Math.floor(Math.random() * 10000) + 100,
        source: 'fallback_popular',
        isActive: true,
        mood: ['energetic', 'upbeat', 'chill', 'danceable'][i % 4],
        genre: ['pop', 'hip-hop', 'rock', 'electronic'][i % 4],
        createdAt: new Date().toISOString()
      });
    }
  } else {
    // For search terms, generate realistic songs that might match
    for (let i = 0; i < Math.min(limit, 50); i++) {
      const artist = artists[i % artists.length];
      const album = albums[i % albums.length];
      const songName = songNames[i % songNames.length];
      
      // Create realistic song names that might match the search
      const realisticSongNames = [
        `${songName}`,
        `${searchTerm} Vibes`,
        `${searchTerm} Nights`,
        `${songName} (${searchTerm} Remix)`,
        `${searchTerm} Dreams`,
        `${songName} - ${searchTerm} Version`
      ];
      
      songs.push({
        id: `fallback_search_${i + 1}`,
        name: realisticSongNames[i % realisticSongNames.length],
        artist: artist,
        artists: artist,
        album: album,
        albumArt: `https://picsum.photos/300/300?random=${i + 1}`,
        album_art_url: `https://picsum.photos/300/300?random=${i + 1}`,
        preview_url: null,
        duration: Math.floor(Math.random() * 300) + 120,
        popularity: Math.floor(Math.random() * 30) + 70,
        playCount: Math.floor(Math.random() * 100000) + 1000,
        likeCount: Math.floor(Math.random() * 10000) + 100,
        source: 'fallback_search',
        isActive: true,
        mood: ['energetic', 'upbeat', 'chill', 'danceable'][i % 4],
        genre: ['pop', 'hip-hop', 'rock', 'electronic'][i % 4],
        createdAt: new Date().toISOString()
      });
    }
  }
  
  return songs;
}

// Helper function to get popular songs from local database
function getPopularSongsFromDatabase(searchTerm) {
  const searchLower = searchTerm.toLowerCase();
  const popularSongs = [
    {
      id: 'popular_1',
      name: 'Blinding Lights',
      artist: 'The Weeknd',
      artists: 'The Weeknd',
      album: 'After Hours',
      albumArt: 'https://is1-ssl.mzstatic.com/image/thumb/Music123/v4/73/6d/8c/736d8c1b-8f5a-8f5a-8f5a-8f5a8f5a8f5a/20UM1IM24801.rgb.jpg/100x100bb.jpg',
      album_art_url: 'https://is1-ssl.mzstatic.com/image/thumb/Music123/v4/73/6d/8c/736d8c1b-8f5a-8f5a-8f5a-8f5a8f5a8f5a/20UM1IM24801.rgb.jpg/100x100bb.jpg',
      preview_url: null,
      duration: 200,
      popularity: 95,
      playCount: 2500000,
      likeCount: 150000,
      source: 'popular_database',
      isActive: true,
      mood: ['energetic', 'upbeat'],
      genre: ['pop'],
      createdAt: new Date().toISOString()
    },
    {
      id: 'popular_2',
      name: 'Shape of You',
      artist: 'Ed Sheeran',
      artists: 'Ed Sheeran',
      album: '÷ (Divide)',
      albumArt: 'https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/8c/e8/85/8ce88585-8f5a-8f5a-8f5a-8f5a8f5a8f5a/20UM1IM24801.rgb.jpg/100x100bb.jpg',
      album_art_url: 'https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/8c/e8/85/8ce88585-8f5a-8f5a-8f5a-8f5a8f5a8f5a/20UM1IM24801.rgb.jpg/100x100bb.jpg',
      preview_url: null,
      duration: 233,
      popularity: 92,
      playCount: 2200000,
      likeCount: 120000,
      source: 'popular_database',
      isActive: true,
      mood: ['energetic', 'upbeat'],
      genre: ['pop'],
      createdAt: new Date().toISOString()
    },
    {
      id: 'popular_3',
      name: 'Dance Monkey',
      artist: 'Tones and I',
      artists: 'Tones and I',
      album: 'The Kids Are Coming',
      albumArt: 'https://is1-ssl.mzstatic.com/image/thumb/Music113/v4/8c/e8/85/8ce88585-8f5a-8f5a-8f5a-8f5a8f5a8f5a/20UM1IM24801.rgb.jpg/100x100bb.jpg',
      album_art_url: 'https://is1-ssl.mzstatic.com/image/thumb/Music113/v4/8c/e8/85/8ce88585-8f5a-8f5a-8f5a-8f5a8f5a8f5a/20UM1IM24801.rgb.jpg/100x100bb.jpg',
      preview_url: null,
      duration: 210,
      popularity: 88,
      playCount: 1800000,
      likeCount: 95000,
      source: 'popular_database',
      isActive: true,
      mood: ['energetic', 'upbeat'],
      genre: ['pop'],
      createdAt: new Date().toISOString()
    },
    {
      id: 'popular_4',
      name: 'Bad Guy',
      artist: 'Billie Eilish',
      artists: 'Billie Eilish',
      album: 'When We All Fall Asleep, Where Do We Go?',
      albumArt: 'https://is1-ssl.mzstatic.com/image/thumb/Music114/v4/8c/e8/85/8ce88585-8f5a-8f5a-8f5a-8f5a8f5a8f5a/20UM1IM24801.rgb.jpg/100x100bb.jpg',
      album_art_url: 'https://is1-ssl.mzstatic.com/image/thumb/Music114/v4/8c/e8/85/8ce88585-8f5a-8f5a-8f5a-8f5a8f5a8f5a/20UM1IM24801.rgb.jpg/100x100bb.jpg',
      preview_url: null,
      duration: 194,
      popularity: 90,
      playCount: 2000000,
      likeCount: 110000,
      source: 'popular_database',
      isActive: true,
      mood: ['dark', 'mysterious'],
      genre: ['pop'],
      createdAt: new Date().toISOString()
    },
    {
      id: 'popular_5',
      name: 'Levitating',
      artist: 'Dua Lipa',
      artists: 'Dua Lipa',
      album: 'Future Nostalgia',
      albumArt: 'https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/8c/e8/85/8ce88585-8f5a-8f5a-8f5a-8f5a8f5a8f5a/20UM1IM24801.rgb.jpg/100x100bb.jpg',
      album_art_url: 'https://is1-ssl.mzstatic.com/image/thumb/Music116/v4/8c/e8/85/8ce88585-8f5a-8f5a-8f5a-8f5a8f5a8f5a/20UM1IM24801.rgb.jpg/100x100bb.jpg',
      preview_url: null,
      duration: 203,
      popularity: 87,
      playCount: 1600000,
      likeCount: 85000,
      source: 'popular_database',
      isActive: true,
      mood: ['energetic', 'upbeat'],
      genre: ['pop'],
      createdAt: new Date().toISOString()
    }
  ];

  // Filter songs that match the search term
  return popularSongs.filter(song => 
    song.name.toLowerCase().includes(searchLower) ||
    song.artist.toLowerCase().includes(searchLower) ||
    song.album.toLowerCase().includes(searchLower)
  );
}

// Helper function to get general popular songs
function getGeneralPopularSongs() {
  return [
    {
      id: 'general_1',
      name: 'Blinding Lights',
      artist: 'The Weeknd',
      artists: 'The Weeknd',
      album: 'After Hours',
      albumArt: 'https://is1-ssl.mzstatic.com/image/thumb/Music123/v4/73/6d/8c/736d8c1b-8f5a-8f5a-8f5a-8f5a8f5a8f5a/20UM1IM24801.rgb.jpg/100x100bb.jpg',
      album_art_url: 'https://is1-ssl.mzstatic.com/image/thumb/Music123/v4/73/6d/8c/736d8c1b-8f5a-8f5a-8f5a-8f5a8f5a8f5a/20UM1IM24801.rgb.jpg/100x100bb.jpg',
      preview_url: null,
      duration: 200,
      popularity: 95,
      playCount: 2500000,
      likeCount: 150000,
      source: 'general_popular',
      isActive: true,
      mood: ['energetic', 'upbeat'],
      genre: ['pop'],
      createdAt: new Date().toISOString()
    },
    {
      id: 'general_2',
      name: 'Shape of You',
      artist: 'Ed Sheeran',
      artists: 'Ed Sheeran',
      album: '÷ (Divide)',
      albumArt: 'https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/8c/e8/85/8ce88585-8f5a-8f5a-8f5a-8f5a8f5a8f5a/20UM1IM24801.rgb.jpg/100x100bb.jpg',
      album_art_url: 'https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/8c/e8/85/8ce88585-8f5a-8f5a-8f5a-8f5a8f5a8f5a/20UM1IM24801.rgb.jpg/100x100bb.jpg',
      preview_url: null,
      duration: 233,
      popularity: 92,
      playCount: 2200000,
      likeCount: 120000,
      source: 'general_popular',
      isActive: true,
      mood: ['energetic', 'upbeat'],
      genre: ['pop'],
      createdAt: new Date().toISOString()
    }
  ];
}



// GET /api/songs/alchemist
// Get a curated list of popular songs for the Audio Alchemist page
router.get('/alchemist', [
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  handleValidationErrors
], async (req, res) => {
  try {
    const { limit = 50 } = req.query;
    console.log('️ Audio Alchemist request: getting popular tracks');

    const songs = await musicService.getPopularTracks(limit);

    if (!songs || songs.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Could not retrieve any songs for Audio Alchemist.',
        data: { songs: [] }
      });
    }

    console.log(`✅ Found ${songs.length} songs for Audio Alchemist`);
    res.status(200).json({
      status: 'success',
      message: 'Songs retrieved successfully for Audio Alchemist',
      data: {
        songs
      }
    });

  } catch (error) {
    console.error('❌ Error in Audio Alchemist route:', error.message);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error while fetching songs for Audio Alchemist'
    });
  }
});

module.exports = router;
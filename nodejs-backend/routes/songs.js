const express = require('express');
const { body, param, query, validationResult } = require('express-validator');
const Song = require('../models/Song.js');
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
    const { search, mood, genre, limit = 10000, skip = 0 } = req.query;
    console.log('🔍 Songs search request:', { search, mood, genre, limit, skip });

    let songs = [];
    let totalSongs = 0;

    // Try to get songs from external APIs first
    try {
                // Only get trending songs if no search term is provided
          if (!search || search.length < 3) {
            console.log('🌐 Getting trending songs from Deezer');
            try {
              const trendingResponse = await fetch(`https://api.deezer.com/chart/0/tracks?limit=300`);
              if (trendingResponse.ok) {
                const trendingData = await trendingResponse.json();
                
                if (trendingData.data && trendingData.data.length > 0) {
                  const trendingSongs = trendingData.data.map(track => ({
                    id: `deezer_trending_${track.id}`,
                    name: track.title,
                    artist: track.artist.name,
                    artists: track.artist.name,
                    album: track.album.title,
                    albumArt: track.album.cover_medium,
                    album_art_url: track.album.cover_medium,
                    preview_url: track.preview,
                    duration: track.duration,
                    popularity: Math.floor(Math.random() * 30) + 70,
                    playCount: Math.floor(Math.random() * 100000) + 10000,
                    likeCount: Math.floor(Math.random() * 10000) + 1000,
                    source: 'deezer_trending',
                    isActive: true,
                    mood: ['popular', 'trending'],
                    genre: ['pop'],
                    createdAt: new Date().toISOString()
                  }));
                  songs.push(...trendingSongs);
                  console.log(`✅ Found ${trendingSongs.length} trending songs from Deezer`);
                }
              } else {
                console.log('⚠️ Deezer trending API failed, continuing with other sources');
              }
            } catch (trendingError) {
              console.log('⚠️ Deezer trending API failed, continuing with other sources');
            }
          }

      // Search Deezer API for songs (only if search term is 2+ characters)
      if (search && search.length >= 2) {
        console.log('🌐 Searching Deezer API for:', search);
        
        // Try multiple search variations to get more relevant results
        const searchVariations = [
          search,
          `${search} music`,
          `${search} song`,
          `${search} artist`,
          search.split(' ').slice(0, 2).join(' '), // First 2 words if multiple words
          search + ' track',
          search + ' hit',
          search + ' popular'
        ];
        
        let deezerSongsFound = false;
        
        for (const searchTerm of searchVariations) {
          if (deezerSongsFound) break; // Stop if we found songs from Deezer
          
          try {
            const deezerResponse = await fetch(`https://api.deezer.com/search?q=${encodeURIComponent(searchTerm)}&limit=200`);
            if (deezerResponse.ok) {
              const deezerData = await deezerResponse.json();
              
              if (deezerData.data && deezerData.data.length > 0) {
                // Use all results from Deezer search
                console.log(`✅ Using ${deezerData.data.length} songs from Deezer for "${search}"`);
                const deezerSongs = deezerData.data.map(track => ({
                  id: `deezer_search_${track.id}`,
                  name: track.title,
                  artist: track.artist.name,
                  artists: track.artist.name,
                  album: track.album.title,
                  albumArt: track.album.cover_medium,
                  album_art_url: track.album.cover_medium,
                  preview_url: track.preview,
                  duration: track.duration,
                  popularity: Math.floor(Math.random() * 30) + 70,
                  playCount: Math.floor(Math.random() * 50000) + 1000,
                  likeCount: Math.floor(Math.random() * 5000) + 100,
                  source: 'deezer_search',
                  isActive: true,
                  mood: ['energetic', 'upbeat'],
                  genre: ['pop'],
                  createdAt: new Date().toISOString()
                }));
                songs.push(...deezerSongs);
                deezerSongsFound = true;
                break;
              }
            }
          } catch (error) {
            console.log(`⚠️ Deezer search failed for "${searchTerm}", trying next variation`);
          }
        }
        
        if (!deezerSongsFound) {
          console.log('⚠️ No songs found from Deezer search variations');
        }
      }

      // Search Jamendo API for additional songs (only if search term is 2+ characters)
      if (search && search.length >= 2) {
        console.log('🌐 Searching Jamendo API for:', search);
        
        // Try multiple search variations for Jamendo too
        const searchVariations = [
          search,
          `${search} music`,
          `${search} song`,
          `${search} artist`,
          search.split(' ').slice(0, 2).join(' '), // First 2 words if multiple words
          search + ' track',
          search + ' hit',
          search + ' popular'
        ];
        
        let jamendoSongsFound = false;
        
        for (const searchTerm of searchVariations) {
          if (jamendoSongsFound) break; // Stop if we found songs from Jamendo
          
          try {
            const jamendoResponse = await fetch(`https://api.jamendo.com/v3/tracks/?client_id=${process.env.JAMENDO_CLIENT_ID || '2d652c8c'}&format=json&limit=200&search=${encodeURIComponent(searchTerm)}`);
            if (jamendoResponse.ok) {
              const jamendoData = await jamendoResponse.json();
              
              if (jamendoData.results && jamendoData.results.length > 0) {
                // Use all results from Jamendo search
                console.log(`✅ Using ${jamendoData.results.length} songs from Jamendo for "${search}"`);
                const jamendoSongs = jamendoData.results.map(track => ({
                  id: `jamendo_search_${track.id}`,
                  name: track.name,
                  artist: track.artist_name,
                  artists: track.artist_name,
                  album: track.album_name || 'Unknown Album',
                  albumArt: track.image,
                  album_art_url: track.image,
                  preview_url: track.audio,
                  duration: track.duration,
                  popularity: Math.floor(Math.random() * 30) + 70,
                  playCount: Math.floor(Math.random() * 50000) + 1000,
                  likeCount: Math.floor(Math.random() * 5000) + 100,
                  source: 'jamendo_search',
                  isActive: true,
                  mood: ['energetic', 'upbeat'],
                  genre: ['pop'],
                  createdAt: new Date().toISOString()
                }));
                songs.push(...jamendoSongs);
                jamendoSongsFound = true;
                break;
              }
            }
          } catch (error) {
            console.log(`⚠️ Jamendo search failed for "${searchTerm}", trying next variation`);
          }
        }
        
        if (!jamendoSongsFound) {
          console.log('⚠️ No songs found from Jamendo search variations');
        }
      }

      // Only get trending songs if we have NO search results at all
      if (songs.length === 0) {
        console.log('🌐 No search results found, getting trending songs as fallback');
        try {
          const trendingResponse = await fetch('https://api.deezer.com/chart/0/tracks?limit=50');
          if (trendingResponse.ok) {
            const trendingData = await trendingResponse.json();
            
            if (trendingData.data && trendingData.data.length > 0) {
              const trendingSongs = trendingData.data.map(track => ({
                id: `deezer_trending_${track.id}`,
                name: track.title,
                artist: track.artist.name,
                artists: track.artist.name,
                album: track.album.title,
                albumArt: track.album.cover_medium,
                album_art_url: track.album.cover_medium,
                preview_url: track.preview,
                duration: track.duration,
                popularity: Math.floor(Math.random() * 30) + 70,
                playCount: Math.floor(Math.random() * 100000) + 10000,
                likeCount: Math.floor(Math.random() * 10000) + 1000,
                source: 'deezer_trending',
                isActive: true,
                mood: ['popular', 'trending'],
                genre: ['pop'],
                createdAt: new Date().toISOString()
              }));
              songs.push(...trendingSongs);
              console.log(`✅ Found ${trendingSongs.length} trending songs as fallback`);
            }
          } else {
            console.log('⚠️ Deezer trending API failed');
          }
        } catch (trendingError) {
          console.log('⚠️ Deezer trending API failed');
        }
      }

    } catch (apiError) {
      console.error('❌ API search failed:', apiError.message);
      console.log('⚠️ APIs failed, using fallback songs');
    }

    // If we got songs from APIs, use them
    if (songs.length > 0) {
      totalSongs = songs.length;
      // Don't slice - return all songs
      // songs = songs.slice(skip, skip + parseInt(limit));
      
      console.log(`🎵 Returning ${songs.length} songs from APIs (total: ${totalSongs})`);
      
      return res.status(200).json({
      status: 'success',
        message: 'Songs retrieved successfully',
      data: {
        songs,
        pagination: {
            current: 1,
            total: 1,
            limit: totalSongs,
            skip: 0,
            totalSongs
        },
        filters: {
            search: search || '',
            mood: mood || '',
            genre: genre || ''
          },
          source: 'api'
        }
      });
    }

    // Final fallback: Get trending songs if no songs found
    console.log('⚠️ No songs found from search, getting trending songs as final fallback');
    try {
      // Try to get songs that might be related to the search term
      let fallbackSongs = [];
      
      if (search && search.length > 0) {
        // Try to get popular songs that might contain similar words
        const trendingResponse = await fetch(`https://api.deezer.com/chart/0/tracks?limit=300`);
        if (trendingResponse.ok) {
          const trendingData = await trendingResponse.json();
          if (trendingData.data && trendingData.data.length > 0) {
            // Filter trending songs to find ones that might be related
            const searchLower = search.toLowerCase();
            const relatedSongs = trendingData.data.filter(track => {
              const trackTitle = track.title.toLowerCase();
              const trackArtist = track.artist.name.toLowerCase();
              const trackAlbum = track.album.title.toLowerCase();
              
              // Check if any part of the search term appears in the song info
              return trackTitle.includes(searchLower) || 
                     trackArtist.includes(searchLower) ||
                     trackAlbum.includes(searchLower) ||
                     searchLower.split(' ').some(word => 
                       trackTitle.includes(word) || 
                       trackArtist.includes(word) || 
                       trackAlbum.includes(word)
                     );
            });
            
            if (relatedSongs.length > 0) {
              fallbackSongs = relatedSongs.slice(0, 50); // Limit to 50 related songs
              console.log(`✅ Found ${fallbackSongs.length} related trending songs for "${search}"`);
            } else {
              // If no related songs found, use all trending songs
              fallbackSongs = trendingData.data.slice(0, 50);
              console.log(`✅ Using ${fallbackSongs.length} trending songs as fallback for "${search}"`);
            }
          }
        }
      } else {
        // If no search term, just get trending songs
        const trendingResponse = await fetch(`https://api.deezer.com/chart/0/tracks?limit=300`);
        if (trendingResponse.ok) {
          const trendingData = await trendingResponse.json();
          if (trendingData.data && trendingData.data.length > 0) {
            fallbackSongs = trendingData.data.slice(0, 50);
            console.log(`✅ Using ${fallbackSongs.length} trending songs as fallback`);
          }
        }
      }
      
      if (fallbackSongs.length > 0) {
        const trendingSongs = fallbackSongs.map(track => ({
          id: `deezer_trending_fallback_${track.id}`,
          name: track.title,
          artist: track.artist.name,
          artists: track.artist.name,
          album: track.album.title,
          albumArt: track.album.cover_medium,
          album_art_url: track.album.cover_medium,
          preview_url: track.preview,
          duration: track.duration,
          popularity: Math.floor(Math.random() * 30) + 70,
          playCount: Math.floor(Math.random() * 50000) + 1000,
          likeCount: Math.floor(Math.random() * 5000) + 100,
          source: 'deezer_trending_fallback',
          isActive: true,
          mood: ['energetic', 'upbeat'],
          genre: ['pop'],
          createdAt: new Date().toISOString()
        }));
        
        songs = trendingSongs;
        totalSongs = songs.length;
        
        console.log(`🎵 Returning ${songs.length} fallback songs (total: ${totalSongs})`);
        
        return res.status(200).json({
          status: 'success',
          message: 'Songs retrieved successfully',
          data: {
            songs,
            pagination: {
              current: 1,
              total: 1,
              limit: totalSongs,
              skip: 0,
              totalSongs
            },
            filters: {
              search: search || '',
              mood: mood || '',
              genre: genre || ''
            },
            source: 'api_fallback'
          }
        });
      }
    } catch (error) {
      console.log('⚠️ Failed to get trending songs as final fallback');
    }

    // No songs found at all
    console.log('⚠️ All APIs failed, returning empty results');
    
    songs = [];
    totalSongs = 0;

    console.log(`🎵 No real songs found from APIs`);
    
    res.status(200).json({
      status: 'success',
      message: 'Songs retrieved successfully',
      data: {
        songs,
        pagination: {
          current: 1,
          total: 1,
          limit: totalSongs,
          skip: 0,
          totalSongs
        },
        filters: {
          search: search || '',
          mood: mood || '',
          genre: genre || ''
        },
        source: 'fallback'
      }
    });

  } catch (error) {
    console.error('❌ Error fetching songs:', error.message);
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

// GET /api/songs/:songId
// Get a specific song by ID
router.get('/:songId', [
  param('songId').notEmpty().withMessage('Song ID is required'),
  handleValidationErrors
], async (req, res) => {
  try {
    const { songId } = req.params;

    const song = await Song.findOne({ id: songId, isActive: true });

    if (!song) {
      return res.status(404).json({
        status: 'error',
        message: 'Song not found',
        songId
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Song retrieved successfully',
      data: {
        song
      }
    });

  } catch (error) {
    console.error('❌ Error fetching song:', error.message);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error while fetching song'
    });
  }
});

// POST /api/songs
// Add a new song
router.post('/', [
  body('id').notEmpty().withMessage('Song ID is required'),
  body('name').notEmpty().trim().withMessage('Song name is required'),
  body('artist').notEmpty().trim().withMessage('Artist is required'),
  body('audioFeatures.danceability').isFloat({ min: 0, max: 1 }).withMessage('Danceability must be between 0 and 1'),
  body('audioFeatures.energy').isFloat({ min: 0, max: 1 }).withMessage('Energy must be between 0 and 1'),
  body('audioFeatures.speechiness').isFloat({ min: 0, max: 1 }).withMessage('Speechiness must be between 0 and 1'),
  body('audioFeatures.acousticness').isFloat({ min: 0, max: 1 }).withMessage('Acousticness must be between 0 and 1'),
  body('audioFeatures.instrumentalness').isFloat({ min: 0, max: 1 }).withMessage('Instrumentalness must be between 0 and 1'),
  body('audioFeatures.liveness').isFloat({ min: 0, max: 1 }).withMessage('Liveness must be between 0 and 1'),
  body('audioFeatures.valence').isFloat({ min: 0, max: 1 }).withMessage('Valence must be between 0 and 1'),
  body('audioFeatures.tempo').isFloat({ min: 0 }).withMessage('Tempo must be positive'),
  body('audioFeatures.loudness').isFloat().withMessage('Loudness must be a number'),
  handleValidationErrors
], async (req, res) => {
  try {
    // Check if song already exists
    const existingSong = await Song.findOne({ id: req.body.id });
    if (existingSong) {
      return res.status(409).json({
        status: 'error',
        message: 'Song with this ID already exists',
        songId: req.body.id
      });
    }

    const newSong = new Song(req.body);
    const savedSong = await newSong.save();

    res.status(201).json({
      status: 'success',
      message: 'Song created successfully',
      data: {
        song: savedSong
      }
    });

  } catch (error) {
    console.error('❌ Error creating song:', error.message);
    
    if (error.code === 11000) {
      return res.status(409).json({
        status: 'error',
        message: 'Song with this ID already exists'
      });
    }

    res.status(500).json({
      status: 'error',
      message: 'Internal server error while creating song'
    });
  }
});

// PUT /api/songs/:songId
// Update a song
router.put('/:songId', [
  param('songId').notEmpty().withMessage('Song ID is required'),
  body('name').optional().notEmpty().trim().withMessage('Song name cannot be empty'),
  body('artist').optional().notEmpty().trim().withMessage('Artist cannot be empty'),
  handleValidationErrors
], async (req, res) => {
  try {
    const { songId } = req.params;

    const updatedSong = await Song.findOneAndUpdate(
      { id: songId, isActive: true },
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!updatedSong) {
      return res.status(404).json({
        status: 'error',
        message: 'Song not found',
        songId
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Song updated successfully',
      data: {
        song: updatedSong
      }
    });

  } catch (error) {
    console.error('❌ Error updating song:', error.message);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error while updating song'
    });
  }
});

// DELETE /api/songs/:songId
// Soft delete a song
router.delete('/:songId', [
  param('songId').notEmpty().withMessage('Song ID is required'),
  handleValidationErrors
], async (req, res) => {
  try {
    const { songId } = req.params;

    const deletedSong = await Song.findOneAndUpdate(
      { id: songId, isActive: true },
      { $set: { isActive: false } },
      { new: true }
    );

    if (!deletedSong) {
      return res.status(404).json({
        status: 'error',
        message: 'Song not found',
        songId
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Song deleted successfully',
      data: {
        songId,
        deletedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Error deleting song:', error.message);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error while deleting song'
    });
  }
});

// POST /api/songs/:songId/play
// Increment play count for a song
router.post('/:songId/play', [
  param('songId').notEmpty().withMessage('Song ID is required'),
  handleValidationErrors
], async (req, res) => {
  try {
    const { songId } = req.params;

    const song = await Song.findOne({ id: songId, isActive: true });
    if (!song) {
      return res.status(404).json({
        status: 'error',
        message: 'Song not found',
        songId
      });
    }

    await song.incrementPlayCount();

    res.status(200).json({
      status: 'success',
      message: 'Play count updated',
      data: {
        songId,
        playCount: song.playCount
      }
    });

  } catch (error) {
    console.error('❌ Error updating play count:', error.message);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error while updating play count'
    });
  }
});

// POST /api/songs/:songId/like
// Add a like to a song
router.post('/:songId/like', [
  param('songId').notEmpty().withMessage('Song ID is required'),
  handleValidationErrors
], async (req, res) => {
  try {
    const { songId } = req.params;

    const song = await Song.findOne({ id: songId, isActive: true });
    if (!song) {
      return res.status(404).json({
        status: 'error',
        message: 'Song not found',
        songId
      });
    }

    await song.addLike();

    res.status(200).json({
      status: 'success',
      message: 'Song liked',
      data: {
        songId,
        likeCount: song.likeCount
      }
    });

  } catch (error) {
    console.error('❌ Error liking song:', error.message);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error while liking song'
    });
  }
});

// DELETE /api/songs/:songId/like
// Remove a like from a song
router.delete('/:songId/like', [
  param('songId').notEmpty().withMessage('Song ID is required'),
  handleValidationErrors
], async (req, res) => {
  try {
    const { songId } = req.params;

    const song = await Song.findOne({ id: songId, isActive: true });
    if (!song) {
      return res.status(404).json({
        status: 'error',
        message: 'Song not found',
        songId
      });
    }

    await song.removeLike();

    res.status(200).json({
      status: 'success',
      message: 'Like removed',
      data: {
        songId,
        likeCount: song.likeCount
      }
    });

  } catch (error) {
    console.error('❌ Error removing like:', error.message);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error while removing like'
    });
  }
});

// GET /api/songs/analytics/overview
// Get songs analytics overview
router.get('/analytics/overview', async (req, res) => {
  try {
    const [
      totalSongs,
      totalPlays,
      totalLikes,
      avgPopularity,
      moodDistribution,
      topGenres,
      recentSongs
    ] = await Promise.all([
      Song.countDocuments({ isActive: true }),
      Song.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: null, total: { $sum: '$playCount' } } }
      ]),
      Song.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: null, total: { $sum: '$likeCount' } } }
      ]),
      Song.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: null, avg: { $avg: '$popularity' } } }
      ]),
      Song.aggregate([
        { $match: { isActive: true } },
        { $unwind: '$mood' },
        { $group: { _id: '$mood', count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ]),
      Song.aggregate([
        { $match: { isActive: true } },
        { $unwind: '$genre' },
        { $group: { _id: '$genre', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]),
      Song.find({ isActive: true })
        .sort({ createdAt: -1 })
        .limit(5)
        .select('id name artist createdAt')
        .lean()
    ]);

    res.status(200).json({
      status: 'success',
      message: 'Analytics data retrieved successfully',
      data: {
        overview: {
          totalSongs,
          totalPlays: totalPlays[0]?.total || 0,
          totalLikes: totalLikes[0]?.total || 0,
          averagePopularity: Math.round(avgPopularity[0]?.avg || 0)
        },
        distribution: {
          moods: moodDistribution,
          genres: topGenres
        },
        recent: recentSongs,
        generatedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Error generating analytics:', error.message);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error while generating analytics'
    });
  }
});

module.exports = router; 
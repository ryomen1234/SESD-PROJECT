const express = require('express');
const router = express.Router();
const musicService = require('../services/musicService');
const audiusService = require('../services/audiusService');

router.get('/trending', async (req, res) => {
  try {
    const { limit = 20 } = req.query;
    const playlists = await musicService.getTrendingPlaylists(parseInt(limit));
    res.json({
      status: 'success',
      message: `Retrieved ${playlists.length} trending playlists`,
      data: { playlists }
    });
  } catch (error) {
    console.error('Error fetching trending playlists:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch trending playlists',
      error: error.message
    });
  }
});

router.get('/search', async (req, res) => {
  try {
    const { query, limit = 20 } = req.query;
    
    if (!query) {
      return res.status(400).json({
        status: 'error',
        message: 'Search query is required'
      });
    }

    const playlists = await musicService.searchPlaylists(query, parseInt(limit));
    res.json({
      status: 'success',
      message: `Found ${playlists.length} playlists for "${query}"`,
      data: playlists
    });
  } catch (error) {
    console.error('Error searching playlists:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to search playlists',
      error: error.message
    });
  }
});

// New route for getting a specific playlist by ID
router.get('/:playlistId', async (req, res) => {
  try {
    const { playlistId } = req.params;
    
    // Get the actual playlist from Deezer API
    try {
      const response = await fetch(`https://api.deezer.com/playlist/${playlistId}`);
      const data = await response.json();
      
      if (data.id) {
        // Get the playlist tracks
        const tracksResponse = await fetch(`https://api.deezer.com/playlist/${playlistId}/tracks`);
        const tracksData = await tracksResponse.json();
        
        const tracks = tracksData.data?.map((track, index) => ({
          id: track.id,
          title: track.title,
          artist: track.artist.name,
          duration: track.duration,
          artwork: {
            '150x150': track.album.cover_medium,
            '480x480': track.album.cover_big,
            '1000x1000': track.album.cover_xl
          }
        })) || [];
        
        const playlist = {
          id: data.id,
          name: data.title,
          description: data.description || `A curated playlist by ${data.user.name}`,
          tracks: tracks,
          trackCount: tracks.length,
          duration: tracks.reduce((total, track) => total + track.duration, 0),
          artwork: tracks.length > 0 ? tracks[0].artwork : { '480x480': data.picture_big || data.picture_xl }
        };
        
        res.json({
          status: 'success',
          message: 'Playlist retrieved successfully',
          data: { playlist }
        });
        return;
      }
    } catch (error) {
      console.log('Deezer API failed, using fallback');
    }
    
    // Fallback to mock playlist
    const mockPlaylist = {
      id: playlistId,
      name: `My Playlist ${playlistId.slice(-4)}`,
      description: 'A curated playlist with amazing tracks',
      tracks: [
        {
          id: '1',
          title: 'NUEVAYOL',
          artist: 'Bad Bunny',
          duration: 183,
          artwork: { '480x480': 'https://picsum.photos/480/480?random=1' }
        },
        {
          id: '2',
          title: 'Love Me Not',
          artist: 'Ravyn Lenae',
          duration: 213,
          artwork: { '480x480': 'https://picsum.photos/480/480?random=2' }
        },
        {
          id: '3',
          title: 'Anxiety',
          artist: 'Doechii',
          duration: 195,
          artwork: { '480x480': 'https://picsum.photos/480/480?random=3' }
        }
      ],
      trackCount: 3,
      duration: 591,
      artwork: { '480x480': 'https://picsum.photos/480/480?random=playlist' }
    };
    
    res.json({
      status: 'success',
      message: 'Playlist retrieved successfully',
      data: { playlist: mockPlaylist }
    });
  } catch (error) {
    console.error('Error fetching playlist:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch playlist',
      error: error.message
    });
  }
});

router.get('/:playlistId/tracks', async (req, res) => {
  try {
    const { playlistId } = req.params;
    const { limit = 50, offset = 0 } = req.query;
    
    // First get playlist info from Deezer API
    let playlistInfo = null;
    try {
      const playlistResponse = await fetch(`https://api.deezer.com/playlist/${playlistId}`);
      const playlistData = await playlistResponse.json();
      
      if (playlistData.id) {
        playlistInfo = {
          id: playlistData.id,
          name: playlistData.title,
          description: playlistData.description,
          artwork: {
            '480x480': playlistData.picture_big || playlistData.picture_xl,
            '150x150': playlistData.picture_medium
          }
        };
      }
    } catch (error) {
      console.log('Failed to fetch playlist info from Deezer, using fallback');
    }
    
    // Get tracks
    const tracks = await musicService.getPlaylistTracks(playlistId, parseInt(limit), parseInt(offset));
    
    // If we couldn't get playlist info, create a fallback
    if (!playlistInfo) {
      playlistInfo = {
        id: playlistId,
        name: `Playlist ${playlistId}`,
        description: 'A curated playlist with amazing tracks',
        artwork: tracks.length > 0 ? tracks[0].artwork : { '480x480': 'https://picsum.photos/480/480?random=playlist' }
      };
    }
    
    res.json({
      status: 'success',
      message: `Retrieved ${tracks.length} tracks from playlist`,
      data: {
        playlist: playlistInfo,
        tracks: tracks
      }
    });
  } catch (error) {
    console.error('Error fetching playlist tracks:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch playlist tracks',
      error: error.message
    });
  }
});

router.get('/recommendations/mood/:mood', async (req, res) => {
  try {
    const { mood } = req.params;
    
    const moodStrategies = {
      workout: {
        query: 'energy',
        endpoint: 'search',
        fallback: 'chart/464/tracks',
        randomSeed: 1,
        alternativeEndpoint: 'chart/464/tracks'
      },
      focus: {
        query: 'instrumental',
        endpoint: 'search',
        fallback: 'chart/132/tracks',
        randomSeed: 2,
        alternativeEndpoint: 'chart/132/tracks'
      },
      sad: {
        query: 'sad',
        endpoint: 'search',
        fallback: 'chart/0/tracks',
        randomSeed: 3,
        alternativeEndpoint: 'chart/0/tracks'
      },
      party: {
        query: 'dance',
        endpoint: 'search',
        fallback: 'chart/132/tracks',
        randomSeed: 4,
        alternativeEndpoint: 'chart/132/tracks'
      },
      chill: {
        query: 'relax',
        endpoint: 'search',
        fallback: 'chart/0/tracks',
        randomSeed: 5,
        alternativeEndpoint: 'chart/0/tracks'
      },
      upbeat: {
        query: 'happy',
        endpoint: 'search',
        fallback: 'chart/132/tracks',
        randomSeed: 6,
        alternativeEndpoint: 'chart/132/tracks'
      },
      motivation: {
        query: 'inspirational',
        endpoint: 'search',
        fallback: 'chart/464/tracks',
        randomSeed: 7,
        alternativeEndpoint: 'chart/464/tracks'
      },
      nostalgic: {
        query: 'classic',
        endpoint: 'search',
        fallback: 'chart/0/tracks',
        randomSeed: 8,
        alternativeEndpoint: 'chart/0/tracks'
      },
      energetic: {
        query: 'energetic',
        endpoint: 'search',
        fallback: 'chart/464/tracks',
        randomSeed: 9,
        alternativeEndpoint: 'chart/464/tracks'
      },
      mysterious: {
        query: 'dark',
        endpoint: 'search',
        fallback: 'chart/0/tracks',
        randomSeed: 10,
        alternativeEndpoint: 'chart/0/tracks'
      },
      peaceful: {
        query: 'calm',
        endpoint: 'search',
        fallback: 'chart/0/tracks',
        randomSeed: 11,
        alternativeEndpoint: 'chart/0/tracks'
      },
      adventurous: {
        query: 'epic',
        endpoint: 'search',
        fallback: 'chart/0/tracks',
        randomSeed: 12,
        alternativeEndpoint: 'chart/0/tracks'
      }
    };
    
    const strategy = moodStrategies[mood.toLowerCase()] || { query: mood, endpoint: 'search', fallback: 'chart/0/tracks', randomSeed: 0, alternativeEndpoint: 'chart/0/tracks' };
    
    const moodOffsets = {
      workout: 0, focus: 30, sad: 60, party: 90, chill: 120, upbeat: 150,
      motivation: 180, nostalgic: 210, energetic: 240, mysterious: 270, peaceful: 300, adventurous: 330
    };
    
    const offset = moodOffsets[mood.toLowerCase()] || 0;
    
    let data;
    
    try {
      const response = await fetch(`https://api.deezer.com/search?q=${encodeURIComponent(strategy.query)}&limit=15&index=${offset}`);
      data = await response.json();
      
      if (!data.data || data.data.length === 0) {
        throw new Error('No search results');
      }
    } catch (error) {
      console.log(`⚠️ Search failed for ${mood}, trying alternative endpoint with offset ${offset}`);
      
      const alternativeResponse = await fetch(`https://api.deezer.com/${strategy.alternativeEndpoint}?limit=15&index=${offset}`);
      const alternativeData = await alternativeResponse.json();
      
      if (!alternativeData.data || alternativeData.data.length === 0) {
        console.log(`⚠️ Alternative endpoint failed, using general trending for ${mood}`);
        const finalFallbackResponse = await fetch(`https://api.deezer.com/chart/0/tracks?limit=15&index=${offset}`);
        const finalFallbackData = await finalFallbackResponse.json();
        
        if (!finalFallbackData.data) {
          throw new Error(`No tracks found for mood: ${mood}`);
        }
        
        data = finalFallbackData;
      } else {
        data = alternativeData;
      }
    }
    
    const shuffledData = data.data.sort(() => 0.5 - Math.random());
    
    const limitedData = shuffledData.slice(0, 10);
    
    const recommendations = limitedData.map(track => ({
      id: track.id,
      name: track.title,
      title: track.title,
      artist: track.artist?.name || 'Unknown Artist',
      artists: track.artist?.name || 'Unknown Artist',
      albumArt: track.album?.cover_medium || track.album?.cover || null,
      album_art_url: track.album?.cover_medium || track.album?.cover || null,
      duration: track.duration || 0,
      preview_url: track.preview || null,
      preview: track.preview || null,
      link: track.link || null,
      artwork: {
        '150x150': track.album?.cover_medium || track.album?.cover || null,
        '480x480': track.album?.cover_big || track.album?.cover || null
      }
    }));

    res.json({
      status: 'success',
      message: `Generated ${recommendations.length} recommendations for ${mood} mood`,
      data: {
        mood: mood,
        recommendations: recommendations
      }
    });
  } catch (error) {
    console.error('Error generating mood recommendations:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to generate mood recommendations',
      error: error.message
    });
  }
});

module.exports = router; 
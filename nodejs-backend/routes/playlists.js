import express from 'express';
import { query, param, validationResult } from 'express-validator';
import musicService from '../services/musicService.js';

const router = express.Router();

// Validation middleware for error handling
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

// GET /api/playlists/trending - Get trending playlists from Audius
router.get('/trending', [
  query('time')
    .optional()
    .isIn(['week', 'month', 'year', 'allTime'])
    .withMessage('Time must be week, month, year, or allTime'),
  query('offset')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Offset must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  handleValidationErrors
], async (req, res) => {
  try {
    const { time = 'week', offset = 0, limit = 10 } = req.query;

    console.log(`🎵 Fetching trending playlists: time=${time}, offset=${offset}, limit=${limit}`);
    
    // Add timeout to the entire request
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Request timeout')), 25000);
    });

    const apiPromise = musicService.getTrendingPlaylists(time, parseInt(offset), parseInt(limit));
    
    const result = await Promise.race([apiPromise, timeoutPromise]);

    if (!result.success) {
      console.error('❌ iTunes API failed:', result.error);
      return res.status(500).json({
        status: 'error',
        message: 'Failed to fetch trending playlists from iTunes',
        error: result.error
      });
    }

    // Format playlists data
    const formattedPlaylists = result.data?.data?.map(playlist => 
      musicService.formatPlaylistData(playlist)
    ) || [];

    console.log(`✅ Successfully fetched ${formattedPlaylists.length} playlists`);

    res.status(200).json({
      status: 'success',
      message: `Retrieved ${result.count} trending playlists`,
      data: {
        playlists: formattedPlaylists,
        pagination: {
          offset: parseInt(offset),
          limit: parseInt(limit),
          total: result.count
        },
        filters: {
          time
        },
        source: 'iTunes'
      }
    });

  } catch (error) {
    console.error('❌ Error in trending playlists endpoint:', error.message);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error while fetching trending playlists',
      error: error.message
    });
  }
});

// GET /api/playlists/search - Search playlists on Audius
router.get('/search', [
  query('query')
    .notEmpty()
    .withMessage('Search query is required')
    .isLength({ min: 1, max: 100 })
    .withMessage('Search query must be between 1 and 100 characters'),
  query('offset')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Offset must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Limit must be between 1 and 50'),
  handleValidationErrors
], async (req, res) => {
  try {
    const { query: searchQuery, offset = 0, limit = 10 } = req.query;

    console.log(`🔍 Searching playlists: query="${searchQuery}", offset=${offset}, limit=${limit}`);
    
    const result = await musicService.searchPlaylists(searchQuery, parseInt(offset), parseInt(limit));

    if (!result.success) {
      return res.status(500).json({
        status: 'error',
        message: 'Failed to search playlists on iTunes',
        error: result.error
      });
    }

    // Format playlists data
    const formattedPlaylists = result.data?.data?.map(playlist => 
      musicService.formatPlaylistData(playlist)
    ) || [];

    res.status(200).json({
      status: 'success',
      message: `Found ${result.count} playlists for "${searchQuery}"`,
      data: {
        playlists: formattedPlaylists,
        pagination: {
          offset: parseInt(offset),
          limit: parseInt(limit),
          total: result.count
        },
        search: {
          query: searchQuery
        },
        source: 'iTunes'
      }
    });

  } catch (error) {
    console.error('❌ Error in search playlists endpoint:', error.message);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error while searching playlists'
    });
  }
});

// GET /api/playlists/:id - Get specific playlist by ID
router.get('/:id', [
  param('id')
    .notEmpty()
    .withMessage('Playlist ID is required'),
  handleValidationErrors
], async (req, res) => {
  try {
    const { id } = req.params;

    console.log(`📋 Fetching playlist: id=${id}`);
    
    const result = await musicService.getPlaylistById(id);

    if (!result.success) {
      return res.status(404).json({
        status: 'error',
        message: `Playlist with ID ${id} not found`,
        error: result.error
      });
    }

    if (!result.data) {
      return res.status(404).json({
        status: 'error',
        message: `Playlist with ID ${id} not found`
      });
    }

    const formattedPlaylist = musicService.formatPlaylistData(result.data);

    res.status(200).json({
      status: 'success',
      message: 'Playlist retrieved successfully',
      data: {
        playlist: formattedPlaylist,
        source: 'iTunes'
      }
    });

  } catch (error) {
    console.error('❌ Error in get playlist endpoint:', error.message);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error while fetching playlist'
    });
  }
});

// GET /api/playlists/:id/tracks - Get tracks from a specific playlist
router.get('/:id/tracks', [
  param('id')
    .notEmpty()
    .withMessage('Playlist ID is required'),
  query('offset')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Offset must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  handleValidationErrors
], async (req, res) => {
  try {
    const { id } = req.params;
    const { offset = 0, limit = 50 } = req.query;

    console.log(`🎵 Fetching playlist tracks: id=${id}, offset=${offset}, limit=${limit}`);
    
    const result = await musicService.getPlaylistTracks(id, parseInt(offset), parseInt(limit));

    if (!result.success) {
      return res.status(404).json({
        status: 'error',
        message: `Failed to fetch tracks for playlist ${id}`,
        error: result.error
      });
    }

    // Format tracks data
    const formattedTracks = result.data?.data?.map(track => 
      musicService.formatTrackData(track)
    ) || [];

    res.status(200).json({
      status: 'success',
      message: `Retrieved ${result.count} tracks from playlist ${id}`,
      data: {
        playlistId: id,
        tracks: formattedTracks,
        pagination: {
          offset: parseInt(offset),
          limit: parseInt(limit),
          total: result.count
        },
        source: 'iTunes'
      }
    });

  } catch (error) {
    console.error('❌ Error in get playlist tracks endpoint:', error.message);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error while fetching playlist tracks'
    });
  }
});

// GET /api/playlists - Get bulk playlists (with optional IDs filter)
router.get('/', [
  query('ids')
    .optional()
    .custom((value) => {
      if (value) {
        const ids = value.split(',');
        if (ids.length > 50) {
          throw new Error('Maximum 50 playlist IDs allowed');
        }
        return ids.every(id => id.trim().length > 0);
      }
      return true;
    })
    .withMessage('Invalid playlist IDs format'),
  query('offset')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Offset must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  handleValidationErrors
], async (req, res) => {
  try {
    const { ids, offset = 0, limit = 20 } = req.query;
    const playlistIds = ids ? ids.split(',').map(id => id.trim()) : [];

    console.log(`📋 Fetching bulk playlists: ids=${playlistIds.length ? playlistIds.join(',') : 'all'}, offset=${offset}, limit=${limit}`);
    
    const result = await musicService.getBulkPlaylists(playlistIds);

    if (!result.success) {
      return res.status(500).json({
        status: 'error',
        message: 'Failed to fetch playlists from iTunes',
        error: result.error
      });
    }

    // Format playlists data and apply client-side pagination if needed
    let formattedPlaylists = result.data?.data?.map(playlist => 
      musicService.formatPlaylistData(playlist)
    ) || [];

    // Apply pagination if no specific IDs were requested
    if (!ids) {
      const startIndex = parseInt(offset);
      const endIndex = startIndex + parseInt(limit);
      formattedPlaylists = formattedPlaylists.slice(startIndex, endIndex);
    }

    res.status(200).json({
      status: 'success',
      message: `Retrieved ${formattedPlaylists.length} playlists`,
      data: {
        playlists: formattedPlaylists,
        pagination: {
          offset: parseInt(offset),
          limit: parseInt(limit),
          total: formattedPlaylists.length
        },
        filters: {
          specificIds: playlistIds.length > 0 ? playlistIds : null
        },
        source: 'iTunes'
      }
    });

  } catch (error) {
    console.error('❌ Error in bulk playlists endpoint:', error.message);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error while fetching playlists'
    });
  }
});

// TEST endpoint with mock data - for debugging connection issues
router.get('/test', (req, res) => {
  const mockPlaylists = [
    {
      id: 'test1',
      name: 'Test Playlist 1',
      description: 'This is a test playlist to verify connection',
      user: { id: 'test', name: 'Test User', handle: 'testuser' },
      artwork: { '480x480': 'https://picsum.photos/480/480?random=1' },
      trackCount: 15,
      favoriteCount: 100,
      repostCount: 25
    },
    {
      id: 'test2', 
      name: 'Test Playlist 2',
      description: 'Another test playlist',
      user: { id: 'test2', name: 'Test User 2', handle: 'testuser2' },
      artwork: { '480x480': 'https://picsum.photos/480/480?random=2' },
      trackCount: 22,
      favoriteCount: 200,
      repostCount: 50
    }
  ];

  res.status(200).json({
    status: 'success',
    message: 'Test endpoint working - connection is good!',
    data: {
      playlists: mockPlaylists,
      pagination: { offset: 0, limit: 10, total: 2 },
      source: 'Mock Data'
    }
  });
});

// Health check endpoint for playlist service
router.get('/health/check', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Playlist service is healthy',
    timestamp: new Date().toISOString(),
    endpoints: [
      'GET /api/playlists/test - Test endpoint with mock data',
      'GET /api/playlists/trending - Get trending playlists',
      'GET /api/playlists/search - Search playlists',
      'GET /api/playlists/:id - Get specific playlist',
      'GET /api/playlists/:id/tracks - Get playlist tracks',
      'GET /api/playlists - Get bulk playlists'
    ]
  });
});

export default router; 
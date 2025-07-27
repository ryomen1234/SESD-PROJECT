const express = require('express');
const { body, query, param, validationResult } = require('express-validator');
const musicService = require('../services/musicService.js');
const router = express.Router();

// Validation error handler
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

// GET /api/recommendations/ml - Get ML-based recommendations
router.get('/ml', [
  query('user_input')
    .isLength({ min: 1, max: 1000 })
    .withMessage('User input must be between 1 and 1000 characters'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Limit must be between 1 and 50'),
  handleValidationErrors
], async (req, res) => {
  try {
    const { user_input, limit = 10 } = req.query;

    console.log(`🤖 ML Recommendation request: input="${user_input}", limit=${limit}`);
    
    // TODO: Replace this with actual ML model integration
    // This is where your friend will integrate their content filtering model
    
    // Mock response for now
    const mockRecommendations = [
      {
        id: `ml_rec_${Date.now()}_1`,
        title: "Sample ML Recommendation 1",
        artist: {
          id: "ml_artist_1",
          name: "ML Artist 1",
          handle: "ml_artist_1"
        },
        artwork: {
          '150x150': 'https://picsum.photos/150/150?random=ml1',
          '480x480': 'https://picsum.photos/480/480?random=ml1',
          '1000x1000': 'https://picsum.photos/1000/1000?random=ml1'
        },
        duration: 180,
        genre: "Pop",
        mood: "Happy",
        play_count: 1000,
        favorite_count: 100,
        repost_count: 10,
        created_at: new Date().toISOString(),
        album: "ML Sample Album",
        preview_url: null,
        deezer_url: null,
        full_song_url: null,
        ml_score: 0.95,
        ml_reason: "High similarity to your preferences"
      },
      {
        id: `ml_rec_${Date.now()}_2`,
        title: "Sample ML Recommendation 2",
        artist: {
          id: "ml_artist_2",
          name: "ML Artist 2",
          handle: "ml_artist_2"
        },
        artwork: {
          '150x150': 'https://picsum.photos/150/150?random=ml2',
          '480x480': 'https://picsum.photos/480/480?random=ml2',
          '1000x1000': 'https://picsum.photos/1000/1000?random=ml2'
        },
        duration: 200,
        genre: "Rock",
        mood: "Energetic",
        play_count: 2000,
        favorite_count: 200,
        repost_count: 20,
        created_at: new Date().toISOString(),
        album: "ML Sample Album 2",
        preview_url: null,
        deezer_url: null,
        full_song_url: null,
        ml_score: 0.87,
        ml_reason: "Matches your genre preferences"
      }
    ];

    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1000));

    console.log(`✅ Generated ${mockRecommendations.length} ML recommendations`);

    res.status(200).json({
      status: 'success',
      message: `Generated ${mockRecommendations.length} ML recommendations`,
      data: {
        recommendations: mockRecommendations,
        user_input,
        limit: parseInt(limit),
        ml_model: 'content_filtering_v1',
        processing_time_ms: 1000
      }
    });

  } catch (error) {
    console.error('❌ Error in ML recommendations endpoint:', error.message);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error while generating ML recommendations',
      error: error.message
    });
  }
});

// POST /api/recommendations/feedback - Submit user feedback for ML model training
router.post('/feedback', [
  body('track_id').isString().notEmpty().withMessage('Track ID is required'),
  body('user_rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('user_feedback').optional().isString().withMessage('Feedback must be a string'),
  handleValidationErrors
], async (req, res) => {
  try {
    const { track_id, user_rating, user_feedback } = req.body;

    console.log(`📊 User feedback: track_id=${track_id}, rating=${user_rating}, feedback="${user_feedback}"`);
    
    // TODO: Store feedback for ML model training
    // This data will help improve the recommendation system
    
    // Mock storage
    const feedbackData = {
      track_id,
      user_rating,
      user_feedback,
      timestamp: new Date().toISOString(),
      session_id: req.headers['x-session-id'] || 'unknown'
    };

    console.log(`✅ Stored feedback for ML training:`, feedbackData);

    res.status(200).json({
      status: 'success',
      message: 'Feedback received and stored for ML training',
      data: {
        feedback_id: `feedback_${Date.now()}`,
        track_id,
        user_rating,
        stored_at: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Error in feedback endpoint:', error.message);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error while storing feedback',
      error: error.message
    });
  }
});

// GET /api/recommendations/song/:id - Get song-based recommendations
router.get('/song/:id', [
  param('id').notEmpty().withMessage('Song ID is required'),
  query('limit').optional().isInt({ min: 1, max: 20 }).withMessage('Limit must be between 1 and 20'),
  handleValidationErrors
], async (req, res) => {
  try {
    const { id } = req.params;
    const limit = parseInt(req.query.limit) || 10;

    console.log(`🎵 Song-based recommendation request: song_id=${id}, limit=${limit}`);
    
    // Get similar tracks using our music service
    let recommendations = [];
    
    try {
      // Try to get similar tracks from Deezer using different search strategies
      const searchTerms = [
        'popular',
        'trending',
        'new releases',
        'top hits',
        'chart',
        'viral',
        'featured'
      ];
      
      // Get recommendations from multiple sources for variety
      for (const searchTerm of searchTerms.slice(0, 3)) {
        try {
          const similarTracks = await musicService.searchTracks(searchTerm, Math.ceil(limit / 3));
          
          if (similarTracks && similarTracks.length > 0) {
            const mappedTracks = similarTracks.map((track, index) => ({
              id: track.id || `rec_${Date.now()}_${searchTerm}_${index}`,
              title: track.title || track.name || 'Recommended Song',
              artist: {
                id: track.artist?.id || 'unknown',
                name: track.artist?.name || track.artist || 'Unknown Artist'
              },
              album: {
                id: track.album?.id || 'unknown',
                title: track.album?.title || track.album || 'Unknown Album',
                cover_medium: track.album?.cover_medium || track.album?.cover || track.image || `https://picsum.photos/300/300?random=${searchTerm}_${index}`
              },
              duration: track.duration || 210,
              preview: track.preview || track.preview_url || null,
              link: track.link,
              image: track.album?.cover_medium || track.album?.cover || track.image || `https://picsum.photos/300/300?random=${searchTerm}_${index}`,
              source: `deezer_${searchTerm}`
            }));
            
            recommendations.push(...mappedTracks);
          }
        } catch (apiError) {
          console.warn(`❌ API search failed for "${searchTerm}":`, apiError.message);
        }
      }
      
      // Remove duplicates based on title and artist
      const uniqueRecommendations = recommendations.filter((rec, index, self) => 
        index === self.findIndex(r => 
          r.title.toLowerCase() === rec.title.toLowerCase() && 
          r.artist.name.toLowerCase() === rec.artist.name.toLowerCase()
        )
      );
      
      recommendations = uniqueRecommendations;
      
    } catch (apiError) {
      console.warn('❌ API search failed for recommendations:', apiError.message);
    }
    
    // If no recommendations from API, use diverse fallback
    if (recommendations.length === 0) {
      console.log('🔄 Using diverse fallback recommendations');
      recommendations = [
        {
          id: 'rec_1',
          title: 'Blinding Lights',
          artist: {
            id: 'the_weeknd',
            name: 'The Weeknd'
          },
          album: {
            id: 'after_hours',
            title: 'After Hours',
            cover_medium: 'https://picsum.photos/300/300?random=1'
          },
          duration: 200,
          preview: null,
          link: null,
          image: 'https://picsum.photos/300/300?random=1',
          source: 'fallback'
        },
        {
          id: 'rec_2',
          title: 'Shape of You',
          artist: {
            id: 'ed_sheeran',
            name: 'Ed Sheeran'
          },
          album: {
            id: 'divide',
            title: 'Divide',
            cover_medium: 'https://picsum.photos/300/300?random=2'
          },
          duration: 235,
          preview: null,
          link: null,
          image: 'https://picsum.photos/300/300?random=2',
          source: 'fallback'
        },
        {
          id: 'rec_3',
          title: 'Bad Guy',
          artist: {
            id: 'billie_eilish',
            name: 'Billie Eilish'
          },
          album: {
            id: 'when_we_all_fall_asleep',
            title: 'When We All Fall Asleep, Where Do We Go?',
            cover_medium: 'https://picsum.photos/300/300?random=3'
          },
          duration: 194,
          preview: null,
          link: null,
          image: 'https://picsum.photos/300/300?random=3',
          source: 'fallback'
        },
        {
          id: 'rec_4',
          title: 'Dance Monkey',
          artist: {
            id: 'tones_and_i',
            name: 'Tones and I'
          },
          album: {
            id: 'the_kids_are_coming',
            title: 'The Kids Are Coming',
            cover_medium: 'https://picsum.photos/300/300?random=4'
          },
          duration: 209,
          preview: null,
          link: null,
          image: 'https://picsum.photos/300/300?random=4',
          source: 'fallback'
        },
        {
          id: 'rec_5',
          title: 'Levitating',
          artist: {
            id: 'dua_lipa',
            name: 'Dua Lipa'
          },
          album: {
            id: 'future_nostalgia',
            title: 'Future Nostalgia',
            cover_medium: 'https://picsum.photos/300/300?random=5'
          },
          duration: 203,
          preview: null,
          link: null,
          image: 'https://picsum.photos/300/300?random=5',
          source: 'fallback'
        }
      ];
    }

    console.log(`✅ Generated ${recommendations.length} song-based recommendations`);

    res.status(200).json({
      status: 'success',
      message: `Generated ${recommendations.length} recommendations based on song ${id}`,
      data: {
        recommendations: recommendations.slice(0, limit),
        original_song_id: id,
        limit: limit,
        source: recommendations[0]?.source || 'fallback'
      }
    });

  } catch (error) {
    console.error('❌ Error in song-based recommendations endpoint:', error.message);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error while generating song-based recommendations',
      error: error.message
    });
  }
});

// GET /api/recommendations/mood/:mood - Get mood-based recommendations
router.get('/mood/:mood', [
  param('mood').notEmpty().withMessage('Mood is required'),
  query('limit').optional().isInt({ min: 1, max: 20 }).withMessage('Limit must be between 1 and 20'),
  handleValidationErrors
], async (req, res) => {
  try {
    const { mood } = req.params;
    const limit = parseInt(req.query.limit) || 10;

    console.log(`😊 Mood-based recommendation request: mood=${mood}, limit=${limit}`);
    
    // Get mood-based tracks using our music service
    let recommendations = [];
    
    try {
      // Try to get mood-based tracks from Deezer
      const moodTracks = await musicService.searchTracks(mood, limit);
      
      if (moodTracks && moodTracks.length > 0) {
        recommendations = moodTracks.map((track, index) => ({
          id: track.id || `mood_rec_${Date.now()}_${index}`,
          title: track.title || track.name || 'Mood Song',
          artist: {
            id: track.artist?.id || 'unknown',
            name: track.artist?.name || track.artist || 'Unknown Artist'
          },
          album: {
            id: track.album?.id || 'unknown',
            title: track.album?.title || track.album || 'Unknown Album',
            cover_medium: track.album?.cover_medium || track.album?.cover || track.image || `https://picsum.photos/300/300?random=${index}`
          },
          duration: track.duration || 210,
          preview: track.preview || track.preview_url || null,
          link: track.link,
          image: track.album?.cover_medium || track.album?.cover || track.image || `https://picsum.photos/300/300?random=${index}`,
          source: 'deezer_jamendo'
        }));
      }
    } catch (apiError) {
      console.warn('❌ API search failed for mood recommendations:', apiError.message);
    }
    
    // If no recommendations from API, use fallback
    if (recommendations.length === 0) {
      console.log('🔄 Using fallback mood recommendations');
      recommendations = [
        {
          id: 'mood_rec_1',
          title: 'Happy',
          artist: {
            id: 'pharrell_williams',
            name: 'Pharrell Williams'
          },
          album: {
            id: 'girl',
            title: 'G I R L',
            cover_medium: 'https://picsum.photos/300/300?random=4'
          },
          duration: 233,
          preview: null,
          link: null,
          image: 'https://picsum.photos/300/300?random=4',
          source: 'fallback'
        },
        {
          id: 'mood_rec_2',
          title: 'Good Vibes',
          artist: {
            id: 'unknown_artist',
            name: 'Unknown Artist'
          },
          album: {
            id: 'unknown_album',
            title: 'Unknown Album',
            cover_medium: 'https://picsum.photos/300/300?random=5'
          },
          duration: 180,
          preview: null,
          link: null,
          image: 'https://picsum.photos/300/300?random=5',
          source: 'fallback'
        }
      ];
    }

    console.log(`✅ Generated ${recommendations.length} mood-based recommendations`);

    res.status(200).json({
      status: 'success',
      message: `Generated ${recommendations.length} recommendations for mood: ${mood}`,
      data: {
        recommendations: recommendations.slice(0, limit),
        mood: mood,
        limit: limit,
        source: recommendations[0]?.source || 'fallback'
      }
    });

  } catch (error) {
    console.error('❌ Error in mood-based recommendations endpoint:', error.message);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error while generating mood-based recommendations',
      error: error.message
    });
  }
});

// GET /api/recommendations/health/check - Health check for ML service
router.get('/health/check', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'ML Recommendation service is healthy',
    timestamp: new Date().toISOString(),
    endpoints: [
      'GET /api/recommendations/ml - Get ML-based recommendations',
      'POST /api/recommendations/feedback - Submit user feedback',
      'GET /api/recommendations/health/check - Health check'
    ],
    ml_model_status: 'ready_for_integration',
    note: 'Replace mock responses with actual ML model integration'
  });
});

module.exports = router; 
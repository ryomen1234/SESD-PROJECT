import express from 'express';
import { body, param, query, validationResult } from 'express-validator';
import recommendationEngine from '../utils/recommendationEngine.js';
import Song from '../models/Song.js';

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

// GET /api/recommendations/song/:songId
// Get recommendations based on a specific song
router.get('/song/:songId', [
  param('songId').notEmpty().withMessage('Song ID is required'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
  handleValidationErrors
], async (req, res) => {
  try {
    const { songId } = req.params;
    const limit = parseInt(req.query.limit) || 10;

    console.log(`🎵 Getting recommendations for song: ${songId}`);

    const recommendations = await recommendationEngine.recommendBySong(songId, limit);

    if (recommendations.length === 0) {
      return res.status(404).json({
        status: 'success',
        message: 'No recommendations found for this song',
        data: {
          recommendations: [],
          total: 0,
          songId
        }
      });
    }

    res.status(200).json({
      status: 'success',
      message: `Found ${recommendations.length} recommendations`,
      data: {
        recommendations,
        total: recommendations.length,
        songId,
        algorithm: 'cosine_similarity'
      }
    });

  } catch (error) {
    console.error('❌ Error in song recommendations:', error.message);
    
    if (error.message.includes('not found')) {
      return res.status(404).json({
        status: 'error',
        message: 'Song not found',
        songId: req.params.songId
      });
    }

    res.status(500).json({
      status: 'error',
      message: 'Internal server error while generating recommendations'
    });
  }
});

// GET /api/recommendations/mood/:mood
// Get recommendations based on mood
router.get('/mood/:mood', [
  param('mood').isIn(['Party', 'Focus', 'Chill', 'Workout', 'Sad', 'Upbeat', 'Romantic', 'Energetic', 'Relaxing'])
    .withMessage('Invalid mood. Valid moods: Party, Focus, Chill, Workout, Sad, Upbeat, Romantic, Energetic, Relaxing'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  handleValidationErrors
], async (req, res) => {
  try {
    const { mood } = req.params;
    const limit = parseInt(req.query.limit) || 20;

    console.log(`🎵 Getting ${mood} mood recommendations`);

    const recommendations = await recommendationEngine.recommendByMood(mood, limit);

    res.status(200).json({
      status: 'success',
      message: `Found ${recommendations.length} songs for ${mood} mood`,
      data: {
        recommendations,
        total: recommendations.length,
        mood,
        algorithm: 'mood_compatibility'
      }
    });

  } catch (error) {
    console.error('❌ Error in mood recommendations:', error.message);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error while generating mood recommendations'
    });
  }
});

// POST /api/recommendations/hybrid
// Get hybrid recommendations using multiple strategies
router.post('/hybrid', [
  body('songId').optional().notEmpty().withMessage('Song ID cannot be empty if provided'),
  body('mood').optional().isIn(['Party', 'Focus', 'Chill', 'Workout', 'Sad', 'Upbeat', 'Romantic', 'Energetic', 'Relaxing'])
    .withMessage('Invalid mood'),
  body('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
  body('diversityFactor').optional().isFloat({ min: 0, max: 1 }).withMessage('Diversity factor must be between 0 and 1'),
  handleValidationErrors
], async (req, res) => {
  try {
    const {
      songId = null,
      mood = null,
      userId = null,
      limit = 20,
      diversityFactor = 0.3
    } = req.body;

    if (!songId && !mood) {
      return res.status(400).json({
        status: 'error',
        message: 'At least one of songId or mood must be provided'
      });
    }

    console.log(`🎵 Getting hybrid recommendations with songId: ${songId}, mood: ${mood}`);

    const recommendations = await recommendationEngine.getHybridRecommendations({
      songId,
      mood,
      userId,
      limit,
      diversityFactor
    });

    res.status(200).json({
      status: 'success',
      message: `Generated ${recommendations.length} hybrid recommendations`,
      data: {
        recommendations,
        total: recommendations.length,
        parameters: {
          songId,
          mood,
          limit,
          diversityFactor
        },
        algorithm: 'hybrid_recommendation'
      }
    });

  } catch (error) {
    console.error('❌ Error in hybrid recommendations:', error.message);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error while generating hybrid recommendations'
    });
  }
});

// GET /api/recommendations/trending
// Get trending songs
router.get('/trending', [
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
  query('timeFrame').optional().isInt({ min: 1, max: 30 }).withMessage('Time frame must be between 1 and 30 days'),
  handleValidationErrors
], async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const timeFrame = parseInt(req.query.timeFrame) || 7;

    console.log(`🔥 Getting trending songs (${timeFrame} days)`);

    const trendingSongs = await recommendationEngine.getTrendingSongs(limit, timeFrame);

    res.status(200).json({
      status: 'success',
      message: `Found ${trendingSongs.length} trending songs`,
      data: {
        trending: trendingSongs,
        total: trendingSongs.length,
        timeFrame,
        algorithm: 'activity_based_trending'
      }
    });

  } catch (error) {
    console.error('❌ Error getting trending songs:', error.message);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error while getting trending songs'
    });
  }
});

// GET /api/recommendations/similar/:songId/:targetSongId
// Check similarity between two specific songs
router.get('/similar/:songId/:targetSongId', [
  param('songId').notEmpty().withMessage('Song ID is required'),
  param('targetSongId').notEmpty().withMessage('Target song ID is required'),
  handleValidationErrors
], async (req, res) => {
  try {
    const { songId, targetSongId } = req.params;

    const song1 = await Song.findOne({ id: songId, isActive: true });
    const song2 = await Song.findOne({ id: targetSongId, isActive: true });

    if (!song1 || !song2) {
      return res.status(404).json({
        status: 'error',
        message: 'One or both songs not found'
      });
    }

    const features1 = recommendationEngine.extractFeatures(song1);
    const features2 = recommendationEngine.extractFeatures(song2);
    
    const similarity = recommendationEngine.cosineSimilarity(features1, features2);

    res.status(200).json({
      status: 'success',
      message: 'Similarity calculated successfully',
      data: {
        song1: {
          id: song1.id,
          name: song1.name,
          artist: song1.artist
        },
        song2: {
          id: song2.id,
          name: song2.name,
          artist: song2.artist
        },
        similarity,
        similarityPercentage: Math.round(similarity * 100),
        interpretation: similarity > 0.8 ? 'Very Similar' :
                       similarity > 0.6 ? 'Similar' :
                       similarity > 0.4 ? 'Somewhat Similar' :
                       similarity > 0.2 ? 'Different' : 'Very Different'
      }
    });

  } catch (error) {
    console.error('❌ Error calculating similarity:', error.message);
    res.status(500).json({
      status: 'error',
      message: 'Internal server error while calculating similarity'
    });
  }
});

// GET /api/recommendations/moods
// Get available mood options
router.get('/moods', (req, res) => {
  const moods = [
    {
      name: 'Party',
      description: 'High energy songs perfect for parties and dancing',
      emoji: '🎉',
      characteristics: ['High Energy', 'Danceable', 'Positive']
    },
    {
      name: 'Focus',
      description: 'Instrumental and ambient tracks for concentration',
      emoji: '🧠',
      characteristics: ['Low Energy', 'Instrumental', 'Minimal Vocals']
    },
    {
      name: 'Chill',
      description: 'Relaxed and mellow vibes for unwinding',
      emoji: '😌',
      characteristics: ['Relaxed', 'Acoustic', 'Peaceful']
    },
    {
      name: 'Workout',
      description: 'High-energy motivational tracks for exercise',
      emoji: '💪',
      characteristics: ['High Energy', 'Fast Tempo', 'Motivating']
    },
    {
      name: 'Sad',
      description: 'Melancholic songs for emotional moments',
      emoji: '😢',
      characteristics: ['Low Valence', 'Emotional', 'Slow Tempo']
    },
    {
      name: 'Upbeat',
      description: 'Happy and energetic songs to lift your mood',
      emoji: '🌟',
      characteristics: ['High Valence', 'Energetic', 'Positive']
    },
    {
      name: 'Romantic',
      description: 'Love songs and romantic ballads',
      emoji: '💕',
      characteristics: ['Emotional', 'Melodic', 'Intimate']
    },
    {
      name: 'Energetic',
      description: 'High-octane tracks with intense energy',
      emoji: '⚡',
      characteristics: ['Very High Energy', 'Intense', 'Dynamic']
    },
    {
      name: 'Relaxing',
      description: 'Calm and peaceful music for relaxation',
      emoji: '🧘',
      characteristics: ['Very Low Energy', 'Peaceful', 'Meditative']
    }
  ];

  res.status(200).json({
    status: 'success',
    message: 'Available mood categories',
    data: {
      moods,
      total: moods.length
    }
  });
});

export default router; 
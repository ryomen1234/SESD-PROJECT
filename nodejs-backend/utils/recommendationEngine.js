import { Matrix } from 'ml-matrix';
import Song from '../models/Song.js';

class RecommendationEngine {
  constructor() {
    this.audioFeatures = [
      'danceability', 'energy', 'key', 'loudness', 'mode',
      'speechiness', 'acousticness', 'instrumentalness', 
      'liveness', 'valence', 'tempo'
    ];
    
    this.moodProfiles = {
      'Party': {
        energy: 0.8,
        danceability: 0.8,
        valence: 0.8,
        loudness: -5.0,
        tempo: 125,
        acousticness: 0.2
      },
      'Focus': {
        energy: 0.2,
        danceability: 0.2,
        instrumentalness: 0.8,
        speechiness: 0.05,
        loudness: -15.0,
        acousticness: 0.6,
        valence: 0.4
      },
      'Chill': {
        energy: 0.3,
        danceability: 0.5,
        valence: 0.5,
        acousticness: 0.7,
        loudness: -12.0,
        tempo: 90,
        instrumentalness: 0.3
      },
      'Workout': {
        energy: 0.9,
        danceability: 0.7,
        valence: 0.8,
        tempo: 130,
        loudness: -3.0,
        speechiness: 0.1
      },
      'Sad': {
        energy: 0.2,
        valence: 0.2,
        acousticness: 0.6,
        instrumentalness: 0.4,
        loudness: -20.0,
        tempo: 70,
        danceability: 0.3
      },
      'Upbeat': {
        energy: 0.8,
        valence: 0.9,
        danceability: 0.7,
        tempo: 120,
        loudness: -6.0,
        speechiness: 0.1
      },
      'Romantic': {
        energy: 0.4,
        valence: 0.6,
        acousticness: 0.5,
        instrumentalness: 0.2,
        danceability: 0.4,
        loudness: -10.0,
        tempo: 80
      },
      'Energetic': {
        energy: 0.9,
        danceability: 0.8,
        valence: 0.8,
        tempo: 140,
        loudness: -4.0,
        speechiness: 0.2
      },
      'Relaxing': {
        energy: 0.2,
        valence: 0.5,
        acousticness: 0.8,
        instrumentalness: 0.7,
        danceability: 0.2,
        loudness: -18.0,
        tempo: 60
      }
    };
  }

  // Normalize audio features to 0-1 range
  normalizeFeatures(songs) {
    const features = songs.map(song => this.extractFeatures(song));
    const matrix = new Matrix(features);
    
    // Min-max normalization for each feature
    const normalized = [];
    for (let col = 0; col < matrix.columns; col++) {
      const column = matrix.getColumn(col);
      const min = Math.min(...column);
      const max = Math.max(...column);
      const range = max - min;
      
      if (range === 0) continue;
      
      for (let row = 0; row < matrix.rows; row++) {
        if (!normalized[row]) normalized[row] = [];
        normalized[row][col] = (matrix.get(row, col) - min) / range;
      }
    }
    
    return normalized;
  }

  // Extract audio features from song object
  extractFeatures(song) {
    const features = song.audioFeatures;
    return [
      features.danceability || 0,
      features.energy || 0,
      (features.key + 1) / 12, // Normalize key to 0-1
      (features.loudness + 60) / 60, // Normalize loudness (assuming -60 to 0 dB range)
      features.mode || 0,
      features.speechiness || 0,
      features.acousticness || 0,
      features.instrumentalness || 0,
      features.liveness || 0,
      features.valence || 0,
      Math.min(features.tempo / 200, 1) || 0 // Normalize tempo (assuming max 200 BPM)
    ];
  }

  // Calculate cosine similarity between two feature vectors
  cosineSimilarity(vectorA, vectorB) {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < vectorA.length; i++) {
      dotProduct += vectorA[i] * vectorB[i];
      normA += vectorA[i] * vectorA[i];
      normB += vectorB[i] * vectorB[i];
    }

    normA = Math.sqrt(normA);
    normB = Math.sqrt(normB);

    if (normA === 0 || normB === 0) return 0;
    
    return dotProduct / (normA * normB);
  }

  // Get song recommendations based on a reference song
  async recommendBySong(songId, numRecommendations = 10) {
    try {
      // Get the reference song
      const referenceSong = await Song.findOne({ id: songId, isActive: true });
      if (!referenceSong) {
        throw new Error('Reference song not found');
      }

      // Get all songs except the reference song
      const allSongs = await Song.find({ 
        id: { $ne: songId }, 
        isActive: true 
      }).lean();

      if (allSongs.length === 0) {
        return [];
      }

      // Add reference song to the beginning for normalization
      const songsWithReference = [referenceSong, ...allSongs];
      
      // Normalize features
      const normalizedFeatures = this.normalizeFeatures(songsWithReference);
      const referenceFeatures = normalizedFeatures[0];

      // Calculate similarities
      const similarities = [];
      for (let i = 1; i < normalizedFeatures.length; i++) {
        const similarity = this.cosineSimilarity(referenceFeatures, normalizedFeatures[i]);
        similarities.push({
          song: allSongs[i - 1],
          similarity: similarity,
          score: this.calculateRecommendationScore(allSongs[i - 1], similarity)
        });
      }

      // Sort by similarity and score
      similarities.sort((a, b) => b.score - a.score);

      // Return top recommendations
      return similarities
        .slice(0, numRecommendations)
        .map(item => ({
          ...item.song,
          similarityScore: item.similarity,
          recommendationScore: item.score
        }));

    } catch (error) {
      console.error('Error in recommendBySong:', error);
      throw error;
    }
  }

  // Get mood-based recommendations
  async recommendByMood(mood, numRecommendations = 20) {
    try {
      if (!this.moodProfiles[mood]) {
        throw new Error(`Mood profile not found: ${mood}`);
      }

      // Get songs with the specified mood or calculate mood compatibility
      const songs = await Song.find({ isActive: true }).lean();
      
      if (songs.length === 0) {
        return [];
      }

      const moodProfile = this.moodProfiles[mood];
      const recommendations = [];

      for (const song of songs) {
        // Check if song already has this mood
        const hasMood = song.mood && song.mood.includes(mood);
        
        // Calculate mood compatibility score
        const compatibilityScore = this.calculateMoodCompatibility(song.audioFeatures, moodProfile);
        
        // Boost score if song already tagged with this mood
        const finalScore = hasMood ? compatibilityScore * 1.3 : compatibilityScore;
        
        recommendations.push({
          ...song,
          moodCompatibility: compatibilityScore,
          recommendationScore: this.calculateRecommendationScore(song, finalScore)
        });
      }

      // Sort by recommendation score
      recommendations.sort((a, b) => b.recommendationScore - a.recommendationScore);

      return recommendations.slice(0, numRecommendations);

    } catch (error) {
      console.error('Error in recommendByMood:', error);
      throw error;
    }
  }

  // Calculate mood compatibility between song features and mood profile
  calculateMoodCompatibility(songFeatures, moodProfile) {
    let totalScore = 0;
    let weightCount = 0;

    for (const [feature, targetValue] of Object.entries(moodProfile)) {
      if (songFeatures[feature] !== undefined) {
        // Calculate distance (closer = better)
        const distance = Math.abs(songFeatures[feature] - targetValue);
        const similarity = 1 - distance; // Convert distance to similarity
        
        // Weight important features more heavily
        const weight = this.getFeatureWeight(feature);
        totalScore += similarity * weight;
        weightCount += weight;
      }
    }

    return weightCount > 0 ? totalScore / weightCount : 0;
  }

  // Get feature importance weights for mood matching
  getFeatureWeight(feature) {
    const weights = {
      energy: 1.2,
      valence: 1.2,
      danceability: 1.0,
      acousticness: 0.9,
      instrumentalness: 0.8,
      tempo: 0.9,
      loudness: 0.7,
      speechiness: 0.6
    };
    
    return weights[feature] || 0.5;
  }

  // Calculate overall recommendation score
  calculateRecommendationScore(song, similarityScore) {
    let score = similarityScore;
    
    // Boost popular songs slightly
    if (song.popularity) {
      score *= (1 + (song.popularity / 100) * 0.1);
    }
    
    // Boost songs with more plays
    if (song.playCount > 0) {
      score *= (1 + Math.log(song.playCount + 1) * 0.05);
    }
    
    // Boost liked songs
    if (song.likeCount > 0) {
      score *= (1 + Math.log(song.likeCount + 1) * 0.1);
    }
    
    return Math.max(0, Math.min(1, score)); // Clamp between 0 and 1
  }

  // Get hybrid recommendations (combine different strategies)
  async getHybridRecommendations(options = {}) {
    const {
      songId = null,
      mood = null,
      userId = null,
      limit = 20,
      diversityFactor = 0.3
    } = options;

    try {
      let recommendations = [];

      // Get song-based recommendations
      if (songId) {
        const songRecs = await this.recommendBySong(songId, Math.floor(limit * 0.6));
        recommendations = [...songRecs];
      }

      // Get mood-based recommendations
      if (mood && recommendations.length < limit) {
        const remaining = limit - recommendations.length;
        const moodRecs = await this.recommendByMood(mood, remaining);
        
        // Merge and deduplicate
        const existingIds = new Set(recommendations.map(song => song.id));
        const newMoodRecs = moodRecs.filter(song => !existingIds.has(song.id));
        recommendations = [...recommendations, ...newMoodRecs.slice(0, remaining)];
      }

      // Add diversity if requested
      if (diversityFactor > 0) {
        recommendations = this.addDiversity(recommendations, diversityFactor);
      }

      return recommendations.slice(0, limit);

    } catch (error) {
      console.error('Error in getHybridRecommendations:', error);
      throw error;
    }
  }

  // Add diversity to recommendations by reducing similar consecutive songs
  addDiversity(recommendations, diversityFactor) {
    if (recommendations.length <= 1) return recommendations;

    const diversified = [recommendations[0]];
    const remaining = recommendations.slice(1);

    for (const song of remaining) {
      if (diversified.length >= recommendations.length) break;
      
      // Check similarity with last added song
      const lastSong = diversified[diversified.length - 1];
      const similarity = this.cosineSimilarity(
        this.extractFeatures(lastSong),
        this.extractFeatures(song)
      );

      // Add song if it's different enough or we're forcing diversity
      if (similarity < (1 - diversityFactor) || Math.random() < diversityFactor) {
        diversified.push(song);
      }
    }

    // Fill remaining slots if needed
    const usedIds = new Set(diversified.map(song => song.id));
    const unused = remaining.filter(song => !usedIds.has(song.id));
    
    while (diversified.length < recommendations.length && unused.length > 0) {
      diversified.push(unused.shift());
    }

    return diversified;
  }

  // Get trending songs based on recent activity
  async getTrendingSongs(limit = 10, timeFrame = 7) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - timeFrame);

      return await Song.find({ 
        isActive: true,
        updatedAt: { $gte: cutoffDate }
      })
      .sort({ 
        playCount: -1, 
        likeCount: -1, 
        popularity: -1 
      })
      .limit(limit)
      .lean();

    } catch (error) {
      console.error('Error in getTrendingSongs:', error);
      throw error;
    }
  }
}

export default new RecommendationEngine(); 
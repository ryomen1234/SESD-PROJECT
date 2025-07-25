import mongoose from 'mongoose';

const songSchema = new mongoose.Schema({
  // Basic song information
  id: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  artist: {
    type: String,
    required: true,
    trim: true,
    index: true
  },
  album: {
    type: String,
    trim: true
  },
  year: {
    type: Number,
    min: 1900,
    max: new Date().getFullYear() + 1
  },
  genre: [{
    type: String,
    trim: true
  }],
  
  // Audio features for recommendation algorithm
  audioFeatures: {
    danceability: {
      type: Number,
      min: 0,
      max: 1,
      required: true
    },
    energy: {
      type: Number,
      min: 0,
      max: 1,
      required: true
    },
    key: {
      type: Number,
      min: -1,
      max: 11
    },
    loudness: {
      type: Number,
      required: true
    },
    mode: {
      type: Number,
      min: 0,
      max: 1
    },
    speechiness: {
      type: Number,
      min: 0,
      max: 1,
      required: true
    },
    acousticness: {
      type: Number,
      min: 0,
      max: 1,
      required: true
    },
    instrumentalness: {
      type: Number,
      min: 0,
      max: 1,
      required: true
    },
    liveness: {
      type: Number,
      min: 0,
      max: 1,
      required: true
    },
    valence: {
      type: Number,
      min: 0,
      max: 1,
      required: true
    },
    tempo: {
      type: Number,
      min: 0,
      required: true
    }
  },
  
  // Additional metadata
  duration: {
    type: Number, // in seconds
    min: 0
  },
  popularity: {
    type: Number,
    min: 0,
    max: 100,
    default: 50
  },
  
  // External links
  spotifyId: String,
  youtubeId: String,
  appleMusicId: String,
  
  // Mood classification
  mood: [{
    type: String,
    enum: ['Party', 'Focus', 'Chill', 'Workout', 'Sad', 'Upbeat', 'Romantic', 'Energetic', 'Relaxing'],
    index: true
  }],
  
  // Social features
  playCount: {
    type: Number,
    default: 0,
    min: 0
  },
  likeCount: {
    type: Number,
    default: 0,
    min: 0
  },
  
  // Image/artwork
  artwork: {
    small: String,
    medium: String,
    large: String
  },
  
  // Preview audio
  previewUrl: String,
  
  // Tags for better search
  tags: [{
    type: String,
    trim: true
  }],
  
  // Recommendation metadata
  recommendationScore: {
    type: Number,
    default: 0
  },
  
  // Status
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  versionKey: false
});

// Indexes for performance
songSchema.index({ name: 'text', artist: 'text', album: 'text' });
songSchema.index({ 'audioFeatures.energy': 1, 'audioFeatures.valence': 1 });
songSchema.index({ mood: 1 });
songSchema.index({ genre: 1 });
songSchema.index({ popularity: -1 });
songSchema.index({ createdAt: -1 });

// Virtual for full song info
songSchema.virtual('fullName').get(function() {
  return `${this.artist} - ${this.name}`;
});

// Static methods
songSchema.statics.findByMood = function(mood) {
  return this.find({ mood: { $in: [mood] }, isActive: true });
};

songSchema.statics.findSimilar = function(songId, limit = 10) {
  // This will be implemented with the recommendation algorithm
  return this.find({ _id: { $ne: songId }, isActive: true }).limit(limit);
};

songSchema.statics.searchSongs = function(query) {
  return this.find({
    $or: [
      { name: { $regex: query, $options: 'i' } },
      { artist: { $regex: query, $options: 'i' } },
      { album: { $regex: query, $options: 'i' } },
      { tags: { $regex: query, $options: 'i' } }
    ],
    isActive: true
  });
};

// Instance methods
songSchema.methods.incrementPlayCount = function() {
  this.playCount += 1;
  return this.save();
};

songSchema.methods.addLike = function() {
  this.likeCount += 1;
  return this.save();
};

songSchema.methods.removeLike = function() {
  if (this.likeCount > 0) {
    this.likeCount -= 1;
  }
  return this.save();
};

// Pre-save middleware
songSchema.pre('save', function(next) {
  // Auto-generate mood based on audio features
  if (!this.mood || this.mood.length === 0) {
    this.mood = this.generateMoodFromFeatures();
  }
  next();
});

// Method to generate mood from audio features
songSchema.methods.generateMoodFromFeatures = function() {
  const moods = [];
  const features = this.audioFeatures;
  
  if (features.energy > 0.7 && features.danceability > 0.7 && features.valence > 0.6) {
    moods.push('Party');
  }
  if (features.energy < 0.4 && features.acousticness > 0.5) {
    moods.push('Chill');
  }
  if (features.energy > 0.8 && features.tempo > 120) {
    moods.push('Workout');
  }
  if (features.valence < 0.3) {
    moods.push('Sad');
  }
  if (features.valence > 0.7 && features.energy > 0.6) {
    moods.push('Upbeat');
  }
  if (features.instrumentalness > 0.5 && features.energy < 0.5) {
    moods.push('Focus');
  }
  
  return moods.length > 0 ? moods : ['Chill'];
};

export default mongoose.model('Song', songSchema); 
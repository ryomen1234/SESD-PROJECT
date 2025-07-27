import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  googleId: {
    type: String,
    unique: true,
    sparse: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  picture: {
    type: String
  },
  savedPlaylists: [{
    id: String,
    name: String,
    description: String,
    tracks: [{
      id: String,
      title: String,
      artist: {
        id: String,
        name: String
      },
      artwork: {
        '150x150': String,
        '480x480': String
      },
      duration: Number,
      preview_url: String,
      deezer_url: String,
      full_song_url: String
    }],
    createdAt: {
      type: Date,
      default: Date.now
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('User', userSchema); 
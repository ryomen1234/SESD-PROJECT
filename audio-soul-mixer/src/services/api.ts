import axios, { AxiosResponse } from 'axios';

// API configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance with default config
export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth tokens if needed
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling common errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('auth_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Types
export interface Song {
  id: string;
  name: string;
  artist: string;
  album?: string;
  year?: number;
  genre?: string[];
  audioFeatures: {
    danceability: number;
    energy: number;
    key: number;
    loudness: number;
    mode: number;
    speechiness: number;
    acousticness: number;
    instrumentalness: number;
    liveness: number;
    valence: number;
    tempo: number;
  };
  duration?: number;
  popularity: number;
  mood?: string[];
  playCount: number;
  likeCount: number;
  artwork?: {
    small: string;
    medium: string;
    large: string;
  };
  previewUrl?: string;
  tags?: string[];
  similarityScore?: number;
  recommendationScore?: number;
  moodCompatibility?: number;
}

export interface ApiResponse<T> {
  status: 'success' | 'error';
  message: string;
  data: T;
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    current: number;
    total: number;
    limit: number;
    skip: number;
    totalItems: number;
  };
  filters?: any;
}

export interface MoodInfo {
  name: string;
  description: string;
  emoji: string;
  characteristics: string[];
}

// API Service Functions
export const songsApi = {
  // Get all songs with pagination and filters
  getSongs: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    mood?: string;
    genre?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<ApiResponse<{ songs: Song[]; pagination: any }>> => {
    const response = await api.get('/songs', { params });
    return response.data;
  },

  // Get a specific song by ID
  getSong: async (songId: string): Promise<ApiResponse<{ song: Song }>> => {
    const response = await api.get(`/songs/${songId}`);
    return response.data;
  },

  // Add a new song
  addSong: async (song: Partial<Song>): Promise<ApiResponse<{ song: Song }>> => {
    const response = await api.post('/songs', song);
    return response.data;
  },

  // Update a song
  updateSong: async (songId: string, updates: Partial<Song>): Promise<ApiResponse<{ song: Song }>> => {
    const response = await api.put(`/songs/${songId}`, updates);
    return response.data;
  },

  // Delete a song
  deleteSong: async (songId: string): Promise<ApiResponse<any>> => {
    const response = await api.delete(`/songs/${songId}`);
    return response.data;
  },

  // Increment play count
  playeSong: async (songId: string): Promise<ApiResponse<{ songId: string; playCount: number }>> => {
    const response = await api.post(`/songs/${songId}/play`);
    return response.data;
  },

  // Like a song
  likeSong: async (songId: string): Promise<ApiResponse<{ songId: string; likeCount: number }>> => {
    const response = await api.post(`/songs/${songId}/like`);
    return response.data;
  },

  // Unlike a song
  unlikeSong: async (songId: string): Promise<ApiResponse<{ songId: string; likeCount: number }>> => {
    const response = await api.delete(`/songs/${songId}/like`);
    return response.data;
  },

  // Get analytics overview
  getAnalytics: async (): Promise<ApiResponse<any>> => {
    const response = await api.get('/songs/analytics/overview');
    return response.data;
  }
};

export const recommendationsApi = {
  // Get song-based recommendations
  getBySong: async (
    songId: string,
    limit?: number
  ): Promise<ApiResponse<{ 
    recommendations: Song[];
    total: number;
    songId: string;
    algorithm: string;
  }>> => {
    const response = await api.get(`/recommendations/song/${songId}`, {
      params: { limit }
    });
    return response.data;
  },

  // Get mood-based recommendations
  getByMood: async (
    mood: string,
    limit?: number
  ): Promise<ApiResponse<{
    recommendations: Song[];
    total: number;
    mood: string;
    algorithm: string;
  }>> => {
    const response = await api.get(`/recommendations/mood/${mood}`, {
      params: { limit }
    });
    return response.data;
  },

  // Get hybrid recommendations
  getHybrid: async (params: {
    songId?: string;
    mood?: string;
    limit?: number;
    diversityFactor?: number;
  }): Promise<ApiResponse<{
    recommendations: Song[];
    total: number;
    parameters: any;
    algorithm: string;
  }>> => {
    const response = await api.post('/recommendations/hybrid', params);
    return response.data;
  },

  // Get trending songs
  getTrending: async (
    limit?: number,
    timeFrame?: number
  ): Promise<ApiResponse<{
    trending: Song[];
    total: number;
    timeFrame: number;
    algorithm: string;
  }>> => {
    const response = await api.get('/recommendations/trending', {
      params: { limit, timeFrame }
    });
    return response.data;
  },

  // Get similarity between two songs
  getSimilarity: async (
    songId: string,
    targetSongId: string
  ): Promise<ApiResponse<{
    song1: { id: string; name: string; artist: string };
    song2: { id: string; name: string; artist: string };
    similarity: number;
    similarityPercentage: number;
    interpretation: string;
  }>> => {
    const response = await api.get(`/recommendations/similar/${songId}/${targetSongId}`);
    return response.data;
  },

  // Get available moods
  getMoods: async (): Promise<ApiResponse<{ moods: MoodInfo[]; total: number }>> => {
    const response = await api.get('/recommendations/moods');
    return response.data;
  }
};

// Playlist Types
export interface Playlist {
  id: string;
  name: string;
  description: string;
  user: {
    id: string;
    name: string;
    handle: string;
  };
  artwork?: {
    '150x150'?: string;
    '480x480'?: string;
    '1000x1000'?: string;
  };
  trackCount: number;
  isPrivate?: boolean;
  createdAt?: string;
  updatedAt?: string;
  favoriteCount: number;
  repostCount: number;
}

export interface PlaylistTrack {
  id: string;
  title: string;
  artist: {
    id: string;
    name: string;
    handle: string;
  };
  artwork?: {
    '150x150'?: string;
    '480x480'?: string;
    '1000x1000'?: string;
  };
  duration: number;
  genre?: string;
  mood?: string;
  playCount: number;
  favoriteCount: number;
  repostCount: number;
  createdAt?: string;
  // Audio-related properties
  preview_url?: string;
  previewUrl?: string;
  audio?: string;
  album?: string;
  deezer_url?: string;
  full_song_url?: string;
  // ML-related properties
  ml_score?: number;
  ml_reason?: string;
}

// Playlists API
export const playlistsApi = {
  // Get trending playlists
  getTrending: async (params?: {
    time?: 'week' | 'month' | 'year' | 'allTime';
    offset?: number;
    limit?: number;
  }): Promise<ApiResponse<{ 
    playlists: Playlist[];
    pagination: any;
    filters: any;
    source: string;
  }>> => {
    const response = await api.get('/playlists/trending', { params });
    return response.data;
  },

  // Search playlists
  search: async (params: {
    query: string;
    offset?: number;
    limit?: number;
  }): Promise<ApiResponse<{ 
    playlists: Playlist[];
    pagination: any;
    search: { query: string };
    source: string;
  }>> => {
    const response = await api.get('/playlists/search', { params });
    return response.data;
  },

  // Get specific playlist by ID
  getById: async (playlistId: string): Promise<ApiResponse<{ 
    playlist: Playlist;
    source: string;
  }>> => {
    const response = await api.get(`/playlists/${playlistId}`);
    return response.data;
  },

  // Get playlist tracks
  getTracks: async (
    playlistId: string,
    params?: {
      offset?: number;
      limit?: number;
    }
  ): Promise<ApiResponse<{ 
    playlistId: string;
    tracks: PlaylistTrack[];
    pagination: any;
    source: string;
  }>> => {
    const response = await api.get(`/playlists/${playlistId}/tracks`, { params });
    return response.data;
  },

  // Get bulk playlists
  getBulk: async (params?: {
    ids?: string;
    offset?: number;
    limit?: number;
  }): Promise<ApiResponse<{ 
    playlists: Playlist[];
    pagination: any;
    filters: any;
    source: string;
  }>> => {
    const response = await api.get('/playlists', { params });
    return response.data;
  },

  // Health check for playlist service
  healthCheck: async (): Promise<ApiResponse<any>> => {
    const response = await api.get('/playlists/health/check');
    return response.data;
  }
};

// Health check
export const healthCheck = async (): Promise<ApiResponse<any>> => {
  const response = await api.get('/health');
  return response.data;
};

// Helper function to handle API errors
export const handleApiError = (error: any) => {
  if (error.response) {
    // Server responded with error status
    return {
      message: error.response.data.message || 'Something went wrong',
      status: error.response.status,
      data: error.response.data
    };
  } else if (error.request) {
    // Request was made but no response received
    return {
      message: 'Network error - please check your connection',
      status: 0,
      data: null
    };
  } else {
    // Something else happened
    return {
      message: error.message || 'Unknown error occurred',
      status: 0,
      data: null
    };
  }
};

// ML Recommendations API
export interface MLRecommendationRequest {
  user_input: string;
  limit?: number;
}

export interface MLRecommendationResponse {
  recommendations: PlaylistTrack[];
  user_input: string;
  limit: number;
  ml_model: string;
  processing_time_ms: number;
}

export const mlRecommendationsApi = {
  // Get ML-based recommendations
  getRecommendations: async (params: MLRecommendationRequest): Promise<ApiResponse<MLRecommendationResponse>> => {
    const response: AxiosResponse<ApiResponse<MLRecommendationResponse>> = await api.get('/recommendations/ml', {
      params
    });
    return response.data;
  },

  // Submit user feedback for ML training
  submitFeedback: async (trackId: string, rating: number, feedback?: string): Promise<ApiResponse<any>> => {
    const response: AxiosResponse<ApiResponse<any>> = await api.post('/recommendations/feedback', {
      track_id: trackId,
      user_rating: rating,
      user_feedback: feedback
    });
    return response.data;
  },

  // Health check for ML service
  healthCheck: async (): Promise<ApiResponse<any>> => {
    const response: AxiosResponse<ApiResponse<any>> = await api.get('/recommendations/health/check');
    return response.data;
  }
};

// Export default API instance
export default api; 
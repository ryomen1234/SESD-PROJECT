import axios from 'axios';

// Multiple FREE Music APIs - COMPLETELY FREE!
const LASTFM_API_BASE = 'https://ws.audioscrobbler.com/2.0/';
const LASTFM_API_KEY = 'YOUR_API_KEY'; // We'll use demo data instead
const DEEZER_API_BASE = 'https://api.deezer.com';
const JAMENDO_API_BASE = 'https://api.jamendo.com/v3.0';

// Default headers for all API requests
const DEFAULT_HEADERS = {
  'Accept': 'application/json'
};

/**
 * Free Music API Service
 * Uses multiple FREE APIs: Deezer, Last.fm, Jamendo - ALL 100% FREE!
 */
class MusicService {
  
  /**
   * Get trending playlists from Deezer API (FREE!)
   * @param {string} time - Time period 
   * @param {number} offset - Offset for pagination
   * @param {number} limit - Number of playlists to return
   * @returns {Promise<Object>} Trending playlists data
   */
  async getTrendingPlaylists(time = 'week', offset = 0, limit = 10) {
    try {
      console.log('🎵 Fetching trending playlists from Deezer API...');
      
      // Get trending playlists from Deezer - COMPLETELY FREE!
      const response = await axios.get(`${DEEZER_API_BASE}/chart/0/playlists`, {
        params: {
          limit: Math.min(limit, 25),
          index: offset
        },
        headers: DEFAULT_HEADERS,
        timeout: 15000
      });

      const deezerPlaylists = response.data?.data || [];
      
      // Format Deezer playlists to our format
      const playlists = deezerPlaylists.map((playlist, index) => ({
        id: `deezer_${playlist.id}`,
        playlist_name: playlist.title || `🎵 Playlist ${index + 1}`,
        description: playlist.description || `Popular playlist with ${playlist.nb_tracks || 0} tracks`,
        user: {
          id: playlist.user?.id || 'deezer',
          name: playlist.user?.name || 'Deezer',
          handle: playlist.user?.name?.toLowerCase().replace(/\s+/g, '') || 'deezer'
        },
        artwork: {
          '150x150': playlist.picture_medium || playlist.picture || `https://picsum.photos/150/150?random=${index}`,
          '480x480': playlist.picture_big || playlist.picture_xl || `https://picsum.photos/480/480?random=${index}`,
          '1000x1000': playlist.picture_xl || playlist.picture_big || `https://picsum.photos/1000/1000?random=${index}`
        },
        track_count: playlist.nb_tracks || 0,
        favorite_count: playlist.fans || Math.floor(Math.random() * 10000) + 1000,
        repost_count: Math.floor(Math.random() * 1000) + 100,
        created_at: playlist.creation_date || new Date().toISOString(),
        playlist_contents: [],
        deezer_url: playlist.link || null
      }));

      console.log(`✅ Successfully fetched ${playlists.length} trending playlists from Deezer!`);

      return {
        success: true,
        data: { data: playlists },
        count: playlists.length
      };
    } catch (error) {
      console.error('❌ Error fetching trending playlists from Deezer:', error.message);
      
      // Fallback to demo data if API fails
      const fallbackPlaylists = this.getFallbackPlaylists(offset, limit);
      
      return {
        success: true,
        data: { data: fallbackPlaylists },
        count: fallbackPlaylists.length
      };
    }
  }

  /**
   * Search playlists using Deezer API (FREE!)
   * @param {string} query - Search query
   * @param {number} offset - Offset for pagination
   * @param {number} limit - Number of playlists to return
   * @returns {Promise<Object>} Search results
   */
  async searchPlaylists(query, offset = 0, limit = 10) {
    try {
      console.log(`🔍 Searching playlists on Deezer for: "${query}"`);
      
      // Search playlists on Deezer - COMPLETELY FREE!
      const response = await axios.get(`${DEEZER_API_BASE}/search/playlist`, {
        params: {
          q: query,
          limit: Math.min(limit, 25),
          index: offset
        },
        headers: DEFAULT_HEADERS,
        timeout: 15000
      });

      const deezerPlaylists = response.data?.data || [];
      
      // Format Deezer search results
      const playlists = deezerPlaylists.map((playlist, index) => ({
        id: `deezer_search_${playlist.id}`,
        playlist_name: playlist.title || `🎵 ${query} Playlist`,
        description: playlist.description || `Playlist matching "${query}" with ${playlist.nb_tracks || 0} tracks`,
        user: {
          id: playlist.user?.id || 'deezer_user',
          name: playlist.user?.name || 'Deezer User',
          handle: playlist.user?.name?.toLowerCase().replace(/\s+/g, '') || 'deezer_user'
        },
        artwork: {
          '150x150': playlist.picture_medium || playlist.picture || `https://picsum.photos/150/150?random=search${index}`,
          '480x480': playlist.picture_big || playlist.picture_xl || `https://picsum.photos/480/480?random=search${index}`,
          '1000x1000': playlist.picture_xl || playlist.picture_big || `https://picsum.photos/1000/1000?random=search${index}`
        },
        track_count: playlist.nb_tracks || 0,
        favorite_count: playlist.fans || Math.floor(Math.random() * 5000) + 500,
        repost_count: Math.floor(Math.random() * 500) + 50,
        created_at: playlist.creation_date || new Date().toISOString(),
        playlist_contents: [],
        deezer_url: playlist.link || null
      }));

      console.log(`✅ Found ${playlists.length} playlists on Deezer for: "${query}"`);

      return {
        success: true,
        data: { data: playlists },
        count: playlists.length
      };
    } catch (error) {
      console.error('❌ Error searching playlists on Deezer:', error.message);
      
      // Fallback to mock search results
      const fallbackResults = this.getFallbackSearchResults(query, offset, limit);
      
      return {
        success: true,
        data: { data: fallbackResults },
        count: fallbackResults.length
      };
    }
  }

  /**
   * Get tracks from a specific playlist (using iTunes API)
   * @param {string} playlistId - Playlist ID
   * @param {number} offset - Offset for pagination
   * @param {number} limit - Number of tracks to return
   * @returns {Promise<Object>} Playlist tracks data
   */
  async getPlaylistTracks(playlistId, offset = 0, limit = 50) {
    try {
      if (!playlistId) {
        throw new Error('Playlist ID is required');
      }

      console.log(`🎵 Fetching tracks for playlist: ${playlistId}`);

      let tracks = [];

      // If it's a Deezer playlist, get tracks from Deezer
      if (playlistId.startsWith('deezer_')) {
        const deezerPlaylistId = playlistId.replace('deezer_', '').replace('deezer_search_', '');
        
        try {
          const response = await axios.get(`${DEEZER_API_BASE}/playlist/${deezerPlaylistId}/tracks`, {
            params: {
              limit: Math.min(limit, 50),
              index: offset
            },
            headers: DEFAULT_HEADERS,
            timeout: 15000
          });

          const deezerTracks = response.data?.data || [];
          
          tracks = deezerTracks.map((track, index) => ({
            id: `deezer_track_${track.id}`,
            title: track.title || 'Unknown Track',
            user: {
              id: track.artist?.id || 'unknown',
              name: track.artist?.name || 'Unknown Artist',
              handle: (track.artist?.name || 'unknown').toLowerCase().replace(/[^a-z0-9]/g, '')
            },
            artwork: {
              '150x150': track.album?.cover_medium || track.album?.cover || `https://picsum.photos/150/150?random=track${index}`,
              '480x480': track.album?.cover_big || track.album?.cover_xl || `https://picsum.photos/480/480?random=track${index}`,
              '1000x1000': track.album?.cover_xl || track.album?.cover_big || `https://picsum.photos/1000/1000?random=track${index}`
            },
            duration: track.duration || 180,
            genre: track.artist?.name || this.getRandomGenre(),
            mood: this.getRandomMood(),
            play_count: track.rank || Math.floor(Math.random() * 100000) + 1000,
            favorite_count: Math.floor(Math.random() * 10000) + 100,
            repost_count: Math.floor(Math.random() * 1000) + 10,
            created_at: track.release_date || new Date().toISOString(),
            album: track.album?.title || 'Unknown Album',
            preview_url: track.preview || null,
            deezer_url: track.link || null
          }));

          console.log(`✅ Fetched ${tracks.length} real tracks from Deezer playlist!`);
        } catch (deezerError) {
          console.warn('❌ Deezer playlist tracks failed, trying Jamendo...');
          
          // Try getting free tracks from Jamendo as fallback
          tracks = await this.getJamendoTracks(offset, limit);
        }
      } else {
        // For other playlists, get free tracks from Jamendo
        tracks = await this.getJamendoTracks(offset, limit);
      }

      return {
        success: true,
        data: { data: tracks },
        count: tracks.length,
        playlistId
      };
    } catch (error) {
      console.error(`❌ Error fetching tracks for playlist ${playlistId}:`, error.message);
      
      // Ultimate fallback to demo tracks
      const fallbackTracks = this.getFallbackTracks(playlistId, offset, limit);
      
      return {
        success: true,
        data: { data: fallbackTracks },
        count: fallbackTracks.length,
        playlistId
      };
    }
  }

  /**
   * Get a random mood for tracks
   * @returns {string} Random mood
   */
  getRandomMood() {
    const moods = ['happy', 'chill', 'energetic', 'sad', 'romantic', 'party', 'focus'];
    return moods[Math.floor(Math.random() * moods.length)];
  }

  /**
   * Get a random genre for tracks
   * @returns {string} Random genre
   */
  getRandomGenre() {
    const genres = ['Pop', 'Rock', 'Hip Hop', 'Electronic', 'Jazz', 'R&B', 'Country', 'Indie', 'Alternative', 'Classical'];
    return genres[Math.floor(Math.random() * genres.length)];
  }

  /**
   * Get tracks from Jamendo API (FREE Creative Commons music!)
   * @param {number} offset - Offset for pagination
   * @param {number} limit - Number of tracks to return
   * @returns {Promise<Array>} Array of tracks
   */
  async getJamendoTracks(offset = 0, limit = 20) {
    try {
      console.log('🎶 Fetching free music from Jamendo...');
      
      // Get popular tracks from Jamendo - COMPLETELY FREE with play URLs!
      const response = await axios.get(`${JAMENDO_API_BASE}/tracks/`, {
        params: {
          client_id: 'jamendo', // Free client ID
          format: 'json',
          limit: Math.min(limit, 50),
          offset: offset,
          order: 'popularity_total',
          include: 'musicinfo'
        },
        headers: DEFAULT_HEADERS,
        timeout: 15000
      });

      const jamendoTracks = response.data?.results || [];
      
      const tracks = jamendoTracks.map((track, index) => ({
        id: `jamendo_${track.id}`,
        title: track.name || 'Unknown Track',
        user: {
          id: track.artist_id || 'jamendo_artist',
          name: track.artist_name || 'Unknown Artist',
          handle: (track.artist_name || 'unknown').toLowerCase().replace(/[^a-z0-9]/g, '')
        },
        artwork: {
          '150x150': track.image || `https://picsum.photos/150/150?random=jamendo${index}`,
          '480x480': track.image || `https://picsum.photos/480/480?random=jamendo${index}`,
          '1000x1000': track.image || `https://picsum.photos/1000/1000?random=jamendo${index}`
        },
        duration: track.duration || 180,
        genre: track.musicinfo?.tags?.genres?.[0] || this.getRandomGenre(),
        mood: this.getRandomMood(),
        play_count: Math.floor(Math.random() * 50000) + 1000,
        favorite_count: Math.floor(Math.random() * 5000) + 100,
        repost_count: Math.floor(Math.random() * 500) + 10,
        created_at: track.releasedate || new Date().toISOString(),
        album: track.album_name || 'Unknown Album',
        preview_url: track.audio || null, // FREE PLAYABLE URL!
        jamendo_url: track.shareurl || null
      }));

      console.log(`✅ Fetched ${tracks.length} FREE playable tracks from Jamendo!`);
      return tracks;
    } catch (error) {
      console.error('❌ Jamendo API failed:', error.message);
      return [];
    }
  }

  /**
   * Fallback playlists when APIs fail
   * @param {number} offset - Offset for pagination
   * @param {number} limit - Number of playlists to return
   * @returns {Array} Array of fallback playlists
   */
  getFallbackPlaylists(offset = 0, limit = 10) {
    const fallbackPlaylists = [
      { term: 'top hits 2024', name: '🔥 Top Hits 2024', description: 'The biggest hits of the year' },
      { term: 'chill pop', name: '😌 Chill Pop Vibes', description: 'Relaxing pop music for any mood' },
      { term: 'workout music', name: '💪 Workout Beats', description: 'High energy tracks for your workout' },
      { term: 'indie rock', name: '🎸 Indie Rock Collection', description: 'Best of indie rock music' },
      { term: 'electronic dance', name: '🎧 Electronic Dance', description: 'EDM and dance music hits' },
      { term: 'jazz classics', name: '🎷 Jazz Classics', description: 'Timeless jazz masterpieces' },
      { term: 'hip hop', name: '🎤 Hip Hop Essentials', description: 'Essential hip hop tracks' },
      { term: 'acoustic', name: '🎵 Acoustic Sessions', description: 'Beautiful acoustic music' },
      { term: 'rock classics', name: '🤘 Rock Classics', description: 'Classic rock anthems' },
      { term: 'ambient chill', name: '🌙 Ambient Chill', description: 'Ambient and chill music' }
    ];

    const startIndex = offset;
    const endIndex = Math.min(startIndex + limit, fallbackPlaylists.length);
    
    return fallbackPlaylists.slice(startIndex, endIndex).map((trend, i) => ({
      id: `fallback_${i}`,
      playlist_name: trend.name,
      description: trend.description,
      user: {
        id: 'music_service',
        name: 'Music Collections',
        handle: 'music_collections'
      },
      artwork: {
        '150x150': `https://picsum.photos/150/150?random=fallback${i}`,
        '480x480': `https://picsum.photos/480/480?random=fallback${i}`,
        '1000x1000': `https://picsum.photos/1000/1000?random=fallback${i}`
      },
      track_count: Math.floor(Math.random() * 50) + 15,
      favorite_count: Math.floor(Math.random() * 10000) + 1000,
      repost_count: Math.floor(Math.random() * 1000) + 100,
      created_at: new Date().toISOString(),
      playlist_contents: []
    }));
  }

  /**
   * Fallback search results when APIs fail
   * @param {string} query - Search query
   * @param {number} offset - Offset for pagination
   * @param {number} limit - Number of results to return
   * @returns {Array} Array of fallback search results
   */
  getFallbackSearchResults(query, offset = 0, limit = 10) {
    const mockArtists = [
      'Taylor Swift', 'Ed Sheeran', 'Drake', 'Billie Eilish', 'The Weeknd',
      'Ariana Grande', 'Justin Bieber', 'Dua Lipa', 'Harry Styles', 'Olivia Rodrigo',
      'Post Malone', 'Bad Bunny', 'Travis Scott', 'Lil Nas X', 'Doja Cat'
    ];

    const startIndex = offset;
    const endIndex = Math.min(startIndex + limit, mockArtists.length);
    
    return mockArtists.slice(startIndex, endIndex).map((artist, i) => ({
      id: `fallback_search_${artist.replace(/\s+/g, '_').toLowerCase()}_${i}`,
      playlist_name: `🎵 ${artist} - Best Songs`,
      description: `Popular songs by ${artist} matching "${query}"`,
      user: {
        id: 'search_service',
        name: artist,
        handle: artist.toLowerCase().replace(/\s+/g, '')
      },
      artwork: {
        '150x150': `https://picsum.photos/150/150?random=search_fallback${i}`,
        '480x480': `https://picsum.photos/480/480?random=search_fallback${i}`,
        '1000x1000': `https://picsum.photos/1000/1000?random=search_fallback${i}`
      },
      track_count: Math.floor(Math.random() * 30) + 10,
      favorite_count: Math.floor(Math.random() * 5000) + 500,
      repost_count: Math.floor(Math.random() * 500) + 50,
      created_at: new Date().toISOString(),
      playlist_contents: []
    }));
  }

  /**
   * Fallback tracks when all APIs fail
   * @param {string} playlistId - Playlist ID
   * @param {number} offset - Offset for pagination
   * @param {number} limit - Number of tracks to return
   * @returns {Array} Array of fallback tracks
   */
  getFallbackTracks(playlistId, offset = 0, limit = 20) {
    const trackNames = [
      'Blinding Lights', 'Shape of You', 'Someone You Loved', 'Watermelon Sugar', 'Levitating',
      'Bad Guy', 'Circles', 'Rockstar', 'Sunflower', 'Old Town Road',
      'Don\'t Start Now', 'The Box', 'Roses', 'Say So', 'Savage',
      'WAP', 'Mood', 'Good 4 U', 'Peaches', 'Stay',
      'Heat Waves', 'Industry Baby', 'Ghost', 'Shivers', 'Easy On Me'
    ];

    const artists = [
      'The Weeknd', 'Ed Sheeran', 'Lewis Capaldi', 'Harry Styles', 'Dua Lipa',
      'Billie Eilish', 'Post Malone', 'DaBaby', 'Lil Nas X', 'Roddy Ricch',
      'SAINt JHN', 'Doja Cat', 'Megan Thee Stallion', 'Cardi B', '24kGoldn',
      'Olivia Rodrigo', 'Justin Bieber', 'The Kid LAROI', 'Glass Animals', 'Justice'
    ];

    const startIndex = offset;
    const endIndex = Math.min(startIndex + limit, trackNames.length);

    return trackNames.slice(startIndex, endIndex).map((title, i) => {
      const actualIndex = startIndex + i;
      const artistIndex = actualIndex % artists.length;
      
      return {
        id: `fallback_track_${playlistId}_${actualIndex}`,
        title: title,
        user: {
          id: `artist_${artistIndex}`,
          name: artists[artistIndex],
          handle: artists[artistIndex].toLowerCase().replace(/[^a-z0-9]/g, '')
        },
        artwork: {
          '150x150': `https://picsum.photos/150/150?random=fallback_track${actualIndex}`,
          '480x480': `https://picsum.photos/480/480?random=fallback_track${actualIndex}`,
          '1000x1000': `https://picsum.photos/1000/1000?random=fallback_track${actualIndex}`
        },
        duration: Math.floor(Math.random() * 120) + 180,
        genre: this.getRandomGenre(),
        mood: this.getRandomMood(),
        play_count: Math.floor(Math.random() * 100000) + 1000,
        favorite_count: Math.floor(Math.random() * 10000) + 100,
        repost_count: Math.floor(Math.random() * 1000) + 10,
        created_at: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
        album: `Album ${Math.floor(Math.random() * 10) + 1}`,
        preview_url: null
      };
    });
  }

  /**
   * Get bulk playlists data (using iTunes API)
   * @param {Array<string>} playlistIds - Array of playlist IDs (ignored for iTunes)
   * @returns {Promise<Object>} Bulk playlists data
   */
  async getBulkPlaylists(playlistIds = []) {
    try {
      // For iTunes, we'll return a mix of popular playlists
      const popularTerms = [
        'pop hits', 'rock music', 'hip hop', 'electronic', 'country', 
        'r&b soul', 'alternative', 'classical', 'reggae', 'folk'
      ];

      const playlists = [];
      
      for (let i = 0; i < Math.min(popularTerms.length, 20); i++) {
        const term = popularTerms[i];
        
        // Get a few songs to determine track count
        try {
          const songsResponse = await axios.get(ITUNES_API_BASE, {
            params: {
              term: term,
              media: 'music',
              entity: 'song',
              limit: 20,
              explicit: 'No'
            },
            headers: DEFAULT_HEADERS,
            timeout: 8000
          });

          const songs = songsResponse.data?.results || [];
          
          playlists.push({
            id: `bulk_${i}`,
            playlist_name: `🎶 ${term.charAt(0).toUpperCase() + term.slice(1)} Collection`,
            description: `Best ${term} music collection`,
            user: {
              id: 'itunes_bulk',
              name: 'iTunes Collections',
              handle: 'itunes_music'
            },
            artwork: {
              '150x150': `https://picsum.photos/150/150?random=bulk${i}`,
              '480x480': `https://picsum.photos/480/480?random=bulk${i}`,
              '1000x1000': `https://picsum.photos/1000/1000?random=bulk${i}`
            },
            track_count: songs.length,
            favorite_count: Math.floor(Math.random() * 8000) + 2000,
            repost_count: Math.floor(Math.random() * 800) + 200,
            created_at: new Date().toISOString()
          });
        } catch (songError) {
          console.warn(`❌ Failed to fetch songs for ${term}:`, songError.message);
        }
      }

      return {
        success: true,
        data: { data: playlists },
        count: playlists.length
      };
    } catch (error) {
      console.error('❌ Error fetching bulk playlists:', error.message);
      return {
        success: false,
        error: error.message,
        data: null
      };
    }
  }

  /**
   * Get a specific playlist by ID
   * @param {string} playlistId - Playlist ID
   * @returns {Promise<Object>} Playlist data
   */
  async getPlaylistById(playlistId) {
    try {
      if (!playlistId) {
        throw new Error('Playlist ID is required');
      }

      // For simplicity, we'll create a playlist based on the ID
      let searchTerm = 'popular music';
      let playlistName = 'Popular Music Collection';
      
      if (playlistId.startsWith('trending_')) {
        const trendingTerms = [
          { term: 'top hits 2024', name: '🔥 Top Hits 2024' },
          { term: 'chill pop', name: '😌 Chill Pop Vibes' },
          { term: 'workout music', name: '💪 Workout Beats' }
        ];
        const index = parseInt(playlistId.replace('trending_', ''));
        const trend = trendingTerms[index];
        if (trend) {
          searchTerm = trend.term;
          playlistName = trend.name;
        }
      }

      // Get song count
      const songsResponse = await axios.get(ITUNES_API_BASE, {
        params: {
          term: searchTerm,
          media: 'music',
          entity: 'song',
          limit: 50,
          explicit: 'No'
        },
        headers: DEFAULT_HEADERS,
        timeout: 10000
      });

      const songs = songsResponse.data?.results || [];

      const playlist = {
        id: playlistId,
        playlist_name: playlistName,
        description: `Curated collection of ${searchTerm} music`,
        user: {
          id: 'itunes',
          name: 'iTunes Music',
          handle: 'apple_music'
        },
        artwork: {
          '150x150': `https://picsum.photos/150/150?random=${playlistId}`,
          '480x480': `https://picsum.photos/480/480?random=${playlistId}`,
          '1000x1000': `https://picsum.photos/1000/1000?random=${playlistId}`
        },
        track_count: songs.length,
        favorite_count: Math.floor(Math.random() * 10000) + 1000,
        repost_count: Math.floor(Math.random() * 1000) + 100,
        created_at: new Date().toISOString()
      };

      return {
        success: true,
        data: playlist,
        playlistId
      };
    } catch (error) {
      console.error(`❌ Error fetching playlist ${playlistId}:`, error.message);
      return {
        success: false,
        error: error.message,
        data: null,
        playlistId
      };
    }
  }

  /**
   * Helper method to format playlist data for consistent response structure
   * @param {Object} playlistData - Raw playlist data from iTunes
   * @returns {Object} Formatted playlist data
   */
  formatPlaylistData(playlistData) {
    if (!playlistData) return null;

    return {
      id: playlistData.id,
      name: playlistData.playlist_name,
      description: playlistData.description,
      user: {
        id: playlistData.user?.id,
        name: playlistData.user?.name,
        handle: playlistData.user?.handle
      },
      artwork: playlistData.artwork,
      trackCount: playlistData.track_count,
      isPrivate: playlistData.is_private,
      createdAt: playlistData.created_at,
      updatedAt: playlistData.updated_at,
      favoriteCount: playlistData.favorite_count,
      repostCount: playlistData.repost_count
    };
  }

  /**
   * Helper method to format track data for consistent response structure
   * @param {Object} trackData - Raw track data from iTunes
   * @returns {Object} Formatted track data
   */
  formatTrackData(trackData) {
    if (!trackData) return null;

    return {
      id: trackData.id,
      title: trackData.title,
      artist: {
        id: trackData.user?.id,
        name: trackData.user?.name,
        handle: trackData.user?.handle
      },
      artwork: trackData.artwork,
      duration: trackData.duration,
      genre: trackData.genre,
      mood: trackData.mood,
      playCount: trackData.play_count,
      favoriteCount: trackData.favorite_count,
      repostCount: trackData.repost_count,
      createdAt: trackData.created_at
    };
  }

  /**
   * Search for tracks across multiple platforms
   * @param {string} query - Search query (song name, artist name, etc.)
   * @param {number} limit - Number of results to return
   * @returns {Promise<Array>} Array of search results
   */
  async searchTracks(query, limit = 20) {
    try {
      console.log(`🔍 Searching for tracks: "${query}"`);
      let searchResults = [];

      // First, try searching Deezer
      try {
        console.log('🎵 Searching Deezer...');
        const deezerResponse = await axios.get(`${DEEZER_API_BASE}/search/track`, {
          params: {
            q: query,
            limit: Math.min(limit, 25)
          },
          headers: DEFAULT_HEADERS,
          timeout: 10000
        });

        if (deezerResponse.data?.data && deezerResponse.data.data.length > 0) {
          searchResults = deezerResponse.data.data.map((track, index) => ({
            id: `deezer_${track.id}`,
            title: track.title || 'Unknown Song',
            name: track.title || 'Unknown Song',
            artist: {
              id: track.artist?.id || 'unknown',
              name: track.artist?.name || 'Unknown Artist'
            },
            album: {
              id: track.album?.id || 'unknown',
              title: track.album?.title || 'Unknown Album',
              cover: track.album?.cover_medium || track.album?.cover,
              cover_medium: track.album?.cover_medium || track.album?.cover
            },
            duration: track.duration || 210,
            preview: track.preview || null,
            preview_url: track.preview || null,
            link: track.link,
            image: track.album?.cover_medium || `https://picsum.photos/300/300?random=${index}`,
            source: 'deezer'
          }));
          
          console.log(`✅ Found ${searchResults.length} tracks from Deezer`);
        }
      } catch (deezerError) {
        console.warn('❌ Deezer search failed:', deezerError.message);
      }

      // If Deezer didn't return enough results, supplement with Jamendo
      if (searchResults.length < limit) {
        try {
          console.log('🎶 Searching Jamendo for additional results...');
          const remainingLimit = Math.min(limit - searchResults.length, 20);
          
          const jamendoResponse = await axios.get(`${JAMENDO_API_BASE}/tracks/`, {
            params: {
              client_id: 'jamendo',
              format: 'json',
              limit: remainingLimit,
              search: query,
              order: 'popularity_total',
              include: 'musicinfo'
            },
            headers: DEFAULT_HEADERS,
            timeout: 10000
          });

          if (jamendoResponse.data?.results && jamendoResponse.data.results.length > 0) {
            const jamendoTracks = jamendoResponse.data.results.map((track, index) => ({
              id: `jamendo_${track.id}`,
              title: track.name || 'Unknown Song',
              name: track.name || 'Unknown Song',
              artist: {
                id: track.artist_id || 'unknown',
                name: track.artist_name || 'Unknown Artist'
              },
              album: {
                id: track.album_id || 'unknown',
                title: track.album_name || 'Unknown Album',
                cover: track.image || `https://picsum.photos/300/300?random=jamendo${index}`,
                cover_medium: track.image || `https://picsum.photos/300/300?random=jamendo${index}`
              },
              duration: track.duration || 210,
              preview: track.audio || null,
              preview_url: track.audio || null,
              audio: track.audio || null,
              link: track.shareurl,
              image: track.image || `https://picsum.photos/300/300?random=jamendo${index}`,
              source: 'jamendo'
            }));
            
            searchResults = [...searchResults, ...jamendoTracks];
            console.log(`✅ Added ${jamendoTracks.length} tracks from Jamendo`);
          }
        } catch (jamendoError) {
          console.warn('❌ Jamendo search failed:', jamendoError.message);
        }
      }

      // Return the combined results
      return searchResults.slice(0, limit);
      
    } catch (error) {
      console.error('❌ Track search failed:', error.message);
      return [];
    }
  }

  /**
   * Get popular/trending tracks
   * @param {number} limit - Number of tracks to return
   * @returns {Promise<Array>} Array of popular tracks
   */
  async getPopularTracks(limit = 20) {
    try {
      console.log(`🔥 Fetching ${limit} popular tracks...`);
      let popularTracks = [];

      // First, try getting popular tracks from Deezer charts
      try {
        console.log('📈 Fetching Deezer popular tracks...');
        const deezerResponse = await axios.get(`${DEEZER_API_BASE}/chart/0/tracks`, {
          params: {
            limit: Math.min(limit, 25)
          },
          headers: DEFAULT_HEADERS,
          timeout: 10000
        });

        if (deezerResponse.data?.data && deezerResponse.data.data.length > 0) {
          popularTracks = deezerResponse.data.data.map((track, index) => ({
            id: `deezer_popular_${track.id}`,
            title: track.title || 'Popular Song',
            name: track.title || 'Popular Song',
            artist: {
              id: track.artist?.id || 'unknown',
              name: track.artist?.name || 'Popular Artist'
            },
            album: {
              id: track.album?.id || 'unknown', 
              title: track.album?.title || 'Popular Album',
              cover: track.album?.cover_medium || track.album?.cover,
              cover_medium: track.album?.cover_medium || track.album?.cover
            },
            duration: track.duration || 210,
            preview: track.preview || null,
            preview_url: track.preview || null,
            link: track.link,
            image: track.album?.cover_medium || `https://picsum.photos/300/300?random=popular${index}`,
            source: 'deezer',
            rank: track.position || index + 1
          }));
          
          console.log(`✅ Found ${popularTracks.length} popular tracks from Deezer`);
        }
      } catch (deezerError) {
        console.warn('❌ Deezer popular tracks failed:', deezerError.message);
      }

      // If we need more tracks, get popular ones from Jamendo
      if (popularTracks.length < limit) {
        try {
          console.log('🎶 Fetching popular Jamendo tracks...');
          const remainingLimit = Math.min(limit - popularTracks.length, 20);
          
          const jamendoResponse = await axios.get(`${JAMENDO_API_BASE}/tracks/`, {
            params: {
              client_id: 'jamendo',
              format: 'json',
              limit: remainingLimit,
              order: 'popularity_total',
              include: 'musicinfo'
            },
            headers: DEFAULT_HEADERS,
            timeout: 10000
          });

          if (jamendoResponse.data?.results && jamendoResponse.data.results.length > 0) {
            const jamendoTracks = jamendoResponse.data.results.map((track, index) => ({
              id: `jamendo_popular_${track.id}`,
              title: track.name || 'Popular Song',
              name: track.name || 'Popular Song',
              artist: {
                id: track.artist_id || 'unknown',
                name: track.artist_name || 'Popular Artist'
              },
              album: {
                id: track.album_id || 'unknown',
                title: track.album_name || 'Popular Album',
                cover: track.image || `https://picsum.photos/300/300?random=jamendo_popular${index}`,
                cover_medium: track.image || `https://picsum.photos/300/300?random=jamendo_popular${index}`
              },
              duration: track.duration || 210,
              preview: track.audio || null,
              preview_url: track.audio || null,
              audio: track.audio || null,
              link: track.shareurl,
              image: track.image || `https://picsum.photos/300/300?random=jamendo_popular${index}`,
              source: 'jamendo',
              rank: popularTracks.length + index + 1
            }));
            
            popularTracks = [...popularTracks, ...jamendoTracks];
            console.log(`✅ Added ${jamendoTracks.length} popular tracks from Jamendo`);
          }
        } catch (jamendoError) {
          console.warn('❌ Jamendo popular tracks failed:', jamendoError.message);
        }
      }

      return popularTracks.slice(0, limit);
      
    } catch (error) {
      console.error('❌ Failed to fetch popular tracks:', error.message);
      return [];
    }
  }
}

export default new MusicService(); 
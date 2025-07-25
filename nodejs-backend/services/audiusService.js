import axios from 'axios';

// iTunes Search API Base URL - FREE and RELIABLE!
const ITUNES_API_BASE = 'https://itunes.apple.com/search';

// Default headers for all API requests
const DEFAULT_HEADERS = {
  'Accept': 'application/json'
};

/**
 * iTunes Music API Service
 * Handles all interactions with iTunes Search API - FREE and RELIABLE!
 */
class MusicService {
  
  /**
   * Get trending playlists (simulated with popular music collections)
   * @param {string} time - Time period (ignored for iTunes)
   * @param {number} offset - Offset for pagination
   * @param {number} limit - Number of playlists to return
   * @returns {Promise<Object>} Trending playlists data
   */
  async getTrendingPlaylists(time = 'week', offset = 0, limit = 10) {
    try {
      // Create trending playlists from popular genres/moods
      const trendingTerms = [
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

      const playlists = [];
      const startIndex = offset;
      const endIndex = Math.min(startIndex + limit, trendingTerms.length);
      
      for (let i = startIndex; i < endIndex; i++) {
        const trend = trendingTerms[i];
        if (!trend) continue;

        // Get a few songs for track count
        const songsResponse = await axios.get(ITUNES_API_BASE, {
          params: {
            term: trend.term,
            media: 'music',
            entity: 'song',
            limit: 25,
            explicit: 'No'
          },
          headers: DEFAULT_HEADERS,
          timeout: 10000
        });

        const songs = songsResponse.data?.results || [];
        const trackCount = songs.length;
        
        playlists.push({
          id: `trending_${i}`,
          playlist_name: trend.name,
          description: trend.description,
          user: {
            id: 'itunes',
            name: 'iTunes Music',
            handle: 'apple_music'
          },
          artwork: {
            '150x150': `https://picsum.photos/150/150?random=${i}`,
            '480x480': `https://picsum.photos/480/480?random=${i}`,
            '1000x1000': `https://picsum.photos/1000/1000?random=${i}`
          },
          track_count: trackCount,
          favorite_count: Math.floor(Math.random() * 10000) + 1000,
          repost_count: Math.floor(Math.random() * 1000) + 100,
          created_at: new Date().toISOString(),
          playlist_contents: songs.slice(0, 5).map(song => ({ track_id: song.trackId }))
        });
      }

      return {
        success: true,
        data: { data: playlists },
        count: playlists.length
      };
    } catch (error) {
      console.error('❌ Error fetching trending playlists:', error.message);
      return {
        success: false,
        error: error.message,
        data: null
      };
    }
  }

  /**
   * Search playlists using iTunes API
   * @param {string} query - Search query
   * @param {number} offset - Offset for pagination
   * @param {number} limit - Number of playlists to return
   * @returns {Promise<Object>} Search results
   */
  async searchPlaylists(query, offset = 0, limit = 10) {
    try {
      // Search for songs matching the query
      const response = await axios.get(ITUNES_API_BASE, {
        params: {
          term: query,
          media: 'music',
          entity: 'song',
          limit: 50,
          explicit: 'No'
        },
        headers: DEFAULT_HEADERS,
        timeout: 10000
      });

      const songs = response.data?.results || [];
      
      if (songs.length === 0) {
        return {
          success: true,
          data: { data: [] },
          count: 0
        };
      }

      // Group songs by artist to create "playlists"
      const artistGroups = {};
      songs.forEach(song => {
        const artistName = song.artistName;
        if (!artistGroups[artistName]) {
          artistGroups[artistName] = [];
        }
        artistGroups[artistName].push(song);
      });

      // Convert artist groups to playlist format
      const playlists = [];
      const artistNames = Object.keys(artistGroups);
      const startIndex = offset;
      const endIndex = Math.min(startIndex + limit, artistNames.length);

      for (let i = startIndex; i < endIndex; i++) {
        const artistName = artistNames[i];
        const artistSongs = artistGroups[artistName];
        const firstSong = artistSongs[0];

        playlists.push({
          id: `search_${artistName.replace(/\s+/g, '_').toLowerCase()}_${i}`,
          playlist_name: `🎵 ${artistName} - Best Songs`,
          description: `Popular songs by ${artistName} matching "${query}"`,
          user: {
            id: 'itunes_search',
            name: artistName,
            handle: artistName.toLowerCase().replace(/\s+/g, '')
          },
          artwork: {
            '150x150': firstSong.artworkUrl60 || `https://picsum.photos/150/150?random=${i}`,
            '480x480': firstSong.artworkUrl100 || `https://picsum.photos/480/480?random=${i}`,
            '1000x1000': firstSong.artworkUrl100 || `https://picsum.photos/1000/1000?random=${i}`
          },
          track_count: artistSongs.length,
          favorite_count: Math.floor(Math.random() * 5000) + 500,
          repost_count: Math.floor(Math.random() * 500) + 50,
          created_at: new Date().toISOString(),
          playlist_contents: artistSongs.slice(0, 10).map(song => ({ track_id: song.trackId }))
        });
      }

      return {
        success: true,
        data: { data: playlists },
        count: playlists.length
      };
    } catch (error) {
      console.error('❌ Error searching playlists:', error.message);
      return {
        success: false,
        error: error.message,
        data: null
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

      let searchTerm = '';
      
      // Extract search term from playlist ID
      if (playlistId.startsWith('trending_')) {
        const trendingTerms = [
          'top hits 2024', 'chill pop', 'workout music', 'indie rock', 
          'electronic dance', 'jazz classics', 'hip hop', 'acoustic', 
          'rock classics', 'ambient chill'
        ];
        const index = parseInt(playlistId.replace('trending_', ''));
        searchTerm = trendingTerms[index] || 'popular';
      } else if (playlistId.startsWith('search_')) {
        // Extract artist name from search playlist ID
        const parts = playlistId.split('_');
        searchTerm = parts.slice(1, -1).join(' ').replace(/_/g, ' ');
      } else {
        searchTerm = 'popular music';
      }

      // Search for songs using the extracted term
      const response = await axios.get(ITUNES_API_BASE, {
        params: {
          term: searchTerm,
          media: 'music',
          entity: 'song',
          limit: Math.min(limit + offset, 200),
          explicit: 'No'
        },
        headers: DEFAULT_HEADERS,
        timeout: 10000
      });

      const allSongs = response.data?.results || [];
      const songs = allSongs.slice(offset, offset + limit);

      // Convert iTunes songs to our track format
      const tracks = songs.map((song, index) => ({
        id: song.trackId?.toString() || `track_${index}`,
        title: song.trackName || 'Unknown Track',
        user: {
          id: song.artistId?.toString() || 'unknown',
          name: song.artistName || 'Unknown Artist',
          handle: (song.artistName || 'unknown').toLowerCase().replace(/\s+/g, '')
        },
        artwork: {
          '150x150': song.artworkUrl60 || `https://picsum.photos/150/150?random=${index}`,
          '480x480': song.artworkUrl100 || `https://picsum.photos/480/480?random=${index}`,
          '1000x1000': song.artworkUrl100 || `https://picsum.photos/1000/1000?random=${index}`
        },
        duration: Math.floor((song.trackTimeMillis || 180000) / 1000),
        genre: song.primaryGenreName || 'Music',
        mood: this.getRandomMood(),
        play_count: Math.floor(Math.random() * 100000) + 1000,
        favorite_count: Math.floor(Math.random() * 10000) + 100,
        repost_count: Math.floor(Math.random() * 1000) + 10,
        created_at: song.releaseDate || new Date().toISOString(),
        album: song.collectionName || 'Unknown Album',
        preview_url: song.previewUrl || null
      }));

      return {
        success: true,
        data: { data: tracks },
        count: tracks.length,
        playlistId
      };
    } catch (error) {
      console.error(`❌ Error fetching tracks for playlist ${playlistId}:`, error.message);
      return {
        success: false,
        error: error.message,
        data: null,
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

      const response = await axios.get(`${AUDIUS_API_BASE}/playlists`, {
        params: {
          id: playlistId
        },
        headers: DEFAULT_HEADERS,
        timeout: 30000
      });

      const playlist = response.data?.data?.[0] || null;

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
   * @param {Object} playlistData - Raw playlist data from Audius
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
   * @param {Object} trackData - Raw track data from Audius
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
}

export default new MusicService(); 
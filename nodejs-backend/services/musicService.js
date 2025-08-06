const axios = require('axios');

const LASTFM_API_BASE = 'https://ws.audioscrobbler.com/2.0/';
const LASTFM_API_KEY = 'YOUR_API_KEY';
const DEEZER_API_BASE = 'https://api.deezer.com';
const JAMENDO_API_BASE = 'https://api.jamendo.com/v3.0';
const SPOTIFY_API_BASE = 'https://api.spotify.com/v1';

const defaultHeaders = {
  'User-Agent': 'SonicArchitect/1.0',
  'Accept': 'application/json',
  'Content-Type': 'application/json'
};

const musicPreviews = [
  'https://www.soundjay.com/misc/sounds/bell-ringing-05.wav',
  'https://www.soundjay.com/misc/sounds/fail-buzzer-02.wav',
  'https://www.soundjay.com/misc/sounds/phone-ring-1.wav',
  'https://www.soundjay.com/misc/sounds/phone-ring-2.wav',
  'https://www.soundjay.com/misc/sounds/phone-ring-3.wav'
];

async function getTrendingPlaylists(limit = 20) {
  try {
    const response = await fetch(`${DEEZER_API_BASE}/chart/0/playlists?limit=${limit}`);
    const data = await response.json();
    
    if (!data.data) {
      throw new Error('No data received from Deezer API');
    }
    
    const playlists = data.data.map((playlist, index) => ({
      id: playlist.id,
      name: playlist.title,
      description: playlist.description || `A curated playlist by ${playlist.user.name}`,
      user: {
        id: playlist.user.id,
        name: playlist.user.name,
        handle: playlist.user.name.toLowerCase().replace(/\s+/g, '_')
      },
      artwork: {
        '150x150': playlist.picture_medium || playlist.picture || `https://picsum.photos/150/150?random=${index}`,
        '480x480': playlist.picture_big || playlist.picture_xl || `https://picsum.photos/480/480?random=${index}`,
        '1000x1000': playlist.picture_xl || playlist.picture_big || `https://picsum.photos/1000/1000?random=${index}`
      },
      trackCount: playlist.nb_tracks || 0,
      favoriteCount: playlist.fans || Math.floor(Math.random() * 10000) + 1000,
      repostCount: Math.floor(Math.random() * 1000) + 100,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      genre: 'Pop',
      mood: 'Energetic',
      source: 'Deezer'
    }));
    
    return playlists;
  } catch (error) {
    console.error('Error fetching trending playlists:', error);
    
    const fallbackPlaylists = [
      {
        id: 'fallback1',
        name: 'Top Hits 2024',
        description: 'The hottest tracks of the year',
        user: { id: 'deezer', name: 'Deezer', handle: 'deezer' },
        artwork: { '480x480': 'https://picsum.photos/480/480?random=1' },
        trackCount: 50,
        favoriteCount: 15000,
        repostCount: 2500,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        genre: 'Pop',
        mood: 'Energetic',
        source: 'Fallback'
      },
      {
        id: 'fallback2',
        name: 'Chill Vibes',
        description: 'Relaxing music for your day',
        user: { id: 'deezer', name: 'Deezer', handle: 'deezer' },
        artwork: { '480x480': 'https://picsum.photos/480/480?random=2' },
        trackCount: 30,
        favoriteCount: 8000,
        repostCount: 1200,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        genre: 'Ambient',
        mood: 'Chill',
        source: 'Fallback'
      }
    ];
    
    return fallbackPlaylists;
  }
}

async function searchPlaylists(query, limit = 20) {
  try {
    // Try Deezer API first
    const response = await fetch(`${DEEZER_API_BASE}/search/playlist?q=${encodeURIComponent(query)}&limit=${limit}`);
    const data = await response.json();
    
    if (data.data && data.data.length > 0) {
      const playlists = data.data.map((playlist, index) => ({
        id: playlist.id,
        name: playlist.title,
        description: playlist.description || `A curated playlist by ${playlist.user.name}`,
        user: {
          id: playlist.user.id,
          name: playlist.user.name,
          handle: playlist.user.name.toLowerCase().replace(/\s+/g, '_')
        },
        artwork: {
          '150x150': playlist.picture_medium || playlist.picture || `https://picsum.photos/150/150?random=${query}${index}`,
          '480x480': playlist.picture_big || playlist.picture_xl || `https://picsum.photos/480/480?random=${query}${index}`,
          '1000x1000': playlist.picture_xl || playlist.picture_big || `https://picsum.photos/1000/1000?random=${query}${index}`
        },
        trackCount: playlist.nb_tracks || 0,
        favoriteCount: playlist.fans || Math.floor(Math.random() * 10000) + 1000,
        repostCount: Math.floor(Math.random() * 1000) + 100,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        genre: 'Mixed',
        mood: 'Mixed',
        source: 'Deezer'
      }));
      
      return playlists;
    }
    
    // If no results from Deezer, return fallback playlists based on search query
    const fallbackPlaylists = [];
    const searchLower = query.toLowerCase();
    
    // Create different playlists based on search terms
    if (searchLower.includes('chill') || searchLower.includes('relax')) {
      fallbackPlaylists.push({
        id: `chill_${Date.now()}`,
        name: 'Chill Vibes',
        description: 'Relaxing music for your day',
        user: { id: 'curator', name: 'Chill Curator', handle: 'chill_curator' },
        artwork: { '480x480': `https://picsum.photos/480/480?random=chill${Date.now()}` },
        trackCount: 25,
        favoriteCount: 8000,
        repostCount: 1200,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        genre: 'Ambient',
        mood: 'Chill',
        source: 'Fallback'
      });
    }
    
    if (searchLower.includes('rock') || searchLower.includes('guitar')) {
      fallbackPlaylists.push({
        id: `rock_${Date.now()}`,
        name: 'Rock Classics',
        description: 'The best rock music of all time',
        user: { id: 'curator', name: 'Rock Curator', handle: 'rock_curator' },
        artwork: { '480x480': `https://picsum.photos/480/480?random=rock${Date.now()}` },
        trackCount: 30,
        favoriteCount: 12000,
        repostCount: 2000,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        genre: 'Rock',
        mood: 'Energetic',
        source: 'Fallback'
      });
    }
    
    if (searchLower.includes('jazz') || searchLower.includes('smooth')) {
      fallbackPlaylists.push({
        id: `jazz_${Date.now()}`,
        name: 'Smooth Jazz',
        description: 'Relaxing jazz melodies',
        user: { id: 'curator', name: 'Jazz Curator', handle: 'jazz_curator' },
        artwork: { '480x480': `https://picsum.photos/480/480?random=jazz${Date.now()}` },
        trackCount: 20,
        favoriteCount: 6000,
        repostCount: 800,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        genre: 'Jazz',
        mood: 'Smooth',
        source: 'Fallback'
      });
    }
    
    if (searchLower.includes('workout') || searchLower.includes('gym')) {
      fallbackPlaylists.push({
        id: `workout_${Date.now()}`,
        name: 'Workout Energy',
        description: 'High energy music for your workout',
        user: { id: 'curator', name: 'Fitness Curator', handle: 'fitness_curator' },
        artwork: { '480x480': `https://picsum.photos/480/480?random=workout${Date.now()}` },
        trackCount: 35,
        favoriteCount: 15000,
        repostCount: 3000,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        genre: 'Pop',
        mood: 'Energetic',
        source: 'Fallback'
      });
    }
    
    // If no specific matches, return generic search results
    if (fallbackPlaylists.length === 0) {
      fallbackPlaylists.push({
        id: `search_${Date.now()}`,
        name: `Search Results for "${query}"`,
        description: `Playlists matching "${query}"`,
        user: { id: 'curator', name: 'Search Curator', handle: 'search_curator' },
        artwork: { '480x480': `https://picsum.photos/480/480?random=search${Date.now()}` },
        trackCount: Math.floor(Math.random() * 20) + 10,
        favoriteCount: Math.floor(Math.random() * 5000) + 1000,
        repostCount: Math.floor(Math.random() * 500) + 100,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        genre: 'Mixed',
        mood: 'Mixed',
        source: 'Search'
      });
    }
    
    return fallbackPlaylists;
  } catch (error) {
    console.error('Error searching playlists:', error);
    return [];
  }
}

async function getPlaylistTracks(playlistId, limit = 50, offset = 0) {
  try {
    const playlistIdNum = playlistId.replace('deezer_', '');
    const response = await fetch(`${DEEZER_API_BASE}/playlist/${playlistIdNum}/tracks?limit=${limit}&index=${offset}`);
    const data = await response.json();
    
    if (!data.data) {
      throw new Error('No tracks found');
    }
    
    const tracks = data.data.map((track, index) => ({
      id: track.id,
      title: track.title,
      artist: {
        id: track.artist.id,
        name: track.artist.name,
        handle: track.artist.name.toLowerCase().replace(/\s+/g, '_')
      },
      artwork: {
        '150x150': track.album?.cover_medium || track.album?.cover || `https://picsum.photos/150/150?random=track${index}`,
        '480x480': track.album?.cover_big || track.album?.cover_xl || `https://picsum.photos/480/480?random=track${index}`,
        '1000x1000': track.album?.cover_xl || track.album?.cover_big || `https://picsum.photos/1000/1000?random=track${index}`
      },
      duration: track.duration,
      genre: 'Pop',
      mood: 'Energetic',
      play_count: Math.floor(Math.random() * 10000) + 1000,
      favorite_count: Math.floor(Math.random() * 1000) + 100,
      repost_count: Math.floor(Math.random() * 100) + 10,
      created_at: new Date().toISOString(),
      album: track.album?.title || 'Unknown Album',
      preview_url: track.preview || null,
      deezer_url: track.link
    }));
    
    return tracks;
  } catch (error) {
    console.error('Error fetching playlist tracks:', error);
    
    const fallbackTracks = Array.from({ length: 10 }, (_, i) => ({
      id: `fallback_track_${i + 1}`,
      title: `Fallback Track ${i + 1}`,
      artist: {
        id: `artist_${i + 1}`,
        name: `Artist ${i + 1}`,
        handle: `artist_${i + 1}`
      },
      artwork: {
        '150x150': `https://picsum.photos/150/150?random=fallback_track${i + 1}`,
        '480x480': `https://picsum.photos/480/480?random=fallback_track${i + 1}`,
        '1000x1000': `https://picsum.photos/1000/1000?random=fallback_track${i + 1}`
      },
      duration: Math.floor(Math.random() * 300) + 120,
      genre: 'Pop',
      mood: 'Energetic',
      play_count: Math.floor(Math.random() * 10000) + 1000,
      favorite_count: Math.floor(Math.random() * 1000) + 100,
      repost_count: Math.floor(Math.random() * 100) + 10,
      created_at: new Date().toISOString(),
      album: 'Fallback Album',
      preview_url: musicPreviews[i % musicPreviews.length],
      deezer_url: null,
      full_song_url: null
    }));
    
    return fallbackTracks;
  }
}

async function searchIndianMusic(query = 'bollywood', limit = 20) {
  try {
    const response = await fetch(`${DEEZER_API_BASE}/search?q=${encodeURIComponent(query)}&limit=${limit}`);
    const data = await response.json();
    
    if (!data.data) {
      throw new Error('No Indian music found');
    }
    
    const tracks = data.data.map((track, index) => ({
      id: track.id,
      title: track.title,
      artist: {
        id: track.artist.id,
        name: track.artist.name,
        handle: track.artist.name.toLowerCase().replace(/\s+/g, '_')
      },
      artwork: {
        '150x150': track.album?.cover_medium || track.album?.cover || `https://picsum.photos/150/150?random=indian${index}`,
        '480x480': track.album?.cover_big || track.album?.cover_xl || `https://picsum.photos/480/480?random=indian${index}`,
        '1000x1000': track.album?.cover_xl || track.album?.cover_big || `https://picsum.photos/1000/1000?random=indian${index}`
      },
      duration: track.duration,
      genre: 'Indian',
      mood: 'Energetic',
      play_count: Math.floor(Math.random() * 10000) + 1000,
      favorite_count: Math.floor(Math.random() * 1000) + 100,
      repost_count: Math.floor(Math.random() * 100) + 10,
      created_at: new Date().toISOString(),
      album: track.album?.title || 'Unknown Album',
      preview_url: track.preview || null,
      deezer_url: track.link
    }));
    
    return tracks;
  } catch (error) {
    console.error('Error searching Indian music:', error);
    return [];
  }
}

async function getJamendoTracks(limit = 20) {
  try {
    const response = await fetch(`${JAMENDO_API_BASE}/tracks/?client_id=2d4e6f8a&format=json&limit=${limit}&groupby=artist_id`);
    const data = await response.json();
    
    if (!data.results) {
      throw new Error('No Jamendo tracks found');
    }
    
    const tracks = data.results.map((track, index) => ({
      id: track.id,
      title: track.name,
      artist: {
        id: track.artist_id,
        name: track.artist_name,
        handle: track.artist_name.toLowerCase().replace(/\s+/g, '_')
      },
      artwork: {
        '150x150': track.image || `https://picsum.photos/150/150?random=jamendo${index}`,
        '480x480': track.image || `https://picsum.photos/480/480?random=jamendo${index}`,
        '1000x1000': track.image || `https://picsum.photos/1000/1000?random=jamendo${index}`
      },
      duration: track.duration,
      genre: track.tags?.[0] || 'Electronic',
      mood: 'Energetic',
      play_count: Math.floor(Math.random() * 10000) + 1000,
      favorite_count: Math.floor(Math.random() * 1000) + 100,
      repost_count: Math.floor(Math.random() * 100) + 10,
      created_at: new Date().toISOString(),
      album: track.album_name || 'Unknown Album',
      preview_url: track.audio || null,
      deezer_url: null,
      full_song_url: track.audio
    }));
    
    return tracks;
  } catch (error) {
    console.error('Error fetching Jamendo tracks:', error);
    
    const fallbackTracks = Array.from({ length: 10 }, (_, i) => ({
      id: `jamendo_fallback_${i + 1}`,
      title: `Jamendo Track ${i + 1}`,
      artist: {
        id: `jamendo_artist_${i + 1}`,
        name: `Jamendo Artist ${i + 1}`,
        handle: `jamendo_artist_${i + 1}`
      },
      artwork: {
        '150x150': `https://picsum.photos/150/150?random=jamendo_fallback${i}`,
        '480x480': `https://picsum.photos/480/480?random=jamendo_fallback${i}`,
        '1000x1000': `https://picsum.photos/1000/1000?random=jamendo_fallback${i}`
      },
      duration: Math.floor(Math.random() * 300) + 120,
      genre: 'Electronic',
      mood: 'Energetic',
      play_count: Math.floor(Math.random() * 10000) + 1000,
      favorite_count: Math.floor(Math.random() * 1000) + 100,
      repost_count: Math.floor(Math.random() * 100) + 10,
      created_at: new Date().toISOString(),
      album: 'Jamendo Album',
      preview_url: musicPreviews[i % musicPreviews.length],
      deezer_url: null,
      full_song_url: null
    }));
    
    return fallbackTracks;
  }
}

async function searchSongs(query, limit = 20) {
  try {
    const response = await fetch(`${DEEZER_API_BASE}/search?q=${encodeURIComponent(query)}&limit=${limit}`);
    if (!response.ok) {
      console.error(`Deezer API error: ${response.status} ${response.statusText}`);
      return [];
    }
    const data = await response.json();

    if (!data.data || !Array.isArray(data.data)) {
      console.warn('⚠️ No songs found in Deezer search response.');
      return [];
    }

    const songs = data.data
      .map((track) => {
        // Robust data validation to prevent crashes
        if (!track || !track.id || !track.title || !track.artist || !track.artist.name || !track.album || !track.album.cover_medium) {
          console.warn('Skipping malformed search track from Deezer:', track);
          return null;
        }
        return {
          id: track.id,
          title: track.title,
          artist: {
            id: track.artist.id,
            name: track.artist.name,
            handle: track.artist.name.toLowerCase().replace(/\s+/g, '_')
          },
          artwork: {
            '150x150': track.album.cover_medium,
            '480x480': track.album.cover_big,
            '1000x1000': track.album.cover_xl
          },
          duration: track.duration,
          preview_url: track.preview || null,
          deezer_url: track.link,
          album: track.album.title || 'Unknown Album',
        };
      })
      .filter(Boolean); // Filter out any null entries

    return songs;
  } catch (error) {
    console.error('❌ Error searching songs:', error);
    return []; // Always return an array
  }
}

async function getPopularTracks(limit = 20) {
  try {
    const response = await fetch(`${DEEZER_API_BASE}/chart/0/tracks?limit=${limit}`);
    if (!response.ok) {
      console.error(`Deezer API error: ${response.status} ${response.statusText}`);
      return [];
    }
    const data = await response.json();

    if (!data.data || !Array.isArray(data.data)) {
      console.warn('⚠️ No popular tracks data found in Deezer response.');
      return [];
    }

    const tracks = data.data
      .map((track) => {
        // Robust data validation to prevent crashes. Skip any track with incomplete data.
        if (!track || !track.id || !track.title || !track.artist || !track.artist.name || !track.album || !track.album.cover_medium) {
          console.warn('Skipping malformed track from Deezer:', track);
          return null;
        }
        return {
          id: track.id,
          title: track.title,
          artist: {
            id: track.artist.id,
            name: track.artist.name,
            handle: track.artist.name.toLowerCase().replace(/\s+/g, '_')
          },
          artwork: {
            '150x150': track.album.cover_medium,
            '480x480': track.album.cover_big,
            '1000x1000': track.album.cover_xl
          },
          duration: track.duration,
          preview_url: track.preview || null,
          deezer_url: track.link,
          album: track.album.title || 'Unknown Album',
        };
      })
      .filter(Boolean); // Filter out any null entries from bad data

    return tracks;
  } catch (error) {
    console.error('❌ Error fetching popular tracks:', error);
    return []; // Always return an array to prevent further errors
  }
}

module.exports = {
  getTrendingPlaylists,
  searchPlaylists,
  getPlaylistTracks,
  searchIndianMusic,
  getJamendoTracks,
  searchSongs,
  getPopularTracks
}; 
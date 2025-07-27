const axios = require('axios');

const ITUNES_API_BASE = 'https://itunes.apple.com';

const defaultHeaders = {
  'User-Agent': 'SonicArchitect/1.0',
  'Accept': 'application/json',
  'Content-Type': 'application/json'
};

async function getTrendingPlaylists() {
  try {
    const genres = ['pop', 'rock', 'hip-hop', 'electronic', 'jazz', 'classical'];
    const playlists = [];
    
    for (let i = 0; i < 10; i++) {
      const genre = genres[i % genres.length];
      const response = await axios.get(`${ITUNES_API_BASE}/search`, {
        params: {
          term: genre,
          entity: 'song',
          limit: 5
        },
        headers: defaultHeaders
      });
      
      const songs = response.data.results || [];
      
      playlists.push({
        id: `itunes_${genre}_${i}`,
        name: `${genre.charAt(0).toUpperCase() + genre.slice(1)} Hits`,
        description: `Top ${genre} songs from iTunes`,
        user: { id: 'itunes', name: 'iTunes', handle: 'itunes' },
        artwork: { '480x480': `https://picsum.photos/480/480?random=${i}` },
        trackCount: songs.length,
        favoriteCount: Math.floor(Math.random() * 10000) + 1000,
        repostCount: Math.floor(Math.random() * 1000) + 100,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        genre: genre.charAt(0).toUpperCase() + genre.slice(1),
        mood: 'Energetic',
        source: 'iTunes'
      });
    }
    
    return playlists;
  } catch (error) {
    console.error('Error fetching iTunes playlists:', error);
    return [];
  }
}

async function searchPlaylists(query, offset = 0, limit = 10) {
  try {
    const response = await axios.get(`${ITUNES_API_BASE}/search`, {
      params: {
        term: query,
        entity: 'song',
        limit: limit * 2
      },
      headers: defaultHeaders
    });
    
    const songs = response.data.results || [];
    
    const playlists = [];
    const artists = [...new Set(songs.map(song => song.artistName))];
    
    for (let i = 0; i < Math.min(artists.length, limit); i++) {
      const artistSongs = songs.filter(song => song.artistName === artists[i]);
      
      playlists.push({
        id: `itunes_artist_${artists[i].replace(/\s+/g, '_')}`,
        name: `${artists[i]} Collection`,
        description: `Songs by ${artists[i]}`,
        user: { id: 'itunes', name: 'iTunes', handle: 'itunes' },
        artwork: { '480x480': `https://picsum.photos/480/480?random=search${i}` },
        trackCount: artistSongs.length,
        favoriteCount: Math.floor(Math.random() * 10000) + 1000,
        repostCount: Math.floor(Math.random() * 1000) + 100,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        genre: 'Mixed',
        mood: 'Mixed',
        source: 'iTunes'
      });
    }
    
    return playlists;
  } catch (error) {
    console.error('Error searching iTunes playlists:', error);
    return [];
  }
}

async function getPlaylistById(playlistId) {
  try {
    const searchTerm = playlistId.replace('itunes_', '').replace(/_/g, ' ');
    const response = await axios.get(`${ITUNES_API_BASE}/search`, {
      params: {
        term: searchTerm,
        entity: 'song',
        limit: 20
      },
      headers: defaultHeaders
    });
    
    const songs = response.data.results || [];
    
    if (songs.length === 0) {
      throw new Error('Playlist not found');
    }
    
    const artistName = songs[0].artistName;
    const artistSongs = songs.filter(song => song.artistName === artistName);
    
    return {
      id: playlistId,
      name: `${artistName} Collection`,
      description: `Songs by ${artistName}`,
      user: { id: 'itunes', name: 'iTunes', handle: 'itunes' },
      artwork: { '480x480': `https://picsum.photos/480/480?random=${playlistId}` },
      trackCount: artistSongs.length,
      favoriteCount: Math.floor(Math.random() * 10000) + 1000,
      repostCount: Math.floor(Math.random() * 1000) + 100,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      genre: 'Mixed',
      mood: 'Mixed',
      source: 'iTunes'
    };
  } catch (error) {
    console.error('Error fetching iTunes playlist:', error);
    throw error;
  }
}

async function getPlaylistTracks(playlistId, offset = 0, limit = 50) {
  try {
    const searchTerm = playlistId.replace('itunes_', '').replace(/_/g, ' ');
    const response = await axios.get(`${ITUNES_API_BASE}/search`, {
      params: {
        term: searchTerm,
        entity: 'song',
        limit: limit
      },
      headers: defaultHeaders
    });
    
    const songs = response.data.results || [];
    
    const tracks = songs.map((song, index) => ({
      id: song.trackId,
      title: song.trackName,
      artist: {
        id: song.artistId,
        name: song.artistName,
        handle: song.artistName.toLowerCase().replace(/\s+/g, '_')
      },
      artwork: {
        '150x150': song.artworkUrl60 || `https://picsum.photos/150/150?random=itunes${index}`,
        '480x480': song.artworkUrl100 || `https://picsum.photos/480/480?random=itunes${index}`,
        '1000x1000': song.artworkUrl100 || `https://picsum.photos/1000/1000?random=itunes${index}`
      },
      duration: Math.floor(song.trackTimeMillis / 1000),
      genre: song.primaryGenreName || 'Pop',
      mood: 'Energetic',
      play_count: Math.floor(Math.random() * 10000) + 1000,
      favorite_count: Math.floor(Math.random() * 1000) + 100,
      repost_count: Math.floor(Math.random() * 100) + 10,
      created_at: new Date().toISOString(),
      album: song.collectionName || 'Unknown Album',
      preview_url: song.previewUrl || null,
      deezer_url: null,
      full_song_url: song.trackViewUrl
    }));
    
    return tracks;
  } catch (error) {
    console.error('Error fetching iTunes playlist tracks:', error);
    return [];
  }
}

async function getBulkPlaylists(playlistIds = []) {
  try {
    const playlists = [];
    
    for (const playlistId of playlistIds) {
      try {
        const playlist = await getPlaylistById(playlistId);
        playlists.push(playlist);
      } catch (error) {
        console.error(`Error fetching playlist ${playlistId}:`, error);
      }
    }
    
    return playlists;
  } catch (error) {
    console.error('Error fetching bulk playlists:', error);
    return [];
  }
}

module.exports = {
  getTrendingPlaylists,
  searchPlaylists,
  getPlaylistById,
  getPlaylistTracks,
  getBulkPlaylists
}; 
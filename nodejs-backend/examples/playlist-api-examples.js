/**
 * Playlist API Examples
 * This file demonstrates how to use all the playlist endpoints
 * Make sure your server is running on localhost:5000
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api/playlists';

// Example 1: Get trending playlists
async function getTrendingPlaylistsExample() {
  console.log('\n🎵 Getting trending playlists...');
  try {
    const response = await axios.get(`${BASE_URL}/trending`, {
      params: {
        time: 'week',  // 'week', 'month', 'year', 'allTime'
        limit: 10,
        offset: 0
      }
    });
    
    console.log('✅ Success:', response.data.message);
    console.log('📋 Playlists found:', response.data.data.playlists.length);
    
    // Show first playlist if available
    if (response.data.data.playlists.length > 0) {
      const playlist = response.data.data.playlists[0];
      console.log(`📀 First playlist: "${playlist.name}" by ${playlist.user.name}`);
    }
    
    return response.data;
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

// Example 2: Search playlists
async function searchPlaylistsExample() {
  console.log('\n🔍 Searching playlists...');
  try {
    const response = await axios.get(`${BASE_URL}/search`, {
      params: {
        query: 'chill',  // Search for chill playlists
        limit: 5,
        offset: 0
      }
    });
    
    console.log('✅ Success:', response.data.message);
    console.log('📋 Playlists found:', response.data.data.playlists.length);
    
    // Show all found playlists
    response.data.data.playlists.forEach((playlist, index) => {
      console.log(`📀 ${index + 1}. "${playlist.name}" by ${playlist.user.name} (${playlist.trackCount} tracks)`);
    });
    
    return response.data;
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

// Example 3: Get specific playlist by ID
async function getPlaylistByIdExample(playlistId) {
  console.log(`\n📋 Getting playlist ID: ${playlistId}...`);
  try {
    const response = await axios.get(`${BASE_URL}/${playlistId}`);
    
    console.log('✅ Success:', response.data.message);
    const playlist = response.data.data.playlist;
    console.log(`📀 Playlist: "${playlist.name}"`);
    console.log(`👤 Creator: ${playlist.user.name} (@${playlist.user.handle})`);
    console.log(`🎵 Tracks: ${playlist.trackCount}`);
    console.log(`❤️ Favorites: ${playlist.favoriteCount}`);
    
    return response.data;
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

// Example 4: Get tracks from a playlist
async function getPlaylistTracksExample(playlistId) {
  console.log(`\n🎵 Getting tracks from playlist ID: ${playlistId}...`);
  try {
    const response = await axios.get(`${BASE_URL}/${playlistId}/tracks`, {
      params: {
        limit: 10,
        offset: 0
      }
    });
    
    console.log('✅ Success:', response.data.message);
    console.log('🎵 Tracks found:', response.data.data.tracks.length);
    
    // Show first few tracks
    response.data.data.tracks.slice(0, 3).forEach((track, index) => {
      console.log(`🎶 ${index + 1}. "${track.title}" by ${track.artist.name}`);
      console.log(`   Genre: ${track.genre} | Duration: ${Math.floor(track.duration / 60)}:${String(track.duration % 60).padStart(2, '0')}`);
    });
    
    return response.data;
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

// Example 5: Get bulk playlists
async function getBulkPlaylistsExample() {
  console.log('\n📋 Getting bulk playlists...');
  try {
    const response = await axios.get(`${BASE_URL}/`, {
      params: {
        limit: 5,
        offset: 0
      }
    });
    
    console.log('✅ Success:', response.data.message);
    console.log('📋 Playlists found:', response.data.data.playlists.length);
    
    response.data.data.playlists.forEach((playlist, index) => {
      console.log(`📀 ${index + 1}. "${playlist.name}" by ${playlist.user.name} (${playlist.trackCount} tracks)`);
    });
    
    return response.data;
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

// Example 6: Health check
async function healthCheckExample() {
  console.log('\n🏥 Checking playlist service health...');
  try {
    const response = await axios.get(`${BASE_URL}/health/check`);
    
    console.log('✅ Status:', response.data.status);
    console.log('📝 Available endpoints:');
    response.data.endpoints.forEach(endpoint => {
      console.log(`   - ${endpoint}`);
    });
    
    return response.data;
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

// Run all examples
async function runAllExamples() {
  console.log('🎵 Sonic Architect Playlist API Examples');
  console.log('==========================================');
  
  // 1. Health check first
  await healthCheckExample();
  
  // 2. Get trending playlists
  const trendingPlaylists = await getTrendingPlaylistsExample();
  
  // 3. Search playlists
  await searchPlaylistsExample();
  
  // 4. Get bulk playlists
  const bulkPlaylists = await getBulkPlaylistsExample();
  
  // 5. If we have a playlist from trending, get its details and tracks
  if (trendingPlaylists?.data?.playlists?.length > 0) {
    const firstPlaylist = trendingPlaylists.data.playlists[0];
    await getPlaylistByIdExample(firstPlaylist.id);
    await getPlaylistTracksExample(firstPlaylist.id);
  } else if (bulkPlaylists?.data?.playlists?.length > 0) {
    const firstPlaylist = bulkPlaylists.data.playlists[0];
    await getPlaylistByIdExample(firstPlaylist.id);
    await getPlaylistTracksExample(firstPlaylist.id);
  }
  
  console.log('\n✨ All examples completed!');
}

// Export functions for use in other files
module.exports = {
  getTrendingPlaylistsExample,
  searchPlaylistsExample,
  getPlaylistByIdExample,
  getPlaylistTracksExample,
  getBulkPlaylistsExample,
  healthCheckExample,
  runAllExamples
};

// Run examples if this file is executed directly
if (require.main === module) {
  runAllExamples();
} 
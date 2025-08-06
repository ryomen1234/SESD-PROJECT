import React, { useState, useEffect, useRef } from "react";
import { Search, Music } from "lucide-react";
import Layout from "../components/Layout";
import SongCard from "../components/SongCard";
import SongCardSkeleton from "../components/SongCardSkeleton"; // Import the skeleton component
import { Input } from "../components/ui/input";
import { useParams } from "react-router-dom";
import { savePlaylist } from "../services/playlistService";
import PlaylistSelectionModal from "../components/PlaylistSelectionModal";
import { PlaylistTrack } from "../services/playlistService";

interface Song {
  id: string;
  name: string;
  artists: string;
  album: string;
  // This will be a placeholder, as our backend doesn't provide album art yet
  albumArt: string;
  album_art_url: string;
  artist: string;
}

const RecommendBySong: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Song[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [recommendedSongs, setRecommendedSongs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0); // Add refresh key for forcing re-renders
  const [isClearingQuery, setIsClearingQuery] = useState(false); // Flag to prevent search when clearing query
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null); // Add timeout for debouncing
  const currentQueryRef = useRef<string>('');
  
  // Audio playback state
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
  const [currentPlayingTrackId, setCurrentPlayingTrackId] = useState<string | null>(null);
  
  // Playlist selection modal state
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  const [songsToSave, setSongsToSave] = useState<PlaylistTrack[]>([]);

  useEffect(() => {
    const fetchRecommendations = async () => {
      // Only fetch recommendations if we have a selected song
      if (!selectedSong) {
        setIsLoading(false);
        return;
      }
      setIsLoading(true); // Set loading to true before fetching
      try {
        console.log('🎵 Fetching recommendations for song:', selectedSong.id);
        
        // Use our Node.js backend for recommendations
        const response = await fetch(
          `http://localhost:5000/api/recommendations/song/${selectedSong.id}?limit=20`
        );
        const data = await response.json();
        
        console.log('📦 Recommendations response:', data);
        
        if (data.status === 'success' && data.data.recommendations) {
          const songsWithArt = data.data.recommendations.map((rec: any, index: number) => ({
            id: rec.id || `rec_${index}`,
            name: rec.title || rec.name || 'Unknown Song',
            title: rec.title || rec.name || 'Unknown Song',
            artist: rec.artist?.name || rec.artist || 'Unknown Artist',
            artists: rec.artist?.name || rec.artist || 'Unknown Artist',
            album: rec.album?.title || rec.album || 'Unknown Album',
            albumArt: rec.image || rec.albumArt || rec.album?.cover_medium || `https://picsum.photos/200/200?random=${selectedSong.id}-${index}`,
            duration: rec.duration || 0,
            preview_url: rec.preview_url || rec.preview || null,
            deezer_id: rec.deezer_id || null,
            deezer_url: rec.deezer_url || rec.link || null,
            source: rec.source || 'unknown'
          }));
          
          console.log('✅ Mapped recommendations:', songsWithArt);
          setRecommendedSongs(songsWithArt);
        } else {
          console.error("Recommendations API returned error:", data);
          setRecommendedSongs([]);
        }

      } catch (error) {
        console.error("Error fetching recommendations:", error);
        setRecommendedSongs([]);
      } finally {
        setIsLoading(false); // Set loading to false after fetching
      }
    };
    fetchRecommendations();
  }, [selectedSong]); // Only depend on selectedSong, not id

  const handleSearch = async (query: string) => {
    // Always update the search query and ref
    setSearchQuery(query);
    currentQueryRef.current = query;
    
    // Don't search if we're clearing the query programmatically
    if (isClearingQuery) {
      setIsClearingQuery(false);
      return;
    }
    
    console.log('🔍 Searching for:', query);
    
    // Clear any existing timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    
    if (query.length > 1) { // Changed from 2 to 1 for better search
      // Set a new timeout to debounce the search
      const timeout = setTimeout(async () => {
        // Double-check that this is still the current query
        if (query !== currentQueryRef.current) {
          console.log('🔄 Query changed, skipping this search');
          return;
        }
        
        console.log('🚀 Executing search for:', query);
        
        try {
          // Search directly from the backend API
          console.log('🌐 Making API request to:', `http://localhost:5000/api/songs?search=${encodeURIComponent(query)}&limit=1000`);
          const response = await fetch(`http://localhost:5000/api/songs?search=${encodeURIComponent(query)}&limit=1000`);
          console.log('📡 Response status:', response.status);
          const data = await response.json();
          console.log('📦 Response data:', data);
          
          // Double-check that this is still the current query
          if (query !== currentQueryRef.current) {
            console.log('🔄 Query changed during API call, ignoring results');
            return;
          }
          
          if (data.status === 'success' && data.data.songs) {
            // Map the API response to our Song interface
            const mappedSongs = data.data.songs.map((song: any, index: number) => ({
              id: song.id || `search_${index}`,
              name: song.name || song.title || 'Unknown Song',
              artist: song.artist || 'Unknown Artist',
              artists: song.artist || 'Unknown Artist',
              album: song.album || 'Unknown Album',
              albumArt: song.albumArt || song.album_art_url || `https://picsum.photos/200/200?random=${index}`,
              album_art_url: song.albumArt || song.album_art_url || `https://picsum.photos/200/200?random=${index}`,
              preview_url: song.preview_url || null,
              duration: song.duration || 0
            }));
            
            // Final check before setting results
            if (query === currentQueryRef.current) {
              setSearchResults(mappedSongs);
              setShowResults(true);
              console.log(`✅ Found ${mappedSongs.length} search results for "${query}"`);
            } else {
              console.log('🔄 Query changed after mapping, ignoring results');
            }
          } else {
            console.error("Search API returned error:", data);
            if (query === currentQueryRef.current) {
              setSearchResults([]);
              setShowResults(true);
            }
          }
        } catch (error) {
          console.error('❌ Search failed:', error);
          // Show comprehensive fallback songs on error
          const fallbackSongs = [
            {
              id: 'fallback_1',
              name: 'Blinding Lights',
              artist: 'The Weeknd',
              artists: 'The Weeknd',
              album: 'After Hours',
              albumArt: 'https://picsum.photos/300/300?random=1',
              album_art_url: 'https://picsum.photos/300/300?random=1'
            },
            {
              id: 'fallback_2',
              name: 'Shape of You',
              artist: 'Ed Sheeran',
              artists: 'Ed Sheeran',
              album: 'Divide',
              albumArt: 'https://picsum.photos/300/300?random=2',
              album_art_url: 'https://picsum.photos/300/300?random=2'
            },
            {
              id: 'fallback_3',
              name: 'Bad Guy',
              artist: 'Billie Eilish',
              artists: 'Billie Eilish',
              album: 'When We All Fall Asleep, Where Do We Go?',
              albumArt: 'https://picsum.photos/300/300?random=3',
              album_art_url: 'https://picsum.photos/300/300?random=3'
            },
            {
              id: 'fallback_4',
              name: 'Levitating',
              artist: 'Dua Lipa',
              artists: 'Dua Lipa',
              album: 'Future Nostalgia',
              albumArt: 'https://picsum.photos/300/300?random=4',
              album_art_url: 'https://picsum.photos/300/300?random=4'
            },
            {
              id: 'fallback_5',
              name: 'Watermelon Sugar',
              artist: 'Harry Styles',
              artists: 'Harry Styles',
              album: 'Fine Line',
              albumArt: 'https://picsum.photos/300/300?random=5',
              album_art_url: 'https://picsum.photos/300/300?random=5'
            }
          ];
          if (query === currentQueryRef.current) {
            setSearchResults(fallbackSongs);
            setShowResults(true);
            console.log('🔄 Using fallback results after error:', fallbackSongs.length, 'songs');
          }
        }
      }, 500); // Increased to 500ms for better debouncing
      
      setSearchTimeout(timeout);
    } else {
      setShowResults(false);
      console.log('📝 Query too short, hiding results');
    }
  };

  const handleSongSelect = async (song: Song) => {
    setSelectedSong(song);
    setShowResults(false);
    // Don't clear search query immediately to prevent triggering search again
    setIsLoading(true);
    
    // Clear previous recommendations to avoid showing same songs
    setRecommendedSongs([]);
    
    // Add a small delay to ensure state is cleared
    await new Promise(resolve => setTimeout(resolve, 100));

    // Fetch recommendations for the selected song using our Node.js backend
    try {
      const response = await fetch(`http://localhost:5000/api/recommendations/song/${song.id}`);
      const data = await response.json();
      if (data.status === 'success' && data.data.recommendations) {
        const songsWithArt = data.data.recommendations.map((rec: any, index: number) => ({
          id: rec.id || `rec_${Date.now()}_${index}`, // Add timestamp to ensure unique IDs
          name: rec.title || rec.name || 'Recommended Song',
          artist: rec.artist?.name || rec.artist || 'Unknown Artist',
          artists: rec.artist?.name || rec.artist || 'Unknown Artist',
          album: rec.album?.title || rec.album || 'Unknown Album',
          albumArt: rec.image || rec.albumArt || rec.album?.cover_medium || `https://picsum.photos/200/200?random=${song.id}-${index}`,
          album_art_url: rec.image || rec.albumArt || rec.album?.cover_medium || `https://picsum.photos/200/200?random=${song.id}-${index}`,
          preview_url: rec.preview || rec.preview_url || rec.previewUrl || null,
          duration: rec.duration || 0
        }));
        setRecommendedSongs(songsWithArt);
        console.log(`✅ Loaded ${songsWithArt.length} recommendations for "${song.name}"`);
        setRefreshKey(prev => prev + 1); // Increment refresh key to force re-render
      } else {
        console.error("Recommendations API returned error:", data);
        setRecommendedSongs([]);
      }
    } catch (error) {
      console.error("Failed to fetch recommendations:", error);
      setRecommendedSongs([]);
    } finally {
      setIsLoading(false);
      // Clear search query after everything is done
      setIsClearingQuery(true);
      setSearchQuery("");
    }
  };

  // Function to handle choosing a different song
  const handleChooseDifferentSong = () => {
    setSelectedSong(null);
    setRecommendedSongs([]);
    setSearchQuery("");
    setShowResults(false);
    setRefreshKey(0);
  };

  // Function to handle song playback
  const handlePlaySong = (song: any) => {
    if (currentPlayingTrackId === song.id) {
      if (currentAudio) {
        currentAudio.pause();
        setCurrentAudio(null);
        setCurrentPlayingTrackId(null);
      }
      return;
    }

    if (currentAudio) {
      currentAudio.pause();
    }

    const audioUrl = song.preview_url || song.preview;
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audio.addEventListener('ended', () => {
        setCurrentAudio(null);
        setCurrentPlayingTrackId(null);
      });

      audio.play().then(() => {
        setCurrentAudio(audio);
        setCurrentPlayingTrackId(song.id);
      }).catch((error) => {
        console.error('❌ Failed to play song:', error);
        openFullSong(song);
      });
    } else {
      openFullSong(song);
    }
  };

  const openFullSong = (song: any) => {
    if (song.deezer_url) {
      window.open(song.deezer_url, '_blank');
    } else {
      alert("Full song URL is not available.");
    }
  };

  const handleSaveToPlaylist = async (song: any) => {
    try {
      console.log('💾 Opening playlist selection for song:', song);
      
      // Convert song to PlaylistTrack format
      const songData: PlaylistTrack = {
        id: song.id || `song_${Date.now()}`,
        title: song.title || song.name || 'Unknown Title',
        artist: song.artist?.name || song.artist || 'Unknown Artist',
        artwork: song.image || song.albumArt || song.album?.cover_medium || {},
        duration: song.duration || 0,
        preview_url: song.preview_url || song.preview || null,
        deezer_url: song.deezer_url || song.link || null
      };
      
      setSongsToSave([songData]);
      setShowPlaylistModal(true);
      
    } catch (error) {
      console.error('❌ Failed to prepare song for playlist:', error);
      alert('Failed to prepare song for playlist. Please try again.');
    }
  };

  const handleSaveAllRecommendations = async () => {
    try {
      console.log('💾 Opening playlist selection for all recommendations');
      
      if (recommendedSongs.length === 0) {
        alert('No recommendations to save!');
        return;
      }
      
      // Convert all songs to PlaylistTrack format
      const songsData: PlaylistTrack[] = recommendedSongs.map((song, index) => ({
        id: song.id || `song_${Date.now()}_${index}`,
        title: song.title || song.name || 'Unknown Title',
        artist: song.artist?.name || song.artist || 'Unknown Artist',
        artwork: song.image || song.albumArt || song.album?.cover_medium || {},
        duration: song.duration || 0,
        preview_url: song.preview_url || song.preview || null,
        deezer_url: song.deezer_url || song.link || null
      }));
      
      setSongsToSave(songsData);
      setShowPlaylistModal(true);
      
    } catch (error) {
      console.error('❌ Failed to prepare recommendations for playlist:', error);
      alert('Failed to prepare recommendations for playlist. Please try again.');
    }
  };

  const handlePlaylistSaveSuccess = () => {
    // Refresh recommendations or show success message
    console.log('✅ Songs saved to playlist successfully');
  };

  return (
    <Layout>
      <div className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-center mb-4 text-gray-900">
            From a Single <span className="text-blue-600">Spark</span>
          </h1>
          <p className="text-xl text-gray-600 text-center mb-12">
            Discover music that resonates with your favorite tracks
          </p>

          {!selectedSong ? (
            /* Search Section */
            <div className="relative">
              <div className="relative mb-6">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  placeholder="Search for a song or artist..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-12 py-6 text-lg bg-white border-gray-300 text-gray-900 placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              {/* Search Results Dropdown */}
              {showResults && (
                <div className="absolute w-full bg-white rounded-lg border border-gray-200 shadow-lg z-10 max-h-96 overflow-y-auto">
                  {searchResults.length > 0 ? (
                    <>
                      <div className="p-3 bg-gray-50 border-b border-gray-200 text-sm text-gray-600">
                        Found {searchResults.length} results for "{searchQuery}"
                      </div>
                      {searchResults.map((song) => (
                      <button
                        key={song.id}
                        onClick={() => handleSongSelect(song)}
                          className="w-full p-4 flex items-center space-x-3 hover:bg-gray-50 transition-colors text-left"
                      >
                        <img
                          src={song.albumArt}
                          alt={song.name}
                          className="w-12 h-12 rounded object-cover"
                            onError={(e) => {
                              e.currentTarget.src = `https://picsum.photos/48/48?random=${song.id}`;
                            }}
                        />
                        <div>
                            <div className="font-medium text-gray-900">{song.name}</div>
                            <div className="text-sm text-gray-600">{song.artists}</div>
                        </div>
                      </button>
                      ))}
                    </>
                  ) : (
                    <div className="p-4 text-center text-gray-500">
                      No songs found for "{searchQuery}". Try searching for a different song or artist name.
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            /* Selected Song and Recommendations */
            <div className="animate-fade-in">
              {/* Selected Song Display */}
              <div className="bg-white rounded-2xl p-8 mb-12 text-center border border-gray-200 shadow-lg">
                <div className="flex flex-col md:flex-row items-center justify-center space-y-6 md:space-y-0 md:space-x-8">
                  <div className="relative">
                    <img
                      src={selectedSong.albumArt}
                      alt={selectedSong.name}
                      className="w-32 h-32 rounded-lg object-cover sonic-glow"
                    />
                    <div className="absolute -top-2 -right-2 bg-blue-600 rounded-full p-2">
                      <Music className="h-4 w-4 text-white" />
                    </div>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      {selectedSong.name}
                    </h2>
                    <p className="text-lg text-gray-600 mb-4">
                      by {selectedSong.artists}
                    </p>
                    <button
                      onClick={handleChooseDifferentSong}
                      className="text-blue-600 hover:text-blue-700 transition-colors"
                    >
                      Choose a different song
                    </button>
                  </div>
                </div>
              </div>

              {/* Recommended Songs Grid */}
              <div key={refreshKey}> {/* Add refresh key to force re-render */}
                <div className="flex justify-between items-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900">
                    Songs You'll <span className="text-blue-600">Love</span>
                  </h3>
                  {recommendedSongs.length > 0 && (
                    <button
                      onClick={handleSaveAllRecommendations}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center space-x-2"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      <span>Save All to Playlist</span>
                    </button>
                  )}
                </div>
                
                {isLoading ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {Array.from({ length: 12 }).map((_, index) => (
                      <SongCardSkeleton key={index} />
                    ))}
                  </div>
                ) : recommendedSongs.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {recommendedSongs.map((song, index) => (
                      <div
                        key={`${song.id}-${index}`}
                        className="animate-slide-up bg-white rounded-xl p-4 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100"
                        style={{ animationDelay: `${index * 0.1}s` }}
                      >
                        {/* Album Art */}
                        <div className="relative mb-4">
                          <img
                            src={song.image || song.albumArt || song.album?.cover_medium || `https://picsum.photos/300/300?random=${song.id}`}
                            alt={song.title || song.name}
                            className="w-full aspect-square rounded-lg object-cover"
                            onError={(e) => {
                              e.currentTarget.src = `https://picsum.photos/300/300?random=${song.id}`;
                            }}
                          />
                          
                          {/* Play Button Overlay */}
                          <button
                            onClick={() => handlePlaySong(song)}
                            className={`absolute top-2 right-2 p-2 rounded-full transition-all duration-200 ${
                              currentPlayingTrackId === song.id
                                ? 'bg-red-500 hover:bg-red-600 text-white'
                                : 'bg-blue-600 hover:bg-blue-700 text-white'
                            }`}
                          >
                            {currentPlayingTrackId === song.id ? (
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z"/>
                              </svg>
                            ) : (
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M8 5v14l11-7z"/>
                              </svg>
                            )}
                          </button>
                          
                          {/* Save Button */}
                          <button
                            onClick={() => handleSaveToPlaylist(song)}
                            className="absolute top-2 left-2 p-2 rounded-full bg-green-600 hover:bg-green-700 text-white transition-all duration-200"
                            title="Save to playlist"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                          </button>
                        </div>
                        
                        {/* Song Info */}
                        <div className="space-y-1">
                          <h4 className="font-semibold text-gray-900 text-sm line-clamp-2">
                            {song.title || song.name}
                          </h4>
                          <p className="text-gray-600 text-xs line-clamp-1">
                            {song.artist?.name || song.artist || song.artists}
                          </p>
                          {song.album?.title && (
                            <p className="text-gray-500 text-xs line-clamp-1">
                              {song.album.title}
                            </p>
                          )}
                        </div>
                        
                        {/* Duration */}
                        {song.duration && (
                          <div className="mt-2 text-xs text-gray-500">
                            {Math.floor(song.duration / 60)}:{(song.duration % 60).toString().padStart(2, '0')}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="text-gray-500 text-lg mb-4">
                      No recommendations found for this song.
                    </div>
                    <button
                      onClick={handleChooseDifferentSong}
                      className="text-blue-600 hover:text-blue-700 transition-colors"
                    >
                      Try a different song
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      <PlaylistSelectionModal
        isOpen={showPlaylistModal}
        onClose={() => setShowPlaylistModal(false)}
        songs={songsToSave}
        onSuccess={handlePlaylistSaveSuccess}
      />
    </Layout>
  );
};

export default RecommendBySong;
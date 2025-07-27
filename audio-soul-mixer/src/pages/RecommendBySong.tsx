import { useState, useEffect } from "react";
import { Search, Music } from "lucide-react";
import Layout from "../components/Layout";
import SongCard from "../components/SongCard";
import SongCardSkeleton from "../components/SongCardSkeleton"; // Import the skeleton component
import { Input } from "../components/ui/input";
import { useParams } from "react-router-dom";

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

const RecommendBySong = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSong, setSelectedSong] = useState<Song | null>(null);
  const [allSongs, setAllSongs] = useState<Song[]>([]);
  const [searchResults, setSearchResults] = useState<Song[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [recommendedSongs, setRecommendedSongs] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState(true); // Add loading state
  const { id } = useParams();

  useEffect(() => {
    // Fetch all songs from the backend when the component mounts
    const fetchSongs = async () => {
      try {
        // Use our Node.js backend instead of Python backend
        const response = await fetch("http://localhost:5000/api/songs?limit=1000");
        const data = await response.json();
        if (data.status === 'success' && data.data.songs) {
          // Add a placeholder albumArt to each song
          const songsWithArt = data.data.songs.map((song: any, index: number) => ({
            id: song.id || `song_${index}`,
            name: song.name || song.title || 'Unknown Song',
            artist: song.artist || 'Unknown Artist',
            artists: song.artist || 'Unknown Artist',
            album: song.album || 'Unknown Album',
            albumArt: song.albumArt || song.album_art_url || `https://picsum.photos/200/200?random=${index}`,
            album_art_url: song.albumArt || song.album_art_url || `https://picsum.photos/200/200?random=${index}`,
            preview_url: song.preview_url || null,
            duration: song.duration || 0
          }));
          setAllSongs(songsWithArt);
          console.log(`✅ Loaded ${songsWithArt.length} songs from API`);
        } else {
          console.error("API returned error:", data);
          setAllSongs([]);
        }
      } catch (error) {
        console.error("Failed to fetch songs:", error);
        setAllSongs([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSongs();
  }, []);

  useEffect(() => {
    const fetchRecommendations = async () => {
      if (!id) {
        setIsLoading(false);
        return;
      }
      setIsLoading(true); // Set loading to true before fetching
      try {
        // Use our Node.js backend for recommendations
        const response = await fetch(
          `http://localhost:5000/api/recommendations/song/${id}`
        );
        const data = await response.json();
        if (data.status === 'success' && data.data.recommendations) {
          const songsWithArt = data.data.recommendations.map((rec: any, index: number) => ({
            ...rec,
            artists: rec.artist, // Map artist to artists for compatibility
            albumArt: rec.albumArt || rec.album_art_url || `https://picsum.photos/200/200?random=${id}-${index}`
          }));
          setRecommendedSongs(songsWithArt);
        } else {
          console.error("Recommendations API returned error:", data);
        }
        const selected = allSongs.find(song => song.id === id);
        if(selected) setSelectedSong(selected);

      } catch (error) {
        console.error("Error fetching recommendations:", error);
      } finally {
        setIsLoading(false); // Set loading to false after fetching
      }
    };
    if(allSongs.length > 0) fetchRecommendations();
  }, [id, allSongs]);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    console.log('🔍 Searching for:', query);
    if (query.length > 1) { // Changed from 2 to 1 for better search
      try {
        // Search directly from the backend API
        console.log('🌐 Making API request to:', `http://localhost:5000/api/songs?search=${encodeURIComponent(query)}&limit=1000`);
        const response = await fetch(`http://localhost:5000/api/songs?search=${encodeURIComponent(query)}&limit=1000`);
        console.log('📡 Response status:', response.status);
        const data = await response.json();
        console.log('📦 Response data:', data);
        
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
          setSearchResults(mappedSongs);
          setShowResults(true);
          console.log(`✅ Found ${mappedSongs.length} search results for "${query}"`);
        } else {
          console.error("Search API returned error:", data);
          setSearchResults([]);
          setShowResults(true);
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
        setSearchResults(fallbackSongs);
        setShowResults(true);
        console.log('🔄 Using fallback results after error:', fallbackSongs.length, 'songs');
      }
    } else {
      setShowResults(false);
      console.log('📝 Query too short, hiding results');
    }
  };

  const handleSongSelect = async (song: Song) => {
    setSelectedSong(song);
    setShowResults(false);
    setSearchQuery("");
    setIsLoading(true);

    // Fetch recommendations for the selected song using our Node.js backend
    try {
      const response = await fetch(`http://localhost:5000/api/recommendations/song/${song.id}`);
      const data = await response.json();
      if (data.status === 'success' && data.data.recommendations) {
        const songsWithArt = data.data.recommendations.map((rec: any, index: number) => ({
          id: rec.id || `rec_${index}`,
          name: rec.title || rec.name || 'Recommended Song',
          artist: rec.artist?.name || rec.artist || 'Unknown Artist',
          artists: rec.artist?.name || rec.artist || 'Unknown Artist',
          album: rec.album?.title || rec.album || 'Unknown Album',
          albumArt: rec.album?.cover_medium || rec.image || rec.albumArt || `https://picsum.photos/200/200?random=${song.id}-${index}`,
          album_art_url: rec.album?.cover_medium || rec.image || rec.albumArt || `https://picsum.photos/200/200?random=${song.id}-${index}`,
          preview_url: rec.preview || rec.preview_url || null,
          duration: rec.duration || 0
        }));
        setRecommendedSongs(songsWithArt);
        console.log(`✅ Loaded ${songsWithArt.length} recommendations for "${song.name}"`);
      } else {
        console.error("Recommendations API returned error:", data);
        setRecommendedSongs([]);
      }
    } catch (error) {
      console.error("Failed to fetch recommendations:", error);
      setRecommendedSongs([]);
    } finally {
      setIsLoading(false);
    }
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
                <div className="absolute w-full bg-white rounded-lg border border-gray-200 shadow-lg z-10 max-h-60 overflow-y-auto">
                  {searchResults.length > 0 ? (
                    searchResults.map((song) => (
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
                    ))
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
                      onClick={() => setSelectedSong(null)}
                      className="text-blue-600 hover:text-blue-700 transition-colors"
                    >
                      Choose a different song
                    </button>
                  </div>
                </div>
              </div>

              {/* Recommended Songs Grid */}
              <div>
                <h3 className="text-2xl font-bold text-center mb-8 text-gray-900">
                  Songs You'll <span className="text-blue-600">Love</span>
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {isLoading
                    ? Array.from({ length: 12 }).map((_, index) => (
                        <SongCardSkeleton key={index} />
                      ))
                    : recommendedSongs.map((song, index) => (
                        <div
                          key={song.id}
                          className="animate-slide-up"
                          style={{ animationDelay: `${index * 0.1}s` }}
                        >
                          <SongCard
                            title={song.name}
                            artist={song.artists}
                            albumArt={song.albumArt}
                            onPlay={() => console.log(`Playing ${song.name}`)}
                          />
                        </div>
                      ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default RecommendBySong;
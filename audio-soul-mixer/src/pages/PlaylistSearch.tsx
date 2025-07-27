import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Music, Users } from 'lucide-react';
import Layout from '../components/Layout';
import PlaylistCard from '../components/PlaylistCard';

const PlaylistSearch: React.FC = () => {
  const navigate = useNavigate();
  const [playlists, setPlaylists] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [hasSearched, setHasSearched] = useState(false);

  const searchPlaylists = async (query: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/api/playlists/search?query=${encodeURIComponent(query)}&limit=25`);
      const data = await response.json();
      
      if (data.status === 'success') {
        const playlists = data.data || [];
        setPlaylists(Array.isArray(playlists) ? playlists : []);
      } else {
        setPlaylists([]);
      }
    } catch (error) {
      console.error('Error searching playlists:', error);
      setPlaylists([]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadAllPlaylists = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/playlists/trending?limit=25');
      const data = await response.json();
      
      if (data.status === 'success') {
        const playlists = data.data?.playlists || data.data || [];
        setPlaylists(Array.isArray(playlists) ? playlists : []);
      } else {
        setPlaylists([]);
      }
    } catch (error) {
      console.error('Error fetching playlists:', error);
      setPlaylists([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      setHasSearched(true);
      searchPlaylists(query);
    } else {
      setHasSearched(false);
      loadAllPlaylists();
    }
  };

  useEffect(() => {
    loadAllPlaylists();
  }, []);

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Discover Playlists</h1>
          
          {/* Search Input */}
          <div className="relative max-w-md">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search for playlists..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">
            {hasSearched ? `Search Results for "${searchQuery}"` : 'Trending Playlists'}
          </h2>

          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow-md p-4 animate-pulse">
                  <div className="h-32 bg-gray-200 rounded-lg mb-3"></div>
                  <div className="h-3 bg-gray-200 rounded mb-1"></div>
                  <div className="h-2 bg-gray-200 rounded w-2/3"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {Array.isArray(playlists) && playlists.length > 0 ? (
                playlists.map((playlist: any) => (
                  <PlaylistCard
                    key={playlist.id}
                    playlist={playlist}
                    onClick={() => navigate(`/playlist/${playlist.id}`)}
                  />
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <div className="flex flex-col items-center space-y-4">
                    <Music className="h-12 w-12 text-gray-400" />
                    <p className="text-gray-500 text-lg">
                      {hasSearched 
                        ? `No playlists found for "${searchQuery}". Try a different search term.`
                        : 'No playlists available at the moment.'
                      }
                    </p>
                    {hasSearched && (
                      <button
                        onClick={() => {
                          setSearchQuery('');
                          setHasSearched(false);
                          loadAllPlaylists();
                        }}
                        className="text-blue-600 hover:text-blue-700 font-medium"
                      >
                        View all trending playlists
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default PlaylistSearch; 
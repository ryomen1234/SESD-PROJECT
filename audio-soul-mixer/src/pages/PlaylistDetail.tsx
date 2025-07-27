import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { saveRecentlyPlayed } from '../services/playlistService';
import { Play, Pause, ExternalLink, ArrowLeft } from 'lucide-react';

const PlaylistDetail: React.FC = () => {
  const { playlistId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [playlist, setPlaylist] = useState<any>(null);
  const [tracks, setTracks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPlayingTrackId, setCurrentPlayingTrackId] = useState<string | null>(null);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);

  const playTrack = (track: any) => {
    if (currentPlayingTrackId === track.id) {
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
        currentAudioRef.current.currentTime = 0;
      }
      setCurrentPlayingTrackId(null);
      return;
    }

    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current.currentTime = 0;
    }

    const audioUrl = track.preview_url || track.preview;
    if (audioUrl) {
      const audio = new Audio(audioUrl);
      audio.addEventListener('ended', () => {
        setCurrentPlayingTrackId(null);
      });
      audio.addEventListener('error', () => {
        console.error('Failed to play audio');
        setCurrentPlayingTrackId(null);
      });
      audio.play().catch(err => {
        console.error('Failed to play audio:', err);
        setCurrentPlayingTrackId(null);
      });
      currentAudioRef.current = audio;
      setCurrentPlayingTrackId(track.id);
    } else {
      alert('No audio preview available for this track');
    }
  };

  const handleTrackPlay = async (track: any) => {
    playTrack(track);

    if (user) {
      try {
        await saveRecentlyPlayed({
          userId: user.uid,
          trackId: track.id,
          title: track.title || track.name,
          artist: track.artist?.name || track.artist || track.artists,
          artwork: track.artwork,
          duration: track.duration || 0,
          preview_url: track.preview_url || track.preview
        });
      } catch (error) {
        console.error('Error saving recently played:', error);
      }
    }
  };

  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    const loadPlaylistDetails = async () => {
      if (!playlistId) return;

      setIsLoading(true);
      try {
        const response = await fetch(`http://localhost:5000/api/playlists/${playlistId}/tracks`);
        const data = await response.json();
        
        if (data.status === 'success') {
          const tracksData = data.data?.tracks || data.data || [];
          setTracks(Array.isArray(tracksData) ? tracksData : []);
          
          // Get playlist info from the API response
          const playlistInfo = data.data?.playlist || {};
          setPlaylist({
            id: playlistId,
            name: playlistInfo.name || playlistInfo.title || `Playlist ${playlistId}`,
            description: playlistInfo.description,
            trackCount: tracksData.length,
            artwork: playlistInfo.artwork || playlistInfo.picture
          });
        } else {
          setTracks([]);
        }
      } catch (error) {
        console.error('Error fetching playlist tracks:', error);
        setTracks([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadPlaylistDetails();
  }, [playlistId]);

  useEffect(() => {
    return () => {
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
      }
    };
  }, []);

  if (isLoading) {
    return (
      <Layout>
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="space-y-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4 p-4 bg-white rounded-lg">
                  <div className="w-12 h-12 bg-gray-200 rounded"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                  <div className="w-16 h-4 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <button
            onClick={() => navigate('/playlists')}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Playlists</span>
          </button>
          
          <div className="flex items-center space-x-6">
            <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center overflow-hidden">
              {tracks.length > 0 && (tracks[0].artwork?.['480x480'] || tracks[0].artwork?.['150x150'] || tracks[0].albumArt) ? (
                <img
                  src={tracks[0].artwork?.['480x480'] || tracks[0].artwork?.['150x150'] || tracks[0].albumArt}
                  alt={playlist?.name || 'Playlist'}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                  }}
                />
              ) : null}
              <span className="text-white text-2xl font-bold">
                {playlist?.name?.charAt(0) || 'P'}
              </span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {playlist?.name || 'Playlist'}
              </h1>
              <p className="text-gray-600">
                {tracks.length} tracks
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {tracks.length > 0 ? (
            tracks.map((track: any) => (
              <div
                key={track.id}
                className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-gray-300 rounded-lg flex items-center justify-center">
                    {track.artwork?.['150x150'] || track.albumArt ? (
                      <img
                        src={track.artwork?.['150x150'] || track.albumArt}
                        alt={track.title || track.name}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <span className="text-gray-500 font-semibold text-sm">
                        {(track.title || track.name || 'T').charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900 truncate">
                      {track.title || track.name}
                    </h3>
                    <p className="text-gray-600 truncate">
                      {track.artist?.name || track.artist || track.artists}
                    </p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">
                      {formatDuration(track.duration || 0)}
                    </span>
                    
                    <button
                      onClick={() => handleTrackPlay(track)}
                      className="p-2 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                      title={currentPlayingTrackId === track.id ? 'Pause' : 'Play'}
                    >
                      {currentPlayingTrackId === track.id ? (
                        <Pause className="h-4 w-4" />
                      ) : (
                        <Play className="h-4 w-4" />
                      )}
                    </button>

                    {(track.full_song_url || track.deezer_url) && (
                      <a
                        href={track.full_song_url || track.deezer_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-full bg-gray-600 text-white hover:bg-gray-700 transition-colors"
                        title="Listen full song"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">
                No tracks found in this playlist.
              </p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default PlaylistDetail; 
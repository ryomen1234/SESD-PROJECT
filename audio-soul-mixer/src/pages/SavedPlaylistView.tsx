import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import SongCard from '../components/SongCard';
import { useAuth } from '../contexts/AuthContext';
import { saveRecentlyPlayed, getUserPlaylists } from '../services/playlistService';
import { Clock, Play, Pause, ExternalLink, ArrowLeft } from 'lucide-react';

interface PlaylistTrack {
  id: string;
  title: string;
  artist: string;
  artwork?: {
    '150x150'?: string;
    '480x480'?: string;
    '1000x1000'?: string;
  } | string;
  duration: number;
  preview_url?: string;
  deezer_url?: string;
  full_song_url?: string;
}

interface SavedPlaylist {
  id: string;
  name: string;
  description: string;
  tracks: PlaylistTrack[];
  userId: string;
  createdAt: any;
  updatedAt: any;
  duration?: number;
  trackCount?: number;
  artwork?: {
    '150x150'?: string;
    '480x480'?: string;
    '1000x1000'?: string;
  } | string;
  genre?: string;
  mood?: string;
  source?: string;
}

const SavedPlaylistView: React.FC = () => {
  const { playlistId } = useParams<{ playlistId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [playlist, setPlaylist] = useState<SavedPlaylist | null>(null);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
  const [currentPlayingTrackId, setCurrentPlayingTrackId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!playlistId) {
      navigate('/');
      return;
    }

    const loadPlaylist = async () => {
      try {
        // First try to load from Firebase (saved playlists)
        if (user) {
          const userPlaylists = await getUserPlaylists(user.uid);
          const savedPlaylist = userPlaylists.find(p => p.id === playlistId);
          if (savedPlaylist) {
            setPlaylist(savedPlaylist);
            setIsLoading(false);
            return;
          }
        }

        // If not found in Firebase, try API
        const response = await fetch(`http://localhost:5000/api/playlists/${playlistId}`);
        if (response.ok) {
          const data = await response.json();
          setPlaylist(data.data.playlist);
        } else {
          navigate('/');
        }
      } catch (error) {
        console.error('Error loading playlist:', error);
        navigate('/');
      } finally {
        setIsLoading(false);
      }
    };

    loadPlaylist();
  }, [playlistId, navigate, user]);

  const playTrack = async (track: PlaylistTrack) => {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    }

    if (currentPlayingTrackId === track.id) {
      setCurrentPlayingTrackId(null);
      setCurrentAudio(null);
      return;
    }

    try {
      // Use the existing preview_url that was saved with the track
      if (track.preview_url) {
        const audio = new Audio(track.preview_url);
        
        audio.addEventListener('ended', () => {
          setCurrentPlayingTrackId(null);
          setCurrentAudio(null);
        });

        audio.addEventListener('error', () => {
          alert(`No audio preview available for "${track.title}". Use the external link to listen to the full song.`);
          setCurrentPlayingTrackId(null);
          setCurrentAudio(null);
        });

        await audio.play();
        setCurrentAudio(audio);
        setCurrentPlayingTrackId(track.id);

        if (user) {
          try {
            await saveRecentlyPlayed({
              userId: user.uid,
              trackId: track.id,
              title: track.title,
              artist: track.artist,
              artwork: typeof track.artwork === 'string' ? { '480x480': track.artwork } : track.artwork,
              duration: track.duration,
              preview_url: track.preview_url
            });
          } catch (error) {
            console.error('Error saving to recently played:', error);
          }
        }
      } else {
        alert(`No audio preview available for "${track.title}". Use the external link to listen to the full song.`);
      }
    } catch (error) {
      console.error('Error playing track:', error);
      alert(`No audio preview available for "${track.title}". Use the external link to listen to the full song.`);
    }
  };

  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateValue: any): string => {
    if (!dateValue) return 'Unknown date';

    let date: Date;

    if (dateValue.seconds) {
      date = new Date(dateValue.seconds * 1000);
    } else if (dateValue instanceof Date) {
      date = dateValue;
    } else if (typeof dateValue === 'string') {
      date = new Date(dateValue);
    } else if (dateValue.seconds && dateValue.nanoseconds) {
      date = new Date(dateValue.seconds * 1000);
    } else {
      date = new Date();
    }

    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  if (!playlist) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Playlist Not Found</h1>
          <p className="text-gray-600 mb-6">The playlist you're looking for doesn't exist or has been removed.</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Back Home
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Playlists</span>
        </button>
        
        <div className="mb-8">
          <div className="flex items-center space-x-6">
            {/* Playlist Artwork */}
            <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center overflow-hidden">
              {playlist.tracks.length > 0 && (playlist.tracks[0].artwork?.['480x480'] || playlist.tracks[0].artwork?.['150x150'] || (typeof playlist.tracks[0].artwork === 'string' ? playlist.tracks[0].artwork : null)) ? (
                <img
                  src={playlist.tracks[0].artwork?.['480x480'] || playlist.tracks[0].artwork?.['150x150'] || (typeof playlist.tracks[0].artwork === 'string' ? playlist.tracks[0].artwork : '')}
                  alt={playlist.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    e.currentTarget.nextElementSibling?.classList.remove('hidden');
                  }}
                />
              ) : null}
              <span className="text-white text-2xl font-bold">
                {playlist.name?.charAt(0) || 'P'}
              </span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {playlist.name || 'Playlist'}
              </h1>
              <p className="text-gray-600">
                {playlist.tracks.length} tracks
              </p>
            </div>
          </div>
        </div>

        {/* Track List */}
        <div className="space-y-4">
          {playlist.tracks.length > 0 ? (
            playlist.tracks.map((track: any) => (
              <div
                key={track.id}
                className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center space-x-4">
                  {/* Album Artwork */}
                  <div className="flex-shrink-0 w-12 h-12 bg-gray-300 rounded-lg flex items-center justify-center overflow-hidden">
                    {track.artwork?.['480x480'] || track.artwork?.['150x150'] || (typeof track.artwork === 'string' ? track.artwork : null) ? (
                      <img
                        src={track.artwork?.['480x480'] || track.artwork?.['150x150'] || (typeof track.artwork === 'string' ? track.artwork : '')}
                        alt={track.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                    ) : null}
                    <span className="text-gray-500 font-semibold text-sm">
                      {(track.title || 'T').charAt(0).toUpperCase()}
                    </span>
                  </div>

                  {/* Track Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900 truncate">
                      {track.title}
                    </h3>
                    <p className="text-gray-600 truncate">
                      {track.artist}
                    </p>
                  </div>

                  {/* Duration and Controls */}
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">
                      {formatDuration(track.duration || 0)}
                    </span>
                    
                    <button
                      onClick={() => playTrack(track)}
                      className="p-2 rounded-full bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                      title={currentPlayingTrackId === track.id ? 'Pause' : 'Play'}
                    >
                      {currentPlayingTrackId === track.id ? (
                        <Pause className="h-4 w-4" />
                      ) : (
                        <Play className="h-4 w-4" />
                      )}
                    </button>

                    {track.full_song_url && (
                      <a
                        href={track.full_song_url}
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

export default SavedPlaylistView; 
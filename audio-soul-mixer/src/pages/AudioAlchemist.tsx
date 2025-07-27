import { useState, useEffect } from "react";
import Layout from "../components/Layout";
import SongCard from "../components/SongCard";
import { Slider } from "../components/ui/slider";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { savePlaylist, saveRecentlyPlayed } from "../services/playlistService";
import { useAuth } from "../contexts/AuthContext";

interface AudioFeatures {
  danceability: number;
  energy: number;
  valence: number;
  acousticness: number;
}

interface Song {
  id: string;
  title: string;
  artist: string;
  albumArt: string;
  duration?: number;
  preview_url?: string | null;
  deezer_url?: string | null;
  full_song_url?: string | null;
  artwork?: {
    '150x150'?: string;
    '480x480'?: string;
    '1000x1000'?: string;
  };
}

const AudioAlchemist = () => {
  const { user } = useAuth();
  const [audioFeatures, setAudioFeatures] = useState<AudioFeatures>({
    danceability: 50,
    energy: 50,
    valence: 50,
    acousticness: 50
  });
  
  const [playlist, setPlaylist] = useState<Song[]>([]);
  const [playlistName, setPlaylistName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
  const [currentPlayingTrackId, setCurrentPlayingTrackId] = useState<string | null>(null);

  // Preset configurations
  const presets = [
    {
      name: "Party Mode",
      description: "High energy, danceable, happy music",
      features: { danceability: 90, energy: 85, valence: 80, acousticness: 20 }
    },
    {
      name: "Study Focus",
      description: "Calm, instrumental, low energy",
      features: { danceability: 30, energy: 25, valence: 40, acousticness: 80 }
    },
    {
      name: "Workout",
      description: "High energy, motivating, upbeat",
      features: { danceability: 75, energy: 90, valence: 70, acousticness: 30 }
    },
    {
      name: "Chill Vibes",
      description: "Relaxing, acoustic, peaceful",
      features: { danceability: 40, energy: 30, valence: 60, acousticness: 90 }
    },
    {
      name: "Creative Flow",
      description: "Inspirational, moderate energy, positive",
      features: { danceability: 60, energy: 50, valence: 75, acousticness: 50 }
    },
    {
      name: "Happy Pop",
      description: "Upbeat, positive, mainstream",
      features: { danceability: 80, energy: 70, valence: 85, acousticness: 40 }
    }
  ];

  const applyPreset = (preset: typeof presets[0]) => {
    setAudioFeatures(preset.features);
    // Auto-generate playlist when preset is applied
    setTimeout(() => {
      generatePlaylist(preset.features);
    }, 100);
  };

  // Generate playlist based on audio features
  const generatePlaylist = async (features: AudioFeatures) => {
    setIsLoading(true);
    
    try {
      // Build search query based on audio features - using real search terms
      let searchTerms = [];
      let genres = [];
      
      // Energy - use mood and style terms
      if (features.energy > 80) {
        searchTerms.push('energetic upbeat rock');
        genres.push('rock', 'electronic', 'pop');
      } else if (features.energy > 60) {
        searchTerms.push('upbeat pop');
        genres.push('pop', 'rock');
      } else if (features.energy > 40) {
        searchTerms.push('moderate tempo');
        genres.push('pop', 'indie');
      } else if (features.energy > 20) {
        searchTerms.push('calm relaxing');
        genres.push('ambient', 'folk');
      } else {
        searchTerms.push('very calm ambient');
        genres.push('ambient', 'classical');
      }
      
      // Danceability
      if (features.danceability > 80) {
        searchTerms.push('dance electronic');
        genres.push('electronic', 'dance');
      } else if (features.danceability < 30) {
        searchTerms.push('slow ballad');
        genres.push('ballad', 'folk');
      }
      
      // Valence (mood)
      if (features.valence > 80) {
        searchTerms.push('happy joyful');
        genres.push('pop', 'funk');
      } else if (features.valence < 30) {
        searchTerms.push('melancholy sad');
        genres.push('indie', 'folk');
      }
      
      // Acousticness
      if (features.acousticness > 80) {
        searchTerms.push('acoustic guitar');
        genres.push('folk', 'acoustic');
      } else if (features.acousticness < 20) {
        searchTerms.push('electronic synth');
        genres.push('electronic', 'synth');
      }
      
      // Use multiple search terms to get diverse results
      const allSongs: Song[] = [];
      
      for (const searchTerm of searchTerms.slice(0, 3)) { // Limit to 3 search terms
        try {
          const response = await fetch(`http://localhost:5000/api/songs?search=${encodeURIComponent(searchTerm)}&limit=20`);
          const data = await response.json();
          
          if (data.status === 'success' && data.data.songs) {
            const songs = data.data.songs.slice(0, 7); // Get 7 songs per search term
            allSongs.push(...songs);
          }
        } catch (error) {
          console.error(`Error fetching songs for "${searchTerm}":`, error);
        }
      }
      
      // Remove duplicates and limit to 20 songs
      const uniqueSongs = allSongs.filter((song, index, self) => 
        index === self.findIndex(s => s.id === song.id)
      ).slice(0, 20);
      
      // Add artwork structure to songs
      const processedSongs = uniqueSongs.map(song => ({
        ...song,
        artwork: {
          '150x150': song.albumArt,
          '480x480': song.albumArt,
          '1000x1000': song.albumArt
        }
      }));
      
      setPlaylist(processedSongs);
      
      // Auto-generate playlist name based on features
      const nameParts = [];
      if (features.energy > 70) nameParts.push('Energetic');
      if (features.danceability > 70) nameParts.push('Dance');
      if (features.valence > 70) nameParts.push('Happy');
      if (features.acousticness > 70) nameParts.push('Acoustic');
      
      const defaultName = nameParts.length > 0 ? `${nameParts.join(' ')} Mix` : 'Custom Playlist';
      setPlaylistName(defaultName);
      
    } catch (error) {
      console.error('Error generating playlist:', error);
      alert('Failed to generate playlist. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSliderChange = (feature: keyof AudioFeatures, value: number[]) => {
    setAudioFeatures(prev => ({
      ...prev,
      [feature]: value[0]
    }));
  };

  const handlePlaySong = async (song: Song) => {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    }

    if (currentPlayingTrackId === song.id) {
      setCurrentPlayingTrackId(null);
      setCurrentAudio(null);
      return;
    }

    try {
      if (song.preview_url) {
        const audio = new Audio(song.preview_url);
        
        audio.addEventListener('ended', () => {
          setCurrentPlayingTrackId(null);
          setCurrentAudio(null);
        });

        audio.addEventListener('error', (error) => {
          console.error('Error playing preview:', error);
          alert(`No audio preview available for "${song.title}"`);
          setCurrentPlayingTrackId(null);
          setCurrentAudio(null);
        });

        await audio.play();
        setCurrentAudio(audio);
        setCurrentPlayingTrackId(song.id);
        
        // Save to recently played
        if (user) {
          try {
            await saveRecentlyPlayed({
              userId: user.uid,
              trackId: song.id,
              title: song.title,
              artist: song.artist,
              artwork: song.artwork,
              duration: song.duration || 0,
              preview_url: song.preview_url
            });
          } catch (error) {
            console.error('Error saving to recently played:', error);
          }
        }
      } else {
        alert(`No audio preview available for "${song.title}"`);
      }
    } catch (error) {
      console.error('Error playing track:', error);
      alert(`No audio preview available for "${song.title}"`);
    }
  };

  const handleSavePlaylist = async () => {
    if (!user) {
      alert('Please log in to save playlists');
      return;
    }

    if (!playlistName.trim()) {
      alert('Please enter a playlist name');
      return;
    }

    if (playlist.length === 0) {
      alert('No songs to save');
      return;
    }

    try {
      const tracks = playlist.map(song => ({
        id: song.id || `track_${Date.now()}_${Math.random()}`,
        title: song.title || 'Unknown Title',
        artist: song.artist || 'Unknown Artist',
        artwork: song.artwork || {
          '150x150': song.albumArt || '',
          '480x480': song.albumArt || '',
          '1000x1000': song.albumArt || ''
        },
        duration: song.duration || 0,
        preview_url: song.preview_url || null
      }));

      const totalDuration = tracks.reduce((sum, track) => sum + (track.duration || 0), 0);
      const firstTrackArtwork = tracks[0]?.artwork || {
        '150x150': '',
        '480x480': '',
        '1000x1000': ''
      };

      await savePlaylist({
        name: playlistName || 'Custom Playlist',
        description: `Generated playlist with ${playlist.length} tracks`,
        tracks,
        userId: user.uid,
        duration: totalDuration,
        trackCount: tracks.length,
        artwork: firstTrackArtwork,
        genre: 'Mixed',
        mood: 'Custom',
        source: 'audio-alchemist'
      });

      alert('Playlist saved successfully!');
    } catch (error) {
      console.error('Error saving playlist:', error);
      alert('Failed to save playlist. Please try again.');
    }
  };

  // Cleanup audio when component unmounts
  useEffect(() => {
    return () => {
      if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
      }
    };
  }, [currentAudio]);

  const sliderConfig = [
    {
      key: 'danceability' as keyof AudioFeatures,
      label: 'Danceability',
      leftLabel: 'Slow',
      rightLabel: 'Dance',
      description: 'Search for dance music vs slow ballads'
    },
    {
      key: 'energy' as keyof AudioFeatures,
      label: 'Energy',
      leftLabel: 'Calm',
      rightLabel: 'Energetic',
      description: 'Search for energetic vs relaxing music'
    },
    {
      key: 'valence' as keyof AudioFeatures,
      label: 'Mood',
      leftLabel: 'Melancholy',
      rightLabel: 'Joyful',
      description: 'Search for happy vs emotional music'
    },
    {
      key: 'acousticness' as keyof AudioFeatures,
      label: 'Style',
      leftLabel: 'Electronic',
      rightLabel: 'Acoustic',
      description: 'Search for acoustic vs electronic music'
    }
  ];

  return (
    <Layout>
      <div className="container mx-auto px-6 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">
              Audio <span className="text-blue-600">Mixer</span>
            </h1>
            <p className="text-xl text-gray-600">
              Create custom playlists by adjusting musical attributes
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Left Side - Alchemist Controls */}
            <div className="space-y-8">
              <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
                  Mix Your <span className="text-blue-600">Music</span>
                </h2>
                
                {/* Preset Buttons */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Presets</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {presets.map((preset) => (
                      <button
                        key={preset.name}
                        onClick={() => applyPreset(preset)}
                        className="p-3 text-sm bg-gray-100 hover:bg-blue-100 text-gray-700 hover:text-blue-700 rounded-lg transition-colors duration-200"
                        title={preset.description}
                      >
                        {preset.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Generate Button */}
                <div className="mb-8">
                  <button
                    onClick={() => generatePlaylist(audioFeatures)}
                    disabled={isLoading}
                    className="w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold rounded-lg transition-colors duration-200"
                  >
                    {isLoading ? 'Generating...' : 'Generate Playlist'}
                  </button>
                </div>
                
                <div className="space-y-8">
                  {sliderConfig.map((config) => (
                    <div key={config.key} className="space-y-4">
                      <div className="flex items-center justify-between">
                        <label className="text-lg font-medium text-gray-900">
                          {config.label}
                        </label>
                        <span className="text-sm text-blue-600 font-medium">
                          {audioFeatures[config.key]}%
                        </span>
                      </div>
                      
                      <div className="space-y-2">
                        <Slider
                          value={[audioFeatures[config.key]]}
                          onValueChange={(value) => handleSliderChange(config.key, value)}
                          max={100}
                          step={1}
                          className="w-full"
                        />
                        <div className="flex justify-between text-sm text-gray-500">
                          <span>{config.leftLabel}</span>
                          <span>{config.rightLabel}</span>
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-500">
                        {config.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Side - Generated Playlist */}
            <div className="space-y-6">
              <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">
                  Your <span className="text-blue-600">Playlist</span>
                </h2>
                <p className="text-gray-600 text-center mb-6">
                  {playlist.length} tracks crafted from your preferences
                </p>
                
                {/* Playlist Name Input and Save Button */}
                {playlist.length > 0 && (
                  <div className="mb-6 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Playlist Name
                      </label>
                      <Input
                        type="text"
                        value={playlistName}
                        onChange={(e) => setPlaylistName(e.target.value)}
                        placeholder="Enter playlist name..."
                        className="w-full"
                      />
                    </div>
                    <Button
                      onClick={handleSavePlaylist}
                      className="w-full bg-green-600 hover:bg-green-700 text-white"
                    >
                      Save to My Playlists
                    </Button>
                  </div>
                )}
                
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4 max-h-[600px] overflow-y-auto custom-scrollbar">
                    {playlist.map((song, index) => (
                      <div
                        key={song.id}
                        className="animate-fade-in"
                        style={{ animationDelay: `${index * 0.05}s` }}
                      >
                        <SongCard
                          title={song.title}
                          artist={song.artist}
                          albumArt={song.albumArt}
                          onPlay={() => handlePlaySong(song)}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AudioAlchemist;
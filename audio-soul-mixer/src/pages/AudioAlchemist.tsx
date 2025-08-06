import { useState, useEffect } from "react";
import Layout from "../components/Layout";
import SongCard from "../components/SongCard";
import { Slider } from "../components/ui/slider";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { savePlaylist, saveRecentlyPlayed } from "../services/playlistService";
import { useAuth } from "../contexts/AuthContext";

// Interfaces
interface Song {
  id: string;
  title: string;
  artist: string;
  albumArt: string;
  duration?: number;
  preview_url?: string;
  deezer_url?: string;
  artwork?: {
    '150x150'?: string;
    '480x480'?: string;
    '1000x1000'?: string;
  };
}

interface AudioFeatures {
  acousticness: number;
  danceability: number;
  energy: number;
  instrumentalness: number;
  liveness: number;
  valence: number;
}

// Constants
const initialFeatures: AudioFeatures = {
  acousticness: 0.5,
  danceability: 0.7,
  energy: 0.6,
  instrumentalness: 0.1,
  liveness: 0.2,
  valence: 0.5,
};

const presets: { name: string; features: AudioFeatures }[] = [
    { name: "Chill Mix", features: { acousticness: 0.8, danceability: 0.4, energy: 0.3, instrumentalness: 0.6, liveness: 0.1, valence: 0.3 } },
    { name: "Workout Energy", features: { acousticness: 0.1, danceability: 0.8, energy: 0.9, instrumentalness: 0.0, liveness: 0.4, valence: 0.7 } },
    { name: "Focus Flow", features: { acousticness: 0.7, danceability: 0.3, energy: 0.2, instrumentalness: 0.8, liveness: 0.1, valence: 0.2 } },
    { name: "Party Starter", features: { acousticness: 0.2, danceability: 0.9, energy: 0.8, instrumentalness: 0.0, liveness: 0.5, valence: 0.8 } },
    { name: "Sad Vibes", features: { acousticness: 0.6, danceability: 0.3, energy: 0.2, instrumentalness: 0.5, liveness: 0.1, valence: 0.1 } },
    { name: "Upbeat Morning", features: { acousticness: 0.3, danceability: 0.7, energy: 0.8, instrumentalness: 0.0, liveness: 0.2, valence: 0.9 } },
    { name: "Late Night Jazz", features: { acousticness: 0.9, danceability: 0.5, energy: 0.3, instrumentalness: 0.7, liveness: 0.1, valence: 0.2 } },
    { name: "Acoustic Cafe", features: { acousticness: 0.9, danceability: 0.4, energy: 0.4, instrumentalness: 0.2, liveness: 0.1, valence: 0.4 } },
];

const AudioAlchemist = () => {
  const { user } = useAuth();
  const [audioFeatures, setAudioFeatures] = useState<AudioFeatures>(initialFeatures);
  const [playlist, setPlaylist] = useState<Song[]>([]);
  const [playlistName, setPlaylistName] = useState("Audio Alchemist Mix");
  const [isLoading, setIsLoading] = useState(false);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
  const [currentPlayingTrackId, setCurrentPlayingTrackId] = useState<string | null>(null);

  const handleSliderChange = (feature: keyof AudioFeatures) => (value: number[]) => {
    setAudioFeatures(prev => ({ ...prev, [feature]: value[0] }));
  };
  
  const applyPreset = (preset: { name: string, features: AudioFeatures }) => {
    setAudioFeatures(preset.features);
    setPlaylistName(preset.name);
  };

  const generatePlaylist = async () => {
    setIsLoading(true);
    setPlaylist([]);
    try {
      // Since Deezer search isn't working, we'll use different approaches to get variety
      // Create a seed based on slider values to get consistent but different results
      const seed = Math.floor(
        (audioFeatures.valence * 100) + 
        (audioFeatures.energy * 100) + 
        (audioFeatures.danceability * 100) + 
        (audioFeatures.acousticness * 100)
      );
      
      // Use the seed to determine which "page" of popular tracks to fetch
      const offset = (seed % 10) * 20; // This gives us offsets: 0, 20, 40, 60, 80, 100, 120, 140, 160, 180
      const limit = 20;

      // First try to get popular tracks with different offsets for variety
      const response = await fetch(`http://localhost:5000/api/songs/alchemist?limit=${limit + offset}`);
      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }
      const data = await response.json();

      if (data.status === 'success' && data.data.songs && data.data.songs.length > 0) {
        // Take a slice from the middle based on our offset to simulate different "pages"
        let songsToUse = data.data.songs;
        if (songsToUse.length > offset + limit) {
          songsToUse = songsToUse.slice(offset, offset + limit);
        } else if (songsToUse.length > limit) {
          // If we don't have enough for the offset, take the last 20
          songsToUse = songsToUse.slice(-limit);
        }

        // Shuffle the results based on our audio features for more variety
        const shuffledSongs = [...songsToUse].sort(() => {
          // Use audio features as a pseudo-random seed
          const pseudoRandom = (audioFeatures.valence + audioFeatures.energy + audioFeatures.danceability) % 1;
          return pseudoRandom - 0.5;
        });

        const processedSongs: Song[] = shuffledSongs.slice(0, 20).map((song: any) => ({
          id: song.id,
          title: song.title || 'Unknown Title',
          artist: song.artist?.name || 'Unknown Artist',
          albumArt: song.artwork?.['480x480'] || `https://picsum.photos/480/480?random=${song.id}`,
          duration: song.duration,
          preview_url: song.preview_url,
          deezer_url: song.deezer_url,
          artwork: song.artwork,
        }));
        
        setPlaylist(processedSongs);
        
        // Set playlist name based on dominant feature
        const features = Object.entries(audioFeatures).sort(([, a], [, b]) => b - a);
        const dominantFeature = features[0][0];
        const featureNames: { [key: string]: string } = {
          valence: "Happy",
          energy: "Energetic", 
          danceability: "Dance",
          acousticness: "Acoustic",
          instrumentalness: "Instrumental",
          liveness: "Live"
        };
        
        if (playlistName === "Audio Alchemist Mix" || !presets.some(p => p.name === playlistName)) {
          setPlaylistName(`${featureNames[dominantFeature] || "Custom"} Mix`);
        }
      } else {
        setPlaylist([]);
      }
    } catch (error) {
      console.error('Error generating playlist:', error);
      alert('Failed to generate playlist. Please try again.');
    } finally {
      setIsLoading(false);
    }
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
          openFullSong(song);
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
              preview_url: song.preview_url,
              deezer_url: song.deezer_url,
            });
          } catch (error) {
            console.error('Error saving to recently played:', error);
          }
        }
      } else {
        openFullSong(song);
      }
    } catch (error) {
      console.error('Error playing track:', error);
      openFullSong(song);
    }
  };

  const openFullSong = (song: Song) => {
    if (song.deezer_url) {
      window.open(song.deezer_url, '_blank');
    } else {
      alert("Full song URL is not available.");
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
      await savePlaylist({
        name: playlistName,
        description: `Generated with Audio Alchemist.`,
        tracks: playlist,
        duration: playlist.reduce((sum, track) => sum + (track.duration || 0), 0),
        trackCount: playlist.length,
        artwork: playlist[0]?.artwork,
        genre: 'Mixed',
        mood: 'Custom',
        source: 'audio-alchemist',
      });
      alert('Playlist saved successfully!');
    } catch (error) {
      console.error('Error saving playlist:', error);
      alert('Failed to save playlist. Please try again.');
    }
  };

  useEffect(() => {
    return () => {
      if (currentAudio) {
        currentAudio.pause();
      }
    };
  }, [currentAudio]);

  return (
    <Layout>
      <div className="container mx-auto px-6 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">
              Audio <span className="text-blue-600">Alchemist</span>
            </h1>
            <p className="text-xl text-gray-600">
              Craft playlists by mixing musical attributes or start with a preset.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            <div className="space-y-8">
              <div className="bg-white rounded-2xl p-8 shadow-lg border">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 text-center">
                  Start with a <span className="text-blue-600">Preset</span>
                </h2>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                  {presets.map(preset => (
                    <Button key={preset.name} variant="outline" onClick={() => applyPreset(preset)}>
                      {preset.name}
                    </Button>
                  ))}
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
                  Or Mix Your <span className="text-blue-600">Own</span>
                </h2>
                <div className="space-y-6 mb-8">
                  {Object.keys(audioFeatures).map(feature => (
                    <div key={feature}>
                      <label className="capitalize text-lg font-medium text-gray-800">
                        {feature.charAt(0).toUpperCase() + feature.slice(1)}
                      </label>
                      <Slider
                        min={0}
                        max={1}
                        step={0.01}
                        value={[audioFeatures[feature as keyof AudioFeatures]]}
                        onValueChange={handleSliderChange(feature as keyof AudioFeatures)}
                      />
                    </div>
                  ))}
                </div>
                <Button onClick={generatePlaylist} disabled={isLoading} className="w-full py-3">
                  {isLoading ? 'Generating...' : 'Generate Playlist'}
                </Button>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-white rounded-2xl p-8 shadow-lg border">
                <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">
                  Your <span className="text-blue-600">Playlist</span>
                </h2>
                <p className="text-gray-600 text-center mb-6">
                  {playlist.length > 0 ? `${playlist.length} tracks crafted for you` : "Generate a playlist to see results"}
                </p>
                {playlist.length > 0 && (
                  <div className="mb-6 space-y-4">
                    <Input
                      type="text"
                      value={playlistName}
                      onChange={(e) => setPlaylistName(e.target.value)}
                      placeholder="Enter playlist name..."
                      className="w-full"
                    />
                    <Button onClick={handleSavePlaylist} className="w-full bg-green-600 hover:bg-green-700 text-white">
                      Save to My Playlists
                    </Button>
                  </div>
                )}
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4 max-h-[600px] overflow-y-auto">
                    {playlist.map((song) => (
                      <SongCard
                        key={song.id}
                        title={song.title}
                        artist={song.artist}
                        albumArt={song.albumArt}
                        onPlay={() => handlePlaySong(song)}
                        isPlaying={currentPlayingTrackId === song.id}
                      />
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
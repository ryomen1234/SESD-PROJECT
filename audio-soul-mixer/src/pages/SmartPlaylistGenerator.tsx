import { useState } from "react";
import { Search, Music, Clock, Users, Play, Plus, Download, ExternalLink as ExternalLinkIcon } from "lucide-react";
import Layout from "../components/Layout";
import { useAuth } from "../contexts/AuthContext";
import { useToast } from "../contexts/ToastContext";
import { savePlaylist as savePlaylistToFirebase, saveRecentlyPlayed } from "../services/playlistService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface PlaylistRequest {
  name: string;
  duration: number; // in minutes
  energy: 'low' | 'medium' | 'high';
  genre: string;
  mood: string;
  activity: string;
}

interface GeneratedPlaylist {
  id: string;
  name: string;
  description: string;
  duration: number;
  trackCount: number;
  tracks: PlaylistTrack[];
  energy: string;
  genre: string;
  mood: string;
  activity: string;
}

interface PlaylistTrack {
  id: string;
  title: string;
  artist: {
    id: string;
    name: string;
  };
  artwork: {
    '150x150': string;
    '480x480': string;
  };
  duration: number;
  preview_url: string | null;
  deezer_url: string;
  full_song_url: string;
}

const SmartPlaylistGenerator = () => {
  const [playlistRequest, setPlaylistRequest] = useState<PlaylistRequest>({
    name: '',
    duration: 30,
    energy: 'medium',
    genre: 'pop',
    mood: 'happy',
    activity: 'workout'
  });
  
  const [generatedPlaylist, setGeneratedPlaylist] = useState<GeneratedPlaylist | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
  const [currentlyPlayingTrackId, setCurrentlyPlayingTrackId] = useState<string | null>(null);

  const energyLevels = [
    { value: 'low', label: 'Low Energy', description: 'Calm, relaxing, chill' },
    { value: 'medium', label: 'Medium Energy', description: 'Balanced, moderate' },
    { value: 'high', label: 'High Energy', description: 'Energetic, intense' }
  ];

  const genres = [
    'pop', 'rock', 'hip-hop', 'electronic', 'jazz', 'classical', 
    'country', 'r&b', 'indie', 'folk', 'reggae', 'latin'
  ];

  const moods = [
    'happy', 'sad', 'energetic', 'calm', 'romantic', 'melancholic',
    'upbeat', 'chill', 'nostalgic', 'motivational', 'relaxed', 'excited'
  ];

  const activities = [
    'workout', 'study', 'party', 'commute', 'cooking', 'cleaning',
    'meditation', 'running', 'gaming', 'reading', 'socializing', 'sleep'
  ];

  const generatePlaylist = async () => {
    if (!playlistRequest.name.trim()) {
      alert('Please enter a playlist name');
      return;
    }

    setIsGenerating(true);
    
    try {
      let searchQuery = `${playlistRequest.genre} ${playlistRequest.mood} ${playlistRequest.activity}`;
      
      if (playlistRequest.energy === 'high') searchQuery += ' energetic';
      if (playlistRequest.energy === 'low') searchQuery += ' calm';
      
      const targetTrackCount = Math.ceil(playlistRequest.duration / 3.5);
      
      const response = await fetch(`http://localhost:5000/api/playlists/recommendations/mood/${encodeURIComponent(searchQuery)}`);
      const data = await response.json();
      
      if (data.status === 'success' && data.data.recommendations && data.data.recommendations.length > 0) {
        const tracks: PlaylistTrack[] = data.data.recommendations.map((track: any) => ({
          id: track.id,
          title: track.name || track.title,
          artist: {
            id: track.artist?.id || track.id,
            name: track.artist?.name || track.artist || track.artists
          },
          artwork: {
            '150x150': track.albumArt || track.album_art_url || track.artwork?.['150x150'],
            '480x480': track.albumArt || track.album_art_url || track.artwork?.['480x480']
          },
          duration: track.duration || 180,
          preview_url: track.preview_url || track.preview,
          deezer_url: track.link || `https://www.deezer.com/track/${track.id}`,
          full_song_url: `https://www.youtube.com/results?search_query=${encodeURIComponent(`${track.name || track.title} ${track.artist?.name || track.artist || track.artists} official audio`)}`
        }));

        const totalDuration = tracks.reduce((sum, track) => sum + track.duration, 0) / 60; // Convert to minutes

        const playlist: GeneratedPlaylist = {
          id: `playlist_${Date.now()}`,
          name: playlistRequest.name,
          description: `A ${playlistRequest.energy} energy ${playlistRequest.genre} playlist for ${playlistRequest.activity} with a ${playlistRequest.mood} mood`,
          duration: Math.round(totalDuration),
          trackCount: tracks.length,
          tracks,
          energy: playlistRequest.energy,
          genre: playlistRequest.genre,
          mood: playlistRequest.mood,
          activity: playlistRequest.activity
        };

        setGeneratedPlaylist(playlist);
              } else {
          const fallbackResponse = await fetch('http://localhost:5000/api/songs');
        const fallbackData = await fallbackResponse.json();
        
        if (fallbackData.status === 'success' && fallbackData.data.songs && fallbackData.data.songs.length > 0) {
          const tracks: PlaylistTrack[] = fallbackData.data.songs.slice(0, targetTrackCount).map((track: any) => ({
            id: track.id,
            title: track.name || track.title,
            artist: {
              id: track.artist?.id || track.id,
              name: track.artist?.name || track.artist || track.artists
            },
            artwork: {
              '150x150': track.albumArt || track.album_art_url || track.artwork?.['150x150'],
              '480x480': track.albumArt || track.album_art_url || track.artwork?.['480x480']
            },
            duration: track.duration || 180,
            preview_url: track.preview_url || track.preview,
            deezer_url: track.link || `https://www.deezer.com/track/${track.id}`,
            full_song_url: `https://www.youtube.com/results?search_query=${encodeURIComponent(`${track.name || track.title} ${track.artist?.name || track.artist || track.artists} official audio`)}`
          }));

          const totalDuration = tracks.reduce((sum, track) => sum + track.duration, 0) / 60;

          const playlist: GeneratedPlaylist = {
            id: `playlist_${Date.now()}`,
            name: playlistRequest.name,
            description: `A ${playlistRequest.energy} energy ${playlistRequest.genre} playlist for ${playlistRequest.activity} with a ${playlistRequest.mood} mood`,
            duration: Math.round(totalDuration),
            trackCount: tracks.length,
            tracks,
            energy: playlistRequest.energy,
            genre: playlistRequest.genre,
            mood: playlistRequest.mood,
            activity: playlistRequest.activity
          };

          setGeneratedPlaylist(playlist);
        } else {
          throw new Error('No tracks found for the given criteria');
        }
      }
    } catch (error) {
      console.error('Error generating playlist:', error);
      alert('Failed to generate playlist. Please try different criteria.');
    } finally {
      setIsGenerating(false);
    }
  };

  const playTrack = async (track: PlaylistTrack) => {
    // Stop current audio if playing
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    }

    if (currentlyPlayingTrackId === track.id) {
      // If clicking the same track, stop it
      setCurrentlyPlayingTrackId(null);
      setCurrentAudio(null);
      return;
    }

    if (track.preview_url) {
      const audio = new Audio(track.preview_url);
      audio.play();
      setCurrentAudio(audio);
      setCurrentlyPlayingTrackId(track.id);

      // Save to recently played if user is authenticated
      if (user) {
        try {
          await saveRecentlyPlayed(user.uid, {
            id: track.id,
            title: track.title,
            artist: track.artist.name,
            artwork: track.artwork?.['150x150'] || track.albumArt || track.album_art_url,
            duration: track.duration,
            preview_url: track.preview_url
          });
        } catch (error) {
          console.error('Failed to save recently played track:', error);
        }
      }

      // Cleanup when audio ends
      audio.onended = () => {
        setCurrentlyPlayingTrackId(null);
        setCurrentAudio(null);
      };
    } else {
      alert('No preview available for this track');
    }
  };

  const { user } = useAuth();
  const { showToast } = useToast();

  const savePlaylist = async () => {
    if (!user) {
      showToast('Please log in to save playlists.', 'error');
      return;
    }

    if (!generatedPlaylist) {
      showToast('No playlist to save.', 'error');
      return;
    }

    try {
      const playlistData = {
        name: generatedPlaylist.name,
        description: generatedPlaylist.description,
        duration: generatedPlaylist.duration,
        trackCount: generatedPlaylist.trackCount,
        tracks: generatedPlaylist.tracks.map(track => ({
          id: track.id,
          title: track.title,
          artist: track.artist.name,
          artwork: track.artwork,
          duration: track.duration,
          preview_url: track.preview_url,
          deezer_url: track.deezer_url,
          full_song_url: track.full_song_url
        })),
        artwork: generatedPlaylist.tracks.length > 0 ? generatedPlaylist.tracks[0].artwork : undefined,
        userId: user.uid
      };

      await savePlaylistToFirebase(playlistData);
      showToast('Playlist saved successfully!', 'success');
    } catch (error) {
      console.error('Error saving playlist:', error);
      showToast('Failed to save playlist. Please try again.', 'error');
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-6 py-12">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">
              Smart <span className="text-blue-600">Playlist Generator</span>
            </h1>
            <p className="text-xl text-gray-600">
              Create personalized playlists for any moment with intelligent recommendations
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Playlist Configuration */}
            <Card className="bg-white border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900">
                  <Music className="h-5 w-5 text-gray-600" />
                  Configure Your Playlist
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 text-gray-700">
                {/* Playlist Name */}
                <div>
                  <label className="text-sm font-medium mb-2 block text-gray-700">Playlist Name</label>
                  <Input
                    placeholder="My Awesome Playlist"
                    value={playlistRequest.name}
                    onChange={(e) => setPlaylistRequest(prev => ({ ...prev, name: e.target.value }))}
                    className="bg-white border-gray-300 text-gray-900 placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                {/* Duration */}
                <div>
                  <label className="text-sm font-medium mb-2 block text-gray-700">
                    Duration: {playlistRequest.duration} minutes
                  </label>
                  <Slider
                    value={[playlistRequest.duration]}
                    onValueChange={(value) => setPlaylistRequest(prev => ({ ...prev, duration: value[0] }))}
                    max={120}
                    min={15}
                    step={5}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>15 min</span>
                    <span>120 min</span>
                  </div>
                </div>

                {/* Energy Level */}
                <div>
                  <label className="text-sm font-medium mb-2 block text-gray-700">Energy Level</label>
                  <Select
                    value={playlistRequest.energy}
                    onValueChange={(value: 'low' | 'medium' | 'high') => 
                      setPlaylistRequest(prev => ({ ...prev, energy: value }))
                    }
                  >
                    <SelectTrigger className="bg-white border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-blue-500">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {energyLevels.map(level => (
                        <SelectItem key={level.value} value={level.value}>
                          <div>
                            <div className="font-medium">{level.label}</div>
                            <div className="text-xs text-gray-500">{level.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Genre */}
                <div>
                  <label className="text-sm font-medium mb-2 block text-gray-700">Genre</label>
                  <Select
                    value={playlistRequest.genre}
                    onValueChange={(value) => setPlaylistRequest(prev => ({ ...prev, genre: value }))}
                  >
                    <SelectTrigger className="bg-white border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-blue-500">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {genres.map(genre => (
                        <SelectItem key={genre} value={genre}>
                          {genre.charAt(0).toUpperCase() + genre.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Mood */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Mood</label>
                  <Select
                    value={playlistRequest.mood}
                    onValueChange={(value) => setPlaylistRequest(prev => ({ ...prev, mood: value }))}
                  >
                    <SelectTrigger className="bg-white border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-blue-500">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {moods.map(mood => (
                        <SelectItem key={mood} value={mood}>
                          {mood.charAt(0).toUpperCase() + mood.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Activity */}
                <div>
                  <label className="text-sm font-medium mb-2 block text-gray-700">Activity</label>
                  <Select
                    value={playlistRequest.activity}
                    onValueChange={(value) => setPlaylistRequest(prev => ({ ...prev, activity: value }))}
                  >
                    <SelectTrigger className="bg-white border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-blue-500">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {activities.map(activity => (
                        <SelectItem key={activity} value={activity}>
                          {activity.charAt(0).toUpperCase() + activity.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Generate Button */}
                <Button 
                  onClick={generatePlaylist} 
                  disabled={isGenerating}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium"
                  size="lg"
                >
                  {isGenerating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Generating...
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" />
                      Generate Playlist
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Generated Playlist */}
            <div className="space-y-6">
              {generatedPlaylist ? (
                <Card className="bg-white border-gray-200">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2 text-gray-900">
                        <Play className="h-5 w-5 text-gray-600" />
                        {generatedPlaylist.name}
                      </CardTitle>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={savePlaylist}>
                          <Plus className="h-4 w-4 mr-2" />
                          Save
                        </Button>
                      </div>
                    </div>
                    <p className="text-gray-600">{generatedPlaylist.description}</p>
                    <div className="flex gap-2">
                      <Badge variant="secondary">{generatedPlaylist.energy} energy</Badge>
                      <Badge variant="secondary">{generatedPlaylist.genre}</Badge>
                      <Badge variant="secondary">{generatedPlaylist.mood}</Badge>
                      <Badge variant="secondary">{generatedPlaylist.activity}</Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {generatedPlaylist.duration} min
                      </div>
                      <div className="flex items-center gap-1">
                        <Music className="h-4 w-4" />
                        {generatedPlaylist.trackCount} tracks
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {generatedPlaylist.tracks.map((track, index) => (
                        <div
                          key={track.id}
                          className={`flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer ${
                            currentlyPlayingTrackId === track.id ? 'bg-primary/10 border border-primary/20' : ''
                          }`}
                          onClick={() => playTrack(track)}
                        >
                          <div className="text-sm text-gray-500 w-6">
                            {index + 1}
                          </div>
                          
                          <div className="w-10 h-10 rounded overflow-hidden flex-shrink-0">
                            <img 
                              src={track.artwork?.['150x150'] || track.artwork?.['480x480'] || track.albumArt || track.album_art_url || `https://picsum.photos/40/40?random=${track.id}`} 
                              alt={track.title}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.src = `https://picsum.photos/40/40?random=${track.id}`;
                              }}
                            />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="font-medium truncate">{track.title}</div>
                            <div className="text-sm text-gray-600 truncate">{track.artist.name}</div>
                          </div>
                          
                          <div className="text-sm text-gray-500">
                            {Math.floor(track.duration / 60)}:{(track.duration % 60).toString().padStart(2, '0')}
                          </div>
                          
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                playTrack(track);
                              }}
                              className="opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              {currentlyPlayingTrackId === track.id ? (
                                <div className="w-4 h-4 bg-red-500 rounded-sm" />
                              ) : (
                                <Play className="h-4 w-4" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                window.open(track.full_song_url, '_blank');
                              }}
                              className="opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <ExternalLinkIcon className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="bg-white border-gray-200">
                  <CardContent className="py-12">
                    <div className="text-center text-gray-500">
                      <Music className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Configure your playlist settings and click "Generate Playlist" to get started</p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default SmartPlaylistGenerator; 
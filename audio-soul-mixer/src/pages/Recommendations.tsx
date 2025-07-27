import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Music, Play, Users, Clock, Square, ExternalLink, Brain, Sparkles } from "lucide-react";
import Layout from "../components/Layout";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { mlRecommendationsApi, Playlist, PlaylistTrack, handleApiError } from "../services/api";

// Global audio manager (same as PlaylistSearch)
let currentAudio: HTMLAudioElement | null = null;
let currentPlayingTrackId: string | null = null;

const playTrack = (trackId: string, audioUrl: string, setCurrentlyPlayingTrackId: (id: string | null) => void) => {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
  }
  
  if (currentPlayingTrackId === trackId) {
    currentAudio = null;
    currentPlayingTrackId = null;
    setCurrentlyPlayingTrackId(null);
    return;
  }
  
  currentAudio = new Audio(audioUrl);
  currentPlayingTrackId = trackId;
  setCurrentlyPlayingTrackId(trackId);
  
  currentAudio.play().catch(err => {
    console.log('Audio playback failed:', err);
    currentAudio = null;
    currentPlayingTrackId = null;
    setCurrentlyPlayingTrackId(null);
  });
  
  currentAudio.addEventListener('ended', () => {
    currentAudio = null;
    currentPlayingTrackId = null;
    setCurrentlyPlayingTrackId(null);
  });
};

interface TrackCardProps {
  track: PlaylistTrack;
  index: number;
  currentlyPlayingTrackId: string | null;
  setCurrentlyPlayingTrackId: (id: string | null) => void;
}

const TrackCard = ({ track, index, currentlyPlayingTrackId, setCurrentlyPlayingTrackId }: TrackCardProps) => {
  const artworkUrl = track.artwork?.['150x150'] || track.artwork?.['480x480'] || 
                     `https://picsum.photos/150/150?random=${track.id}`;
  
  const formatDuration = (duration: number) => {
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const audioUrl = track.previewUrl || track.audio || track.preview_url || null;
  


  return (
          <div className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors group">
                        <div className="text-sm text-gray-500 w-6">
          {index + 1}
        </div>
        
        <div className="w-12 h-12 rounded-md overflow-hidden flex-shrink-0">
          <img 
            src={artworkUrl}
            alt={track.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.src = `https://picsum.photos/150/150?random=${track.id}`;
            }}
          />
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="font-medium truncate">{track.title}</h3>
                          <p className="text-sm text-gray-600 truncate">{track.artist.name}</p>
        </div>
        
                        <div className="text-sm text-gray-500">
          {formatDuration(track.duration)}
        </div>
      
      <div className="flex gap-2">
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => {
            if (audioUrl) {
              playTrack(track.id, audioUrl, setCurrentlyPlayingTrackId);
            } else {
              alert('No audio preview available for this track');
            }
          }}
          className={`opacity-0 group-hover:opacity-100 transition-opacity ${!audioUrl ? 'opacity-50' : ''} ${currentlyPlayingTrackId === track.id ? 'bg-primary/20' : ''}`}
          title={audioUrl ? (currentlyPlayingTrackId === track.id ? "Stop track" : "Play track") : "No audio preview available"}
        >
          {currentlyPlayingTrackId === track.id ? (
            <Square className="h-4 w-4 text-primary" />
          ) : (
                            <Play className={`h-4 w-4 ${!audioUrl ? 'text-gray-400' : ''}`} />
          )}
        </Button>
        
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => {
            const searchQuery = encodeURIComponent(`${track.title} ${track.artist.name} official audio`);
            const youtubeUrl = `https://www.youtube.com/results?search_query=${searchQuery}`;
            window.open(youtubeUrl, '_blank');
          }}
          className="opacity-0 group-hover:opacity-100 transition-opacity text-green-400 hover:text-green-300"
          title="Listen full song on YouTube"
        >
          <ExternalLink className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

const Recommendations = () => {
  const navigate = useNavigate();
  const [userInput, setUserInput] = useState("");
  const [recommendedTracks, setRecommendedTracks] = useState<PlaylistTrack[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentlyPlayingTrackId, setCurrentlyPlayingTrackId] = useState<string | null>(null);

  // Cleanup audio when component unmounts
  useEffect(() => {
    return () => {
      if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
        currentAudio = null;
      }
      currentPlayingTrackId = null;
      setCurrentlyPlayingTrackId(null);
    };
  }, []);

  const handleGetRecommendations = async () => {
    if (!userInput.trim()) {
      setError("Please enter some music preferences");
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      // TODO: Replace with actual ML recommendation API call
      // For now, we'll simulate recommendations
      console.log(`🤖 Getting ML recommendations for: "${userInput}"`);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Call the actual ML recommendations API
      const response = await mlRecommendationsApi.getRecommendations({
        user_input: userInput,
        limit: 10
      });
      
      if (response.status === 'success') {
        setRecommendedTracks(response.data.recommendations);
        console.log(`✅ Generated ${response.data.recommendations.length} ML recommendations`);
      } else {
        setError('Failed to get recommendations: ' + response.message);
      }
      
    } catch (error: any) {
      console.error("❌ Recommendation error:", error);
      setError("Failed to get recommendations. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto">
                                    <div className="text-center mb-12">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <Brain className="h-8 w-8 text-blue-600" />
                  <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
                    Music <span className="text-blue-600">Recommendations</span>
                  </h1>
                </div>
                <p className="text-xl text-gray-600 mb-8">
                  Get personalized music suggestions based on your preferences
                </p>
            
                          <div className="max-w-2xl mx-auto space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input
                    placeholder="Describe your music taste, favorite artists, genres, or moods..."
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    className="pl-10 pr-4 py-3 text-lg bg-white border-gray-300 text-gray-900 placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500"
                    onKeyPress={(e) => e.key === 'Enter' && handleGetRecommendations()}
                  />
                </div>
              
              <Button 
                onClick={handleGetRecommendations}
                disabled={isLoading || !userInput.trim()}
                className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium"
                size="lg"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Get Recommendations
                  </>
                )}
              </Button>
            </div>
          </div>

          {error && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 mb-6 max-w-2xl mx-auto">
              <p className="text-destructive text-center">{error}</p>
            </div>
          )}

          {recommendedTracks.length > 0 && (
            <Card className="bg-white border-gray-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900">
                  <Sparkles className="h-5 w-5 text-blue-600" />
                  Recommended for you
                </CardTitle>
                <p className="text-gray-600">
                  Based on your preferences: "{userInput}"
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  {recommendedTracks.map((track, index) => (
                    <TrackCard 
                      key={track.id} 
                      track={track} 
                      index={index}
                      currentlyPlayingTrackId={currentlyPlayingTrackId}
                      setCurrentlyPlayingTrackId={setCurrentlyPlayingTrackId}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {isLoading && recommendedTracks.length === 0 && (
            <Card className="bg-white border-gray-200">
              <CardContent className="py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-lg font-medium mb-2">Analyzing your music taste...</p>
                  <p className="text-gray-600">Our ML model is finding the perfect tracks for you</p>
                </div>
              </CardContent>
            </Card>
          )}

          {!isLoading && recommendedTracks.length === 0 && !error && (
            <Card className="bg-white border-gray-200">
              <CardContent className="py-12">
                <div className="text-center">
                  <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-lg font-medium mb-2 text-gray-900">Ready for recommendations!</p>
                  <p className="text-gray-600">
                    Enter your music preferences above to get personalized recommendations
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Recommendations; 
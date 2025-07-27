import { useState, useEffect } from "react";
import Layout from "../components/Layout";
import SongCard from "../components/SongCard";
import SongCardSkeleton from "../components/SongCardSkeleton";

import workoutImage from "../assets/workout-mood.jpg";
import focusImage from "../assets/focus-mood.jpg";
import sadImage from "../assets/sad-mood.jpg";
import partyImage from "../assets/party-mood.jpg";
import chillImage from "../assets/chill-mood.jpg";
import upbeatImage from "../assets/upbeat-mood.jpg";
import { useParams } from "react-router-dom";

interface Mood {
  id: string;
  name: string;
  image: string;
  gradient: string;
}

interface Song {
  id: string;
  name: string;
  artists: string;
  albumArt: string;
  album_art_url: string;
  artist: string;
}

const RecommendByMood = () => {
  const [selectedMood, setSelectedMood] = useState<Mood | null>(null);
  const [playlist, setPlaylist] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { mood } = useParams();

  useEffect(() => {
    const selected = moods.find(m => m.id.toLowerCase() === mood?.toLowerCase());
    if (selected) {
      handleMoodSelect(selected);
    }
  }, [mood]);

  const moods: Mood[] = [
    {
      id: "workout",
      name: "Workout",
      image: workoutImage,
      gradient: "from-red-500/30 to-orange-500/30"
    },
    {
      id: "focus",
      name: "Focus",
      image: focusImage,
      gradient: "from-blue-500/30 to-indigo-500/30"
    },
    {
      id: "sad",
      name: "Sad",
      image: sadImage,
      gradient: "from-gray-500/30 to-blue-400/30"
    },
    {
      id: "party",
      name: "Party",
      image: partyImage,
      gradient: "from-yellow-400/30 to-orange-500/30"
    },
    {
      id: "chill",
      name: "Chill",
      image: chillImage,
      gradient: "from-green-500/30 to-teal-500/30"
    },
    {
      id: "upbeat",
      name: "Upbeat",
      image: upbeatImage,
      gradient: "from-pink-500/30 to-rose-500/30"
    },
    {
      id: "motivation",
      name: "Motivation",
      image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=600&fit=crop",
      gradient: "from-orange-400/30 to-red-400/30"
    },
    {
      id: "nostalgic",
      name: "Nostalgic",
      image: "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=800&h=600&fit=crop",
      gradient: "from-amber-400/30 to-orange-400/30"
    },
    {
      id: "energetic",
      name: "Energetic",
      image: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&h=600&fit=crop",
      gradient: "from-yellow-400/30 to-green-400/30"
    },
    {
      id: "mysterious",
      name: "Mysterious",
      image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop",
      gradient: "from-purple-500/30 to-indigo-500/30"
    },
    {
      id: "peaceful",
      name: "Peaceful",
      image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop",
      gradient: "from-cyan-400/30 to-blue-400/30"
    },
    {
      id: "adventurous",
      name: "Adventurous",
      image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop",
      gradient: "from-emerald-400/30 to-teal-400/30"
    }
  ];

  const handleMoodSelect = async (mood: Mood) => {
    setSelectedMood(mood);
    setIsLoading(true);
    setPlaylist([]);
    try {
      const moodSearchTerms: { [key: string]: string } = {
        workout: "workout motivation energetic rock",
        focus: "focus study concentration instrumental",
        sad: "sad melancholy emotional ballad",
        party: "party dance electronic upbeat",
        chill: "chill relaxing ambient peaceful",
        upbeat: "upbeat happy positive pop",
        motivation: "motivation inspiring uplifting rock",
        nostalgic: "nostalgic classic retro vintage",
        energetic: "energetic high energy rock electronic",
        mysterious: "mysterious dark atmospheric ambient",
        peaceful: "peaceful calm meditation zen",
        adventurous: "adventurous epic cinematic orchestral"
      };

      const searchTerm = moodSearchTerms[mood.id] || mood.id;
      
      const response = await fetch(`http://localhost:5000/api/playlists/recommendations/mood/${encodeURIComponent(searchTerm)}`);
      const data = await response.json();
      if (data.status === 'success' && data.data.recommendations) {
        const songsWithArt = data.data.recommendations.map((song: any, index: number) => ({
          ...song,
          artists: typeof song.artist === 'string' ? song.artist : song.artist?.name || song.artists || 'Unknown Artist',
          albumArt: song.albumArt || song.album_art_url || `https://picsum.photos/200/200?random=${mood.id}-${index}`
        }));
        setPlaylist(songsWithArt);
      } else {
        setPlaylist([]);
      }
    } catch (error) {
      console.error("Failed to fetch recommendations:", error);
      setPlaylist([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-6 py-12">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-center mb-4">
            What's the <span className="text-blue-600">Vibe</span> Today?
          </h1>
                      <p className="text-xl text-gray-600 text-center mb-12">
              Choose your mood and let us craft the perfect soundtrack
            </p>

          {/* Mood Selection Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-12">
            {moods.map((mood, index) => (
              <button
                key={mood.id}
                onClick={() => handleMoodSelect(mood)}
                className="group relative overflow-hidden rounded-2xl aspect-video glass-hover animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <img
                  src={mood.image}
                  alt={mood.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className={`absolute inset-0 bg-gradient-to-t ${mood.gradient} transition-opacity duration-300`} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <h3 className="text-2xl md:text-3xl font-bold text-white drop-shadow-lg">
                    {mood.name}
                  </h3>
                </div>
                <div className="absolute inset-0 border-2 border-transparent group-hover:border-primary/50 rounded-2xl transition-colors duration-300" />
              </button>
            ))}
          </div>

          {/* Selected Mood Playlist */}
          {selectedMood && (
            <div className="animate-fade-in">
              {/* Mood Header */}
              <div className="glass rounded-2xl p-8 mb-8 text-center">
                <div className="flex flex-col md:flex-row items-center justify-center space-y-6 md:space-y-0 md:space-x-8">
                  <div className="relative">
                    <img
                      src={selectedMood.image}
                      alt={selectedMood.name}
                      className="w-24 h-24 rounded-lg object-cover sonic-glow"
                    />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-foreground mb-2">
                      Your <span className="text-blue-600">{selectedMood.name}</span> Playlist
                    </h2>
                    <p className="text-gray-600">
                      {playlist.length} songs curated for your mood
                    </p>
                    <button
                      onClick={() => setSelectedMood(null)}
                      className="mt-4 text-blue-600 hover:text-blue-700 transition-colors"
                    >
                      Choose a different mood
                    </button>
                  </div>
                </div>
              </div>

              {/* Playlist Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                {isLoading
                  ? Array.from({ length: 10 }).map((_, index) => (
                      <SongCardSkeleton key={index} />
                    ))
                  : playlist.map((song, index) => (
                      <div
                        key={song.id}
                        className="animate-slide-up"
                        style={{ animationDelay: `${index * 0.05}s` }}
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
          )}
        </div>
      </div>
    </Layout>
  );
};

export default RecommendByMood;
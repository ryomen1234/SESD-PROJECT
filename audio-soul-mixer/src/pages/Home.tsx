import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import Layout from "../components/Layout";
import { useAuth } from "../contexts/AuthContext";
import { getUserPlaylists, getRecentlyPlayed, SavedPlaylist, RecentlyPlayed, deletePlaylist } from "../services/playlistService";

import { Music, Zap, Palette, TrendingUp, Users, Play, Headphones, Plus, Brain, Volume2, Clock, Heart, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const Home = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [userPlaylists, setUserPlaylists] = useState<SavedPlaylist[]>([]);
  const [recentlyPlayed, setRecentlyPlayed] = useState<RecentlyPlayed[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
  const [currentPlayingTrackId, setCurrentPlayingTrackId] = useState<string | null>(null);

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // Cleanup audio when component unmounts
  useEffect(() => {
    return () => {
      if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
      }
    };
  }, [currentAudio]);

  useEffect(() => {
    const fetchUserData = async () => {
      if (isAuthenticated && user) {
        try {
          const [playlists, recent] = await Promise.all([
            getUserPlaylists(user.uid),
            getRecentlyPlayed(user.uid, 12) // Increased from 6 to 12 to ensure we get 6 unique songs
          ]);
          setUserPlaylists(playlists);
          setRecentlyPlayed(recent);
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      }
      setLoading(false);
    };

    fetchUserData();
  }, [isAuthenticated, user]);

  const handlePlaylistClick = (playlist: SavedPlaylist) => {
    navigate(`/saved-playlist/${playlist.id}`);
  };

  const handleDeletePlaylist = async (playlistId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the playlist click
    if (window.confirm('Are you sure you want to delete this playlist?')) {
      try {
        // Delete from Firebase
        await deletePlaylist(playlistId);
        // Remove from local state
        setUserPlaylists(prev => prev.filter(p => p.id !== playlistId));
        console.log('Playlist deleted successfully:', playlistId);
      } catch (error) {
        console.error('Error deleting playlist:', error);
        alert('Failed to delete playlist. Please try again.');
      }
    }
  };

  const playTrack = async (track: RecentlyPlayed, e: React.MouseEvent) => {
    e.stopPropagation();
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
      if (track.preview_url) {
        const audio = new Audio(track.preview_url);
        
        audio.addEventListener('ended', () => {
          setCurrentPlayingTrackId(null);
          setCurrentAudio(null);
        });

        audio.addEventListener('error', () => {
          openFullSong(track);
          setCurrentPlayingTrackId(null);
          setCurrentAudio(null);
        });

        await audio.play();
        setCurrentAudio(audio);
        setCurrentPlayingTrackId(track.id);
      } else {
        openFullSong(track);
      }
    } catch (error) {
      console.error('Error playing track:', error);
      openFullSong(track);
    }
  };

  const openFullSong = (track: RecentlyPlayed) => {
    if (track.deezer_url) {
      window.open(track.deezer_url, '_blank');
    } else {
      alert("Full song URL is not available.");
    }
  };

  const features = [
    {
      title: "Playlist Discovery",
      description: "Browse millions of curated playlists. Find trending collections and discover new music.",
      icon: TrendingUp,
      path: "/playlists"
    },
    {
      title: "Smart Playlist Generator",
      description: "Create personalized playlists for any moment with intelligent recommendations.",
      icon: Plus,
      path: "/smart-playlist"
    },
    {
      title: "Music Recommendations",
      description: "Get personalized music suggestions based on your listening preferences.",
      icon: Brain,
      path: "/recommendations"
    },
    {
      title: "Song-Based Discovery",
      description: "Find similar songs based on your favorites using advanced music analysis.",
      icon: Music,
      path: "/recommend-by-song"
    },
    {
      title: "Mood Matching",
      description: "Get playlists tailored to your current mood and activity.",
      icon: Zap,
      path: "/recommend-by-mood"
    },
    {
      title: "Audio Alchemist",
      description: "Mix musical attributes to create custom playlists with real-time integration.",
      icon: Palette,
      path: "/audio-alchemist"
    },
  ];

  const getArtworkUrl = (artwork: any): string => {
    if (typeof artwork === 'string') return artwork;
    if (artwork?.['480x480']) return artwork['480x480'];
    if (artwork?.['150x150']) return artwork['150x150'];
    return '';
  };


  return (
    <Layout>
      <div className="min-h-screen">
        <section className="relative px-6 py-12 overflow-hidden bg-gray-50">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-gray-100" />
          
          <div className="relative z-10 max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-1 gap-12 items-center">
              <motion.div 
                className="text-center lg:text-left space-y-8"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <div>
                  <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6">
                    Craft Your Perfect
                    <motion.span 
                      className="block text-blue-600"
                    >
                      Musical Journey
                    </motion.span>
                  </h1>
                </div>
                
                <p className="text-xl md:text-2xl text-gray-600 mb-8">
                  Discover your next favorite song with intelligent music recommendations.
                  <br />
                  <span className="text-blue-600">Explore millions of tracks from around the world.</span>
                </p>

                <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                  <Button 
                    asChild 
                    size="lg" 
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3"
                  >
                    <Link to="/playlists">
                      <Play className="mr-2 h-5 w-5" />
                      Start Exploring
                    </Link>
                  </Button>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {isAuthenticated && !loading && (
          <>
            {recentlyPlayed.length > 0 && (
              <section className="py-16 px-6 bg-gray-50">
                <div className="max-w-7xl mx-auto">
                  <motion.div 
                    className="mb-12"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                  >
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                      Recently Played
                    </h2>
                    <p className="text-lg text-gray-600">
                      Continue where you left off
                    </p>
                  </motion.div>

                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                    {recentlyPlayed.map((track, index) => (
                      <motion.div
                        key={track.id}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.1, duration: 0.5 }}
                        className="group cursor-pointer"
                        onClick={(e) => playTrack(track, e)}
                      >
                        <Card className="bg-white border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300">
                          <CardContent className="p-4">
                            <div className="aspect-square mb-3 relative overflow-hidden rounded-lg">
                              <img 
                                src={getArtworkUrl(track.artwork) || `https://picsum.photos/300/300?random=${track.id}`} 
                                alt={track.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                onError={(e) => {
                                  e.currentTarget.src = `https://picsum.photos/300/300?random=${track.id}`;
                                }}
                              />
                              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center">
                                {currentPlayingTrackId === track.id ? (
                                  <div className="w-8 h-8 bg-red-500 rounded-sm" />
                                ) : (
                                  <Play className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                )}
                              </div>
                            </div>
                            <h3 className="font-medium text-gray-900 text-sm truncate">
                              {track.title}
                            </h3>
                            <p className="text-gray-500 text-xs truncate">
                              {track.artist}
                            </p>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </section>
            )}

            {userPlaylists.length > 0 && (
              <section className="py-16 px-6 bg-white">
                <div className="max-w-7xl mx-auto">
                  <motion.div 
                    className="mb-12"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                  >
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                      Your Playlists
                    </h2>
                    <p className="text-lg text-gray-600">
                      Your saved playlists
                    </p>
                  </motion.div>

                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {userPlaylists.slice(0, 6).map((playlist, index) => (
                      <motion.div
                        key={playlist.id}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.1, duration: 0.5 }}
                        className="group cursor-pointer"
                      >
                        <Card className="bg-white border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300 cursor-pointer" onClick={() => handlePlaylistClick(playlist)}>
                          <CardContent className="p-6">
                            <div className="flex items-center space-x-4 mb-4">
                              <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                                <img
                                  src={getArtworkUrl(playlist.tracks?.[0]?.artwork) || getArtworkUrl(playlist.artwork) || `https://picsum.photos/48/48?random=${playlist.id}`}
                                  alt={playlist.name}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.currentTarget.src = `https://picsum.photos/48/48?random=${playlist.id}`;
                                  }}
                                />
                              </div>
                              <div className="flex-1">
                                <h3 className="font-semibold text-gray-900 truncate">
                                  {playlist.name}
                                </h3>
                                <p className="text-gray-500 text-sm">
                                  {playlist.trackCount} tracks
                                </p>
                              </div>
                              <button
                                onClick={(e) => handleDeletePlaylist(playlist.id, e)}
                                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                                title="Delete playlist"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                            <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                              {playlist.description}
                            </p>
                            <div className="flex items-center justify-between text-xs text-gray-500">
                              <span>{playlist.duration} min</span>
                              <span>{new Date(playlist.createdAt.toDate()).toLocaleDateString()}</span>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>

                  {userPlaylists.length > 6 && (
                    <div className="text-center mt-8">
                      <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50">
                        View All Playlists
                      </Button>
                    </div>
                  )}
                </div>
              </section>
            )}
          </>
        )}

        <section className="py-20 px-6 bg-white">
          <div className="max-w-7xl mx-auto">
            <motion.div 
              className="text-center mb-16"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Choose Your Musical Adventure
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Six powerful ways to discover music, each designed for different moods and moments.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.2, duration: 0.6 }}
                  whileHover={{ scale: 1.05, y: -10 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {feature.path.startsWith('#') ? (
                    <a 
                      href={feature.path}
                      className="block h-full"
                      onClick={(e) => {
                        e.preventDefault();
                        const targetId = feature.path.substring(1);
                        const element = document.getElementById(targetId);
                        if (element) {
                          element.scrollIntoView({ behavior: 'auto' });
                        }
                      }}
                    >
                      <Card className="h-full bg-white border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300">
                        <CardContent className="p-8 text-center space-y-6">
                          <div className="inline-flex p-4 rounded-full bg-blue-100 text-blue-600">
                            <feature.icon className="h-8 w-8" />
                          </div>
                          
                          <h3 className="text-xl font-bold text-gray-900">
                            {feature.title}
                          </h3>
                          
                          <p className="text-gray-600 leading-relaxed">
                            {feature.description}
                          </p>
                          
                          <div className="flex items-center justify-center">
                            <div className="text-sm font-medium text-blue-600 transition-opacity">
                            Explore Now →
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </a>
                  ) : (
                    <Link to={feature.path} className="block h-full">
                      <Card className="h-full bg-white border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300">
                        <CardContent className="p-8 text-center space-y-6">
                          <div className="inline-flex p-4 rounded-full bg-blue-100 text-blue-600">
                            <feature.icon className="h-8 w-8" />
                          </div>
                          
                          <h3 className="text-xl font-bold text-gray-900">
                            {feature.title}
                          </h3>
                          
                          <p className="text-gray-600 leading-relaxed">
                            {feature.description}
                          </p>
                          
                          <div className="flex items-center justify-center">
                            <div className="text-sm font-medium text-blue-600 transition-opacity">
                            Explore Now →
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 px-6 bg-gray-50">
          <motion.div 
            className="text-center max-w-4xl mx-auto space-y-8"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900">
              Ready to Discover New Music?
            </h2>
            
            <p className="text-xl text-gray-600">
              Start exploring millions of tracks with intelligent recommendations and real music previews.
            </p>
            
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button 
                asChild 
                size="lg" 
                className="bg-blue-600 hover:bg-blue-700 text-white px-12 py-4 text-lg"
              >
                <Link to="/playlists">
                  <Music className="mr-2 h-6 w-6" />
                  Start Your Journey Now
                </Link>
              </Button>
            </motion.div>
          </motion.div>
        </section>
      </div>
    </Layout>
  );
};

export default Home;
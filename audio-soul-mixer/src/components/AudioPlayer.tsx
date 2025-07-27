import { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { saveRecentlyPlayed } from '@/services/playlistService';
import { Button } from './ui/button';
import { Slider } from './ui/slider';

interface AudioPlayerProps {
  audioUrl?: string;
  title?: string;
  artist?: string;
  onPlay?: () => void;
  onPause?: () => void;
  onEnded?: () => void;
  className?: string;
}

const AudioPlayer = ({ 
  audioUrl, 
  title, 
  artist, 
  onPlay, 
  onPause, 
  onEnded,
  className = "" 
}: AudioPlayerProps) => {
  const { user, isAuthenticated } = useAuth();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.2); // Set default volume to 20%
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement>(null);

  // Set default volume on mount
  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.volume = 0.2;
    }
  }, []);

  // Update current time
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handlePlay = async () => {
      setIsPlaying(true);
      onPlay?.();
      
      // Save to recently played if user is authenticated and we have track info
      if (isAuthenticated && user && title && artist && audioUrl) {
        try {
          await saveRecentlyPlayed({
            userId: user.uid,
            trackId: audioUrl, // Using audioUrl as ID for simplicity
            title,
            artist,
            artwork: {
              '150x150': '',
              '480x480': '',
              '1000x1000': ''
            }, // Provide empty artwork object to match expected type
            duration: Math.round(duration),
            preview_url: audioUrl
          });
        } catch (error) {
          console.error('Failed to save recently played track:', error);
        }
      }
    };
    const handlePause = () => {
      setIsPlaying(false);
      onPause?.();
    };
    const handleEnded = () => {
      setIsPlaying(false);
      onEnded?.();
    };
    const handleLoadStart = () => setIsLoading(true);
    const handleCanPlay = () => setIsLoading(false);
    const handleError = () => {
      setError('Failed to load audio');
      setIsLoading(false);
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('loadstart', handleLoadStart);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('loadstart', handleLoadStart);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('error', handleError);
    };
  }, [onPlay, onPause, onEnded, isAuthenticated, user, title, artist, audioUrl, duration]);

  // Handle play/pause
  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch(err => {
        console.error('Failed to play audio:', err);
        setError('Failed to play audio');
      });
    }
  };

  // Handle seek
  const handleSeek = (value: number[]) => {
    const audio = audioRef.current;
    if (!audio) return;
    
    const newTime = (value[0] / 100) * duration;
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  // Handle volume change
  const handleVolumeChange = (value: number[]) => {
    const audio = audioRef.current;
    if (!audio) return;
    
    const newVolume = value[0] / 100;
    audio.volume = newVolume;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  // Handle mute toggle
  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;
    
    if (isMuted) {
      audio.volume = volume;
      setIsMuted(false);
    } else {
      audio.volume = 0;
      setIsMuted(true);
    }
  };

  // Format time
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // If no audio URL, show a placeholder
  if (!audioUrl) {
    return (
      <div className={`flex items-center gap-3 p-3 rounded-lg bg-gray-50 ${className}`}>
        <Button 
          size="icon" 
          variant="ghost" 
          disabled
          className="w-10 h-10"
        >
          <Play className="h-4 w-4" />
        </Button>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">
            {title || 'No audio available'}
          </p>
          {artist && (
            <p className="text-xs text-gray-500 truncate">
              {artist}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-3 p-3 rounded-lg bg-gray-50 ${className}`}>
      {/* Play/Pause Button */}
      <Button 
        size="icon" 
        variant="ghost" 
        onClick={togglePlay}
        disabled={isLoading}
        className="w-10 h-10"
      >
        {isLoading ? (
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
        ) : isPlaying ? (
          <Pause className="h-4 w-4" />
        ) : (
          <Play className="h-4 w-4" />
        )}
      </Button>

      {/* Track Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">
          {title || 'Unknown Track'}
        </p>
        {artist && (
                  <p className="text-xs text-gray-500 truncate">
          {artist}
        </p>
        )}
      </div>

      {/* Progress Bar */}
      <div className="flex-1 max-w-32">
        <Slider
          value={[duration > 0 ? (currentTime / duration) * 100 : 0]}
          onValueChange={handleSeek}
          max={100}
          step={0.1}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Volume Control */}
      <div className="flex items-center gap-2">
        <Button
          size="icon"
          variant="ghost"
          onClick={toggleMute}
          className="w-8 h-8"
        >
          {isMuted ? (
            <VolumeX className="h-3 w-3" />
          ) : (
            <Volume2 className="h-3 w-3" />
          )}
        </Button>
        <Slider
          value={[isMuted ? 0 : volume * 100]}
          onValueChange={handleVolumeChange}
          max={100}
          className="w-16"
        />
      </div>

      {/* Hidden Audio Element */}
      <audio
        ref={audioRef}
        src={audioUrl}
        preload="metadata"
        onError={() => setError('Failed to load audio')}
      />

      {/* Error Display */}
      {error && (
        <div className="absolute top-full left-0 right-0 mt-2 p-2 bg-destructive/10 border border-destructive/20 rounded text-xs text-destructive">
          {error}
        </div>
      )}
    </div>
  );
};

export default AudioPlayer; 
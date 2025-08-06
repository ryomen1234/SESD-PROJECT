import { Play, Pause } from "lucide-react";
import { Button } from "./ui/button";

interface SongCardProps {
  title: string;
  artist: string | { id: string; name: string };
  albumArt: string;
  isPlaying: boolean;
  onPlay?: () => void;
}

const SongCard = ({ title, artist, albumArt, isPlaying, onPlay }: SongCardProps) => {
  return (
    <div className="bg-white rounded-lg p-4 group border border-gray-200 hover:border-gray-300 transition-colors shadow-sm hover:shadow-md">
      <div className="relative mb-3">
        <img
          src={albumArt}
          alt={`${title} by ${typeof artist === 'string' ? artist : artist.name}`}
          className="w-full aspect-square object-cover rounded-md"
          onError={(e) => {
            e.currentTarget.src = `https://picsum.photos/300/300?random=${title}`;
          }}
        />
        <Button
          size="icon"
          variant="secondary"
          className={`absolute top-2 right-2 transition-all duration-300 bg-blue-600/20 backdrop-blur-sm hover:bg-blue-600/30 border-0 ${isPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
          onClick={onPlay}
        >
          {isPlaying ? (
            <Pause className="h-4 w-4 text-white" />
          ) : (
            <Play className="h-4 w-4 text-blue-600" />
          )}
        </Button>
      </div>
      
      <div className="space-y-1">
        <h3 className="font-medium text-sm text-gray-900 line-clamp-1">
          {title}
        </h3>
        <p className="text-xs text-gray-600 line-clamp-1">
          {typeof artist === 'string' ? artist : artist.name}
        </p>
      </div>
    </div>
  );
};

export default SongCard;
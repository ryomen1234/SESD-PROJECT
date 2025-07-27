import React from 'react';
import { Play, Users, Music } from 'lucide-react';

interface PlaylistCardProps {
  playlist: {
    id: string;
    name: string;
    description?: string;
    user?: {
      name: string;
    };
    trackCount?: number;
    artwork?: {
      '480x480'?: string;
      '1000x1000'?: string;
    };
  };
  onClick?: () => void;
}

const PlaylistCard: React.FC<PlaylistCardProps> = ({ playlist, onClick }) => {
  const artworkUrl = playlist.artwork?.['480x480'] || playlist.artwork?.['1000x1000'] || 
                     `https://picsum.photos/300/300?random=${playlist.id}`;

  return (
    <div 
      className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer group h-full flex flex-col"
      onClick={onClick}
    >
      <div className="p-4 flex flex-col h-full">
        <div className="aspect-square rounded-lg overflow-hidden mb-3">
          <img 
            src={artworkUrl}
            alt={playlist.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              e.currentTarget.src = `https://picsum.photos/300/300?random=${playlist.id}`;
            }}
          />
        </div>
        
        <div className="flex-1 flex flex-col">
          <h3 className="text-base font-semibold text-gray-900 mb-1 leading-tight line-clamp-2">
            {playlist.name || 'Untitled Playlist'}
          </h3>
          
          <div className="space-y-1 text-xs text-gray-600 mb-2">
            {playlist.user && (
              <p className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                {playlist.user.name}
              </p>
            )}
            
            {playlist.trackCount && (
              <p className="flex items-center gap-1">
                <Music className="h-3 w-3" />
                {playlist.trackCount} tracks
              </p>
            )}
          </div>

          {playlist.description && (
            <p className="text-xs text-gray-500 line-clamp-2 mb-3 flex-1">
              {playlist.description}
            </p>
          )}
          
          <button className="w-full py-2 px-3 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors mt-auto">
            View Tracks
          </button>
        </div>
      </div>
    </div>
  );
};

export default PlaylistCard; 
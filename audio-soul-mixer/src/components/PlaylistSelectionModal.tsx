import React, { useState, useEffect } from 'react';
import { X, Plus, Music } from 'lucide-react';
import { getUserPlaylistsUpdated, addSongToPlaylist, addSongsToPlaylist, savePlaylist } from '../services/playlistService';
import { SavedPlaylist, PlaylistTrack } from '../services/playlistService';

interface PlaylistSelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  songs: PlaylistTrack[];
  onSuccess: () => void;
}

const PlaylistSelectionModal: React.FC<PlaylistSelectionModalProps> = ({
  isOpen,
  onClose,
  songs,
  onSuccess
}) => {
  const [playlists, setPlaylists] = useState<SavedPlaylist[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string>('');
  const [showCreateNew, setShowCreateNew] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadPlaylists();
    }
  }, [isOpen]);

  const loadPlaylists = async () => {
    try {
      setLoading(true);
      const userPlaylists = await getUserPlaylistsUpdated();
      setPlaylists(userPlaylists);
    } catch (error) {
      console.error('Error loading playlists:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveToExistingPlaylist = async () => {
    if (!selectedPlaylistId) {
      alert('Please select a playlist');
      return;
    }

    try {
      setSaving(true);
      if (songs.length === 1) {
        await addSongToPlaylist(selectedPlaylistId, songs[0]);
      } else {
        await addSongsToPlaylist(selectedPlaylistId, songs);
      }
      alert(`Successfully added ${songs.length} song(s) to playlist!`);
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving to playlist:', error);
      alert(error instanceof Error ? error.message : 'Failed to save to playlist');
    } finally {
      setSaving(false);
    }
  };

  const handleCreateNewPlaylist = async () => {
    if (!newPlaylistName.trim()) {
      alert('Please enter a playlist name');
      return;
    }

    try {
      setSaving(true);
      const playlistData = {
        name: newPlaylistName.trim(),
        description: `Playlist created from recommendations`,
        tracks: songs,
        userId: '', // Will be set by the service
        duration: Math.round(songs.reduce((total, song) => total + (song.duration || 0), 0) / 60),
        trackCount: songs.length,
        artwork: songs[0]?.artwork || {},
        genre: 'Mixed',
        mood: 'Mixed',
        source: 'recommendations'
      };

      await savePlaylist(playlistData);
      alert(`Successfully created playlist "${newPlaylistName}" with ${songs.length} song(s)!`);
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error creating playlist:', error);
      alert('Failed to create playlist');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">
            Save to Playlist
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="mb-4">
          <p className="text-gray-600 mb-2">
            {songs.length === 1 
              ? `Save "${songs[0].title}" to:`
              : `Save ${songs.length} songs to:`
            }
          </p>
        </div>

        {/* Existing Playlists */}
        <div className="mb-4">
          <h3 className="font-semibold text-gray-900 mb-2">Existing Playlists</h3>
          {loading ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          ) : playlists.length > 0 ? (
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {playlists.map((playlist) => (
                <label
                  key={playlist.id}
                  className="flex items-center space-x-3 p-2 rounded-lg border cursor-pointer hover:bg-gray-50"
                >
                  <input
                    type="radio"
                    name="playlist"
                    value={playlist.id}
                    checked={selectedPlaylistId === playlist.id}
                    onChange={(e) => setSelectedPlaylistId(e.target.value)}
                    className="text-blue-600"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{playlist.name}</div>
                    <div className="text-sm text-gray-500">
                      {playlist.tracks?.length || 0} songs
                    </div>
                  </div>
                </label>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-gray-500">
              No playlists found
            </div>
          )}
        </div>

        {/* Create New Playlist */}
        <div className="mb-6">
          <button
            onClick={() => setShowCreateNew(!showCreateNew)}
            className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium"
          >
            <Plus className="h-4 w-4" />
            <span>Create New Playlist</span>
          </button>

          {showCreateNew && (
            <div className="mt-3 p-3 border rounded-lg">
              <input
                type="text"
                placeholder="Enter playlist name..."
                value={newPlaylistName}
                onChange={(e) => setNewPlaylistName(e.target.value)}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          
          {showCreateNew ? (
            <button
              onClick={handleCreateNewPlaylist}
              disabled={saving || !newPlaylistName.trim()}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Creating...' : 'Create & Save'}
            </button>
          ) : (
            <button
              onClick={handleSaveToExistingPlaylist}
              disabled={saving || !selectedPlaylistId}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Saving...' : 'Save to Playlist'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlaylistSelectionModal; 
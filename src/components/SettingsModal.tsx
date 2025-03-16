import React, { useState, useEffect } from 'react';
import { X, Settings, Shuffle, Heart, List, Plus, Music } from 'lucide-react';
import { SaveDestination, UserPlaylist } from '../types';
import { getUserPlaylists, createPlaylist } from '../utils/spotify';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  saveDestination: SaveDestination;
  onChangeSaveDestination: (destination: SaveDestination) => void;
  selectedPlaylistId: string;
  onSelectPlaylist: (playlistId: string) => void;
  shuffleMode: boolean;
  onToggleShuffle: () => void;
  hideAlreadyLiked: boolean;
  onToggleHideAlreadyLiked: () => void;
  onCreateNewPlaylist: (name: string) => Promise<void>;
}

const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  saveDestination,
  onChangeSaveDestination,
  selectedPlaylistId,
  onSelectPlaylist,
  shuffleMode,
  onToggleShuffle,
  hideAlreadyLiked,
  onToggleHideAlreadyLiked,
  onCreateNewPlaylist
}) => {
  const [userPlaylists, setUserPlaylists] = useState<UserPlaylist[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [showNewPlaylistInput, setShowNewPlaylistInput] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchUserPlaylists();
    }
  }, [isOpen]);

  const fetchUserPlaylists = async () => {
    setIsLoading(true);
    try {
      const playlists = await getUserPlaylists();
      setUserPlaylists(playlists);
    } catch (error) {
      console.error('Error fetching playlists:', error);
    }
    setIsLoading(false);
  };

  const handleCreatePlaylist = async () => {
    if (!newPlaylistName.trim()) {
      setError('Please enter a playlist name');
      return;
    }

    setError('');
    await onCreateNewPlaylist(newPlaylistName);
    setNewPlaylistName('');
    setShowNewPlaylistInput(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-4 border-b border-gray-800">
          <div className="flex items-center">
            <Settings size={20} className="text-green-500 mr-2" />
            <h2 className="text-xl font-bold text-white">Settings</h2>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-4 space-y-6">
          {/* Save Destination */}
          <div>
            <h3 className="text-white font-semibold mb-3">Save liked tracks to:</h3>
            <div className="space-y-2">
              <label className="flex items-center space-x-2 text-gray-300 hover:text-white cursor-pointer">
                <input 
                  type="radio" 
                  name="saveDestination" 
                  checked={saveDestination === 'library'} 
                  onChange={() => onChangeSaveDestination('library')}
                  className="text-green-500 focus:ring-green-500"
                />
                <Heart size={16} className="text-pink-500" />
                <span>Spotify Liked Songs</span>
              </label>
              
              <label className="flex items-center space-x-2 text-gray-300 hover:text-white cursor-pointer">
                <input 
                  type="radio" 
                  name="saveDestination" 
                  checked={saveDestination === 'playlist'} 
                  onChange={() => onChangeSaveDestination('playlist')}
                  className="text-green-500 focus:ring-green-500"
                />
                <List size={16} className="text-blue-500" />
                <span>Existing Playlist</span>
              </label>
              
              <label className="flex items-center space-x-2 text-gray-300 hover:text-white cursor-pointer">
                <input 
                  type="radio" 
                  name="saveDestination" 
                  checked={saveDestination === 'new-playlist'} 
                  onChange={() => onChangeSaveDestination('new-playlist')}
                  className="text-green-500 focus:ring-green-500"
                />
                <Plus size={16} className="text-green-500" />
                <span>Create New Playlist</span>
              </label>
            </div>
          </div>

          {/* Playlist Selection */}
          {saveDestination === 'playlist' && (
            <div>
              <h3 className="text-white font-semibold mb-3">Select Playlist:</h3>
              {isLoading ? (
                <p className="text-gray-400">Loading your playlists...</p>
              ) : userPlaylists.length === 0 ? (
                <p className="text-gray-400">No playlists found</p>
              ) : (
                <div className="max-h-48 overflow-y-auto space-y-2 pr-2">
                  {userPlaylists.map(playlist => (
                    <label 
                      key={playlist.id}
                      className="flex items-center space-x-2 text-gray-300 hover:text-white cursor-pointer p-2 rounded hover:bg-gray-800"
                    >
                      <input 
                        type="radio" 
                        name="playlist" 
                        checked={selectedPlaylistId === playlist.id} 
                        onChange={() => onSelectPlaylist(playlist.id)}
                        className="text-green-500 focus:ring-green-500"
                      />
                      {playlist.images?.[0]?.url ? (
                        <img 
                          src={playlist.images[0].url} 
                          alt={playlist.name} 
                          className="w-8 h-8 rounded"
                        />
                      ) : (
                        <div className="w-8 h-8 bg-gray-700 rounded flex items-center justify-center">
                          <Music size={16} className="text-gray-400" />
                        </div>
                      )}
                      <div className="truncate">
                        <span>{playlist.name}</span>
                        <span className="text-xs text-gray-500 ml-1">({playlist.tracks.total} tracks)</span>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* New Playlist Creation */}
          {saveDestination === 'new-playlist' && (
            <div>
              <h3 className="text-white font-semibold mb-3">Create New Playlist:</h3>
              <div className="space-y-2">
                <input 
                  type="text"
                  value={newPlaylistName}
                  onChange={(e) => setNewPlaylistName(e.target.value)}
                  placeholder="Enter playlist name"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                {error && <p className="text-red-500 text-sm">{error}</p>}
                <button
                  onClick={handleCreatePlaylist}
                  className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg w-full"
                >
                  Create Playlist
                </button>
              </div>
            </div>
          )}

          {/* Other Settings */}
          <div className="space-y-4 pt-2 border-t border-gray-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Shuffle size={18} className="text-blue-400" />
                <span className="text-white">Shuffle Tracks</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={shuffleMode} 
                  onChange={onToggleShuffle}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
              </label>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Heart size={18} className="text-pink-500" />
                <span className="text-white">Hide Already Liked Tracks</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={hideAlreadyLiked} 
                  onChange={onToggleHideAlreadyLiked}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
              </label>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-gray-800">
          <button
            onClick={onClose}
            className="w-full bg-gray-800 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded-lg"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
import React, { useState } from 'react';
import { Music, ArrowRight } from 'lucide-react';
import { extractPlaylistId } from '../utils/spotify';

interface PlaylistInputProps {
  onPlaylistSubmit: (playlistId: string) => void;
}

const PlaylistInput: React.FC<PlaylistInputProps> = ({ onPlaylistSubmit }) => {
  const [playlistUrl, setPlaylistUrl] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const playlistId = extractPlaylistId(playlistUrl);
    
    if (!playlistId) {
      setError('Please enter a valid Spotify playlist URL');
      return;
    }
    
    setError('');
    onPlaylistSubmit(playlistId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 to-black flex flex-col items-center justify-center p-4">
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <Music size={48} className="text-green-500" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">Enter a Spotify Playlist</h1>
        <p className="text-gray-300">Paste a Spotify playlist link to start swiping</p>
      </div>
      
      <div className="bg-black/30 backdrop-blur-md p-6 rounded-xl shadow-2xl max-w-md w-full">
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <input
              type="text"
              value={playlistUrl}
              onChange={(e) => setPlaylistUrl(e.target.value)}
              placeholder="https://open.spotify.com/playlist/..."
              className="w-full bg-gray-800 text-white border border-gray-700 rounded-lg py-3 px-4 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            {error && <p className="text-red-500 mt-2 text-sm">{error}</p>}
          </div>
          
          <button 
            type="submit"
            className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-lg flex items-center justify-center transition-colors"
          >
            Start Swiping
            <ArrowRight className="ml-2" size={20} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default PlaylistInput;
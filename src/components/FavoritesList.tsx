import React from 'react';
import { FavoriteTrack } from '../types';
import { Music, Trash2 } from 'lucide-react';

interface FavoritesListProps {
  favorites: FavoriteTrack[];
  onRemoveFavorite: (id: string) => void;
  onPlayTrack: (uri: string) => void;
}

const FavoritesList: React.FC<FavoritesListProps> = ({ favorites, onRemoveFavorite, onPlayTrack }) => {
  if (favorites.length === 0) {
    return (
      <div className="text-center p-8">
        <Music size={48} className="text-gray-500 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-300 mb-2">No favorites yet</h3>
        <p className="text-gray-400">Swipe right on songs you like to add them here</p>
      </div>
    );
  }

  return (
    <div className="overflow-y-auto max-h-[calc(100vh-200px)]">
      <h2 className="text-xl font-bold text-white mb-4 px-4">Your Favorites</h2>
      <div className="space-y-2 px-2">
        {favorites.map((track) => (
          <div 
            key={track.id}
            className="bg-gray-800 rounded-lg p-3 flex items-center hover:bg-gray-700 transition-colors"
          >
            <img 
              src={track.albumImage} 
              alt={track.albumName} 
              className="w-12 h-12 rounded object-cover mr-3"
            />
            
            <div className="flex-1 min-w-0">
              <h3 className="text-white font-medium truncate">{track.name}</h3>
              <p className="text-gray-400 text-sm truncate">{track.artists}</p>
            </div>
            
            <div className="flex space-x-2">
              <button 
                onClick={() => onPlayTrack(track.uri)}
                className="text-green-500 hover:text-green-400 p-2"
                title="Play"
              >
                <Music size={18} />
              </button>
              
              <button 
                onClick={() => onRemoveFavorite(track.id)}
                className="text-red-500 hover:text-red-400 p-2"
                title="Remove"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FavoritesList;
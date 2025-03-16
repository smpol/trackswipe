import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import PlaylistInput from './components/PlaylistInput';
import SwipeInterface from './components/SwipeInterface';
import { getTokenFromUrl, setAccessToken } from './utils/spotify';

function App() {
  const [token, setToken] = useState<string>('');
  const [playlistId, setPlaylistId] = useState<string>('');

  useEffect(() => {
    // Check if token is in URL hash
    const hash = getTokenFromUrl();
    const _token = hash.access_token;
    
    if (_token) {
      setToken(_token);
      setAccessToken(_token);
      
      // Store token in session storage
      sessionStorage.setItem('spotify_token', _token);
    } else {
      // Check if token is in session storage
      const storedToken = sessionStorage.getItem('spotify_token');
      if (storedToken) {
        setToken(storedToken);
        setAccessToken(storedToken);
      }
    }
  }, []);

  const handlePlaylistSubmit = (id: string) => {
    setPlaylistId(id);
  };

  const handleLogout = () => {
    setToken('');
    setPlaylistId('');
    sessionStorage.removeItem('spotify_token');
  };

  if (!token) {
    return <Login />;
  }

  if (!playlistId) {
    return <PlaylistInput onPlaylistSubmit={handlePlaylistSubmit} />;
  }

  return (
    <SwipeInterface 
      playlistId={playlistId} 
      token={token} 
      onLogout={handleLogout} 
    />
  );
}

export default App;
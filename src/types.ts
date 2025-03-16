export interface SpotifyTrack {
  id: string;
  name: string;
  artists: Array<{ name: string }>;
  album: {
    name: string;
    images: Array<{ url: string }>;
  };
  duration_ms: number;
  uri: string;
}

export interface FavoriteTrack {
  id: string;
  name: string;
  artists: string;
  albumName: string;
  albumImage: string;
  uri: string;
}

export interface UserPlaylist {
  id: string;
  name: string;
  images: Array<{ url: string }>;
  tracks: {
    total: number;
  };
}

export type SaveDestination = 'library' | 'playlist' | 'new-playlist';
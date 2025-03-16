import SpotifyWebApi from "spotify-web-api-js";
import { SpotifyTrack, UserPlaylist } from "../types";

const spotifyApi = new SpotifyWebApi();

// Extract playlist ID from Spotify URL
export const extractPlaylistId = (url: string): string | null => {
  const regex = /playlist\/([a-zA-Z0-9]+)/;
  const match = url.match(regex);
  return match ? match[1] : null;
};

// Set access token
export const setAccessToken = (token: string) => {
  spotifyApi.setAccessToken(token);
};

// Get playlist tracks with pagination to handle more than 100 songs
export const getPlaylistTracks = async (
  playlistId: string
): Promise<SpotifyTrack[]> => {
  try {
    let tracks: SpotifyTrack[] = [];
    let offset = 0;
    const limit = 100;
    let hasMoreTracks = true;

    while (hasMoreTracks) {
      const response = await spotifyApi.getPlaylistTracks(playlistId, {
        offset: offset,
        limit: limit,
        fields:
          "items(track(id,name,artists(name),album(name,images),duration_ms,uri)),total",
      });

      const newTracks = response.items
        .filter((item) => item.track) // Filter out null tracks
        .map((item) => item.track as SpotifyTrack);

      tracks = [...tracks, ...newTracks];

      // Check if we've received all tracks
      if (response.items.length < limit) {
        hasMoreTracks = false;
      } else {
        offset += limit;
      }
    }

    return tracks;
  } catch (error) {
    console.error("Error fetching playlist tracks:", error);
    return [];
  }
};

export const checkTrackInLibrary = async (
  trackId: string
): Promise<boolean> => {
  try {
    const response = await spotifyApi.containsMySavedTracks([trackId]);
    console.log(response);
    return response[0];
  } catch (error) {
    console.error("Error checking track in library:", error);
    return false;
  }
};

async function isTrackInPlaylist(
  spotifyApi: SpotifyWebApi.SpotifyWebApiJs,
  playlistId: string,
  trackId: string
): Promise<boolean> {
  let offset = 0;
  const limit = 100;

  try {
    while (true) {
      const response = await spotifyApi.getPlaylistTracks(playlistId, {
        limit,
        offset,
      });

      // Check if the track is in the fetched part of the playlist
      if (response.items.some((item) => item.track.id === trackId)) {
        return true;
      }

      // If the number of fetched tracks is less than the limit, we've reached the end
      if (response.items.length < limit) {
        return false;
      }

      // Increase the offset to fetch the next 100 tracks
      offset += limit;
    }
  } catch (error) {
    console.error("Error checking track in playlist:", error);
    return false;
  }
}

// Add track to user's Spotify library
export const addTrackToLibrary = async (trackId: string): Promise<boolean> => {
  try {
    if (await checkTrackInLibrary(trackId)) {
      return true;
    }
    await spotifyApi.addToMySavedTracks({ ids: [trackId] });
    return true;
  } catch (error) {
    console.error("Error adding track to library:", error);
    return false;
  }
};

// Add track to playlist
export const addTrackToPlaylist = async (
  trackId: string,
  playlistId: string
): Promise<boolean> => {
  try {
    if (await isTrackInPlaylist(spotifyApi, playlistId, trackId)) {
      return true;
    }
    await spotifyApi.addTracksToPlaylist(playlistId, [
      `spotify:track:${trackId}`,
    ]);
    return true;
  } catch (error) {
    console.error("Error adding track to playlist:", error);
    return false;
  }
};

// Check if tracks are in user's Spotify library
export const checkTracksInLibrary = async (
  trackIds: string[]
): Promise<boolean[]> => {
  try {
    const response = await spotifyApi.containsMySavedTracks(trackIds);
    return response;
  } catch (error) {
    console.error("Error checking tracks in library:", error);
    return trackIds.map(() => false);
  }
};

// Remove track from user's Spotify library
export const removeTrackFromLibrary = async (
  trackId: string
): Promise<boolean> => {
  try {
    await spotifyApi.removeFromMySavedTracks({ ids: [trackId] });
    return true;
  } catch (error) {
    console.error("Error removing track from library:", error);
    return false;
  }
};

// Get user's playlists with pagination
export const getUserPlaylists = async (): Promise<UserPlaylist[]> => {
  try {
    let playlists: UserPlaylist[] = [];
    let offset = 0;
    const limit = 50;
    let hasMorePlaylists = true;

    while (hasMorePlaylists) {
      const response = await spotifyApi.getUserPlaylists(undefined, {
        limit: limit,
        offset: offset,
      });

      playlists = [...playlists, ...response.items];

      if (response.items.length < limit) {
        hasMorePlaylists = false;
      } else {
        offset += limit;
      }
    }

    return playlists;
  } catch (error) {
    console.error("Error fetching user playlists:", error);
    return [];
  }
};

// Create a new playlist
export const createPlaylist = async (
  name: string,
  description: string = ""
): Promise<string | null> => {
  try {
    const user = await spotifyApi.getMe();
    const response = await spotifyApi.createPlaylist(user.id, {
      name,
      description,
      public: false,
    });
    return response.id;
  } catch (error) {
    console.error("Error creating playlist:", error);
    return null;
  }
};

// Add tracks to a playlist with batching
export const addTracksToPlaylist = async (
  playlistId: string,
  trackUris: string[]
): Promise<boolean> => {
  try {
    // Add tracks in batches of 100 (Spotify API limit)
    const batchSize = 100;
    for (let i = 0; i < trackUris.length; i += batchSize) {
      const batch = trackUris.slice(i, i + batchSize);
      await spotifyApi.addTracksToPlaylist(playlistId, batch);

      // Add a small delay between batches to avoid rate limiting
      if (i + batchSize < trackUris.length) {
        await new Promise((resolve) => setTimeout(resolve, 50));
      }
    }
    return true;
  } catch (error) {
    console.error("Error adding tracks to playlist:", error);
    return false;
  }
};

// Get Spotify authorization URL
export const getAuthUrl = (): string => {
  const clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID || "";
  const redirectUri = window.location.origin + "/trackswipe/";
  const scopes = [
    "streaming",
    "user-read-email",
    "user-read-private",
    "user-library-read",
    "user-library-modify",
    "playlist-read-private",
    "playlist-modify-private",
    "playlist-modify-public",
    "user-read-playback-state",
    "user-modify-playback-state",
  ];

  return `https://accounts.spotify.com/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(
    redirectUri
  )}&scope=${encodeURIComponent(
    scopes.join(" ")
  )}&response_type=token&show_dialog=true`;
};

// Parse hash from URL to get access token
export const getTokenFromUrl = (): { [key: string]: string } => {
  const hash = window.location.hash
    .substring(1)
    .split("&")
    .reduce((initial: { [key: string]: string }, item) => {
      if (item) {
        const parts = item.split("=");
        initial[parts[0]] = decodeURIComponent(parts[1]);
      }
      return initial;
    }, {});

  window.location.hash = "";
  return hash;
};

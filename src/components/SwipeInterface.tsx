import React, { useState, useEffect, useCallback } from "react";
import {
  getPlaylistTracks,
  addTrackToLibrary,
  addTrackToPlaylist,
  removeTrackFromLibrary,
  checkTracksInLibrary,
  addTracksToPlaylist,
  createPlaylist,
} from "../utils/spotify";
import { SpotifyTrack, FavoriteTrack, SaveDestination } from "../types";
import SwipeCard from "./SwipeCard";
import FavoritesList from "./FavoritesList";
import SettingsModal from "./SettingsModal";
import { Music, Heart, LogOut, Loader2, Settings } from "lucide-react";
import SpotifyWebPlayback from "react-spotify-web-playback";

interface SwipeInterfaceProps {
  playlistId: string;
  token: string;
  onLogout: () => void;
}

const SwipeInterface: React.FC<SwipeInterfaceProps> = ({
  playlistId,
  token,
  onLogout,
}) => {
  const [allTracks, setAllTracks] = useState<SpotifyTrack[]>([]);
  const [displayTracks, setDisplayTracks] = useState<SpotifyTrack[]>([]);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [favorites, setFavorites] = useState<FavoriteTrack[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingMessage, setLoadingMessage] = useState("Loading tracks...");
  const [showFavorites, setShowFavorites] = useState(false);
  const [playbackUri, setPlaybackUri] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [tracksInLibrary, setTracksInLibrary] = useState<{
    [key: string]: boolean;
  }>({});
  const [isAddingToLibrary, setIsAddingToLibrary] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  // Settings state
  const [saveDestination, setSaveDestination] =
    useState<SaveDestination>("library");
  const [selectedPlaylistId, setSelectedPlaylistId] = useState("");
  const [shuffleMode, setShuffleMode] = useState(false);
  const [hideAlreadyLiked, setHideAlreadyLiked] = useState(false);
  const [pendingLikes, setPendingLikes] = useState<string[]>([]);

  // Function to shuffle array
  const shuffleArray = (array: SpotifyTrack[]) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Filter tracks based on settings
  const filterTracks = useCallback(
    (tracks: SpotifyTrack[], libraryStatus: { [key: string]: boolean }) => {
      if (hideAlreadyLiked) {
        tracks = tracks.filter((track) => !libraryStatus[track.id]);
      }

      if (shuffleMode) {
        tracks = shuffleArray(tracks);
      }

      return tracks;
    },
    [hideAlreadyLiked, shuffleMode]
  );

  useEffect(() => {
    const fetchTracks = async () => {
      setIsLoading(true);
      setLoadingMessage("Loading playlist tracks...");

      try {
        const playlistTracks = await getPlaylistTracks(playlistId);
        setAllTracks(playlistTracks);

        if (playlistTracks.length > 0) {
          setLoadingMessage("Checking your Spotify library...");
          const trackIds = playlistTracks.map((track) => track.id);

          const batchSize = 50;
          const libraryStatus: { [key: string]: boolean } = {};

          for (let i = 0; i < trackIds.length; i += batchSize) {
            const batchIds = trackIds.slice(i, i + batchSize);
            const batchStatus = await checkTracksInLibrary(batchIds);

            batchIds.forEach((id, index) => {
              libraryStatus[id] = batchStatus[index];
            });
          }

          setTracksInLibrary(libraryStatus);

          const filteredTracks = filterTracks(playlistTracks, libraryStatus);
          setDisplayTracks(filteredTracks);
        }
      } catch (error) {
        console.error("Error fetching tracks:", error);
      }

      setIsLoading(false);
    };

    fetchTracks();
  }, [playlistId, filterTracks]);

  useEffect(() => {
    if (allTracks.length > 0) {
      const filteredTracks = filterTracks(allTracks, tracksInLibrary);
      setDisplayTracks(filteredTracks);
    }
  }, [hideAlreadyLiked, shuffleMode, allTracks, filterTracks]);

  const playFromMiddle = (track: SpotifyTrack) => {
    if (!track?.uri) return;
    track.duration_ms = 30000;
    setPlaybackUri(track.uri);
    setIsPlaying(true);
  };

  const handleSwipeLeft = () => {
    if (currentTrackIndex < displayTracks.length - 1) {
      setCurrentTrackIndex(currentTrackIndex + 1);
    }
  };

  const handleSwipeRight = async () => {
    const currentTrack = displayTracks[currentTrackIndex];
    if (!currentTrack) return;

    setIsAddingToLibrary(true);

    try {
      let success = false;

      if (saveDestination === "library") {
        success = await addTrackToLibrary(currentTrack.id);

        if (success) {
          setTracksInLibrary((prev) => ({
            ...prev,
            [currentTrack.id]: true,
          }));
        }
      } else {
        setPendingLikes((prev) => [...prev, currentTrack.uri]);
        success = true;
      }

      if (saveDestination === "playlist") {
        success = await addTrackToPlaylist(currentTrack.id, selectedPlaylistId);

        if (success) {
          setTracksInLibrary((prev) => ({
            ...prev,
            [currentTrack.id]: true,
          }));
        }
      }

      if (success) {
        if (!favorites.some((fav) => fav.id === currentTrack.id)) {
          const favoriteTrack: FavoriteTrack = {
            id: currentTrack.id,
            name: currentTrack.name,
            artists: currentTrack.artists
              .map((artist) => artist.name)
              .join(", "),
            albumName: currentTrack.album.name,
            albumImage: currentTrack.album.images[0]?.url || "",
            uri: currentTrack.uri,
          };

          setFavorites((prev) => [...prev, favoriteTrack]);
        }

        if (currentTrackIndex < displayTracks.length - 1) {
          setCurrentTrackIndex((prevIndex) => prevIndex + 1);
        }
      }
    } catch (error) {
      console.error("Error handling swipe right:", error);
    }

    setIsAddingToLibrary(false);
  };
  useEffect(() => {
    if (displayTracks[currentTrackIndex]) {
      playFromMiddle(displayTracks[currentTrackIndex]);
    }
  }, [currentTrackIndex, displayTracks]);

  const handleRemoveFavorite = async (id: string) => {
    try {
      if (saveDestination === "library") {
        const success = await removeTrackFromLibrary(id);

        if (success) {
          setTracksInLibrary((prev) => ({
            ...prev,
            [id]: false,
          }));
        }
      }

      setFavorites((prev) => prev.filter((track) => track.id !== id));

      const track = allTracks.find((t) => t.id === id);
      if (track?.uri && pendingLikes.includes(track.uri)) {
        setPendingLikes((prev) => prev.filter((uri) => uri !== track.uri));
      }
    } catch (error) {
      console.error("Error removing favorite:", error);
    }
  };

  const handlePlayFavorite = (uri: string) => {
    if (!uri) return;
    setPlaybackUri(uri);
    setIsPlaying(true);
  };

  const handleCreateNewPlaylist = async (name: string) => {
    setLoadingMessage("Creating new playlist...");
    setIsLoading(true);

    try {
      const playlistId = await createPlaylist(name, "Created with TrackSwipe");

      if (playlistId) {
        setSelectedPlaylistId(playlistId);
        setSaveDestination("playlist");

        if (pendingLikes.length > 0) {
          await addTracksToPlaylist(playlistId, pendingLikes);
        }
      }
    } catch (error) {
      console.error("Error creating playlist:", error);
    }

    setIsLoading(false);
  };

  const savePendingLikesToPlaylist = async () => {
    if (pendingLikes.length === 0 || !selectedPlaylistId) return;

    setLoadingMessage("Saving tracks to playlist...");
    setIsLoading(true);

    try {
      const success = await addTracksToPlaylist(
        selectedPlaylistId,
        pendingLikes
      );

      if (success) {
        setPendingLikes([]);
      }
    } catch (error) {
      console.error("Error saving to playlist:", error);
    }

    setIsLoading(false);
  };

  useEffect(() => {
    if (
      saveDestination === "playlist" &&
      selectedPlaylistId &&
      pendingLikes.length > 0
    ) {
      savePendingLikesToPlaylist();
    }
  }, [selectedPlaylistId, saveDestination]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-900 to-black flex flex-col items-center justify-center">
        <Loader2 size={48} className="text-green-500 animate-spin mb-4" />
        <p className="text-white text-xl">{loadingMessage}</p>
      </div>
    );
  }

  if (allTracks.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-900 to-black flex flex-col items-center justify-center p-4">
        <div className="text-center mb-8">
          <Music size={48} className="text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">
            No tracks found
          </h2>
          <p className="text-gray-300">
            This playlist might be empty or private
          </p>
        </div>
        <button
          onClick={onLogout}
          className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-full"
        >
          Try another playlist
        </button>
      </div>
    );
  }

  if (displayTracks.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-900 to-black flex flex-col items-center justify-center p-4">
        <div className="text-center mb-8">
          <Heart size={48} className="text-pink-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">
            No tracks to display
          </h2>
          <p className="text-gray-300">
            All tracks in this playlist are already in your library
          </p>
        </div>
        <div className="flex space-x-4">
          <button
            onClick={() => setHideAlreadyLiked(false)}
            className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-6 rounded-full"
          >
            Show All Tracks
          </button>
          <button
            onClick={onLogout}
            className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-6 rounded-full"
          >
            Try Another Playlist
          </button>
        </div>
      </div>
    );
  }

  if (currentTrackIndex >= displayTracks.length) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-purple-900 to-black flex flex-col items-center justify-center p-4">
        <div className="text-center mb-8">
          <Heart size={48} className="text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">
            You've gone through all tracks!
          </h2>
          <p className="text-gray-300">You liked {favorites.length} songs</p>
        </div>
        <div className="flex space-x-4">
          <button
            onClick={() => setCurrentTrackIndex(0)}
            className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-6 rounded-full"
          >
            Start Over
          </button>
          <button
            onClick={onLogout}
            className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-6 rounded-full"
          >
            Try Another Playlist
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 to-black">
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <Music size={28} className="text-green-500 mr-2" />
            <h1 className="text-2xl font-bold text-white">TrackSwipe</h1>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={() => setShowSettings(true)}
              className="flex items-center px-4 py-2 rounded-full bg-gray-800 text-gray-300 hover:bg-gray-700"
            >
              <Settings size={18} className="mr-1" />
              <span className="hidden sm:inline">Settings</span>
            </button>

            <button
              onClick={() => setShowFavorites(!showFavorites)}
              className={`flex items-center px-4 py-2 rounded-full ${
                showFavorites
                  ? "bg-green-500 text-white"
                  : "bg-gray-800 text-gray-300 hover:bg-gray-700"
              }`}
            >
              <Heart size={18} className="mr-1" />
              <span className="hidden sm:inline">Favorites</span>
              {favorites.length > 0 && (
                <span className="ml-1 bg-white text-green-800 text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {favorites.length}
                </span>
              )}
            </button>

            <button
              onClick={onLogout}
              className="flex items-center px-4 py-2 rounded-full bg-gray-800 text-gray-300 hover:bg-gray-700"
            >
              <LogOut size={18} className="mr-1" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          <div className={`w-full ${showFavorites ? "md:w-1/2" : "md:w-full"}`}>
            <div className="flex justify-center items-center mb-6">
              {isAddingToLibrary ? (
                <div className="absolute z-10 inset-0 flex items-center justify-center bg-black/50">
                  <Loader2 size={48} className="text-green-500 animate-spin" />
                </div>
              ) : null}

              <SwipeCard
                track={displayTracks[currentTrackIndex]}
                onSwipeLeft={handleSwipeLeft}
                onSwipeRight={handleSwipeRight}
                isPlaying={isPlaying}
                isInLibrary={
                  tracksInLibrary[displayTracks[currentTrackIndex].id] || false
                }
              />
            </div>

            <div className="flex justify-center space-x-4 mt-4">
              <button
                onClick={handleSwipeLeft}
                className="bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-8 rounded-full transition-colors"
              >
                Skip
              </button>
              <button
                onClick={handleSwipeRight}
                disabled={isAddingToLibrary}
                className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-8 rounded-full transition-colors disabled:opacity-50"
              >
                {isAddingToLibrary ? (
                  <span className="flex items-center">
                    <Loader2 size={18} className="animate-spin mr-2" />
                    Saving...
                  </span>
                ) : (
                  "Like"
                )}
              </button>
            </div>

            <div className="mt-6 text-center text-gray-400">
              <p>Swipe left to skip, right to add to favorites</p>
              <p className="text-sm mt-1">
                Track {currentTrackIndex + 1} of {displayTracks.length}
              </p>
              {saveDestination === "library" ? (
                <p className="text-sm mt-1">Saving to: Spotify Liked Songs</p>
              ) : saveDestination === "playlist" && selectedPlaylistId ? (
                <p className="text-sm mt-1">Saving to playlist</p>
              ) : saveDestination === "new-playlist" ? (
                <p className="text-sm mt-1">Will create a new playlist</p>
              ) : null}
            </div>
          </div>

          {showFavorites && (
            <div className="w-full md:w-1/2 bg-gray-900/50 backdrop-blur-sm rounded-xl p-4">
              <FavoritesList
                favorites={favorites}
                onRemoveFavorite={handleRemoveFavorite}
                onPlayTrack={handlePlayFavorite}
              />
            </div>
          )}
        </div>
      </div>

      {playbackUri && (
        <div className="fixed bottom-0 left-0 right-0">
          <SpotifyWebPlayback
            token={token}
            uris={[playbackUri]}
            play={isPlaying}
            offset={0.5}
            styles={{
              bgColor: "#111",
              color: "#fff",
              loaderColor: "#1DB954",
              sliderColor: "#1DB954",
              trackArtistColor: "#ccc",
              trackNameColor: "#fff",
            }}
            callback={(state) => {
              setIsPlaying(state.isPlaying);
            }}
          />
        </div>
      )}

      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        saveDestination={saveDestination}
        onChangeSaveDestination={setSaveDestination}
        selectedPlaylistId={selectedPlaylistId}
        onSelectPlaylist={setSelectedPlaylistId}
        shuffleMode={shuffleMode}
        onToggleShuffle={() => setShuffleMode(!shuffleMode)}
        hideAlreadyLiked={hideAlreadyLiked}
        onToggleHideAlreadyLiked={() => setHideAlreadyLiked(!hideAlreadyLiked)}
        onCreateNewPlaylist={handleCreateNewPlaylist}
      />
    </div>
  );
};

export default SwipeInterface;

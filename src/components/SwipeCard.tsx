import React, { useState, useRef, useEffect } from "react";
import { SpotifyTrack } from "../types";
import { Music, Clock, Heart, X } from "lucide-react";

interface SwipeCardProps {
  track: SpotifyTrack;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  isPlaying: boolean;
  isInLibrary: boolean;
}

const SwipeCard: React.FC<SwipeCardProps> = ({
  track,
  onSwipeLeft,
  onSwipeRight,
  isPlaying,
  isInLibrary,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [offsetX, setOffsetX] = useState(0);
  const [swipeDirection, setSwipeDirection] = useState<"left" | "right" | null>(
    null
  );
  const [exitAnimation, setExitAnimation] = useState(false);

  const formatArtists = (artists: Array<{ name: string }>) => {
    return artists.map((artist) => artist.name).join(", ");
  };

  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = ((ms % 60000) / 1000).toFixed(0);
    return `${minutes}:${parseInt(seconds) < 10 ? "0" : ""}${seconds}`;
  };

  // Reset card position when track changes
  useEffect(() => {
    setOffsetX(0);
    setSwipeDirection(null);
    setExitAnimation(false);
  }, [track.id]);

  // Mouse events for desktop
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setStartX(e.clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;

    const currentX = e.clientX;
    const diff = currentX - startX;
    setOffsetX(diff);

    // Determine swipe direction for visual feedback
    if (diff > 50) {
      setSwipeDirection("right");
    } else if (diff < -50) {
      setSwipeDirection("left");
    } else {
      setSwipeDirection(null);
    }
  };

  const handleMouseUp = () => {
    if (!isDragging) return;

    const threshold = 100; // Minimum distance to trigger swipe

    if (offsetX > threshold) {
      // Swipe right
      setExitAnimation(true);
      setTimeout(() => {
        onSwipeRight();
      }, 300);
    } else if (offsetX < -threshold) {
      // Swipe left
      setExitAnimation(true);
      setTimeout(() => {
        onSwipeLeft();
      }, 300);
    } else {
      // Reset position if not swiped far enough
      setOffsetX(0);
      setSwipeDirection(null);
    }

    setIsDragging(false);
  };

  // Touch events for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    setStartX(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;

    const currentX = e.touches[0].clientX;
    const diff = currentX - startX;
    setOffsetX(diff);

    // Determine swipe direction for visual feedback
    if (diff > 50) {
      setSwipeDirection("right");
    } else if (diff < -50) {
      setSwipeDirection("left");
    } else {
      setSwipeDirection(null);
    }
  };

  const handleTouchEnd = () => {
    if (!isDragging) return;

    const threshold = 100; // Minimum distance to trigger swipe

    if (offsetX > threshold) {
      // Swipe right
      setExitAnimation(true);
      setTimeout(() => {
        onSwipeRight();
      }, 300);
    } else if (offsetX < -threshold) {
      // Swipe left
      setExitAnimation(true);
      setTimeout(() => {
        onSwipeLeft();
      }, 300);
    } else {
      // Reset position if not swiped far enough
      setOffsetX(0);
      setSwipeDirection(null);
    }

    setIsDragging(false);
  };

  // Calculate rotation based on offset
  const rotation = offsetX * 0.1; // Adjust multiplier for rotation intensity
  const opacity = Math.min(Math.abs(offsetX) / 100, 1);

  // Determine exit animation class
  const getExitClass = () => {
    if (!exitAnimation) return "";
    return swipeDirection === "right"
      ? "animate-exit-right"
      : "animate-exit-left";
  };

  return (
    <div
      ref={cardRef}
      className={`relative bg-gray-900 rounded-xl overflow-hidden shadow-2xl max-w-sm w-full mx-auto cursor-grab active:cursor-grabbing ${getExitClass()}`}
      style={{
        transform: `translateX(${offsetX}px) rotate(${rotation}deg)`,
        transition: isDragging ? "none" : "transform 0.3s ease",
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div className="relative">
        <img
          src={
            track.album.images[0]?.url ||
            "https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?q=80&w=1000"
          }
          alt={track.album.name}
          className="w-full h-64 object-contain"
          draggable="false"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-4">
          <div className="w-full">
            <h2 className="text-white text-xl font-bold truncate">
              {track.name}
            </h2>
            <p className="text-gray-300 truncate">
              {formatArtists(track.artists)}
            </p>
          </div>
        </div>

        {isPlaying && (
          <div className="absolute top-4 right-4 bg-green-500 text-white rounded-full p-2 animate-pulse">
            <Music size={16} />
          </div>
        )}

        {isInLibrary && (
          <div className="absolute top-4 left-4 bg-pink-500 text-white rounded-full p-2">
            <Heart size={16} />
          </div>
        )}

        {/* Swipe indicators */}
        {swipeDirection === "left" && (
          <div
            className="absolute top-4 left-4 bg-red-500 text-white rounded-full p-3"
            style={{ opacity }}
          >
            <X size={24} />
          </div>
        )}

        {swipeDirection === "right" && (
          <div
            className="absolute top-4 right-4 bg-green-500 text-white rounded-full p-3"
            style={{ opacity }}
          >
            <Heart size={24} />
          </div>
        )}
      </div>

      <div className="p-4 bg-gray-800">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center text-gray-400">
            <Music size={16} className="mr-1" />
            <span className="text-sm">{track.album.name}</span>
          </div>
          {/* <div className="flex items-center text-gray-400">
            <Clock size={16} className="mr-1" />
            <span className="text-sm">{formatDuration(track.duration_ms)}</span>
          </div> */}
        </div>

        <div className="flex justify-between">
          <button
            onClick={() => {
              setExitAnimation(true);
              setSwipeDirection("left");
              setTimeout(() => {
                onSwipeLeft();
              }, 300);
            }}
            className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-6 rounded-full transition-colors"
          >
            Skip
          </button>
          <button
            onClick={() => {
              setExitAnimation(true);
              setSwipeDirection("right");
              setTimeout(() => {
                onSwipeRight();
              }, 300);
            }}
            className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-6 rounded-full transition-colors"
          >
            Like
          </button>
        </div>
      </div>

      {/* Overlay gradients for swipe direction */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div
          className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-red-500/50 to-transparent"
          style={{ opacity: swipeDirection === "left" ? opacity * 0.7 : 0 }}
        ></div>
        <div
          className="absolute top-0 right-0 w-full h-full bg-gradient-to-l from-green-500/50 to-transparent"
          style={{ opacity: swipeDirection === "right" ? opacity * 0.7 : 0 }}
        ></div>
      </div>
    </div>
  );
};

export default SwipeCard;

import React from "react";
import { Music } from "lucide-react";
import { getAuthUrl } from "../utils/spotify";

const Login: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 to-black flex flex-col items-center justify-center p-4">
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <Music size={64} className="text-green-500" />
        </div>
        <h1 className="text-4xl font-bold text-white mb-2">TrackSwipe</h1>
        <p className="text-gray-300 text-lg">
          Swipe through songs to find your next favorite
        </p>
      </div>

      <div className="bg-black/30 backdrop-blur-md p-8 rounded-xl shadow-2xl max-w-md w-full">
        <p className="text-gray-300 mb-6 text-center">
          Connect with your Spotify account to start discovering music
        </p>

        <a
          href={getAuthUrl()}
          className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-4 rounded-full flex items-center justify-center transition-colors"
        >
          <Music className="mr-2" size={20} />
          Login with Spotify
        </a>
      </div>
    </div>
  );
};

export default Login;

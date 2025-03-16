# TrackSwipe App

A Tinder-style app for discovering music from Spotify playlists. Swipe left to skip songs, swipe right to add them to your Spotify library, existing playlist, or a new playlist.

## Features

- Login with Spotify
- Enter any Spotify playlist URL
- Tinder-style swipe interface with animations
- Multiple save options:
  - Save to Spotify Liked Songs
  - Save to an existing playlist
  - Create and save to a new playlist
- Shuffle mode for randomized track order
- Option to hide tracks already in your library
- View and manage your favorite tracks
- Supports playlists with more than 100 songs
- Responsive design for mobile and desktop

## Setup

1. Clone this repository
2. Create a Spotify Developer App at https://developer.spotify.com/dashboard
3. Add `http://localhost:5173` to the Redirect URIs in your Spotify App settings
4. Copy `.env.example` to `.env` and add your Spotify Client ID
5. Install dependencies: `npm install`
6. Start the development server: `npm run dev`

## Technologies Used

- React
- TypeScript
- Tailwind CSS
- Spotify Web API
- React Spotify Web Playback
- Bolt.new

## How It Works

1. Log in with your Spotify account
2. Enter a Spotify playlist URL
3. Configure your preferences in Settings:
   - Choose where to save liked tracks
   - Enable/disable shuffle mode
   - Show/hide already liked tracks
4. The app will play each song from the middle
5. Swipe left to skip, right to add to your selected destination
6. View and manage your favorites in the sidebar

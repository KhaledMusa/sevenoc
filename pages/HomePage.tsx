import React, { useMemo } from 'react';
import { useTracks } from '../hooks/useTracks';
import { useAudio } from '../hooks/useAudio';
import Spinner from '../components/Spinner';
import { motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';
import TrackCarousel from '../components/TrackCarousel';
import { Track } from '../types';

const HomePage: React.FC = () => {
  const { tracks, loading, error } = useTracks();
  const { playTrack } = useAudio();

  // Memoize sorted tracks to avoid re-computation on every render
  const latestTracks = useMemo(() => {
    return [...tracks]
      .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())
      .slice(0, 8);
  }, [tracks]);

  const popularTracks = useMemo(() => {
    return [...tracks].sort((a, b) => b.likeCount - a.likeCount).slice(0, 8);
  }, [tracks]);

  const handlePlay = (track: Track, playlist: Track[]) => {
    playTrack(track, playlist);
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64"><Spinner /></div>;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300 p-8 rounded-lg">
        <AlertTriangle className="h-12 w-12 mb-4" />
        <h2 className="text-xl font-bold mb-2">Error</h2>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-12"
    >
      <header className="text-center py-8">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-purple-500">
            Discover Your Next Favorite Tune
        </h1>
        <p className="mt-4 text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
            Explore a universe of sound, from rising artists to established legends.
        </p>
      </header>
      
      <TrackCarousel 
        title="Most Popular"
        tracks={popularTracks}
        onPlay={handlePlay}
      />
      
      <TrackCarousel 
        title="Latest Uploads"
        tracks={latestTracks}
        onPlay={handlePlay}
      />
    </motion.div>
  );
};

export default HomePage;
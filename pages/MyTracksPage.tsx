import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useAudio } from '../hooks/useAudio';
import { useLanguage } from '../hooks/useLanguage';
import { getTracks } from '../services/supabase';
import { Track } from '../types';
import Spinner from '../components/Spinner';
import TrackCard from '../components/TrackCard';
import { AlertTriangle, Music } from 'lucide-react';
import { Link } from 'react-router-dom';

const MyTracksPage: React.FC = () => {
  const { user } = useAuth();
  const { playTrack } = useAudio();
  const { t } = useLanguage();
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserTracks = async () => {
      if (!user) return;
      
      setLoading(true);
      setError(null);
      try {
        const userTracks = await getTracks({ userId: user.id });
        setTracks(userTracks);
      } catch (err: any) {
        setError(err.message || 'Failed to load your tracks.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserTracks();
  }, [user]);

  const handlePlay = (track: Track) => {
    playTrack(track, tracks);
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64"><Spinner /></div>;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300 p-8 rounded-lg">
        <AlertTriangle className="h-12 w-12 mb-4" />
        <h2 className="text-xl font-bold mb-2">{t('error')}</h2>
        <p className="text-center">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold tracking-tight">{t('my_tracks')}</h1>
      
      {tracks.length > 0 ? (
        <div className="space-y-4">
          {tracks.map(track => (
            <TrackCard key={track.id} track={track} onPlay={handlePlay} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center text-center p-8 bg-gray-100 dark:bg-white/5 rounded-lg h-64">
          <Music className="h-12 w-12 text-gray-400 mb-4" />
          <p className="text-gray-500 dark:text-gray-400 mb-4">You haven't uploaded any tracks yet.</p>
          <Link to="/upload" className="px-6 py-2 bg-primary-500 text-white font-semibold rounded-md hover:bg-primary-600 transition-transform transform hover:scale-105">
            {t('upload')}
          </Link>
        </div>
      )}
    </div>
  );
};

export default MyTracksPage;

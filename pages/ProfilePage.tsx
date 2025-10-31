import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { getTracks, getUserProfile } from '../services/supabase';
import { Track, User } from '../types';
import Spinner from '../components/Spinner';
import TrackCard from '../components/TrackCard';
import { useAudio } from '../hooks/useAudio';
import { AlertTriangle, Music } from 'lucide-react';

const ProfilePage: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const { playTrack } = useAudio();
  
  const [user, setUser] = useState<User | null>(null);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!userId) {
        setError("User ID is missing.");
        setLoading(false);
        return;
      }
      
      setLoading(true);
      setError(null);
      try {
        const [profile, userTracks] = await Promise.all([
          getUserProfile(userId),
          getTracks({ userId: userId }),
        ]);

        if (!profile) {
          throw new Error("User not found.");
        }
        
        setUser(profile);
        setTracks(userTracks);

      } catch (err: any) {
        setError(err.message || 'Failed to load profile.');
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [userId]);

  const handlePlay = (track: Track) => {
    playTrack(track, tracks);
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64"><Spinner /></div>;
  }

  if (error || !user) {
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300 p-8 rounded-lg">
        <AlertTriangle className="h-12 w-12 mb-4" />
        <h2 className="text-xl font-bold mb-2">Error</h2>
        <p className="text-center">{error || "Could not load user profile."}</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6 p-4 bg-gray-100 dark:bg-white/5 rounded-lg">
        <img 
          src={user.avatarUrl} 
          alt={user.displayName}
          className="w-24 h-24 sm:w-32 sm:h-32 rounded-full object-cover shadow-lg"
        />
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{user.displayName}</h1>
          <p className="text-gray-500 dark:text-gray-400">{tracks.length} track{tracks.length !== 1 && 's'}</p>
        </div>
      </div>
      
      {tracks.length > 0 ? (
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold">Tracks</h2>
          {tracks.map(track => (
            <TrackCard key={track.id} track={track} onPlay={handlePlay} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center text-center p-8 bg-gray-100 dark:bg-white/5 rounded-lg h-64">
          <Music className="h-12 w-12 text-gray-400 mb-4" />
          <p className="text-gray-500 dark:text-gray-400">{user.displayName} hasn't uploaded any tracks yet.</p>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;

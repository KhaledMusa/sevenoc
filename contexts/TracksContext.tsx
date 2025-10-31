import React, { createContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Track } from '../types';
import { getTracks, likeTrack, unlikeTrack } from '../services/supabase';
import { useAuth } from '../hooks/useAuth';

interface TracksContextType {
  tracks: Track[];
  loading: boolean;
  error: string | null;
  addTrack: (track: Track) => void;
  toggleLikeOnTrack: (trackId: string) => Promise<void>;
}

export const TracksContext = createContext<TracksContextType | undefined>(undefined);

export const TracksProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, likedTrackIds, setLikedTrackIds } = useAuth();

  useEffect(() => {
    const fetchTracks = async () => {
      try {
        setLoading(true);
        setError(null);
        const fetchedTracks = await getTracks();
        setTracks(fetchedTracks);
      } catch (err: any) {
        setError(err.message || 'Failed to load tracks.');
      } finally {
        setLoading(false);
      }
    };

    fetchTracks();
  }, []);

  const addTrack = useCallback((newTrack: Track) => {
    setTracks(prevTracks => [newTrack, ...prevTracks]);
  }, []);

  const toggleLikeOnTrack = useCallback(async (trackId: string) => {
    if (!user) return;

    const isLiked = likedTrackIds.has(trackId);
    const newLikedTrackIds = new Set(likedTrackIds);
    
    // Optimistic UI update for like count and button state
    setTracks(prevTracks => prevTracks.map(t => {
        if (t.id === trackId) {
            return { ...t, likeCount: isLiked ? t.likeCount - 1 : t.likeCount + 1 };
        }
        return t;
    }));

    if (isLiked) {
        newLikedTrackIds.delete(trackId);
    } else {
        newLikedTrackIds.add(trackId);
    }
    setLikedTrackIds(newLikedTrackIds);

    try {
        if (isLiked) {
            await unlikeTrack(trackId, user.id);
        } else {
            await likeTrack(trackId, user.id);
        }
    } catch (err) {
        console.error("Failed to toggle like:", err);
        // Revert UI on failure
        setTracks(prevTracks => prevTracks.map(t => {
            if (t.id === trackId) {
                // This logic is simple, but for a more robust app you might want to refetch
                return { ...t, likeCount: isLiked ? t.likeCount + 1 : t.likeCount - 1 };
            }
            return t;
        }));
        const revertedLikedTrackIds = new Set(likedTrackIds);
        if (isLiked) {
            revertedLikedTrackIds.add(trackId);
        } else {
            revertedLikedTrackIds.delete(trackId);
        }
        setLikedTrackIds(revertedLikedTrackIds);
    }
  }, [user, likedTrackIds, setLikedTrackIds]);

  return (
    <TracksContext.Provider value={{ tracks, loading, error, addTrack, toggleLikeOnTrack }}>
      {children}
    </TracksContext.Provider>
  );
};

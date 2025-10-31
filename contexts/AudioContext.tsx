
import React, { createContext, useState, useRef, useEffect, ReactNode, useCallback } from 'react';
import { Track } from '../types';
import { useTracks } from '../hooks/useTracks';

interface AudioContextType {
  currentTrack: Track | null;
  isPlaying: boolean;
  progress: number;
  duration: number;
  volume: number;
  playTrack: (track: Track, playlist?: Track[]) => void;
  togglePlayPause: () => void;
  playNext: () => void;
  playPrev: () => void;
  seek: (value: number) => void;
  setVolume: (value: number) => void;
}

export const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const AudioProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { tracks: allTracks } = useTracks();
  const [playlist, setPlaylist] = useState<Track[]>([]);
  const [currentTrack, setCurrentTrack] = useState<Track | null>(null);
  const [currentIndex, setCurrentIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const playNextRef = useRef<() => void>(() => {});

  const playTrack = useCallback((track: Track, newPlaylist?: Track[]) => {
    const pl = newPlaylist || allTracks;
    const trackIndex = pl.findIndex(t => t.id === track.id);

    setPlaylist(pl);
    setCurrentTrack(track);
    setCurrentIndex(trackIndex);
    
    if (audioRef.current) {
      audioRef.current.src = track.audioUrl;
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(e => console.error("Error playing audio:", e));
    }
  }, [allTracks]);

  const playNext = useCallback(() => {
    if (playlist.length === 0) return;
    const nextIndex = (currentIndex + 1) % playlist.length;
    playTrack(playlist[nextIndex], playlist);
  }, [currentIndex, playlist, playTrack]);
  
  const playPrev = useCallback(() => {
    if (playlist.length === 0) return;
    const prevIndex = (currentIndex - 1 + playlist.length) % playlist.length;
    playTrack(playlist[prevIndex], playlist);
  }, [currentIndex, playlist, playTrack]);

  // This effect keeps the playNextRef.current up to date with the latest callback
  useEffect(() => {
    playNextRef.current = playNext;
  }, [playNext]);

  // This effect sets up the audio element and its listeners on mount
  useEffect(() => {
    audioRef.current = new Audio();
    audioRef.current.volume = volume;

    const audio = audioRef.current;
    
    const handleTimeUpdate = () => setProgress(audio.currentTime);
    const handleDurationChange = () => setDuration(audio.duration);
    const handleEnded = () => playNextRef.current(); // Use the ref to avoid stale closure

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('durationchange', handleDurationChange);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('durationchange', handleDurationChange);
      audio.removeEventListener('ended', handleEnded);
      audio.pause();
    };
    // This effect should only run once on mount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  const togglePlayPause = useCallback(() => {
    if (!currentTrack) return;
    if (isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
    } else {
      audioRef.current?.play().then(() => {
        setIsPlaying(true);
      }).catch(e => console.error("Error playing audio:", e));
    }
  }, [currentTrack, isPlaying]);

  const seek = (value: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = value;
      setProgress(value);
    }
  };

  const setVolumeCb = (value: number) => {
    if (audioRef.current) {
      audioRef.current.volume = value;
      setVolume(value);
    }
  };

  return (
    <AudioContext.Provider value={{
      currentTrack,
      isPlaying,
      progress,
      duration,
      volume,
      playTrack,
      togglePlayPause,
      playNext,
      playPrev,
      seek,
      setVolume: setVolumeCb,
    }}>
      {children}
    </AudioContext.Provider>
  );
};

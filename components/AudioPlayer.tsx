import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAudio } from '../hooks/useAudio';
import { useLanguage } from '../hooks/useLanguage';
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Music } from 'lucide-react';
import { formatDuration } from '../utils/helpers';

const AudioPlayer: React.FC = () => {
  const {
    currentTrack,
    isPlaying,
    progress,
    duration,
    volume,
    togglePlayPause,
    playNext,
    playPrev,
    seek,
    setVolume,
  } = useAudio();
  const { t } = useLanguage();

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    seek(Number(e.target.value));
  };
  
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVolume(Number(e.target.value));
  };
  
  const progressBarBackground = useMemo(() => {
    const progressPercentage = duration > 0 ? (progress / duration) * 100 : 0;
    return `linear-gradient(to right, #6D28D9 ${progressPercentage}%, #4B5563 ${progressPercentage}%)`;
  }, [progress, duration]);

  const volumeBarBackground = useMemo(() => {
    const volumePercentage = volume * 100;
    return `linear-gradient(to right, #6D28D9 ${volumePercentage}%, #4B5563 ${volumePercentage}%)`;
  }, [volume]);


  if (!currentTrack) {
    return (
      <footer className="sticky bottom-0 z-50 bg-gray-100 dark:bg-[#181818] border-t border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-center">
            <Music size={20} className="mr-2 text-gray-500" />
            <p className="text-sm text-gray-500">{t('not_playing')}</p>
        </div>
      </footer>
    );
  }

  return (
    <footer className="sticky bottom-0 z-50 bg-gray-100/95 dark:bg-[#181818]/95 backdrop-blur-md border-t border-gray-200 dark:border-gray-800">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-20 grid grid-cols-3 items-center">
        {/* Track Info */}
        <div className="flex items-center space-x-3 overflow-hidden">
          {/* Fix: Use coverArtUrl instead of coverImageUrl */}
          <img src={currentTrack.coverArtUrl} alt={currentTrack.title} className="w-12 h-12 rounded-md object-cover flex-shrink-0" />
          <div className="overflow-hidden">
            <p className="font-semibold truncate text-sm">{currentTrack.title}</p>
            <Link to={`/profile/${currentTrack.user.id}`} className="text-xs text-gray-500 dark:text-gray-400 truncate hover:underline">
              {currentTrack.user.displayName}
            </Link>
          </div>
        </div>

        {/* Player Controls */}
        <div className="flex flex-col items-center justify-center">
          <div className="flex items-center space-x-4">
            <button onClick={playPrev} className="p-1 rounded-full text-gray-500 dark:text-gray-300 hover:text-primary-500 dark:hover:text-primary-400">
              <SkipBack size={20} />
            </button>
            <button
              onClick={togglePlayPause}
              className="w-10 h-10 bg-primary-500 text-white rounded-full flex items-center justify-center hover:bg-primary-600"
            >
              {isPlaying ? <Pause size={20} /> : <Play size={20} className="ml-0.5" />}
            </button>
            <button onClick={playNext} className="p-1 rounded-full text-gray-500 dark:text-gray-300 hover:text-primary-500 dark:hover:text-primary-400">
              <SkipForward size={20} />
            </button>
          </div>
           <div className="w-full max-w-xs flex items-center space-x-2 mt-2">
              <span className="text-xs text-gray-500">{formatDuration(progress)}</span>
              <input
                  type="range"
                  min="0"
                  max={duration || 0}
                  value={progress}
                  onChange={handleProgressChange}
                  className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer range-sm"
                  style={{ background: progressBarBackground }}
              />
              <span className="text-xs text-gray-500">{formatDuration(duration)}</span>
          </div>
        </div>

        {/* Volume Control */}
        <div className="flex items-center justify-end space-x-2">
            <button onClick={() => setVolume(volume > 0 ? 0 : 1)}>
                {volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
            </button>
            <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={handleVolumeChange}
                className="w-24 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer range-sm"
                style={{ background: volumeBarBackground }}
            />
        </div>
      </div>
    </footer>
  );
};

export default AudioPlayer;
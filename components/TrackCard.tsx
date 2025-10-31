import React from 'react';
import { Track } from '../types';
import { Play, Music4, Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAudio } from '../hooks/useAudio';
import { useAuth } from '../hooks/useAuth';
import { useTracks } from '../hooks/useTracks';
import { formatDuration } from '../utils/helpers';
import { useNavigate, Link } from 'react-router-dom';

interface TrackCardProps {
  track: Track;
  onPlay: (track: Track) => void;
}

const TrackCard: React.FC<TrackCardProps> = ({ track, onPlay }) => {
  const { currentTrack, isPlaying } = useAudio();
  const { user, likedTrackIds } = useAuth();
  const { toggleLikeOnTrack } = useTracks();
  const navigate = useNavigate();
  const isActive = currentTrack?.id === track.id;
  const isLiked = user ? likedTrackIds.has(track.id) : false;

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const handleLikeClick = () => {
    if (!user) {
      navigate('/auth');
    } else {
      toggleLikeOnTrack(track.id);
    }
  };

  return (
    <motion.div
      variants={cardVariants}
      className={`flex items-center p-3 rounded-lg transition-colors ${isActive ? 'bg-primary-500/10' : 'hover:bg-gray-100 dark:hover:bg-white/10'}`}
    >
      <div className="relative w-16 h-16 rounded-md overflow-hidden flex-shrink-0 mr-4">
        <img
          src={track.coverArtUrl}
          alt={track.title}
          className="w-full h-full object-cover"
        />
        <div 
          className="absolute inset-0 bg-black/30 flex items-center justify-center cursor-pointer group"
          onClick={() => onPlay(track)}
        >
          <Play className="w-8 h-8 text-white fill-white opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>

      <div className="flex-grow">
        <p className={`font-semibold ${isActive ? 'text-primary-500' : ''}`}>
          {track.title}
        </p>
        <Link to={`/profile/${track.user.id}`} className="text-sm text-gray-500 dark:text-gray-400 hover:underline">
          {track.user.displayName}
        </Link>
      </div>
      
      <div className="hidden sm:block text-sm text-gray-500 dark:text-gray-400 mx-4">
        {track.genre}
      </div>

      <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
        <button 
          onClick={handleLikeClick}
          className="flex items-center space-x-1 group"
        >
          <Heart 
            className={`w-5 h-5 transition-colors group-hover:text-red-500 ${isLiked ? 'text-red-500 fill-current' : 'text-gray-400'}`} 
          />
          <span>{track.likeCount}</span>
        </button>
        <div className="flex items-center">
            {isActive && isPlaying && <Music4 className="w-5 h-5 mr-2 text-primary-500 animate-pulse" />}
            <span>{formatDuration(track.duration)}</span>
        </div>
      </div>
    </motion.div>
  );
};

export default TrackCard;
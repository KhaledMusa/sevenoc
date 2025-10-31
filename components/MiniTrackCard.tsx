import React from 'react';
import { Track } from '../types';
import { Play, Heart } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatDuration } from '../utils/helpers';
import { useAuth } from '../hooks/useAuth';
import { useTracks } from '../hooks/useTracks';
import { useNavigate, Link } from 'react-router-dom';

interface MiniTrackCardProps {
  track: Track;
  onPlay: (track: Track) => void;
}

const MiniTrackCard: React.FC<MiniTrackCardProps> = ({ track, onPlay }) => {
  const { user, likedTrackIds } = useAuth();
  const { toggleLikeOnTrack } = useTracks();
  const navigate = useNavigate();
  const isLiked = user ? likedTrackIds.has(track.id) : false;

  const handleLikeClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent the card's onPlay from firing
    if (!user) {
      navigate('/auth');
    } else {
      toggleLikeOnTrack(track.id);
    }
  };

  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
      className="group relative rounded-lg overflow-hidden shadow-md bg-gray-100 dark:bg-[#282828] cursor-pointer"
      onClick={() => onPlay(track)}
    >
      <img
        src={track.coverArtUrl}
        alt={track.title}
        className="w-full h-40 object-cover transition-transform duration-300 group-hover:scale-110"
      />
      <div className="absolute inset-0 bg-black/40 group-hover:bg-black/60 transition-colors"></div>
      
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="flex items-center space-x-4 bg-black/30 backdrop-blur-sm px-4 py-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onPlay(track);
              }}
              className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center text-white transition-transform duration-300 hover:scale-110"
              aria-label={`Play ${track.title}`}
            >
              <Play className="fill-current" size={20} />
            </button>
            <span className="font-mono text-sm text-white">{formatDuration(track.duration)}</span>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 p-3 w-full bg-gradient-to-t from-black/80 to-transparent">
        <h3 className="font-semibold text-white truncate">{track.title}</h3>
        <Link 
          to={`/profile/${track.user.id}`} 
          onClick={(e) => e.stopPropagation()} 
          className="text-sm text-gray-300 truncate hover:underline"
        >
          {track.user.displayName}
        </Link>
        <div className="flex items-center justify-between mt-1">
          <p className="text-xs text-primary-400 truncate">{track.genre}</p>
          <button 
            onClick={handleLikeClick} 
            className="flex items-center space-x-1 text-white group/like"
            aria-label={`Like ${track.title}`}
          >
            <Heart 
              size={14}
              className={`transition-colors group-hover/like:text-red-400 ${isLiked ? 'text-red-500 fill-current' : 'text-gray-300'}`} 
            />
            <span className="text-xs">{track.likeCount}</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default MiniTrackCard;
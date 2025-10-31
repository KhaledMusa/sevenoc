// Fix: Implemented the full content for this component.
import React from 'react';
import { Track } from '../types';
import MiniTrackCard from './MiniTrackCard';

interface TrackCarouselProps {
  title: string;
  tracks: Track[];
  onPlay: (track: Track, playlist: Track[]) => void;
}

const TrackCarousel: React.FC<TrackCarouselProps> = ({ title, tracks, onPlay }) => {
  if (!tracks || tracks.length === 0) {
    return null;
  }

  const handlePlay = (track: Track) => {
    onPlay(track, tracks);
  }

  return (
    <section>
      <h2 className="text-2xl font-semibold mb-4">{title}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {tracks.map(track => (
          <MiniTrackCard key={track.id} track={track} onPlay={handlePlay} />
        ))}
      </div>
    </section>
  );
};

export default TrackCarousel;

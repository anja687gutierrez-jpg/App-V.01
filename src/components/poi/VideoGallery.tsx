import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { VideoCard } from './VideoCard';
import { VideoPlayerModal } from './VideoPlayerModal';
import type { CuratedVideo } from '@/types';

interface VideoGalleryProps {
  videos: CuratedVideo[];
  title?: string;
  subtitle?: string;
  itemsPerView?: number;
  className?: string;
}

/**
 * Video Gallery Component
 * Displays curated videos in a horizontal carousel
 */
export function VideoGallery({
  videos,
  title = 'Curated Videos',
  subtitle = 'Watch videos from travel creators',
  itemsPerView = 4,
  className = ''
}: VideoGalleryProps) {
  const [scrollPosition, setScrollPosition] = useState(0);
  const [selectedVideo, setSelectedVideo] = useState<CuratedVideo | null>(null);
  const [showModal, setShowModal] = useState(false);

  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return;

    const scrollAmount = 350; // Width of card + gap
    const newPosition =
      direction === 'left'
        ? Math.max(0, scrollPosition - scrollAmount)
        : scrollPosition + scrollAmount;

    scrollContainerRef.current.scrollLeft = newPosition;
    setScrollPosition(newPosition);
  };

  const handleVideoClick = (video: CuratedVideo) => {
    setSelectedVideo(video);
    setShowModal(true);
  };

  if (videos.length === 0) {
    return null;
  }

  const canScrollLeft = scrollPosition > 0;
  const canScrollRight =
    scrollContainerRef.current &&
    scrollPosition < scrollContainerRef.current.scrollWidth - scrollContainerRef.current.clientWidth;

  return (
    <>
      <Card className={className}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Sparkles className="h-5 w-5 text-yellow-500" />
              <div>
                <CardTitle>{title}</CardTitle>
                {subtitle && (
                  <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
                )}
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="relative">
          {/* Carousel Container */}
          <div className="relative">
            {/* Scroll Left Button */}
            {canScrollLeft && (
              <Button
                variant="outline"
                size="icon"
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-background/80 backdrop-blur-sm"
                onClick={() => scroll('left')}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            )}

            {/* Videos Container */}
            <div
              ref={scrollContainerRef}
              className="flex gap-4 overflow-x-auto scroll-smooth pb-4 px-4"
              style={{ scrollBehavior: 'smooth' }}
            >
              {videos.map((video) => (
                <div key={video.id} className="flex-shrink-0 w-80">
                  <VideoCard
                    video={video}
                    onClick={handleVideoClick}
                  />
                </div>
              ))}
            </div>

            {/* Scroll Right Button */}
            {canScrollRight && (
              <Button
                variant="outline"
                size="icon"
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-background/80 backdrop-blur-sm"
                onClick={() => scroll('right')}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Video Count */}
          <div className="text-center text-sm text-muted-foreground pt-2">
            {videos.length} video{videos.length !== 1 ? 's' : ''} available
          </div>
        </CardContent>
      </Card>

      {/* Video Player Modal */}
      <VideoPlayerModal
        video={selectedVideo}
        isOpen={showModal}
        onClose={() => setShowModal(false)}
      />
    </>
  );
}

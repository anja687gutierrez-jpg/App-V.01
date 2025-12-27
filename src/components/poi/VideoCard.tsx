import React from 'react';
import { Play, Eye, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { CuratedVideo } from '@/types';

interface VideoCardProps {
  video: CuratedVideo;
  onClick: (video: CuratedVideo) => void;
  className?: string;
}

/**
 * Video Card Component
 * Displays YouTube video thumbnail with metadata and play button overlay
 */
export function VideoCard({ video, onClick, className = '' }: VideoCardProps) {
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatViews = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  return (
    <div
      className={`group relative rounded-lg overflow-hidden bg-black cursor-pointer transition-transform hover:scale-105 ${className}`}
      onClick={() => onClick(video)}
    >
      {/* Thumbnail Image */}
      <div className="relative aspect-video overflow-hidden bg-gray-900">
        <img
          src={video.thumbnailUrl}
          alt={video.title}
          className="w-full h-full object-cover group-hover:opacity-80 transition-opacity"
          loading="lazy"
        />

        {/* Play Button Overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/50 transition-colors">
          <div className="rounded-full bg-red-600 p-3 group-hover:scale-110 transition-transform">
            <Play className="h-6 w-6 text-white fill-white" />
          </div>
        </div>

        {/* Duration Badge */}
        <Badge className="absolute bottom-2 right-2 bg-black/80 text-white text-xs">
          <Clock className="h-3 w-3 mr-1" />
          {formatDuration(video.duration)}
        </Badge>

        {/* Featured Badge */}
        {video.isFeatured && (
          <Badge className="absolute top-2 left-2 bg-yellow-500 text-black text-xs font-bold">
            FEATURED
          </Badge>
        )}
      </div>

      {/* Video Info */}
      <div className="bg-card p-3 space-y-2">
        {/* Title */}
        <h3 className="font-semibold text-sm line-clamp-2 text-card-foreground">
          {video.title}
        </h3>

        {/* Influencer Name */}
        <div className="flex items-center space-x-2">
          {video.influencer.avatarUrl && (
            <img
              src={video.influencer.avatarUrl}
              alt={video.influencer.name}
              className="h-6 w-6 rounded-full object-cover"
            />
          )}
          <span className="text-xs text-muted-foreground font-medium">
            {video.influencer.name}
          </span>
          {video.influencer.isVerified && (
            <span className="text-blue-500 text-xs">✓</span>
          )}
        </div>

        {/* View Count & Relevance */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center space-x-1">
            <Eye className="h-3 w-3" />
            <span>{formatViews(video.viewCount)}</span>
          </div>
          <Badge variant="secondary" className="text-xs">
            {video.relevanceScore}% match
          </Badge>
        </div>

        {/* Tags */}
        {video.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 pt-1">
            {video.tags.slice(0, 2).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
            {video.tags.length > 2 && (
              <Badge variant="outline" className="text-xs">
                +{video.tags.length - 2}
              </Badge>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

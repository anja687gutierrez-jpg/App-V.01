import React, { useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink, Eye, ThumbsUp } from 'lucide-react';
import type { CuratedVideo } from '@/types';

interface VideoPlayerModalProps {
  video: CuratedVideo | null;
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Video Player Modal
 * Displays YouTube video in iframe with full metadata
 */
export function VideoPlayerModal({ video, isOpen, onClose }: VideoPlayerModalProps) {
  if (!video) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatViews = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M views`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K views`;
    return `${count} views`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl p-0 gap-0">
        {/* Video Player */}
        <div className="aspect-video bg-black">
          <iframe
            width="100%"
            height="100%"
            src={`https://www.youtube.com/embed/${video.youtubeVideoId}?autoplay=1`}
            title={video.title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full h-full"
          />
        </div>

        {/* Video Info */}
        <div className="bg-card p-6 space-y-4">
          {/* Title */}
          <div>
            <h2 className="text-2xl font-bold text-card-foreground mb-2">
              {video.title}
            </h2>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {video.description}
            </p>
          </div>

          {/* Influencer Section */}
          <div className="flex items-center justify-between border-b pb-4">
            <div className="flex items-center space-x-3">
              {video.influencer.avatarUrl && (
                <img
                  src={video.influencer.avatarUrl}
                  alt={video.influencer.name}
                  className="h-12 w-12 rounded-full object-cover"
                />
              )}
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-semibold text-card-foreground">
                    {video.influencer.name}
                  </span>
                  {video.influencer.isVerified && (
                    <span className="text-blue-500">✓</span>
                  )}
                </div>
                <span className="text-xs text-muted-foreground">
                  {video.influencer.subscriberCount > 0 &&
                    `${(video.influencer.subscriberCount / 1000).toFixed(0)}K subscribers`}
                </span>
              </div>
            </div>

            {/* Visit Channel Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const url = video.influencer.youtubeUrl ||
                  `https://www.youtube.com/channel/${video.influencer.youtubeChannelId}`;
                window.open(url, '_blank');
              }}
              className="flex items-center space-x-2"
            >
              <ExternalLink className="h-4 w-4" />
              <span>Visit Channel</span>
            </Button>
          </div>

          {/* Stats & Metadata */}
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {/* Views */}
            <div className="space-y-1">
              <div className="flex items-center space-x-1 text-muted-foreground">
                <Eye className="h-4 w-4" />
                <span className="text-xs font-medium">Views</span>
              </div>
              <p className="text-sm font-semibold text-card-foreground">
                {video.viewCount >= 1000000
                  ? `${(video.viewCount / 1000000).toFixed(1)}M`
                  : video.viewCount >= 1000
                    ? `${(video.viewCount / 1000).toFixed(1)}K`
                    : video.viewCount}
              </p>
            </div>

            {/* Relevance Score */}
            <div className="space-y-1">
              <span className="text-xs font-medium text-muted-foreground">Match</span>
              <p className="text-sm font-semibold text-card-foreground">
                {video.relevanceScore}%
              </p>
            </div>

            {/* Published Date */}
            <div className="space-y-1">
              <span className="text-xs font-medium text-muted-foreground">Published</span>
              <p className="text-sm font-semibold text-card-foreground">
                {formatDate(video.publishedAt)}
              </p>
            </div>

            {/* Duration */}
            <div className="space-y-1">
              <span className="text-xs font-medium text-muted-foreground">Duration</span>
              <p className="text-sm font-semibold text-card-foreground">
                {Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, '0')}
              </p>
            </div>
          </div>

          {/* Tags */}
          {video.tags.length > 0 && (
            <div className="space-y-2 border-t pt-4">
              <span className="text-xs font-medium text-muted-foreground">Tags</span>
              <div className="flex flex-wrap gap-2">
                {video.tags.map((tag) => (
                  <Badge key={tag} variant="secondary">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Watch on YouTube */}
          <Button
            className="w-full bg-red-600 hover:bg-red-700 text-white"
            onClick={() => window.open(`https://www.youtube.com/watch?v=${video.youtubeVideoId}`, '_blank')}
          >
            Watch on YouTube
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

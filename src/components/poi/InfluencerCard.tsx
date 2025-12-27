import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, ExternalLink, Star } from 'lucide-react';
import type { Influencer } from '@/types';

interface InfluencerCardProps {
  influencer: Influencer;
  videoCount?: number;
  onVisitChannel?: () => void;
  className?: string;
}

/**
 * Influencer Card Component
 * Displays influencer profile with subscriber count and channel link
 */
export function InfluencerCard({
  influencer,
  videoCount = 0,
  onVisitChannel,
  className = ''
}: InfluencerCardProps) {
  const formatSubscribers = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  const handleVisitChannel = () => {
    const url = `https://www.youtube.com/channel/${influencer.youtubeChannelId}`;
    if (onVisitChannel) {
      onVisitChannel();
    } else {
      window.open(url, '_blank');
    }
  };

  return (
    <Card className={className}>
      <CardHeader className="text-center">
        {/* Avatar */}
        {influencer.avatarUrl && (
          <div className="flex justify-center mb-4">
            <img
              src={influencer.avatarUrl}
              alt={influencer.name}
              className="h-24 w-24 rounded-full object-cover border-4 border-primary"
            />
          </div>
        )}

        {/* Name & Handle */}
        <div>
          <CardTitle className="text-xl flex items-center justify-center space-x-2">
            <span>{influencer.name}</span>
            {influencer.isVerified && (
              <span className="text-blue-500" title="Verified">
                ✓
              </span>
            )}
          </CardTitle>
          <p className="text-sm text-muted-foreground mt-1">@{influencer.handle}</p>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Bio */}
        {influencer.bio && (
          <p className="text-sm text-muted-foreground text-center line-clamp-2">
            {influencer.bio}
          </p>
        )}

        {/* Category Badge */}
        <div className="flex justify-center">
          <Badge variant="secondary" className="capitalize">
            {influencer.category}
          </Badge>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 text-center">
          {/* Subscribers */}
          <div className="space-y-1">
            <div className="flex items-center justify-center space-x-1 text-muted-foreground">
              <Users className="h-4 w-4" />
              <span className="text-xs font-medium">Subscribers</span>
            </div>
            <p className="text-sm font-bold text-card-foreground">
              {formatSubscribers(influencer.subscriberCount)}
            </p>
          </div>

          {/* Videos Count */}
          {videoCount > 0 && (
            <div className="space-y-1">
              <div className="flex items-center justify-center space-x-1 text-muted-foreground">
                <Star className="h-4 w-4" />
                <span className="text-xs font-medium">Videos</span>
              </div>
              <p className="text-sm font-bold text-card-foreground">{videoCount}</p>
            </div>
          )}
        </div>

        {/* Visit Channel Button */}
        <Button
          variant="default"
          className="w-full flex items-center space-x-2"
          onClick={handleVisitChannel}
        >
          <ExternalLink className="h-4 w-4" />
          <span>Visit Channel</span>
        </Button>
      </CardContent>
    </Card>
  );
}

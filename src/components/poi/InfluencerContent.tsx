import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { fetchInfluencerContent, InfluencerVideo } from '@/lib/influencer';
import { Youtube, Instagram, Clapperboard } from 'lucide-react';

interface InfluencerContentProps {
  poiName: string;
}

const PlatformIcon = ({ platform }: { platform: 'youtube' | 'tiktok' | 'instagram' }) => {
  switch (platform) {
    case 'youtube': return <Youtube className="h-4 w-4" />;
    case 'instagram': return <Instagram className="h-4 w-4" />;
    case 'tiktok': return <Clapperboard className="h-4 w-4" />;
    default: return null;
  }
};

export function InfluencerContent({ poiName }: InfluencerContentProps) {
  const [videos, setVideos] = useState<InfluencerVideo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadContent = async () => {
      setLoading(true);
      const influencerVideos = await fetchInfluencerContent(poiName);
      setVideos(influencerVideos);
      setLoading(false);
    };
    loadContent();
  }, [poiName]);

  if (loading) {
    return <div>Loading influencer content...</div>;
  }

  if (videos.length === 0) {
    return null; // Don't render anything if there's no content
  }

  return (
    <Card className="mt-4 bg-gradient-to-r from-blue-50 to-purple-50">
      <CardHeader>
        <CardTitle className="text-lg">From the Community</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {videos.map(video => (
            <div key={video.id} className="flex items-start space-x-4">
              <img src={video.thumbnailUrl} alt={video.title} className="w-24 h-16 object-cover rounded-lg" />
              <div className="flex-1">
                <p className="font-semibold text-sm line-clamp-2">{video.title}</p>
                <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
                  <span>{video.influencerName}</span>
                  <Badge variant="outline" className="flex items-center gap-1">
                    <PlatformIcon platform={video.platform} />
                    {video.platform}
                  </Badge>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

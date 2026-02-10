export interface InfluencerVideo {
  id: string;
  title: string;
  thumbnailUrl: string;
  influencerName: string;
  platform: 'youtube' | 'tiktok' | 'instagram';
}

const mockVideoDatabase: { [key: string]: InfluencerVideo[] } = {
  'Golden Gate Bridge': [
    { id: 'vid1', title: 'Golden Gate Bridge - A Cinematic Drone Tour', thumbnailUrl: '/placeholder-video-1.jpg', influencerName: 'SF Drones', platform: 'youtube' },
    { id: 'vid2', title: 'My Top 5 Photo Spots at the Golden Gate', thumbnailUrl: '/placeholder-video-2.jpg', influencerName: 'PhotoPro', platform: 'instagram' },
  ],
  'Yosemite Falls': [
    { id: 'vid3', title: 'Hiking to the Top of Yosemite Falls!', thumbnailUrl: '/placeholder-video-3.jpg', influencerName: 'Hiker Gal', platform: 'tiktok' },
  ],
};

export async function fetchInfluencerContent(poiName: string): Promise<InfluencerVideo[]> {
  await new Promise(resolve => setTimeout(resolve, 700)); // Simulate network delay

  return mockVideoDatabase[poiName] || [];
}

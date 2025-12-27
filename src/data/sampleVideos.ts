import { CuratedVideo } from '@/types';

export const SAMPLE_VIDEOS: CuratedVideo[] = [
  {
    id: 'v1',
    youtubeVideoId: 'ysz5S6P_ks', // Placeholder ID
    poiId: '1',
    influencerId: 'inf1',
    influencer: {
      id: 'inf1',
      name: 'Sarah Travels',
      handle: '@sarahtravels',
      avatarUrl: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Sarah',
      subscriberCount: 2500000,
      category: 'Travel',
      bio: 'Exploring the world one city at a time.',
      isVerified: true,
      youtubeChannelId: 'UC12345',
      youtubeUrl: 'https://youtube.com'
    },
    title: '48 Hours in New York: Hidden Gems & Local Secrets',
    description: 'Join me as I explore the best coffee shops and hidden parks in NYC.',
    // Pexels: NYC Street/Taxi
    thumbnailUrl: 'https://images.pexels.com/photos/466685/pexels-photo-466685.jpeg?auto=compress&cs=tinysrgb&w=800', 
    duration: 1845,
    viewCount: 2500000,
    publishedAt: '2023-09-15',
    tags: ['NYC', 'Travel', 'Budget'],
    relevanceScore: 0.95,
    isFeatured: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'v2',
    youtubeVideoId: '7GHlLpC9w',
    poiId: '2',
    influencerId: 'inf2',
    influencer: {
      id: 'inf2',
      name: 'Lost LeBlanc',
      handle: '@lostleblanc',
      avatarUrl: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Christian',
      subscriberCount: 1800000,
      category: 'Cinematic',
      bio: 'Cinematic travel vlogs.',
      isVerified: true,
      youtubeChannelId: 'UC67890',
      youtubeUrl: 'https://youtube.com'
    },
    title: 'San Francisco on a Budget: Free Things to Do',
    description: 'How to see the Golden Gate Bridge and more without breaking the bank.',
    // Pexels: Golden Gate Bridge
    thumbnailUrl: 'https://images.pexels.com/photos/208745/pexels-photo-208745.jpeg?auto=compress&cs=tinysrgb&w=800',
    duration: 2100,
    viewCount: 1800000,
    publishedAt: '2023-08-20',
    tags: ['San Francisco', 'Budget', 'Guide'],
    relevanceScore: 0.88,
    isFeatured: false,
    createdAt: new Date().toISOString()
  },
  {
    id: 'v3',
    youtubeVideoId: '9bZkp7q19f0',
    poiId: '3',
    influencerId: 'inf3',
    influencer: {
      id: 'inf3',
      name: 'Yes Theory',
      handle: '@yestheory',
      avatarUrl: 'https://api.dicebear.com/9.x/avataaars/svg?seed=Thomas',
      subscriberCount: 3200000,
      category: 'Adventure',
      bio: 'Seek Discomfort.',
      isVerified: true,
      youtubeChannelId: 'UCabcde',
      youtubeUrl: 'https://youtube.com'
    },
    title: 'Yellowstone National Park: Geysers & Wildlife',
    description: 'We camped in the wild to see the wolves of Yellowstone.',
    // Pexels: Yellowstone / Nature
    thumbnailUrl: 'https://images.pexels.com/photos/210243/pexels-photo-210243.jpeg?auto=compress&cs=tinysrgb&w=800',
    duration: 2400,
    viewCount: 3200000,
    publishedAt: '2023-07-10',
    tags: ['Yellowstone', 'Camping', 'Adventure'],
    relevanceScore: 0.92,
    isFeatured: true,
    createdAt: new Date().toISOString()
  }
];
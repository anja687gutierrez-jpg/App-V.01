/**
 * Influencer Content Integration Guide
 * 
 * This file demonstrates how to integrate the video gallery system
 * into your existing components and pages.
 */

// ============================================================================
// QUICK START: Using Video Components
// ============================================================================

import { VideoGallery } from '@/components/poi/VideoGallery';
import { VideoCard } from '@/components/poi/VideoCard';
import { InfluencerCard } from '@/components/poi/InfluencerCard';
import { getVideosByPOI, getFeaturedVideos } from '@/data/sampleVideos';

// ============================================================================
// 1. DISPLAY VIDEOS FOR A POI (Point of Interest)
// ============================================================================

export function POIVideoDemo({ poiId }: { poiId: string }) {
  const videos = getVideosByPOI(poiId);

  return (
    <VideoGallery
      videos={videos}
      title="Watch Videos From This Location"
      subtitle="See what other travelers experienced here"
    />
  );
}

// ============================================================================
// 2. FEATURED VIDEOS ON DASHBOARD
// ============================================================================

export function DashboardVideos() {
  const featured = getFeaturedVideos();

  return (
    <VideoGallery
      videos={featured}
      title="Featured Travel Videos"
      subtitle="Top recommended videos this week"
      className="mb-8"
    />
  );
}

// ============================================================================
// 3. ENHANCE SMART SUGGESTIONS WITH VIDEOS
// ============================================================================

import type { Suggestion } from '@/types';

interface EnhancedSuggestion extends Suggestion {
  video?: {
    youtubeId: string;
    title: string;
    duration: number;
  };
}

export function SmartSuggestionWithVideo({
  suggestion
}: {
  suggestion: EnhancedSuggestion;
}) {
  const [showVideoModal, setShowVideoModal] = React.useState(false);

  return (
    <div className="space-y-2">
      {/* Existing suggestion content */}
      <h3 className="font-bold">{suggestion.title}</h3>
      <p className="text-sm text-muted-foreground">{suggestion.description}</p>

      {/* NEW: Video thumbnail if available */}
      {suggestion.video && (
        <div
          className="relative rounded-lg overflow-hidden cursor-pointer group mt-3"
          onClick={() => setShowVideoModal(true)}
        >
          <img
            src={`https://i.ytimg.com/vi/${suggestion.video.youtubeId}/hqdefault.jpg`}
            alt={suggestion.video.title}
            className="w-full aspect-video object-cover group-hover:opacity-80 transition-opacity"
          />
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 group-hover:bg-black/60 transition-colors">
            <div className="rounded-full bg-red-600 p-2">
              {/* Play icon */}
              <svg
                className="h-6 w-6 text-white fill-white"
                viewBox="0 0 24 24"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// 4. INFLUENCER PROFILE SECTION
// ============================================================================

import { SAMPLE_INFLUENCERS } from '@/data/sampleVideos';

export function InfluencerSpotlight() {
  const influencer = SAMPLE_INFLUENCERS['sarah-travels'];
  const influencerVideos = 8; // Number of videos by this influencer

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Featured Creator</h2>
      <InfluencerCard
        influencer={influencer}
        videoCount={influencerVideos}
      />
    </div>
  );
}

// ============================================================================
// 5. INTEGRATION EXAMPLES
// ============================================================================

/**
 * Example: Add video gallery to a route detail page
 */
export function RouteDetailWithVideos() {
  const routeId = 'route-usa-west-coast';
  
  // Get all videos for POIs on this route
  // (In production, fetch from your API)
  const routeVideos = getFeaturedVideos().slice(0, 6);

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">West Coast Road Trip</h1>
      
      {/* Existing route content */}
      {/* ... */}

      {/* NEW: Video gallery */}
      <VideoGallery
        videos={routeVideos}
        title="Videos from This Route"
        subtitle="See what other travelers captured along this journey"
      />
    </div>
  );
}

/**
 * Example: Add videos to next stop preview
 */
export function NextStopPreview({ stopId }: { stopId: string }) {
  const videos = getVideosByPOI(stopId);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Check Out Your Next Stop</h2>
      
      {videos.length > 0 && (
        <div className="grid grid-cols-2 gap-4">
          {videos.slice(0, 2).map((video) => (
            <VideoCard key={video.id} video={video} onClick={() => {}} />
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// 6. HOOKS FOR VIDEO MANAGEMENT
// ============================================================================

import { useState, useCallback } from 'react';

/**
 * Hook to manage video gallery state
 */
export function useVideoGallery(poiId: string) {
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const videos = getVideosByPOI(poiId);

  const handleVideoClick = useCallback((video) => {
    setSelectedVideo(video);
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedVideo(null);
  }, []);

  return {
    videos,
    selectedVideo,
    isModalOpen,
    handleVideoClick,
    handleCloseModal
  };
}

// ============================================================================
// 7. DATA FLOW DIAGRAM
// ============================================================================

/**
 * Data Flow:
 * 
 * User clicks video thumbnail
 *     ↓
 * VideoCard onClick → VideoPlayerModal opens
 *     ↓
 * VideoPlayerModal displays YouTube iframe
 *     ↓
 * User can watch full video or visit YouTube
 *     ↓
 * Analytics tracked (optional in future)
 * 
 * 
 * Component Hierarchy:
 * 
 * VideoGallery (Container)
 *   ├── VideoCard[] (Thumbnails)
 *   │   ├── Image
 *   │   ├── Play button
 *   │   ├── Duration badge
 *   │   ├── Influencer info
 *   │   └── Tags
 *   └── VideoPlayerModal
 *       ├── YouTube iframe
 *       ├── Video metadata
 *       ├── Influencer profile
 *       └── Stats (views, date, etc)
 */

// ============================================================================
// 8. STYLING & THEMING
// ============================================================================

/**
 * The video components use existing Tailwind classes and shadcn/ui components.
 * They automatically inherit your theme colors through:
 * 
 * - bg-card, text-card-foreground
 * - border, border-input
 * - text-muted-foreground
 * - hover states and transitions
 * 
 * To customize:
 * 1. Update colors in tailwind.config.js
 * 2. Override individual component styles in className prop
 * 3. Modify component files directly
 */

// ============================================================================
// 9. EXTENDING THE SYSTEM
// ============================================================================

/**
 * Future enhancements:
 * 
 * 1. Search & Filter
 *    - Filter videos by influencer, tag, duration
 *    - Search across all video content
 * 
 * 2. YouTube API Integration
 *    - Auto-fetch video metadata
 *    - Real-time view counts and statistics
 *    - Dynamic search by location
 * 
 * 3. User Interactions
 *    - Save videos to "Watch Later"
 *    - Video recommendations based on watched content
 *    - Share videos with other travelers
 * 
 * 4. Analytics
 *    - Track video clicks and plays
 *    - Measure engagement by location
 *    - Popular creators and videos
 * 
 * 5. Curated Collections
 *    - Admin tool to curate videos
 *    - Themed collections (Budget Travel, Adventure, etc.)
 *    - Seasonal/trending collections
 */

export default {};

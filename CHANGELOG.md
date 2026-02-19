# Changelog

All notable changes to Iconic Pathways will be documented in this file.

## [Phase 3] - 2026-01-25

### Mobile Polish & UI Improvements

This release focuses on responsive design, touch optimization, animations, and overall UI polish to deliver a seamless mobile experience.

---

### Responsive Layouts

- **Collapsible Sidebar**: Desktop sidebar now supports collapse/expand toggle for more screen real estate
- **Mobile Sidebar Overlay**: Full-screen overlay sidebar on mobile with touch-friendly close button
- **Adaptive Layout**: `AppLayout` detects mobile via `useIsMobile` hook and adjusts UI accordingly
- **Container Padding**: Reduced container padding on mobile (1rem vs desktop default)
- **Grid Gap Adjustments**: Tighter grid gaps on mobile for better card stacking
- **Hero Text Scaling**: Responsive hero title sizing (2rem on mobile)

### Touch Targets (44px Minimum)

- **`.touch-target` Utility Class**: Ensures minimum 44x44px touch targets per Apple HIG guidelines
- **`.btn-mobile` Class**: Mobile buttons with 48px minimum height and generous padding
- **Safe Area Support**: `.safe-bottom` utility for iOS safe area inset handling

### Animations

New CSS keyframe animations for smooth, polished interactions:

| Animation | Effect | Duration |
|-----------|--------|----------|
| `fadeIn` | Fade in with subtle upward slide | 0.3s ease-in-out |
| `slideUp` | Slide up from 20px below with fade | 0.3s ease-out |
| `slideDown` | Slide down from 20px above with fade | 0.3s ease-out |
| `scaleIn` | Scale from 95% to 100% with fade | 0.2s ease-out |
| `slideInRight` | Slide in from right (toasts) | 0.4s cubic-bezier |
| `pulse-soft` | Gentle opacity pulse | 2s infinite |
| `shimmer-effect` | Moving shine effect (buttons) | 3.5s infinite |
| `skeleton-loading` | Loading skeleton gradient | 1.5s infinite |

**Animation Classes:**
- `.animate-fade-in`
- `.animate-slide-up`
- `.animate-slide-down`
- `.animate-scale-in`
- `.animate-pulse-soft`
- `.page-transition`

### UI Polish

- **Card Hover Effects**: `.card-hover` class with transform and shadow transitions
- **Glass Morphism**: `.glass` and `.glass-dark` classes for frosted glass effects
- **Consistent Border Radius**: `.rounded-card` (0.75rem) and `.rounded-button` (0.5rem)
- **Consistent Shadows**: `.shadow-card` and `.shadow-card-hover` utilities
- **Focus States**: Enhanced focus-visible outlines for accessibility (2px ring)
- **Scrollbar Hiding**: `.scrollbar-hide` for cleaner mobile scrolling
- **Text Balance**: `.mobile-text-balance` for better text wrapping
- **Toast Notifications**: Styled confirmation toasts with slide-in animation
- **Surprise Me Button**: Gradient button with shimmer effect and hover states
- **Loading Skeletons**: Animated gradient skeleton loader

### Map Improvements

- **Mobile Control Positioning**: Leaflet controls repositioned on mobile (top: 80px)
- **Zoom Control Margins**: Adjusted zoom control margins for touch accessibility
- **POI Marker Styles**: Clean transparent background for map markers

---

### Files Modified

#### Components
- `src/components/layout/AppLayout.tsx` - Collapsible sidebar, mobile overlay, responsive hooks
- `src/components/map/InteractiveRouteMap.tsx` - Mobile-friendly map controls
- `src/components/map/POIMarkers.tsx` - New POI marker component with touch support
- `src/components/ai/TravelBestie.tsx` - New AI chat widget component

#### Pages
- `src/pages/Dashboard.tsx` - Responsive grid layouts, touch-friendly cards
- `src/pages/RoutePlanner.tsx` - Mobile-optimized route planning interface

#### Styles
- `src/index.css` - All new animations, utilities, and responsive breakpoints

#### Services
- `src/services/aiService.ts` - New AI service for Travel Bestie
- `src/services/index.ts` - Service exports

---

### Technical Notes

- Touch target minimum follows Apple Human Interface Guidelines (44pt)
- Animations use CSS transforms for GPU acceleration
- Glass morphism uses `backdrop-filter` with webkit prefix for Safari support
- Safe area insets use `env()` function for iOS notch/home indicator
- Mobile breakpoint: 640px (sm), 768px (md) for map controls

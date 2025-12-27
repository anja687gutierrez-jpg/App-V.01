/**
 * Hooks Index
 * 
 * Barrel export for all custom hooks.
 * Provides convenient access to React hooks throughout the app.
 * 
 * Usage:
 *   import { useRoutes, useDashboardStats, useCurrentTrip } from '@/hooks';
 */

// Existing hooks
export { useToast } from './use-toast';
export { useIsMobile } from './use-mobile';

// New data hooks
export { useRoutes } from './useRoutes';
export { usePOIs, useNearbyPOIs, useNearbyParking } from './usePOIs';
export { useCurrentTrip } from './useCurrentTrip';
export { useTripHistory, useRecentTrips } from './useTripHistory';
export { useDashboardStats } from './useDashboardStats';
export { useAIAssistant } from './useAIAssistant';

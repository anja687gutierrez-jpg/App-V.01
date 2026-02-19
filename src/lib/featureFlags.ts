/**
 * Feature Flag & Membership System
 *
 * Controls access to features based on user membership tier
 * Supports one-time purchase tiers: free, basic, advanced, expert
 *
 * CRITICAL: Users NEVER lose access to previously created trips
 * Limits apply only to creating NEW content
 */

import type { MembershipTier, MembershipLimits, FeatureAccess, UserUsage } from '@/types';
import { authService } from '@/lib/firebaseConfig';

// Test users (development/beta testers) — matched by email
const TEST_USERS = [
  'test@example.com',
  'dev@example.com',
  'anjacarrillo@example.com',
  'anja@iconicpathways.com',
  'admin@example.com',
  'anja687gutierrez@gmail.com',
];

// Membership tier limits and feature access
export const TIER_LIMITS: Record<MembershipTier, MembershipLimits> = {
  free: {
    maxSavedTrips: 3,
    maxWaypointsPerTrip: 7,
    monthlyRouteCalculations: 0, // Mock data only
    maxOfflineTrips: 0,
    features: {
      realTimeRouting: false,
      routeOptimization: false,
      geocoding: false,
      offlineAccess: false,
      tripSharing: false,
      dataExport: false,
      influencerContent: 'sample',
      aiMessages: 10,
      safetyFeatures: 'basic',
    },
  },

  basic: {
    maxSavedTrips: 25,
    maxWaypointsPerTrip: 25,
    monthlyRouteCalculations: 100,
    maxOfflineTrips: 5,
    features: {
      realTimeRouting: true,
      routeOptimization: false,
      geocoding: true,
      offlineAccess: true,
      tripSharing: true,
      dataExport: true,
      influencerContent: 'full',
      aiMessages: 'unlimited',
      safetyFeatures: 'full',
    },
  },

  advanced: {
    maxSavedTrips: 'unlimited',
    maxWaypointsPerTrip: 100,
    monthlyRouteCalculations: 500,
    maxOfflineTrips: 'unlimited',
    features: {
      realTimeRouting: true,
      routeOptimization: true,
      geocoding: true,
      geocodingUnlimited: true,
      offlineAccess: true,
      tripSharing: true,
      tripCollaboration: true,
      dataExport: true,
      exportFormats: ['csv', 'pdf', 'gpx', 'kml'],
      influencerContent: 'exclusive',
      aiMessages: 'unlimited',
      aiPriority: true,
      safetyFeatures: 'full',
      liveTracking: true,
      analytics: true,
      evRouting: true, // Future
      fuelOptimization: true, // Future
    },
  },

  expert: {
    maxSavedTrips: 'unlimited',
    maxWaypointsPerTrip: 'unlimited',
    monthlyRouteCalculations: 'unlimited',
    maxOfflineTrips: 'unlimited',
    features: {
      realTimeRouting: true,
      routeOptimization: true,
      routeOptimizationAdvanced: true,
      geocoding: true,
      geocodingUnlimited: true,
      offlineAccess: true,
      offlineAutoSync: true,
      tripSharing: true,
      tripCollaboration: true,
      publicProfile: true,
      dataExport: true,
      exportFormats: ['csv', 'pdf', 'gpx', 'kml'],
      apiAccess: true,
      influencerContent: 'exclusive',
      influencerContentCreation: true,
      aiMessages: 'unlimited',
      aiPriority: true,
      aiCustomTraining: true,
      safetyFeatures: 'full',
      liveTracking: true,
      analytics: true,
      evRouting: true,
      fuelOptimization: true,
      parkingFinder: true,
      flightTracking: true, // Future
      arFeatures: true, // Future
      whiteLabel: true, // Future
      prioritySupport: true,
      betaAccess: true,
    },
  },

  test: {
    // Same as expert + development features
    maxSavedTrips: 'unlimited',
    maxWaypointsPerTrip: 'unlimited',
    monthlyRouteCalculations: 'unlimited',
    maxOfflineTrips: 'unlimited',
    features: {
      realTimeRouting: true,
      routeOptimization: true,
      routeOptimizationAdvanced: true,
      geocoding: true,
      geocodingUnlimited: true,
      offlineAccess: true,
      offlineAutoSync: true,
      tripSharing: true,
      tripCollaboration: true,
      publicProfile: true,
      dataExport: true,
      exportFormats: ['csv', 'pdf', 'gpx', 'kml'],
      apiAccess: true,
      influencerContent: 'exclusive',
      influencerContentCreation: true,
      aiMessages: 'unlimited',
      aiPriority: true,
      aiCustomTraining: true,
      safetyFeatures: 'full',
      liveTracking: true,
      analytics: true,
      evRouting: true,
      fuelOptimization: true,
      parkingFinder: true,
      flightTracking: true,
      arFeatures: true,
      whiteLabel: true,
      prioritySupport: true,
      betaAccess: true,
      debugMode: true,
      apiMonitoring: true,
    },
  },
};

/**
 * Get user's membership tier
 * In production, this would query the database
 * For now, checks test users or returns 'free'
 */
export function getUserMembership(userId?: string): MembershipTier {
  if (!userId) return 'free';

  // Check for dev test tier override (for testing different tiers)
  try {
    const testTier = localStorage.getItem('dev_test_tier');
    if (testTier && ['free', 'basic', 'advanced', 'expert', 'test'].includes(testTier)) {
      return testTier as MembershipTier;
    }
  } catch (error) {
    // Ignore
  }

  // Check if test user — by userId (email) or current Firebase user's email
  if (TEST_USERS.includes(userId)) return 'test';
  const currentEmail = authService.getCurrentUser()?.email;
  if (currentEmail && TEST_USERS.includes(currentEmail)) return 'test';

  // TODO: In production, query from database/Firestore
  // const userDoc = await db.collection('users').doc(userId).get();
  // return userDoc.data()?.membershipTier || 'free';

  // For now, check localStorage
  try {
    const stored = localStorage.getItem(`membership_${userId}`);
    if (stored) {
      const tier = stored as MembershipTier;
      if (['free', 'basic', 'advanced', 'expert'].includes(tier)) {
        return tier;
      }
    }
  } catch (error) {
    console.error('Error reading membership from storage:', error);
  }

  return 'free';
}

/**
 * Set user's membership tier (for testing/demo purposes)
 */
export function setUserMembership(userId: string, tier: MembershipTier): void {
  try {
    localStorage.setItem(`membership_${userId}`, tier);
  } catch (error) {
    console.error('Error saving membership:', error);
  }
}

/**
 * Get membership limits for a tier
 */
export function getMembershipLimits(tier: MembershipTier): MembershipLimits {
  return TIER_LIMITS[tier];
}

/**
 * Check if a specific feature is enabled for user
 */
export function isFeatureEnabled(
  featureName: keyof FeatureAccess,
  userId?: string
): boolean {
  const tier = getUserMembership(userId);
  const limits = TIER_LIMITS[tier];

  // Check override from localStorage (for testing)
  const override = getFeatureOverride(featureName);
  if (override !== null) return override;

  return !!limits.features[featureName];
}

/**
 * Get all features for a user
 */
export function getUserFeatures(userId?: string): FeatureAccess {
  const tier = getUserMembership(userId);
  return TIER_LIMITS[tier].features;
}

/**
 * Check if user has exceeded usage limit
 */
export function checkUsageLimit(
  userId: string,
  limitType: 'savedTrips' | 'waypointsPerTrip' | 'routeCalculations' | 'offlineTrips',
  currentValue: number
): { allowed: boolean; limit: number | 'unlimited'; remaining: number | 'unlimited' } {
  const tier = getUserMembership(userId);
  const limits = TIER_LIMITS[tier];

  let limit: number | 'unlimited';

  switch (limitType) {
    case 'savedTrips':
      limit = limits.maxSavedTrips;
      break;
    case 'waypointsPerTrip':
      limit = limits.maxWaypointsPerTrip;
      break;
    case 'routeCalculations':
      limit = limits.monthlyRouteCalculations;
      break;
    case 'offlineTrips':
      limit = limits.maxOfflineTrips;
      break;
    default:
      limit = 0;
  }

  if (limit === 'unlimited') {
    return { allowed: true, limit: 'unlimited', remaining: 'unlimited' };
  }

  const allowed = currentValue < limit;
  const remaining = Math.max(0, limit - currentValue);

  return { allowed, limit, remaining };
}

/**
 * Get user's current usage
 */
export function getUserUsage(userId: string): UserUsage {
  try {
    const stored = localStorage.getItem(`usage_${userId}`);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Error reading usage:', error);
  }

  // Default usage
  const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
  return {
    userId,
    tier: getUserMembership(userId),
    currentMonth,
    routeCalculations: 0,
    savedTrips: 0,
    offlineTrips: 0,
    lastReset: new Date().toISOString(),
  };
}

/**
 * Increment usage counter
 */
export function incrementUsageCount(
  userId: string,
  type: 'routeCalculations' | 'savedTrips' | 'offlineTrips',
  amount: number = 1
): UserUsage {
  const usage = getUserUsage(userId);
  const currentMonth = new Date().toISOString().slice(0, 7);

  // Reset if new month
  if (usage.currentMonth !== currentMonth) {
    usage.currentMonth = currentMonth;
    usage.routeCalculations = 0;
    usage.lastReset = new Date().toISOString();
  }

  // Increment counter
  usage[type] = (usage[type] || 0) + amount;

  // Save to localStorage
  try {
    localStorage.setItem(`usage_${userId}`, JSON.stringify(usage));
  } catch (error) {
    console.error('Error saving usage:', error);
  }

  return usage;
}

/**
 * Reset monthly limits (called by cron job or manually)
 */
export function resetMonthlyLimits(userId: string): void {
  const usage = getUserUsage(userId);
  const currentMonth = new Date().toISOString().slice(0, 7);

  usage.currentMonth = currentMonth;
  usage.routeCalculations = 0;
  usage.lastReset = new Date().toISOString();

  try {
    localStorage.setItem(`usage_${userId}`, JSON.stringify(usage));
  } catch (error) {
    console.error('Error resetting usage:', error);
  }
}

/**
 * Get feature override from localStorage (for testing)
 */
export function getFeatureOverride(featureName: string): boolean | null {
  try {
    const override = localStorage.getItem(`feature_${featureName}`);
    if (override === 'true') return true;
    if (override === 'false') return false;
    return null;
  } catch {
    return null;
  }
}

/**
 * Set feature override (for testing)
 */
export function setFeatureOverride(featureName: string, enabled: boolean): void {
  try {
    localStorage.setItem(`feature_${featureName}`, enabled.toString());
  } catch (error) {
    console.error('Failed to set feature override:', error);
  }
}

/**
 * Clear all feature overrides
 */
export function clearFeatureOverrides(): void {
  try {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith('feature_')) {
        localStorage.removeItem(key);
      }
    });
  } catch (error) {
    console.error('Failed to clear feature overrides:', error);
  }
}

/**
 * Moderator check — hardcoded emails for now (no Cloud Functions needed)
 */
const MODERATOR_EMAILS = ['anja687gutierrez@gmail.com'];

export function isModerator(email?: string | null): boolean {
  return !!email && MODERATOR_EMAILS.includes(email);
}

/**
 * Get tier display name
 */
export function getTierDisplayName(tier: MembershipTier): string {
  const names: Record<MembershipTier, string> = {
    free: 'Free Explorer',
    basic: 'Basic Explorer',
    advanced: 'Advanced Explorer',
    expert: 'Expert Explorer',
    test: 'Test User',
  };
  return names[tier];
}

/**
 * Get tier price
 */
export function getTierPrice(tier: MembershipTier): number {
  const prices: Record<MembershipTier, number> = {
    free: 0,
    basic: 29.99,
    advanced: 59.99,
    expert: 99.99,
    test: 0,
  };
  return prices[tier];
}

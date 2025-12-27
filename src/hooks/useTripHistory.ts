/**
 * useTripHistory Hook
 * 
 * Provides access to trip history with optional filtering.
 * 
 * Usage:
 *   const { trips, stats, loading } = useTripHistory();
 *   const { trips: userTrips } = useTripHistory({ userId: 'user-1' });
 */

import { useState, useEffect } from 'react';
import { tripService } from '@/services';

interface Trip {
  id: string;
  routeId: string;
  userId: string;
  startTime: string;
  endTime: string | null;
  distanceTraveled: number;
  fuelCost: number;
  rating: number | null;
  status: 'active' | 'completed';
}

interface TripStats {
  totalTrips: number;
  completedTrips: number;
  activeTrips: number;
  totalDistance: number;
  totalFuelCost: number;
  avgRating: number;
  fuelEfficiency: number;
  uniquePOIsVisited: number;
  averageTripDuration: number;
}

interface UseTripHistoryOptions {
  userId?: string;
  limit?: number;
  autoLoad?: boolean;
}

interface UseTripHistoryResult {
  trips: Trip[];
  stats: TripStats | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  getRouteStats: (routeId: string) => Promise<any>;
}

export function useTripHistory(
  options: UseTripHistoryOptions = {}
): UseTripHistoryResult {
  const { userId, autoLoad = true } = options;

  const [trips, setTrips] = useState<Trip[]>([]);
  const [stats, setStats] = useState<TripStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadHistory = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load trip history
      const historyData = await tripService.getTripHistory(userId);
      setTrips(historyData);

      // Load overall stats
      const statsData = await tripService.getTripStats();
      setStats(statsData);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      setTrips([]);
      setStats(null);
    } finally {
      setLoading(false);
    }
  };

  const getRouteStats = async (routeId: string) => {
    try {
      return await tripService.getRouteTripsStats(routeId);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      return null;
    }
  };

  useEffect(() => {
    if (autoLoad) {
      loadHistory();
    }
  }, [autoLoad, userId]);

  return {
    trips,
    stats,
    loading,
    error,
    refetch: loadHistory,
    getRouteStats,
  };
}

/**
 * useRecentTrips Hook
 * 
 * Get recent trips with optional limit.
 * 
 * Usage:
 *   const { trips, loading } = useRecentTrips(5);
 */

export function useRecentTrips(limit: number = 5) {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadRecent = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await tripService.getRecentTrips(limit);
      setTrips(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      setTrips([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecent();
  }, [limit]);

  return {
    trips,
    loading,
    error,
    refetch: loadRecent,
  };
}

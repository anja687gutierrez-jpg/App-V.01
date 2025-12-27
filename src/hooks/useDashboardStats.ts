/**
 * useDashboardStats Hook
 * 
 * Aggregates data from multiple services for dashboard display.
 * This is the primary hook for dashboard components.
 * 
 * Usage:
 *   const { stats, loading, error, refetch } = useDashboardStats();
 */

import { useState, useEffect, useCallback } from 'react';
import { routeService, poiService, tripService } from '@/services';

interface DashboardStats {
  routes: {
    total: number;
    active: number;
    trending: any[];
  };
  trips: {
    total: number;
    completed: number;
    active: number;
    totalDistance: number;
    totalFuelCost: number;
    avgRating: number;
  };
  pois: {
    total: number;
    visited: number;
    parking: number;
    assistance: number;
    attractions: number;
  };
}

interface UseDashboardStatsResult {
  stats: DashboardStats | null;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useDashboardStats(): UseDashboardStatsResult {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all data in parallel
      const [
        allRoutes,
        activeRoutes,
        trendingRoutes,
        tripStats,
        allPOIs,
        parking,
        assistance,
        attractions,
      ] = await Promise.all([
        routeService.getAllRoutes(),
        routeService.getActiveRoutes(),
        routeService.getTrendingRoutes(5),
        tripService.getTripStats(),
        poiService.getAllPOIs(),
        poiService.getParkingLocations(),
        poiService.getRoadsideAssistance(),
        poiService.getAttractions(),
      ]);

      const visitedPOIs = allPOIs.filter((p) => p.visitStatus === 'visited');

      setStats({
        routes: {
          total: allRoutes.length,
          active: activeRoutes.length,
          trending: trendingRoutes,
        },
        trips: {
          total: tripStats.totalTrips,
          completed: tripStats.completedTrips,
          active: tripStats.activeTrips,
          totalDistance: tripStats.totalDistance,
          totalFuelCost: tripStats.totalFuelCost,
          avgRating: tripStats.avgRating,
        },
        pois: {
          total: allPOIs.length,
          visited: visitedPOIs.length,
          parking: parking.length,
          assistance: assistance.length,
          attractions: attractions.length,
        },
      });
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      setStats(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  return {
    stats,
    loading,
    error,
    refetch: loadStats,
  };
}

/**
 * Route Service
 * 
 * Centralized service for all route-related database operations.
 * This service abstracts away direct SDK calls and provides a clean interface
 * for route management across the application.
 * 
 * To connect to your backend: Replace the sample data calls with your API calls
 */

import { Route, POI, TripRecord } from '@/types';
import { openRouteService } from './openRouteService';
import { isFeatureEnabled } from '@/lib/featureFlags';
import { incrementUsageCount } from '@/lib/featureFlags';

// Sample route data (replace with your backend API calls)
export const sampleRoutes: Route[] = [
  {
    id: 'route-1',
    name: 'California Coast Highway',
    startLocation: { lat: 37.7749, lng: -122.4194 },
    endLocation: { lat: 34.0522, lng: -118.2437 },
    distance: 380,
    estimatedDuration: 7,
    difficulty: 'moderate',
    scenery: 'coastal',
    bestTimeToVisit: 'May-September',
    highlights: ['Golden Gate Bridge', 'Big Sur', 'Malibu Beach'],
    pois: ['poi-1', 'poi-2', 'poi-3'],
    status: 'active',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'route-2',
    name: 'Rocky Mountain Explorer',
    startLocation: { lat: 39.7392, lng: -104.9903 },
    endLocation: { lat: 43.4722, lng: -110.7624 },
    distance: 520,
    estimatedDuration: 5,
    difficulty: 'moderate',
    scenery: 'mountains',
    bestTimeToVisit: 'June-September',
    highlights: ['Rocky Mountains', 'Grand Teton', 'Yellowstone'],
    pois: ['poi-4', 'poi-5'],
    status: 'archived',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'route-3',
    name: 'Desert Landscapes',
    startLocation: { lat: 33.7490, lng: -112.0404 },
    endLocation: { lat: 35.0844, lng: -106.6504 },
    distance: 450,
    estimatedDuration: 4,
    difficulty: 'easy',
    scenery: 'desert',
    bestTimeToVisit: 'November-March',
    highlights: ['Grand Canyon', 'Sedona', 'Albuquerque'],
    pois: ['poi-6', 'poi-7'],
    status: 'draft',
    createdAt: new Date().toISOString(),
  },
];

// Sample trip history data
export const sampleTripHistory: TripRecord[] = [
  {
    id: 'trip-1',
    routeId: 'route-1',
    userId: 'user_demo',
    startTime: new Date(2024, 11, 15).toISOString(),
    endTime: new Date(2024, 11, 22).toISOString(),
    startLocation: { lat: 36.7783, lng: -119.4179 },
    endLocation: { lat: 34.0522, lng: -118.2437 },
    distanceTraveled: 380,
    fuelUsed: 13.6,
    fuelCost: 85.50,
    poisVisited: ['poi-1', 'poi-2'],
    checkPoints: [],
    rating: 4.8,
    notes: null,
    status: 'completed',
  },
  {
    id: 'trip-2',
    routeId: 'route-2',
    userId: 'user_demo',
    startTime: new Date(2024, 10, 5).toISOString(),
    endTime: new Date(2024, 10, 10).toISOString(),
    startLocation: { lat: 37.7749, lng: -122.4194 },
    endLocation: { lat: 34.0522, lng: -118.2437 },
    distanceTraveled: 520,
    fuelUsed: 18.6,
    fuelCost: 120.00,
    poisVisited: ['poi-4'],
    checkPoints: [],
    rating: 4.5,
    notes: null,
    status: 'completed',
  },
];

/**
 * routeService - Main service for route operations
 * 
 * Methods:
 * - getAllRoutes() - Get all routes
 * - getActiveRoutes() - Get only active routes
 * - getRouteById(id) - Get specific route
 * - createRoute(data) - Create new route
 * - updateRoute(id, data) - Update route
 * - deleteRoute(id) - Delete route
 * - getTripHistory() - Get trip history
 * - addTripRecord(record) - Record completed trip
 */
export const routeService = {
  /**
   * Get all routes from database
   * @returns Promise<Route[]> - All routes
   */
  async getAllRoutes(): Promise<Route[]> {
    // TODO: Replace with your backend API call to fetch all routes
    return new Promise((resolve) => {
      setTimeout(() => resolve(sampleRoutes), 100);
    });
  },

  /**
   * Get active routes only
   * @returns Promise<Route[]> - Active routes (status: 'active')
   */
  async getActiveRoutes(): Promise<Route[]> {
  // TODO: Replace with your backend API call to fetch active routes
    const routes = await this.getAllRoutes();
    return routes.filter((r) => r.status === 'active');
  },

  /**
   * Get a specific route by ID
   * @param id - Route ID
   * @returns Promise<Route | null> - Route or null if not found
   */
  async getRouteById(id: string): Promise<Route | null> {
  // TODO: Replace with your backend API call to fetch a single route
    const routes = await this.getAllRoutes();
    return routes.find((r) => r.id === id) || null;
  },

  /**
   * Create a new route
   * @param data - Route data to create
   * @returns Promise<Route> - Created route
   */
  async createRoute(data: Omit<Route, 'id' | 'createdAt'>): Promise<Route> {
  // TODO: Replace with your backend API call to create a route
    const newRoute: Route = {
      ...data,
      id: `route-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    return Promise.resolve(newRoute);
  },

  /**
   * Update an existing route
   * @param id - Route ID to update
   * @param data - Partial route data to update
   * @returns Promise<Route> - Updated route
   */
  async updateRoute(
    id: string,
    data: Partial<Omit<Route, 'id' | 'createdAt'>>
  ): Promise<Route | null> {
  // TODO: Replace with your backend API call to update a route
    const route = await this.getRouteById(id);
    if (!route) return null;
    return Promise.resolve({ ...route, ...data });
  },

  /**
   * Delete a route
   * @param id - Route ID to delete
   * @returns Promise<boolean> - Success status
   */
  async deleteRoute(id: string): Promise<boolean> {
  // TODO: Replace with your backend API call to delete a route
    return Promise.resolve(true);
  },

  /**
   * Get trip history for a route
   * @param routeId - Optional route ID to filter by
   * @returns Promise<TripRecord[]> - Trip history records
   */
  async getTripHistory(routeId?: string) {
  // TODO: Replace with your backend API call to fetch trip history
    return Promise.resolve(
      routeId
        ? sampleTripHistory.filter((t) => t.routeId === routeId)
        : sampleTripHistory
    );
  },

  /**
   * Get total statistics for a route
   * @param id - Route ID
   * @returns Promise<RouteStats> - Route statistics
   */
  async getRouteStats(id: string) {
    const route = await this.getRouteById(id);
    const history = await this.getTripHistory(id);

    if (!route) return null;

    const totalTrips = history.length;
    const totalDistance = history.reduce((sum, t) => sum + t.distanceTraveled, 0);
    const totalFuelCost = history.reduce((sum, t) => sum + t.fuelCost, 0);
    const avgRating = history.length > 0
      ? history.reduce((sum, t) => sum + (t.rating || 0), 0) / history.length
      : 0;

    return {
      id,
      name: route.name,
      totalTrips,
      totalDistance,
      totalFuelCost,
      avgRating: Math.round(avgRating * 10) / 10,
      lastTraveled: history[0]?.endTime,
    };
  },

  /**
   * Add a trip record (called after trip completion)
   * @param record - Trip record to save
   * @returns Promise<void>
   */
  async addTripRecord(record: any): Promise<void> {
  // TODO: Replace with your backend API call to record trip history
    sampleTripHistory.push(record);
    return Promise.resolve();
  },

  /**
   * Search routes by criteria
   * @param criteria - Search filters
   * @returns Promise<Route[]> - Matching routes
   */
  async searchRoutes(criteria: {
    difficulty?: string;
    scenery?: string;
    minDistance?: number;
    maxDistance?: number;
  }): Promise<Route[]> {
    const routes = await this.getAllRoutes();
    return routes.filter((r) => {
      if (criteria.difficulty && r.difficulty !== criteria.difficulty) return false;
      if (criteria.scenery && r.scenery !== criteria.scenery) return false;
      if (criteria.minDistance && r.distance < criteria.minDistance) return false;
      if (criteria.maxDistance && r.distance > criteria.maxDistance) return false;
      return true;
    });
  },

  /**
   * Get trending routes (most visited)
   * @param limit - Number of routes to return
   * @returns Promise<Route[]> - Top routes
   */
  async getTrendingRoutes(limit: number = 5): Promise<Route[]> {
    const routes = await this.getAllRoutes();
    const routeStats = await Promise.all(
      routes.map((r) => this.getRouteStats(r.id))
    );

    return routeStats
      .filter((s) => s !== null)
      .sort((a, b) => (b?.totalTrips || 0) - (a?.totalTrips || 0))
      .slice(0, limit)
      .map((stat) => routes.find((r) => r.id === stat?.id)!)
      .filter(Boolean);
  },

  /**
   * Calculate route using OpenRouteService or fallback to mock
   * This is the KEY integration point
   *
   * @param waypoints - Array of waypoint coordinates
   * @param userId - User ID for feature flag check
   * @returns Enhanced route data
   */
  async calculateRoute(
    waypoints: { lat: number; lng: number }[],
    userId?: string
  ): Promise<{
    distance: number; // km
    duration: number; // hours
    geometry?: [number, number][];
    instructions?: any[];
  }> {
    // Check if user has access to real API
    const useRealAPI = isFeatureEnabled('realTimeRouting', userId);

    if (useRealAPI && openRouteService.isConfigured()) {
      try {
        const orsRoute = await openRouteService.getDirections(waypoints, 'driving-car', {
          includeInstructions: true,
          includeGeometry: true,
        });

        if (orsRoute) {
          // Increment usage counter
          if (userId) {
            incrementUsageCount(userId, 'routeCalculations', 1);
          }

          return {
            distance: orsRoute.summary.distance / 1000, // meters to km
            duration: orsRoute.summary.duration / 3600, // seconds to hours
            geometry: orsRoute.geometry.coordinates,
            instructions: orsRoute.segments.flatMap(s => s.steps),
          };
        }
      } catch (error) {
        console.error('ORS route calculation failed, using fallback:', error);
      }
    }

    // FALLBACK: Enhanced mock calculation
    return this.calculateMockRoute(waypoints);
  },

  /**
   * Enhanced mock route calculation
   * More realistic than simple straight-line distance
   */
  calculateMockRoute(
    waypoints: { lat: number; lng: number }[]
  ): {
    distance: number;
    duration: number;
    geometry?: [number, number][];
  } {
    let totalDistance = 0;

    // Calculate distance between consecutive waypoints
    for (let i = 0; i < waypoints.length - 1; i++) {
      const d = this.haversineDistance(waypoints[i], waypoints[i + 1]);
      totalDistance += d;
    }

    // Apply road factor (roads aren't straight lines)
    const roadFactor = 1.3; // Assume roads are ~30% longer than straight line
    const distance = totalDistance * roadFactor;

    // Estimate duration (assume average 80 km/h, slower in cities)
    const duration = distance / 80;

    return {
      distance,
      duration,
    };
  },

  /**
   * Haversine formula for distance between two coordinates
   */
  haversineDistance(
    coord1: { lat: number; lng: number },
    coord2: { lat: number; lng: number }
  ): number {
    const R = 6371; // Earth's radius in km
    const dLat = this.toRad(coord2.lat - coord1.lat);
    const dLon = this.toRad(coord2.lng - coord1.lng);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(coord1.lat)) *
      Math.cos(this.toRad(coord2.lat)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  },

  toRad(degrees: number): number {
    return degrees * (Math.PI / 180);
  },

  /**
   * Geocode address to coordinates
   */
  async geocodeAddress(
    address: string,
    userId?: string
  ): Promise<{ lat: number; lng: number } | null> {
    const useRealAPI = isFeatureEnabled('geocoding', userId);

    if (useRealAPI && openRouteService.isConfigured()) {
      try {
        const result = await openRouteService.geocode(address, { country: 'US' });
        if (result) {
          return { lat: result.lat, lng: result.lng };
        }
      } catch (error) {
        console.error('Geocoding failed:', error);
      }
    }

    // Fallback: return null (UI should handle)
    return null;
  },
};

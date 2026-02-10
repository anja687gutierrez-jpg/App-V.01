/**
 * Route Service - Firebase Connected
 * 
 * Fetches routes from Firebase with aggressive caching
 * Routes are static data - loaded once and cached for 1 year
 */

import { Route, RouteStop, TripRecord } from '@/types';
import { callFirebaseFunction, getCachedData, setCachedData, getFirebaseConfig } from '@/lib/firebase';
import { sampleRoutes, sampleTripHistory } from '../services/routeService';

const ROUTES_CACHE_KEY = 'routes_cache';

export const routeService = {
  /**
   * Get all routes from Firebase (with client-side caching)
   * First load calls Firebase Cloud Function, then caches for 1 year
   * 
   * @returns Promise<Route[]> - All routes
   */
  async getAllRoutes(): Promise<Route[]> {
    const config = getFirebaseConfig();
    
    // Check browser cache first
    const cached = getCachedData(ROUTES_CACHE_KEY);
    if (cached) {
      return cached;
    }

    try {
      // Call Firebase Cloud Function
      const routes = await callFirebaseFunction<Route[]>('getRoutes');
      
      // Cache for 1 year (routes rarely change)
      setCachedData(ROUTES_CACHE_KEY, routes, config.routeCacheDuration);

      return routes;
    } catch (error) {
      console.error('Error fetching routes from Firebase:', error);
      
      // Fall back to sample data if offline
      if (config.useSampleData) {
        return sampleRoutes;
      }
      
      throw error;
    }
  },

  /**
   * Get active routes only
   * @returns Promise<Route[]> - Active routes
   */
  async getActiveRoutes(): Promise<Route[]> {
    const routes = await this.getAllRoutes();
    return routes.filter((r) => r.status === 'active');
  },

  /**
   * Get specific route by ID
   * @param id - Route ID
   * @returns Promise<Route | null> - Route or null if not found
   */
  async getRouteById(id: string): Promise<Route | null> {
    const routes = await this.getAllRoutes();
    return routes.find((r) => r.id === id) || null;
  },

  /**
   * Create a new route
   * @param data - Route data to create
   * @returns Promise<Route> - Created route with ID
   */
  async createRoute(data: Omit<Route, 'id' | 'createdAt'>): Promise<Route> {
    // TODO: Call Firebase Cloud Function to create route
    // POST /routes with userId from auth context
    
    // For now, return sample
    return {
      id: `route-${Date.now()}`,
      ...data,
      createdAt: new Date().toISOString(),
    } as Route;
  },

  /**
   * Update an existing route
   * @param id - Route ID
   * @param data - Data to update
   * @returns Promise<Route> - Updated route
   */
  async updateRoute(id: string, data: Partial<Route>): Promise<Route> {
    // TODO: Call Firebase Cloud Function to update route
    // PUT /routes/:id with userId verification
    
    const route = await this.getRouteById(id);
    if (!route) throw new Error('Route not found');
    
    return { ...route, ...data };
  },

  /**
   * Delete a route
   * @param id - Route ID
   * @returns Promise<boolean> - Success status
   */
  async deleteRoute(id: string): Promise<boolean> {
    // TODO: Call Firebase Cloud Function to delete route
    // DELETE /routes/:id with userId verification
    
    return Promise.resolve(true);
  },

  /**
   * Get trip history for a route
   * @param routeId - Optional route ID to filter by
   * @returns Promise<TripRecord[]> - Trip history records
   */
  async getTripHistory(routeId?: string): Promise<TripRecord[]> {
    // TODO: Call Firebase Cloud Function to fetch trip history
    // GET /trips?routeId=X&uid=userId
    
    return Promise.resolve(
      routeId
        ? sampleTripHistory.filter((t) => t.routeId === routeId)
        : sampleTripHistory
    );
  },

  /**
   * Add a trip record (called when trip completes)
   * @param record - Trip record to save
   * @returns Promise<boolean> - Success status
   */
  async recordTrip(record: TripRecord): Promise<boolean> {
    // TODO: Call Firebase Cloud Function to save trip
    // POST /trips with userId from auth context
    
    return Promise.resolve(true);
  },

  /**
   * Get route statistics
   * @returns Promise with route stats
   */
  async getRouteStats() {
    const routes = await this.getAllRoutes();
    
    return {
      total: routes.length,
      active: routes.filter((r) => r.status === 'active').length,
      archived: routes.filter((r) => r.status === 'archived').length,
      byDifficulty: {
        easy: routes.filter((r) => r.difficulty === 'easy').length,
        moderate: routes.filter((r) => r.difficulty === 'moderate').length,
        hard: routes.filter((r) => r.difficulty === 'hard').length,
      },
    };
  },

  /**
   * Search routes by criteria
   * @param criteria - Search criteria
   * @returns Promise<Route[]> - Matching routes
   */
  async searchRoutes(criteria: {
    difficulty?: string;
    minDistance?: number;
    maxDistance?: number;
    scenery?: string;
  }): Promise<Route[]> {
    const routes = await this.getAllRoutes();

    return routes.filter((route) => {
      if (criteria.difficulty && route.difficulty !== criteria.difficulty) return false;
      if (criteria.minDistance && route.distance < criteria.minDistance) return false;
      if (criteria.maxDistance && route.distance > criteria.maxDistance) return false;
      if (criteria.scenery && route.scenery !== criteria.scenery) return false;
      return true;
    });
  },

  /**
   * Get trending/popular routes
   * @returns Promise<Route[]> - Top routes by popularity
   */
  async getTrendingRoutes(): Promise<Route[]> {
    const routes = await this.getAllRoutes();
    // Sort by distance (most popular for road trips)
    return routes.sort((a, b) => b.distance - a.distance).slice(0, 5);
  },
};

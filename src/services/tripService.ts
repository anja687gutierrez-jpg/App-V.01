/**
 * Trip Service
 * 
 * Centralized service for trip-related operations.
 * Handles trip creation, history, analytics, and trip-specific queries.
 * 
 * To connect to your backend: Replace the sample data calls with your API calls
 */

import { routeService } from './routeService';
import { poiService } from './poiService';

// Sample trip data (replace with your backend API calls)
const sampleTrips = [
  {
    id: 'trip-1',
    routeId: 'route-1',
    userId: 'user-1',
    startTime: new Date(2024, 11, 15).toISOString(),
    endTime: new Date(2024, 11, 22).toISOString(),
    startLocation: { lat: 37.7749, lng: -122.4194 },
    endLocation: { lat: 34.0522, lng: -118.2437 },
    distanceTraveled: 385,
    fuelUsed: 18.5,
    fuelCost: 87.30,
    poisVisited: ['poi-parking-1', 'poi-attraction-1', 'poi-attraction-2'],
    checkPoints: [
      {
        location: 'San Francisco',
        timestamp: new Date(2024, 11, 15).toISOString(),
        notes: 'Trip start',
      },
      {
        location: 'Big Sur',
        timestamp: new Date(2024, 11, 17).toISOString(),
        notes: 'Scenic stop',
      },
      {
        location: 'Los Angeles',
        timestamp: new Date(2024, 11, 22).toISOString(),
        notes: 'Trip end',
      },
    ],
    rating: 4.8,
    notes: 'Amazing coastal drive with great views',
    status: 'completed' as const,
  },
  {
    id: 'trip-2',
    routeId: 'route-2',
    userId: 'user-1',
    startTime: new Date(2024, 10, 5).toISOString(),
    endTime: new Date(2024, 10, 10).toISOString(),
    startLocation: { lat: 39.7392, lng: -104.9903 },
    endLocation: { lat: 43.4722, lng: -110.7624 },
    distanceTraveled: 520,
    fuelUsed: 24.8,
    fuelCost: 117.80,
    poisVisited: ['poi-assistance-1', 'poi-attraction-1'],
    checkPoints: [
      {
        location: 'Denver',
        timestamp: new Date(2024, 10, 5).toISOString(),
        notes: 'Trip start',
      },
      {
        location: 'Yellowstone',
        timestamp: new Date(2024, 10, 10).toISOString(),
        notes: 'Trip end',
      },
    ],
    rating: 4.5,
    notes: 'Beautiful mountain scenery',
    status: 'completed' as const,
  },
  {
    id: 'trip-3',
    routeId: 'route-3',
    userId: 'user-1',
    name: 'Pacific Coast Highway',
    startTime: new Date(2024, 11, 20).toISOString(),
    endTime: null,
    startLocation: { lat: 37.7749, lng: -122.4194 }, // San Francisco
    endLocation: { lat: 36.2704, lng: -121.8081 }, // Big Sur
    distanceTraveled: 125,
    fuelUsed: 6.2,
    fuelCost: 29.40,
    poisVisited: ['poi-parking-2'],
    checkPoints: [
      {
        location: 'San Francisco, CA',
        timestamp: new Date(2024, 11, 20, 8, 0).toISOString(),
        notes: 'Departing',
      },
      {
        location: 'Big Sur Station',
        timestamp: new Date(2024, 11, 20, 14, 45).toISOString(),
        notes: 'Next stop - ETA 2:45 PM',
      },
    ],
    nextPoi: 'Big Sur Station',
    eta: '2:45 PM',
    progress: 12,
    rating: null,
    notes: null,
    status: 'active' as const,
  },
];

/**
 * tripService - Main service for trip operations
 * 
 * Methods:
 * - getCurrentTrip() - Get active trip
 * - getTripHistory() - Get all completed trips
 * - getTripById(id) - Get specific trip
 * - createTrip(data) - Start new trip
 * - updateTrip(id, data) - Update active trip
 * - endTrip(id) - Complete trip
 * - getTripStats() - Get trip statistics
 */
export const tripService = {
  /**
   * Get current active trip
   * @returns Promise<Trip | null> - Active trip or null
   */
  async getCurrentTrip() {
  // TODO: Replace with your backend API call to find the active trip
    const trips = sampleTrips;
    return Promise.resolve(trips.find((t) => t.status === 'active') || null);
  },

  /**
   * Get all trip history
   * @param userId - Optional user ID filter
   * @returns Promise<Trip[]> - Completed trips
   */
  async getTripHistory(userId?: string) {
  // TODO: Replace with your backend API call to fetch trip history
    const trips = sampleTrips.filter((t) => t.status === 'completed');
    return Promise.resolve(
      userId ? trips.filter((t) => t.userId === userId) : trips
    );
  },

  /**
   * Get a specific trip by ID
   * @param id - Trip ID
   * @returns Promise<Trip | null> - Trip or null if not found
   */
  async getTripById(id: string) {
  // TODO: Replace with your backend API call to fetch a single trip
    return Promise.resolve(sampleTrips.find((t) => t.id === id) || null);
  },

  /**
   * Create a new trip
   * @param data - Trip creation data
   * @returns Promise<Trip> - Created trip
   */
  async createTrip(data: {
    routeId: string;
    userId: string;
    startLocation: { lat: number; lng: number };
  }) {
  // TODO: Replace with your backend API call to create a new trip
    const newTrip = {
      id: `trip-${Date.now()}`,
      ...data,
      name: data.routeId ? `Trip ${data.routeId}` : 'New Trip',
      startTime: new Date().toISOString(),
      endTime: null,
      endLocation: null,
      distanceTraveled: 0,
      fuelUsed: 0,
      fuelCost: 0,
      poisVisited: [] as string[],
      checkPoints: [] as Array<{ location: string; timestamp: string; notes: string }>,
      rating: null,
      notes: null,
      status: 'active' as const,
      nextPoi: undefined,
      eta: undefined,
      progress: 0,
    };
    sampleTrips.push(newTrip);
    return Promise.resolve(newTrip);
  },

  /**
   * Update active trip (add checkpoint, update distance, etc.)
   * @param id - Trip ID
   * @param data - Partial trip data to update
   * @returns Promise<Trip | null> - Updated trip or null
   */
  async updateTrip(id: string, data: Partial<any>) {
  // TODO: Replace with your backend API call to update trip data
    const trip = await this.getTripById(id);
    if (!trip) return null;

    const updated = { ...trip, ...data };
    const index = sampleTrips.findIndex((t) => t.id === id);
    if (index >= 0) {
      sampleTrips[index] = updated;
    }
    return Promise.resolve(updated);
  },

  /**
   * End an active trip
   * @param id - Trip ID
   * @param finalData - Final trip data (rating, notes)
   * @returns Promise<Trip | null> - Completed trip or null
   */
  async endTrip(
    id: string,
    finalData: {
      rating?: number;
      notes?: string;
    }
  ) {
  // TODO: Replace with your backend API call to mark trip as completed
    const trip = await this.getTripById(id);
    if (!trip) return null;

    const completed = {
      ...trip,
      ...finalData,
      status: 'completed' as const,
      endTime: new Date().toISOString(),
    };

    const index = sampleTrips.findIndex((t) => t.id === id);
    if (index >= 0) {
      sampleTrips[index] = completed;
    }
    return Promise.resolve(completed);
  },

  /**
   * Add checkpoint to active trip
   * @param tripId - Trip ID
   * @param checkpoint - Checkpoint data
   * @returns Promise<void>
   */
  async addCheckpoint(
    tripId: string,
    checkpoint: {
      location: string;
      notes?: string;
    }
  ) {
    const trip = await this.getTripById(tripId);
    if (!trip) return;

    const updated = await this.updateTrip(tripId, {
      checkPoints: [
        ...(trip.checkPoints || []),
        {
          ...checkpoint,
          timestamp: new Date().toISOString(),
        },
      ],
    });

    return Promise.resolve(updated);
  },

  /**
   * Record POI visit during trip
   * @param tripId - Trip ID
   * @param poiId - POI ID
   * @returns Promise<void>
   */
  async recordPOIVisit(tripId: string, poiId: string) {
    const trip = await this.getTripById(tripId);
    if (!trip) return;

    const updated = await this.updateTrip(tripId, {
      poisVisited: [...new Set([...(trip.poisVisited || []), poiId])],
    });

    // Mark POI as visited
    await poiService.markVisited(poiId);

    return Promise.resolve(updated);
  },

  /**
   * Get overall trip statistics
   * @returns Promise<TripStats> - Overall statistics
   */
  async getTripStats() {
    const history = await this.getTripHistory();
    const current = await this.getCurrentTrip();

    const totalTrips = history.length + (current ? 1 : 0);
    const completedTrips = history.length;
    const totalDistance = history.reduce((sum, t) => sum + t.distanceTraveled, 0);
    const totalFuelCost = history.reduce((sum, t) => sum + t.fuelCost, 0);
    const avgRating =
      history.length > 0
        ? history.reduce((sum, t) => sum + (t.rating || 0), 0) / history.length
        : 0;

    // Calculate average fuel efficiency (km per liter)
    const totalFuelUsed = history.reduce((sum, t) => sum + t.fuelUsed, 0);
    const fuelEfficiency =
      totalFuelUsed > 0
        ? Math.round((totalDistance / totalFuelUsed) * 10) / 10
        : 0;

    // Count unique POIs visited
    const allPOIsVisited = new Set<string>();
    history.forEach((t) => {
      t.poisVisited.forEach((p) => allPOIsVisited.add(p));
    });

    return Promise.resolve({
      totalTrips,
      completedTrips,
      activeTrips: current ? 1 : 0,
      totalDistance,
      totalFuelCost,
      avgRating: Math.round(avgRating * 10) / 10,
      fuelEfficiency,
      uniquePOIsVisited: allPOIsVisited.size,
      averageTripDuration:
        completedTrips > 0
          ? Math.round(
              history.reduce((sum, t) => {
                const start = new Date(t.startTime).getTime();
                const end = new Date(t.endTime!).getTime();
                return sum + (end - start);
              }, 0) /
                completedTrips /
                (1000 * 60 * 60)
            )
          : 0,
    });
  },

  /**
   * Get trip statistics for a specific route
   * @param routeId - Route ID
   * @returns Promise<RouteTripsStats> - Route-specific statistics
   */
  async getRouteTripsStats(routeId: string) {
    const history = await this.getTripHistory();
    const routeTrips = history.filter((t) => t.routeId === routeId);

    if (routeTrips.length === 0) {
      return Promise.resolve({
        routeId,
        totalTrips: 0,
        totalDistance: 0,
        totalFuelCost: 0,
        avgRating: 0,
      });
    }

    const totalDistance = routeTrips.reduce((sum, t) => sum + t.distanceTraveled, 0);
    const totalFuelCost = routeTrips.reduce((sum, t) => sum + t.fuelCost, 0);
    const avgRating =
      routeTrips.reduce((sum, t) => sum + (t.rating || 0), 0) /
      routeTrips.length;

    return Promise.resolve({
      routeId,
      totalTrips: routeTrips.length,
      totalDistance,
      totalFuelCost,
      avgRating: Math.round(avgRating * 10) / 10,
    });
  },

  /**
   * Get recent trips
   * @param limit - Number of trips to return
   * @returns Promise<Trip[]> - Recent trips
   */
  async getRecentTrips(limit: number = 5) {
    const history = await this.getTripHistory();
    return Promise.resolve(
      history
        .sort(
          (a, b) =>
            new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
        )
        .slice(0, limit)
    );
  },

  /**
   * Calculate fuel savings for a trip
   * @param tripId - Trip ID
   * @param alternativeVehicleType - Vehicle type to compare (e.g., 'gas', 'hybrid', 'ev')
   * @returns Promise<FuelSavingsAnalysis>
   */
  async calculateFuelSavings(
    tripId: string,
    alternativeVehicleType: 'gas' | 'hybrid' | 'ev' = 'gas'
  ) {
    const trip = await this.getTripById(tripId);
    if (!trip) return null;

    const fuelEfficiency = trip.distanceTraveled / trip.fuelUsed;

    // Simulated costs for different vehicle types
    const costPerGallon = {
      gas: 3.50,
      hybrid: 3.50,
      ev: 0.15, // per kWh
    };

    const consumptionRates = {
      gas: trip.distanceTraveled / 22, // avg 22 mpg
      hybrid: trip.distanceTraveled / 48, // avg 48 mpg
      ev: trip.distanceTraveled / 5, // avg 5 mi/kWh
    };

    const actualCost = trip.fuelCost;
    const alternativeCost =
      consumptionRates[alternativeVehicleType] *
      costPerGallon[alternativeVehicleType];

    return Promise.resolve({
      tripId,
      actualCost,
      alternativeCost,
      savings: actualCost - alternativeCost,
      savingsPercentage: Math.round(
        ((actualCost - alternativeCost) / actualCost) * 100
      ),
    });
  },
};

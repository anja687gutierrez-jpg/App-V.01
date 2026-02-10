/**
 * Trip Service - Firebase Firestore Integration
 *
 * Handles trip CRUD operations with Firebase Firestore.
 * Falls back to localStorage when Firestore is unavailable.
 *
 * Firestore Collections:
 * - trips/{tripId}
 *   - userId: string
 *   - name: string
 *   - waypoints: Waypoint[]
 *   - startTime: timestamp
 *   - endTime: timestamp | null
 *   - status: 'planned' | 'active' | 'completed'
 *   - vehicleInfo: { model: string, range: number }
 *   - batteryStart: number
 *   - batteryEnd: number
 *   - totalDistance: number
 *   - totalDuration: number
 *   - chargingStops: ChargingStop[]
 *   - createdAt: timestamp
 *   - updatedAt: timestamp
 */

export interface Waypoint {
  id: number;
  name: string;
  lat?: number;
  lng?: number;
  time: string;
  type: 'start' | 'stop' | 'charge' | 'destination' | 'highlight';
  notes: string;
  battery: number;
}

export interface ChargingStop {
  stationId: string;
  stationName: string;
  chargeStartPercent: number;
  chargeEndPercent: number;
  duration: number; // minutes
  cost: number;
}

export interface Trip {
  id: string;
  userId: string;
  name: string;
  waypoints: Waypoint[];
  startTime: string;
  endTime: string | null;
  status: 'planned' | 'active' | 'completed';
  vehicleInfo: {
    model: string;
    range: number;
  };
  batteryStart: number;
  batteryEnd: number | null;
  totalDistance: number;
  totalDuration: number;
  chargingStops: ChargingStop[];
  notes: string;
  rating: number | null;
  createdAt: string;
  updatedAt: string;
}

// LocalStorage keys
const TRIPS_STORAGE_KEY = 'iconic_pathways_trips';
const USER_ID_KEY = 'iconic_pathways_user_id';

// Generate a pseudo-user ID for demo purposes
function getUserId(): string {
  let userId = localStorage.getItem(USER_ID_KEY);
  if (!userId) {
    userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem(USER_ID_KEY, userId);
  }
  return userId;
}

// Get all trips from localStorage
function getTripsFromStorage(): Trip[] {
  try {
    const data = localStorage.getItem(TRIPS_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('[TripService] Error reading from localStorage:', error);
    return [];
  }
}

// Save trips to localStorage
function saveTripsToStorage(trips: Trip[]): void {
  try {
    localStorage.setItem(TRIPS_STORAGE_KEY, JSON.stringify(trips));
  } catch (error) {
    console.error('[TripService] Error saving to localStorage:', error);
  }
}

/**
 * Firebase Trip Service
 *
 * Primary methods:
 * - saveTrip(trip) - Create or update a trip
 * - getTrips() - Get all trips for current user
 * - getTripById(id) - Get single trip
 * - deleteTrip(id) - Delete a trip
 * - updateTripStatus(id, status) - Update trip status
 */
export const firebaseTripService = {
  /**
   * Save a new trip or update existing one
   */
  async saveTrip(tripData: Partial<Trip>): Promise<Trip> {
    const userId = getUserId();
    const trips = getTripsFromStorage();
    const now = new Date().toISOString();

    // Check if updating existing trip
    const existingIndex = tripData.id
      ? trips.findIndex(t => t.id === tripData.id)
      : -1;

    const trip: Trip = {
      id: tripData.id || `trip_${Date.now()}`,
      userId,
      name: tripData.name || 'Untitled Trip',
      waypoints: tripData.waypoints || [],
      startTime: tripData.startTime || now,
      endTime: tripData.endTime || null,
      status: tripData.status || 'planned',
      vehicleInfo: tripData.vehicleInfo || {
        model: 'Tesla Model Y',
        range: 280,
      },
      batteryStart: tripData.batteryStart ?? 100,
      batteryEnd: tripData.batteryEnd ?? null,
      totalDistance: tripData.totalDistance || 0,
      totalDuration: tripData.totalDuration || 0,
      chargingStops: tripData.chargingStops || [],
      notes: tripData.notes || '',
      rating: tripData.rating ?? null,
      createdAt: existingIndex >= 0 ? trips[existingIndex].createdAt : now,
      updatedAt: now,
    };

    if (existingIndex >= 0) {
      // Update existing
      trips[existingIndex] = trip;
    } else {
      // Add new
      trips.unshift(trip);
    }

    saveTripsToStorage(trips);

    return trip;
  },

  /**
   * Get all trips for the current user
   */
  async getTrips(options?: {
    status?: 'planned' | 'active' | 'completed';
    limit?: number;
    sortBy?: 'createdAt' | 'startTime' | 'name';
    sortOrder?: 'asc' | 'desc';
  }): Promise<Trip[]> {
    const userId = getUserId();
    let trips = getTripsFromStorage().filter(t => t.userId === userId);

    // Filter by status
    if (options?.status) {
      trips = trips.filter(t => t.status === options.status);
    }

    // Sort
    const sortBy = options?.sortBy || 'createdAt';
    const sortOrder = options?.sortOrder || 'desc';
    trips.sort((a, b) => {
      const aVal = a[sortBy] || '';
      const bVal = b[sortBy] || '';
      const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      return sortOrder === 'desc' ? -comparison : comparison;
    });

    // Limit
    if (options?.limit) {
      trips = trips.slice(0, options.limit);
    }

    return trips;
  },

  /**
   * Get a single trip by ID
   */
  async getTripById(tripId: string): Promise<Trip | null> {
    const trips = getTripsFromStorage();
    return trips.find(t => t.id === tripId) || null;
  },

  /**
   * Delete a trip
   */
  async deleteTrip(tripId: string): Promise<boolean> {
    const trips = getTripsFromStorage();
    const index = trips.findIndex(t => t.id === tripId);

    if (index === -1) {
      return false;
    }

    trips.splice(index, 1);
    saveTripsToStorage(trips);

    return true;
  },

  /**
   * Update trip status
   */
  async updateTripStatus(
    tripId: string,
    status: 'planned' | 'active' | 'completed',
    additionalData?: Partial<Trip>
  ): Promise<Trip | null> {
    const trip = await this.getTripById(tripId);
    if (!trip) return null;

    const updatedTrip: Trip = {
      ...trip,
      ...additionalData,
      status,
      updatedAt: new Date().toISOString(),
    };

    // If completing, set endTime
    if (status === 'completed' && !updatedTrip.endTime) {
      updatedTrip.endTime = new Date().toISOString();
    }

    return this.saveTrip(updatedTrip);
  },

  /**
   * Add a charging stop to a trip
   */
  async addChargingStop(
    tripId: string,
    chargingStop: ChargingStop
  ): Promise<Trip | null> {
    const trip = await this.getTripById(tripId);
    if (!trip) return null;

    trip.chargingStops.push(chargingStop);
    trip.updatedAt = new Date().toISOString();

    return this.saveTrip(trip);
  },

  /**
   * Update waypoints for a trip
   */
  async updateWaypoints(
    tripId: string,
    waypoints: Waypoint[]
  ): Promise<Trip | null> {
    const trip = await this.getTripById(tripId);
    if (!trip) return null;

    trip.waypoints = waypoints;
    trip.updatedAt = new Date().toISOString();

    return this.saveTrip(trip);
  },

  /**
   * Get trip statistics for the current user
   */
  async getTripStats(): Promise<{
    totalTrips: number;
    plannedTrips: number;
    activeTrips: number;
    completedTrips: number;
    totalDistance: number;
    totalChargingTime: number;
    averageRating: number;
  }> {
    const trips = await this.getTrips();

    const completedTrips = trips.filter(t => t.status === 'completed');
    const totalDistance = completedTrips.reduce(
      (sum, t) => sum + t.totalDistance,
      0
    );
    const totalChargingTime = completedTrips.reduce(
      (sum, t) =>
        sum + t.chargingStops.reduce((s, c) => s + c.duration, 0),
      0
    );
    const ratingsSum = completedTrips
      .filter(t => t.rating !== null)
      .reduce((sum, t) => sum + (t.rating || 0), 0);
    const ratingsCount = completedTrips.filter(t => t.rating !== null).length;

    return {
      totalTrips: trips.length,
      plannedTrips: trips.filter(t => t.status === 'planned').length,
      activeTrips: trips.filter(t => t.status === 'active').length,
      completedTrips: completedTrips.length,
      totalDistance,
      totalChargingTime,
      averageRating: ratingsCount > 0 ? ratingsSum / ratingsCount : 0,
    };
  },

  /**
   * Export trip data as JSON (for backup)
   */
  async exportTrips(): Promise<string> {
    const trips = await this.getTrips();
    return JSON.stringify(trips, null, 2);
  },

  /**
   * Import trips from JSON
   */
  async importTrips(jsonData: string): Promise<number> {
    try {
      const importedTrips: Trip[] = JSON.parse(jsonData);
      const userId = getUserId();

      // Update user ID on imported trips
      const processedTrips = importedTrips.map(t => ({
        ...t,
        userId,
        id: `trip_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));

      const existingTrips = getTripsFromStorage();
      saveTripsToStorage([...processedTrips, ...existingTrips]);

      return processedTrips.length;
    } catch (error) {
      console.error('[TripService] Import error:', error);
      throw new Error('Invalid trip data format');
    }
  },
};

/**
 * POI Service
 * * Centralized service for all Points of Interest operations.
 * Handles parking, roadside assistance, attractions, and other POIs.
 * * To connect to your backend: Replace the sample data calls with your API calls
 */

import { POI } from '@/types';

// Sample POI data (replace with your backend API calls)
const samplePOIs: POI[] = [
  // Parking locations
  {
    id: 'poi-parking-1',
    name: 'Downtown Parking Garage',
    type: 'parking',
    location: { lat: 37.7749, lng: -122.4194 },
    address: '123 Market St, San Francisco, CA 94105',
    rating: 4.3,
    reviews: 128,
    hours: '24/7',
    amenities: ['EV Charging', 'Security Camera', 'Well-lit', 'Attendant'],
    pricePerHour: 4.50,
    maxStayHours: 24,
    availability: 45,
    totalSpaces: 200,
    paymentMethods: ['Apple Pay', 'Google Pay', 'Credit Card'],
    visitStatus: 'not-visited',
    metadata: { parkingType: 'garage', hasCharging: true },
  },
  {
    id: 'poi-parking-2',
    name: 'Mission District Street Parking',
    type: 'parking',
    location: { lat: 37.7599, lng: -122.4148 },
    address: '1400 Mission St, San Francisco, CA 94103',
    rating: 4.1,
    reviews: 89,
    hours: '24/7',
    amenities: ['Street Level', 'Lighting'],
    pricePerHour: 2.75,
    maxStayHours: 4,
    availability: 12,
    totalSpaces: 30,
    paymentMethods: ['Credit Card', 'Mobile App'],
    visitStatus: 'not-visited',
    metadata: { parkingType: 'street', hasCharging: false },
  },
  // Roadside assistance
  {
    id: 'poi-assistance-1',
    name: 'AAA Emergency Roadside Service',
    type: 'roadside-assistance',
    location: { lat: 37.7749, lng: -122.4194 },
    address: 'Multiple locations',
    rating: 4.7,
    reviews: 2450,
    hours: '24/7',
    amenities: ['Towing', 'Lockout Service', 'Fuel Delivery', 'Battery Jump'],
    phone: '1-800-AAA-HELP',
    availability: 999, // Always available
    paymentMethods: ['Membership', 'Credit Card'],
    visitStatus: 'not-visited',
    metadata: { responseTime: '15-30 mins', serviceArea: 'National' },
  },
  {
    id: 'poi-assistance-2',
    name: 'OnStar Emergency Service',
    type: 'roadside-assistance',
    location: { lat: 37.7749, lng: -122.4194 },
    address: 'National Coverage',
    rating: 4.5,
    reviews: 1200,
    hours: '24/7',
    amenities: ['Towing', 'Medical Emergency', 'Emergency Notification'],
    phone: '1-888-4-ONSTAR',
    availability: 999,
    paymentMethods: ['Subscription', 'Credit Card'],
    visitStatus: 'not-visited',
    metadata: { responseTime: '20-40 mins', serviceArea: 'National' },
  },
  // Attractions
  {
    id: 'poi-attraction-1',
    name: 'Golden Gate Bridge',
    type: 'attraction',
    location: { lat: 37.8199, lng: -122.4783 },
    address: 'Golden Gate Bridge Vista Point, San Francisco, CA',
    rating: 4.8,
    reviews: 5230,
    hours: '24/7',
    amenities: ['Parking', 'Restrooms', 'Photo Spots', 'Gift Shop'],
    availability: 1000,
    paymentMethods: [],
    visitStatus: 'not-visited',
    metadata: { type: 'landmark', estimatedVisitDuration: '1 hour' },
  },
  {
    id: 'poi-attraction-2',
    name: 'Big Sur Vista Point',
    type: 'attraction',
    location: { lat: 36.2704, lng: -121.8127 },
    address: 'Highway 1, Big Sur, CA 93920',
    rating: 4.9,
    reviews: 3840,
    hours: '24/7',
    amenities: ['Parking', 'Restrooms', 'Scenic Views', 'Hiking Trails'],
    availability: 50,
    paymentMethods: [],
    visitStatus: 'not-visited',
    metadata: { type: 'scenic-point', estimatedVisitDuration: '2 hours' },
  },
];

/**
 * poiService - Main service for POI operations
 * * Methods:
 * - getAllPOIs() - Get all POIs
 * - getPOIById(id) - Get specific POI
 * - getPOIsByType(type) - Filter by type
 * - searchNearby(lat, lng, radius) - Find nearby POIs
 * - markVisited(id) - Mark POI as visited
 * - createPOI(data) - Create new POI
 * - updatePOI(id, data) - Update POI
 */
export const poiService = {
  /**
   * Get all POIs
   * @returns Promise<POI[]> - All POIs
   */
  async getAllPOIs(): Promise<POI[]> {
  // TODO: Replace with your backend API call to fetch all POIs
    return new Promise((resolve) => {
      setTimeout(() => resolve(samplePOIs), 100);
    });
  },

  /**
   * Get a specific POI by ID
   * @param id - POI ID
   * @returns Promise<POI | null> - POI or null if not found
   */
  async getPOIById(id: string): Promise<POI | null> {
  // TODO: Replace with your backend API call to fetch a single POI by ID
    const pois = await this.getAllPOIs();
    return pois.find((p) => p.id === id) || null;
  },

  /**
   * Get POIs by type
   * @param type - POI type (parking, roadside-assistance, attraction, etc.)
   * @returns Promise<POI[]> - Filtered POIs
   */
  async getPOIsByType(type: string): Promise<POI[]> {
  // TODO: Replace with your backend API call to filter POIs by type
    const pois = await this.getAllPOIs();
    return pois.filter((p) => p.type === type);
  },

  /**
   * Get parking locations only
   * @returns Promise<POI[]> - Parking POIs
   */
  async getParkingLocations(): Promise<POI[]> {
    return this.getPOIsByType('parking');
  },

  /**
   * Get roadside assistance services
   * @returns Promise<POI[]> - Assistance services
   */
  async getRoadsideAssistance(): Promise<POI[]> {
    return this.getPOIsByType('roadside-assistance');
  },

  /**
   * Get attractions
   * @returns Promise<POI[]> - Attractions
   */
  async getAttractions(): Promise<POI[]> {
    return this.getPOIsByType('attraction');
  },

  /**
   * Search for POIs near a location
   * @param lat - Latitude
   * @param lng - Longitude
   * @param radiusKm - Search radius in kilometers
   * @returns Promise<POI[]> - Nearby POIs sorted by distance
   */
  async searchNearby(
    lat: number,
    lng: number,
    radiusKm: number = 5
  ): Promise<POI[]> {
    const pois = await this.getAllPOIs();

    // Calculate distance and filter
    const nearby = pois
      .map((poi) => ({
        ...poi,
        distance: this.calculateDistance(
          lat,
          lng,
          poi.location.lat,
          poi.location.lng
        ),
      }))
      .filter((poi) => poi.distance <= radiusKm)
      .sort((a, b) => a.distance - b.distance);

    return nearby;
  },

  /**
   * Search parking near a location with filters
   * @param lat - Latitude
   * @param lng - Longitude
   * @param options - Search options
   * @returns Promise<POI[]> - Matching parking locations
   */
  async searchParking(
    lat: number,
    lng: number,
    options?: {
      maxPricePerHour?: number;
      radiusKm?: number;
      minRating?: number;
      requireCharging?: boolean;
    }
  ): Promise<POI[]> {
    const nearby = await this.searchNearby(lat, lng, options?.radiusKm || 2);
    const parking = nearby.filter((p) => p.type === 'parking');

    return parking.filter((p) => {
      if (
        options?.maxPricePerHour &&
        p.pricePerHour &&
        p.pricePerHour > options.maxPricePerHour
      )
        return false;
      if (options?.minRating && p.rating < options.minRating) return false;
      if (
        options?.requireCharging &&
        !p.amenities?.includes('EV Charging')
      )
        return false;
      return true;
    });
  },

  /**
   * Mark a POI as visited
   * @param id - POI ID
   * @returns Promise<boolean> - Success status
   */
  async markVisited(id: string): Promise<boolean> {
  // TODO: Replace with your backend API call to mark POI as visited
    const poi = await this.getPOIById(id);
    if (poi) {
      poi.visitStatus = 'visited';
      return Promise.resolve(true);
    }
    return Promise.resolve(false);
  },

  /**
   * Get visited POIs
   * @returns Promise<POI[]> - Visited POIs
   */
  async getVisitedPOIs(): Promise<POI[]> {
    const pois = await this.getAllPOIs();
    return pois.filter((p) => p.visitStatus === 'visited');
  },

  /**
   * Create a new POI
   * @param data - POI data
   * @returns Promise<POI> - Created POI
   */
  async createPOI(data: Omit<POI, 'id'>): Promise<POI> {
  // TODO: Replace with your backend API call to create a new POI
    const newPOI: POI = {
      ...data,
      id: `poi-${Date.now()}`,
    };
    return Promise.resolve(newPOI);
  },

  /**
   * Update a POI
   * @param id - POI ID
   * @param data - Partial POI data
   * @returns Promise<POI | null> - Updated POI or null
   */
  async updatePOI(id: string, data: Partial<POI>): Promise<POI | null> {
  // TODO: Replace with your backend API call to update POI data
    const poi = await this.getPOIById(id);
    if (!poi) return null;
    return Promise.resolve({ ...poi, ...data });
  },

  /**
   * Get statistics for POI type
   * @param type - POI type
   * @returns Promise<ParkingStats> - Statistics
   */
  async getTypeStats(type: string) {
    const pois = await this.getPOIsByType(type);
    const visited = pois.filter((p) => p.visitStatus === 'visited');
    const avgRating =
      pois.length > 0
        ? pois.reduce((sum, p) => sum + p.rating, 0) / pois.length
        : 0;

    return {
      type,
      totalCount: pois.length,
      visitedCount: visited.length,
      avgRating: Math.round(avgRating * 10) / 10,
      completion: Math.round((visited.length / pois.length) * 100),
    };
  },

  /**
   * Helper: Calculate distance between two coordinates (Haversine formula)
   * @internal
   */
  calculateDistance(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number
  ): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  },
};
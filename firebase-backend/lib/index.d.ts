import * as functions from 'firebase-functions';
/**
 * GET /routes
 * Returns all routes - static data, cached client-side
 *
 * Browser caches for 1 year (rarely changes)
 */
export declare const getRoutes: functions.HttpsFunction;
/**
 * GET /pois
 * Returns all POIs - static data, cached client-side
 */
export declare const getPOIs: functions.HttpsFunction;
/**
 * GET /dashboardStats
 * Returns aggregated dashboard data in ONE call
 * Replaces: 3 separate Firestore reads
 *
 * This is the key optimization - one call gets all stats
 */
export declare const getDashboardStats: functions.HttpsFunction;
/**
 * GET /trips
 * Returns user's trip history with pagination
 */
export declare const getTrips: functions.HttpsFunction;
/**
 * POST /trips
 * Create a new trip
 */
export declare const createTrip: functions.HttpsFunction;
/**
 * PUT /trips/:tripId
 * Update a trip
 */
export declare const updateTrip: functions.HttpsFunction;
/**
 * GET /weather
 * Get weather for a location
 * Cached for 30 minutes to minimize external API calls
 */
export declare const getWeather: functions.HttpsFunction;
/**
 * Health check endpoint
 */
export declare const health: functions.HttpsFunction;

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import cors from 'cors';

// Initialize Firebase Admin
admin.initializeApp();
const db = admin.firestore();

const corsHandler = cors({ origin: true });

/**
 * GET /routes
 * Returns all routes - static data, cached client-side
 * 
 * Browser caches for 1 year (rarely changes)
 */
export const getRoutes = functions.https.onRequest(
  async (req, res) => {
    corsHandler(req, res, async () => {
      try {
        // Set aggressive caching headers
        res.set('Cache-Control', 'public, max-age=31536000'); // 1 year
        res.set('Content-Type', 'application/json');

        const snapshot = await db.collection('routes').get();
        const routes = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        return res.status(200).json({
          success: true,
          data: routes,
          count: routes.length,
          cached: true
        });
      } catch (error) {
        console.error('Error fetching routes:', error);
        return res.status(500).json({
          success: false,
          error: 'Failed to fetch routes'
        });
      }
    });
  }
);

/**
 * GET /pois
 * Returns all POIs - static data, cached client-side
 */
export const getPOIs = functions.https.onRequest(
  async (req, res) => {
    corsHandler(req, res, async () => {
      try {
        res.set('Cache-Control', 'public, max-age=31536000'); // 1 year
        res.set('Content-Type', 'application/json');

        const snapshot = await db.collection('pois').get();
        const pois = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        return res.status(200).json({
          success: true,
          data: pois,
          count: pois.length,
          cached: true
        });
      } catch (error) {
        console.error('Error fetching POIs:', error);
        return res.status(500).json({
          success: false,
          error: 'Failed to fetch POIs'
        });
      }
    });
  }
);

/**
 * GET /dashboardStats
 * Returns aggregated dashboard data in ONE call
 * Replaces: 3 separate Firestore reads
 * 
 * This is the key optimization - one call gets all stats
 */
export const getDashboardStats = functions.https.onRequest(
  async (req, res) => {
    corsHandler(req, res, async () => {
      try {
        const userId = req.query.uid as string;

        if (!userId) {
          return res.status(400).json({
            success: false,
            error: 'Missing userId'
          });
        }

        // Single aggregated read instead of 3 separate reads
        // Fetch user's trips
        const tripsSnapshot = await db
          .collection('trips')
          .where('userId', '==', userId)
          .where('status', '==', 'completed')
          .get();

        // Fetch active trip if exists
        const activeTripsSnapshot = await db
          .collection('trips')
          .where('userId', '==', userId)
          .where('status', '==', 'active')
          .limit(1)
          .get();

        const trips = tripsSnapshot.docs.map(doc => doc.data());
        const activeTrip = activeTripsSnapshot.docs.length > 0 
          ? { id: activeTripsSnapshot.docs[0].id, ...activeTripsSnapshot.docs[0].data() }
          : null;

        // Calculate aggregated stats
        const totalDistance = trips.reduce((sum: number, trip: any) => sum + (trip.distanceTraveled || 0), 0);
        const totalFuelCost = trips.reduce((sum: number, trip: any) => sum + (trip.fuelCost || 0), 0);
        const avgRating = trips.length > 0
          ? trips.reduce((sum: number, trip: any) => sum + (trip.rating || 0), 0) / trips.length
          : 0;

        const stats = {
          routes: {
            total: 0, // Will be the length of routes collection
            active: activeTrip ? 1 : 0,
            trending: [] // Top 3 routes by visits
          },
          trips: {
            completed: trips.length,
            totalDistance,
            totalFuelCost,
            averageRating: parseFloat(avgRating.toFixed(1))
          },
          pois: {
            visited: trips.reduce((sum: number, trip: any) => sum + (trip.poisVisited?.length || 0), 0)
          }
        };

        return res.status(200).json({
          success: true,
          data: stats,
          activeTrip
        });
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        return res.status(500).json({
          success: false,
          error: 'Failed to fetch dashboard stats'
        });
      }
    });
  }
);

/**
 * GET /trips
 * Returns user's trip history with pagination
 */
export const getTrips = functions.https.onRequest(
  async (req, res) => {
    corsHandler(req, res, async () => {
      try {
        const userId = req.query.uid as string;
        const limit = parseInt(req.query.limit as string) || 10;
        const offset = parseInt(req.query.offset as string) || 0;

        if (!userId) {
          return res.status(400).json({
            success: false,
            error: 'Missing userId'
          });
        }

        const snapshot = await db
          .collection('trips')
          .where('userId', '==', userId)
          .orderBy('startTime', 'desc')
          .limit(limit + 1)
          .offset(offset)
          .get();

        const trips = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        return res.status(200).json({
          success: true,
          data: trips,
          hasMore: trips.length > limit,
          count: trips.length
        });
      } catch (error) {
        console.error('Error fetching trips:', error);
        return res.status(500).json({
          success: false,
          error: 'Failed to fetch trips'
        });
      }
    });
  }
);

/**
 * POST /trips
 * Create a new trip
 */
export const createTrip = functions.https.onRequest(
  async (req, res) => {
    corsHandler(req, res, async () => {
      try {
        const userId = req.query.uid as string;
        const tripData = req.body;

        if (!userId) {
          return res.status(400).json({
            success: false,
            error: 'Missing userId'
          });
        }

        const tripRef = await db.collection('trips').add({
          userId,
          ...tripData,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });

        return res.status(201).json({
          success: true,
          id: tripRef.id,
          data: {
            id: tripRef.id,
            userId,
            ...tripData
          }
        });
      } catch (error) {
        console.error('Error creating trip:', error);
        return res.status(500).json({
          success: false,
          error: 'Failed to create trip'
        });
      }
    });
  }
);

/**
 * PUT /trips/:tripId
 * Update a trip
 */
export const updateTrip = functions.https.onRequest(
  async (req, res) => {
    corsHandler(req, res, async () => {
      try {
        const tripId = req.query.id as string;
        const userId = req.query.uid as string;
        const updateData = req.body;

        if (!tripId || !userId) {
          return res.status(400).json({
            success: false,
            error: 'Missing tripId or userId'
          });
        }

        // Verify ownership
        const tripDoc = await db.collection('trips').doc(tripId).get();
        if (!tripDoc.exists || tripDoc.data()?.userId !== userId) {
          return res.status(403).json({
            success: false,
            error: 'Unauthorized'
          });
        }

        await db.collection('trips').doc(tripId).update({
          ...updateData,
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });

        return res.status(200).json({
          success: true,
          id: tripId
        });
      } catch (error) {
        console.error('Error updating trip:', error);
        return res.status(500).json({
          success: false,
          error: 'Failed to update trip'
        });
      }
    });
  }
);

/**
 * GET /weather
 * Get weather for a location
 * Cached for 30 minutes to minimize external API calls
 */
export const getWeather = functions.https.onRequest(
  async (req, res) => {
    corsHandler(req, res, async () => {
      try {
        const { lat, lng } = req.query;

        if (!lat || !lng) {
          return res.status(400).json({
            success: false,
            error: 'Missing latitude or longitude'
          });
        }

        const cacheKey = `${lat},${lng}`;
        const cacheDoc = await db.collection('weatherCache').doc(cacheKey).get();

        // Check if cache is still fresh (30 minutes)
        if (cacheDoc.exists) {
          const cached = cacheDoc.data();
          const age = Date.now() - cached!.timestamp;
          if (age < 30 * 60 * 1000) {
            console.log('Weather cache hit for', cacheKey);
            return res.status(200).json({
              success: true,
              data: cached!.weather,
              cached: true
            });
          }
        }

        // Cache miss - would call external API here
        // For now, return mock data to avoid API rate limits during testing
        const mockWeather = {
          temp: 72,
          feelsLike: 71,
          humidity: 65,
          windSpeed: 8,
          description: 'Partly cloudy',
          condition: 'partly-cloudy'
        };

        // Store in cache
        await db.collection('weatherCache').doc(cacheKey).set({
          weather: mockWeather,
          timestamp: Date.now()
        });

        return res.status(200).json({
          success: true,
          data: mockWeather,
          cached: false
        });
      } catch (error) {
        console.error('Error fetching weather:', error);
        return res.status(500).json({
          success: false,
          error: 'Failed to fetch weather'
        });
      }
    });
  }
);

/**
 * Health check endpoint
 */
export const health = functions.https.onRequest(
  async (req, res) => {
    corsHandler(req, res, async () => {
      return res.status(200).json({
        success: true,
        message: 'API is healthy',
        timestamp: new Date().toISOString()
      });
    });
  }
);

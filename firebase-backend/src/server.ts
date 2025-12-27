import express, { Request, Response } from 'express';
import cors from 'cors';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Mock data for preview
const sampleRoutes = [
  {
    id: 'route-1',
    name: 'California Coast Highway',
    distance: 380,
    duration: 7,
    difficulty: 'moderate',
    scenery: 'coastal',
    highlights: ['Golden Gate Bridge', 'Big Sur', 'Malibu Beach'],
    status: 'active'
  },
  {
    id: 'route-2',
    name: 'Rocky Mountain Explorer',
    distance: 520,
    duration: 5,
    difficulty: 'moderate',
    scenery: 'mountains',
    highlights: ['Rocky Mountains', 'Grand Teton', 'Yellowstone'],
    status: 'archived'
  },
  {
    id: 'route-3',
    name: 'Desert Landscapes',
    distance: 450,
    duration: 6,
    difficulty: 'easy',
    scenery: 'desert',
    highlights: ['Monument Valley', 'Antelope Canyon', 'The Wave'],
    status: 'active'
  }
];

const samplePOIs = [
  {
    id: 'poi-1',
    name: 'Golden Gate Bridge',
    type: 'attraction',
    lat: 37.8199,
    lng: -122.4783,
    rating: 4.8,
    address: 'San Francisco, CA'
  },
  {
    id: 'poi-2',
    name: 'Big Sur Parking',
    type: 'parking',
    lat: 36.2704,
    lng: -121.8102,
    rating: 4.6,
    price: 15,
    address: 'Big Sur, CA'
  },
  {
    id: 'poi-3',
    name: 'Roadside Assistance - CA',
    type: 'roadside_assistance',
    lat: 35.2828,
    lng: -120.6625,
    rating: 4.2,
    address: 'Central Coast, CA'
  }
];

const sampleTrips = [
  {
    id: 'trip-1',
    userId: 'user-1',
    routeId: 'route-1',
    startTime: new Date(2024, 11, 15).toISOString(),
    endTime: new Date(2024, 11, 22).toISOString(),
    distanceTraveled: 380,
    fuelUsed: 18,
    fuelCost: 65.5,
    poisVisited: ['poi-1', 'poi-2'],
    rating: 4.8,
    status: 'completed'
  },
  {
    id: 'trip-2',
    userId: 'user-1',
    routeId: 'route-2',
    startTime: new Date(2024, 10, 1).toISOString(),
    endTime: new Date(2024, 10, 6).toISOString(),
    distanceTraveled: 520,
    fuelUsed: 24,
    fuelCost: 85.2,
    poisVisited: ['poi-3'],
    rating: 4.5,
    status: 'completed'
  }
];

/**
 * GET /routes
 */
app.get('/routes', (req: Request, res: Response) => {
  res.set('Cache-Control', 'public, max-age=31536000');
  res.json({
    success: true,
    data: sampleRoutes,
    count: sampleRoutes.length,
    cached: true,
    message: 'Routes loaded successfully'
  });
});

/**
 * GET /pois
 */
app.get('/pois', (req: Request, res: Response) => {
  res.set('Cache-Control', 'public, max-age=31536000');
  res.json({
    success: true,
    data: samplePOIs,
    count: samplePOIs.length,
    cached: true,
    message: 'POIs loaded successfully'
  });
});

/**
 * GET /dashboardStats
 */
app.get('/dashboardStats', (req: Request, res: Response) => {
  const uid = req.query.uid as string;
  
  if (!uid) {
    return res.status(400).json({
      success: false,
      error: 'Missing userId (uid query param)'
    });
  }

  const userTrips = sampleTrips.filter(t => t.userId === uid);
  const totalDistance = userTrips.reduce((sum, trip) => sum + trip.distanceTraveled, 0);
  const totalFuelCost = userTrips.reduce((sum, trip) => sum + trip.fuelCost, 0);
  const avgRating = userTrips.length > 0
    ? userTrips.reduce((sum, trip) => sum + trip.rating, 0) / userTrips.length
    : 0;

  res.json({
    success: true,
    data: {
      routes: {
        total: sampleRoutes.length,
        active: sampleRoutes.filter(r => r.status === 'active').length,
        trending: sampleRoutes.slice(0, 3)
      },
      trips: {
        completed: userTrips.length,
        totalDistance,
        totalFuelCost,
        averageRating: parseFloat(avgRating.toFixed(1))
      },
      pois: {
        visited: userTrips.reduce((sum, trip) => sum + trip.poisVisited.length, 0)
      }
    },
    message: 'Dashboard stats aggregated (single call = 3 separate reads avoided)'
  });
});

/**
 * GET /trips
 */
app.get('/trips', (req: Request, res: Response) => {
  const uid = req.query.uid as string;
  const limit = parseInt(req.query.limit as string) || 10;
  const offset = parseInt(req.query.offset as string) || 0;

  if (!uid) {
    return res.status(400).json({
      success: false,
      error: 'Missing userId (uid query param)'
    });
  }

  const userTrips = sampleTrips
    .filter(t => t.userId === uid)
    .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime())
    .slice(offset, offset + limit + 1);

  res.json({
    success: true,
    data: userTrips,
    count: userTrips.length,
    hasMore: userTrips.length > limit,
    message: `${userTrips.length} trips loaded for user ${uid}`
  });
});

/**
 * POST /trips
 */
app.post('/trips', (req: Request, res: Response) => {
  const uid = req.query.uid as string;
  const tripData = req.body;

  if (!uid) {
    return res.status(400).json({
      success: false,
      error: 'Missing userId (uid query param)'
    });
  }

  const newTrip = {
    id: `trip-${Date.now()}`,
    userId: uid,
    ...tripData,
    createdAt: new Date().toISOString()
  };

  res.status(201).json({
    success: true,
    data: newTrip,
    message: 'Trip created successfully'
  });
});

/**
 * PUT /trips/:id
 */
app.put('/trips/:id', (req: Request, res: Response) => {
  const tripId = req.params.id;
  const uid = req.query.uid as string;
  const updateData = req.body;

  if (!uid) {
    return res.status(400).json({
      success: false,
      error: 'Missing userId (uid query param)'
    });
  }

  res.json({
    success: true,
    id: tripId,
    updated: updateData,
    message: `Trip ${tripId} updated for user ${uid}`
  });
});

/**
 * GET /weather
 */
app.get('/weather', (req: Request, res: Response) => {
  const { lat, lng } = req.query;

  if (!lat || !lng) {
    return res.status(400).json({
      success: false,
      error: 'Missing latitude or longitude'
    });
  }

  res.json({
    success: true,
    data: {
      temp: 72,
      feelsLike: 71,
      humidity: 65,
      windSpeed: 8,
      description: 'Partly cloudy',
      condition: 'partly-cloudy',
      location: `${lat},${lng}`
    },
    cached: true,
    message: 'Weather data (cached for 30 minutes)'
  });
});

/**
 * GET /health
 */
app.get('/health', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'API is healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

/**
 * GET / - API documentation
 */
app.get('/', (req: Request, res: Response) => {
  res.json({
    api: 'Road Trip Backend (Local Preview)',
    version: '1.0.0',
    endpoints: [
      {
        method: 'GET',
        path: '/routes',
        description: 'Get all routes (cached 1 year)',
        example: 'http://localhost:3001/routes'
      },
      {
        method: 'GET',
        path: '/pois',
        description: 'Get all POIs (cached 1 year)',
        example: 'http://localhost:3001/pois'
      },
      {
        method: 'GET',
        path: '/dashboardStats?uid=USER_ID',
        description: 'Get aggregated dashboard stats (1 call)',
        example: 'http://localhost:3001/dashboardStats?uid=user-1'
      },
      {
        method: 'GET',
        path: '/trips?uid=USER_ID',
        description: 'Get user trip history',
        example: 'http://localhost:3001/trips?uid=user-1&limit=10'
      },
      {
        method: 'POST',
        path: '/trips?uid=USER_ID',
        description: 'Create new trip',
        body: { routeId: 'route-1', distanceTraveled: 100 }
      },
      {
        method: 'PUT',
        path: '/trips/:id?uid=USER_ID',
        description: 'Update trip',
        body: { rating: 5, notes: 'Amazing trip!' }
      },
      {
        method: 'GET',
        path: '/weather?lat=X&lng=Y',
        description: 'Get weather (cached 30 min)',
        example: 'http://localhost:3001/weather?lat=37.7749&lng=-122.4194'
      },
      {
        method: 'GET',
        path: '/health',
        description: 'API health check',
        example: 'http://localhost:3001/health'
      }
    ],
    optimization: {
      staticDataCached: ['routes', 'pois'],
      aggregatedQueries: ['dashboardStats (replaces 3 calls)'],
      weatherCached: '30 minutes',
      browserCache: '1 year for routes/pois'
    }
  });
});

app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════════════╗
║              🚀 LOCAL API SERVER STARTED 🚀                   ║
╚════════════════════════════════════════════════════════════════╝

📍 Server running at: http://localhost:${PORT}

📚 API Endpoints:
  • GET  /                        - API documentation
  • GET  /health                  - Health check
  • GET  /routes                  - All routes (cached 1 year)
  • GET  /pois                    - All POIs (cached 1 year)
  • GET  /dashboardStats?uid=ID   - Aggregated stats (1 call)
  • GET  /trips?uid=ID            - User trip history
  • POST /trips?uid=ID            - Create trip
  • PUT  /trips/:id?uid=ID        - Update trip
  • GET  /weather?lat=X&lng=Y     - Weather (cached 30 min)

🎯 Key Features:
  ✓ CORS enabled (works from any frontend)
  ✓ Aggregated queries (80-90% fewer API calls)
  ✓ Sample data ready to test
  ✓ Production endpoint signatures

📖 View at: http://localhost:${PORT}
  `);
});

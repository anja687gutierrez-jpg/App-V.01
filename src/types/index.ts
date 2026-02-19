export * from './vehicle';

export interface POI {
  id: string;
  name: string;
  type: string;
  location: { lat: number; lng: number };
  address: string;
  rating: number;
  reviews: number;
  hours?: string;
  amenities?: string[];
  pricePerHour?: number;
  maxStayHours?: number;
  availability?: number;
  totalSpaces?: number;
  paymentMethods?: string[];
  visitStatus: 'visited' | 'not-visited' | 'planned';
  phone?: string;
  metadata?: Record<string, unknown>;
  category?: string;
  distance?: number;
}

export interface Route {
  id: string;
  name: string;
  startLocation: { lat: number; lng: number };
  endLocation: { lat: number; lng: number };
  distance: number; // km
  estimatedDuration: number; // hours
  difficulty?: string;
  scenery?: string;
  bestTimeToVisit?: string;
  highlights?: string[];
  pois?: string[];
  status: 'active' | 'archived' | 'draft';
  createdAt: string;
  orsData?: {
    geometry?: [number, number][];
    turnByTurnInstructions?: ORSStep[];
    elevation?: number[];
    surface?: string[];
  };
}

// --- NEW INTERFACE FOR CONTACTS ---
export interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  relation: string;
  isPrimary?: boolean;
  isTrusted?: boolean;
  shareLocationDuringTrips?: boolean;
  countryCode?: string;
  relationship?: string;
}

// --- UPDATED PREFERENCES (Matches Profile.tsx) ---
export interface TourPreferences {
  // The "Who" - Matches your Profile IDs
  avatarStyle: 'tech' | 'guide' | 'ranger' | 'foodie' | 'artist' | 'celebrity' | 'event' | string;

  // The "How"
  travelStyle: 'scenic' | 'history' | 'luxury' | 'adventure' | 'nomad' | 'eco' | 'culture' | string;

  interests: string[];

  // Update: Changed from 'low'|'medium' to string to support specific "$250" inputs
  budget: string;
  currency: string;
  pace: string; // 'Relaxed' | 'Balanced' | 'Fast'

  // Vehicle Data
  vehicleType?: 'car' | 'ev' | 'suv' | 'rv';
  vehicleRange?: number;

  // Legacy support (optional)
  accommodationType?: 'hotel' | 'camping';
  duration?: number;
  voice?: string;
  destination?: string;
}

// --- UPDATED USER PROFILE ---
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatarUrl?: string;
  preferences: TourPreferences;
  emergencyContacts: EmergencyContact[];
}

export interface Influencer {
  id: string;
  youtubeChannelId: string;
  name: string;
  handle: string;
  avatarUrl: string;
  subscriberCount: number;
  category: string;
  bio: string;
  isVerified: boolean;
  youtubeUrl: string;
}

export interface CuratedVideo {
  id: string;
  youtubeVideoId: string;
  poiId: string;
  influencerId: string;
  influencer: Influencer;
  title: string;
  description: string;
  thumbnailUrl: string;
  duration: number;
  viewCount: number;
  publishedAt: string;
  tags: string[];
  relevanceScore: number;
  isFeatured: boolean;
  createdAt: string;
}

// --- Tour & Route Types ---
export interface RouteStop {
  id: string;
  poiId?: string;
  name: string;
  location: { lat: number; lng: number };
  address: string;
  order: number;
  stopOrder?: number; // Alias for order for compatibility
  estimatedArrival?: string;
  estimatedDeparture?: string;
  estimatedTime?: number; // Estimated time in minutes
  duration?: number;
  notes?: string;
  description?: string;
  type?: string;
  latitude?: number;
  longitude?: number;
  tourId?: string;
  fuelInfo?: {
    stationId?: string;
    estimatedCost?: number;
    gallonsNeeded?: number;
    pricePerGallon?: number;
    loyaltyDiscount?: number;
    brand?: string;
    fuelTypes?: string[];
  };
  chargingInfo?: {
    connectorTypes: string[];
    maxPower: number;
    pricing: string;
  };
  amenities?: string;
  createdAt?: string;
  rating?: number;
}

export interface Tour {
  id: string;
  name: string;
  description?: string;
  destination?: string;
  status: 'planned' | 'active' | 'completed' | 'cancelled' | 'draft';
  startDate?: string;
  endDate?: string;
  routeStops?: RouteStop[];
  preferences?: TourPreferences;
  createdAt: string;
  updatedAt: string;
}

// --- Extended EmergencyContact ---
export interface ExtendedEmergencyContact extends EmergencyContact {
  countryCode?: string;
  relationship?: string;
  isPrimary?: boolean;
  isTrusted?: boolean;
  shareLocationDuringTrips?: boolean;
}

// --- Safety & Tour Types ---
export interface SafetyCheckIn {
  id: string;
  tourId: string;
  tripId?: string;
  userId?: string;
  timestamp: string;
  location: { lat: number; lng: number };
  status: 'safe' | 'delayed' | 'concern' | 'pending' | 'concerned' | 'urgent';
  message?: string;
  lastCheckIn?: string;
  scheduledNextCheckIn?: string;
  notifiedContacts?: string[];
  createdAt?: string;
}

export interface IncidentReport {
  id: string;
  tourId?: string;
  tripId?: string;
  userId?: string;
  type: 'accident' | 'breakdown' | 'hazard' | 'medical' | 'other';
  severity: 'low' | 'medium' | 'high' | 'critical';
  location: { lat: number; lng: number } | string;
  description: string;
  timestamp: string;
  reportedBy: string;
  resolved?: boolean;
  emergencyContactedAt?: string;
  latitude?: number;
  longitude?: number;
  policeReportNumber?: string;
  photos?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface RoadsideService {
  id: string;
  name: string;
  phone: string;
  location: { lat: number; lng: number };
  distance: number;
  services: string[];
  type?: string;
  rating?: number;
  available24h?: boolean;
  countryCode?: string;
  coverage?: string | {
    states?: number;
    international?: boolean;
    response?: string;
  };
  serviceArea?: string | string[];
  languages?: string[];
  acceptsInternational?: boolean;
  responseTime?: string;
  createdAt?: string;
}

export interface ParkingLocation {
  id: string;
  name: string;
  location: { lat: number; lng: number };
  address: string;
  distance: number;
  poiId?: string;
  type?: string;
  pricePerHour?: number;
  maxStayHours?: number;
  availability?: number;
  totalSpaces?: number;
  rating?: number;
  amenities?: string[];
  acceptsPaymentApps?: boolean | string[];
}

export interface ChargingStation {
  id: string;
  name: string;
  location: { lat: number; lng: number };
  address: string;
  distance: number;
  connectorTypes: string[];
  powerKw: number;
  available: boolean;
  availability?: 'available' | 'busy' | 'unavailable' | string;
  cost?: number;
  latitude?: number;
  longitude?: number;
  chargingSpeed?: string;
  estimatedTime?: number;
  pricing?: string;
  amenities?: string[];
}

export interface GasStation {
  id: string;
  name: string;
  location: { lat: number; lng: number };
  address: string;
  distance: number;
  fuelTypes: string[];
  price?: number;
  pricePerGallon?: number;
  brand?: string;
  latitude?: number;
  longitude?: number;
  available24h?: boolean;
  availability?: 'open' | 'closing_soon' | 'closed' | string;
  loyaltyDiscount?: number;
  amenities?: string[];
  rating?: number;
}

export interface NarrationScript {
  id: string;
  stopId: string;
  text?: string;
  script?: string;
  title?: string;
  audioUrl?: string;
  duration: number;
  order?: number;
  isGenerating?: boolean;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string | Date;
  metadata?: Record<string, unknown>;
  voicePersonality?: string;
}

export interface Suggestion {
  id: string;
  type: 'poi' | 'route' | 'activity' | 'restaurant' | 'accommodation' | 'detour' | 'stop' | 'optimization' | 'discovery';
  title: string;
  description: string;
  location?: { lat: number; lng: number };
  relevanceScore?: number;
  metadata?: Record<string, unknown>;
  why_hidden?: string;
  timeAdded?: string;
  rating?: number;
  details?: Record<string, unknown>;
  interest?: string;
}

// --- Extended TourPreferences ---
export interface ExtendedTourPreferences extends TourPreferences {
  destination?: string;
}

// --- OPENROUTESERVICE API TYPES ---
export interface ORSCoordinate {
  lat: number;
  lng: number;
}

export interface ORSDirectionsRequest {
  coordinates: [number, number][]; // [lng, lat] format (ORS uses lng,lat!)
  profile?: 'driving-car' | 'driving-hgv' | 'cycling-regular' | 'foot-walking';
  units?: 'km' | 'mi';
  language?: 'en';
  geometry?: boolean;
  instructions?: boolean;
  elevation?: boolean;
  extra_info?: string[];
}

export interface ORSDirectionsResponse {
  routes: ORSRoute[];
  metadata: {
    query: Record<string, unknown>;
    engine: Record<string, unknown>;
  };
}

export interface ORSRoute {
  summary: {
    distance: number; // meters
    duration: number; // seconds
  };
  geometry: {
    coordinates: [number, number][]; // [lng, lat]
    type: 'LineString';
  };
  segments: ORSSegment[];
  way_points: number[];
}

export interface ORSSegment {
  distance: number;
  duration: number;
  steps: ORSStep[];
}

export interface ORSStep {
  distance: number;
  duration: number;
  type: number;
  instruction: string;
  name: string;
  way_points: [number, number];
}

// Geocoding types
export interface ORSGeocodeRequest {
  text: string;
  size?: number;
  boundary_country?: string[];
}

export interface ORSGeocodeResponse {
  features: ORSGeocodeFeature[];
}

export interface ORSGeocodeFeature {
  geometry: {
    coordinates: [number, number]; // [lng, lat]
  };
  properties: {
    name: string;
    label: string;
    country: string;
    region: string;
    locality?: string;
  };
}

// --- MEMBERSHIP & FEATURE FLAGS ---
export type MembershipTier = 'free' | 'basic' | 'advanced' | 'expert' | 'test';

export interface MembershipLimits {
  maxSavedTrips: number | 'unlimited';
  maxWaypointsPerTrip: number | 'unlimited';
  monthlyRouteCalculations: number | 'unlimited';
  maxOfflineTrips: number | 'unlimited';
  features: FeatureAccess;
}

export interface FeatureAccess {
  realTimeRouting: boolean;
  routeOptimization?: boolean;
  routeOptimizationAdvanced?: boolean;
  geocoding?: boolean;
  geocodingUnlimited?: boolean;
  offlineAccess?: boolean;
  offlineAutoSync?: boolean;
  tripSharing?: boolean;
  tripCollaboration?: boolean;
  publicProfile?: boolean;
  dataExport?: boolean;
  exportFormats?: string[];
  apiAccess?: boolean;
  influencerContent?: 'sample' | 'full' | 'exclusive';
  influencerContentCreation?: boolean;
  aiMessages?: number | 'unlimited';
  aiPriority?: boolean;
  aiCustomTraining?: boolean;
  safetyFeatures?: 'basic' | 'full';
  liveTracking?: boolean;
  analytics?: boolean;
  evRouting?: boolean;
  fuelOptimization?: boolean;
  parkingFinder?: boolean;
  flightTracking?: boolean;
  arFeatures?: boolean;
  whiteLabel?: boolean;
  prioritySupport?: boolean;
  betaAccess?: boolean;
  debugMode?: boolean;
  apiMonitoring?: boolean;
}

export interface UserUsage {
  userId: string;
  tier: MembershipTier;
  currentMonth: string; // YYYY-MM
  routeCalculations: number;
  savedTrips: number;
  offlineTrips: number;
  lastReset: string;
}

export interface APIUsageRecord {
  timestamp: number;
  endpoint: string;
  success: boolean;
  cached: boolean;
}

export interface FeatureFlagConfig {
  userId?: string;
  userTier?: MembershipTier;
  featureName: string;
}

export interface TripRecord {
  id: string;
  routeId: string;
  userId: string;
  startTime: string;
  endTime: string | null;
  startLocation: { lat: number; lng: number };
  endLocation: { lat: number; lng: number } | null;
  distanceTraveled: number;
  fuelUsed: number;
  fuelCost: number;
  poisVisited: string[];
  checkPoints: Array<{
    location: string;
    timestamp: string;
    notes?: string;
  }>;
  rating: number | null;
  notes: string | null;
  status: string;
}
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
  metadata?: any;
  category?: string;
}

// --- NEW INTERFACE FOR CONTACTS ---
export interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  relation: string;
  isPrimary?: boolean; // Added for safety
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
  };
}

export interface Tour {
  id: string;
  name: string;
  description?: string;
  destination?: string;
  status: 'planned' | 'active' | 'completed' | 'cancelled';
  startDate?: string;
  endDate?: string;
  routeStops: RouteStop[];
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
  timestamp: string;
  location: { lat: number; lng: number };
  status: 'safe' | 'delayed' | 'concern';
  message?: string;
}

export interface IncidentReport {
  id: string;
  tourId?: string;
  type: 'accident' | 'breakdown' | 'hazard' | 'medical' | 'other';
  severity: 'low' | 'medium' | 'high' | 'critical';
  location: { lat: number; lng: number };
  description: string;
  timestamp: string;
  reportedBy: string;
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
  acceptsPaymentApps?: boolean;
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
  timestamp: string;
  metadata?: any;
}

export interface Suggestion {
  id: string;
  type: 'poi' | 'route' | 'activity' | 'restaurant' | 'accommodation';
  title: string;
  description: string;
  location?: { lat: number; lng: number };
  relevanceScore: number;
  metadata?: any;
}

// --- Extended TourPreferences ---
export interface ExtendedTourPreferences extends TourPreferences {
  destination?: string;
}
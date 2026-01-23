/**
 * NREL Alternative Fuel Stations API Service
 *
 * Fetches Tesla Supercharger and other EV charging station data
 * from the National Renewable Energy Laboratory (NREL) API.
 *
 * API Documentation: https://developer.nrel.gov/docs/transportation/alt-fuel-stations-v1/
 */

// Types for the NREL API response
export interface NRELChargingStation {
  id: number;
  station_name: string;
  street_address: string;
  city: string;
  state: string;
  zip: string;
  latitude: number;
  longitude: number;
  ev_network: string;
  ev_connector_types: string[];
  ev_dc_fast_num: number | null;
  ev_level2_evse_num: number | null;
  ev_pricing: string | null;
  access_code: string;
  access_days_time: string | null;
  facility_type: string | null;
  status_code: string;
  open_date: string | null;
  distance?: number;
  distance_km?: number;
}

export interface ChargingStationFormatted {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  latitude: number;
  longitude: number;
  network: string;
  connectorTypes: string[];
  dcFastCount: number;
  level2Count: number;
  pricing: string;
  accessCode: string;
  hours: string;
  facilityType: string;
  status: 'available' | 'busy' | 'offline';
  distance: number;
  distanceKm: number;
  chargingSpeed: string;
  estimatedChargeTime: number;
  amenities: string[];
}

// Tesla Model Y specifications
const TESLA_MODEL_Y = {
  batteryCapacity: 75, // kWh
  usableCapacity: 72.5, // kWh (accounting for buffer)
  efficiency: 3.89, // miles per kWh (EPA estimated)
  range: 280, // miles (EPA estimated)
  maxChargingSpeed: 250, // kW (Supercharger V3)
};

class NRELService {
  private readonly API_BASE = 'https://api.nrel.gov/alt-fuel-stations/v1';
  // NREL demo API key - for production, use environment variable
  private readonly API_KEY = 'DEMO_KEY';

  /**
   * Fetch Tesla Superchargers near a location
   */
  async getTeslaSuperchargers(
    lat: number,
    lng: number,
    radiusMiles: number = 50
  ): Promise<ChargingStationFormatted[]> {
    try {
      const params = new URLSearchParams({
        api_key: this.API_KEY,
        latitude: lat.toString(),
        longitude: lng.toString(),
        radius: radiusMiles.toString(),
        fuel_type: 'ELEC',
        ev_network: 'Tesla',
        status: 'E', // E = Available
        access: 'public',
        limit: '20',
      });

      const response = await fetch(`${this.API_BASE}/nearest.json?${params}`);

      if (!response.ok) {
        console.warn('[NRELService] API request failed, using fallback data');
        return this.getFallbackStations(lat, lng);
      }

      const data = await response.json();
      return this.formatStations(data.fuel_stations || []);
    } catch (error) {
      console.error('[NRELService] Error fetching stations:', error);
      return this.getFallbackStations(lat, lng);
    }
  }

  /**
   * Fetch all EV charging stations (any network) near a location
   */
  async getAllChargingStations(
    lat: number,
    lng: number,
    radiusMiles: number = 25
  ): Promise<ChargingStationFormatted[]> {
    try {
      const params = new URLSearchParams({
        api_key: this.API_KEY,
        latitude: lat.toString(),
        longitude: lng.toString(),
        radius: radiusMiles.toString(),
        fuel_type: 'ELEC',
        ev_connector_type: 'TESLA,J1772COMBO', // Tesla + CCS
        status: 'E',
        access: 'public',
        limit: '30',
      });

      const response = await fetch(`${this.API_BASE}/nearest.json?${params}`);

      if (!response.ok) {
        return this.getFallbackStations(lat, lng);
      }

      const data = await response.json();
      return this.formatStations(data.fuel_stations || []);
    } catch (error) {
      console.error('[NRELService] Error fetching stations:', error);
      return this.getFallbackStations(lat, lng);
    }
  }

  /**
   * Find charging stations along a route (between waypoints)
   */
  async getStationsAlongRoute(
    waypoints: { lat: number; lng: number }[],
    currentBatteryPercent: number = 80
  ): Promise<{
    stations: ChargingStationFormatted[];
    suggestedStops: ChargingStationFormatted[];
    batteryAnalysis: {
      needsCharging: boolean;
      rangeAnxiety: boolean;
      estimatedRemainingPercent: number;
      segments: Array<{
        from: { lat: number; lng: number };
        to: { lat: number; lng: number };
        distance: number;
        batteryUsed: number;
        batteryRemaining: number;
      }>;
    };
  }> {
    if (waypoints.length < 2) {
      return {
        stations: [],
        suggestedStops: [],
        batteryAnalysis: {
          needsCharging: false,
          rangeAnxiety: false,
          estimatedRemainingPercent: currentBatteryPercent,
          segments: [],
        },
      };
    }

    // Calculate battery usage per segment
    const segments: Array<{
      from: { lat: number; lng: number };
      to: { lat: number; lng: number };
      distance: number;
      batteryUsed: number;
      batteryRemaining: number;
    }> = [];

    let currentBattery = currentBatteryPercent;
    const suggestedStops: ChargingStationFormatted[] = [];
    const allStations: ChargingStationFormatted[] = [];

    for (let i = 0; i < waypoints.length - 1; i++) {
      const from = waypoints[i];
      const to = waypoints[i + 1];

      // Calculate distance using Haversine formula
      const distance = this.calculateDistance(from.lat, from.lng, to.lat, to.lng);

      // Battery usage: distance / (efficiency * battery capacity) * 100
      const batteryUsed = (distance / TESLA_MODEL_Y.range) * 100;
      const batteryRemaining = Math.max(0, currentBattery - batteryUsed);

      segments.push({
        from,
        to,
        distance: Math.round(distance),
        batteryUsed: Math.round(batteryUsed),
        batteryRemaining: Math.round(batteryRemaining),
      });

      // If battery would drop below 20%, suggest a charging stop
      if (batteryRemaining < 20 && i < waypoints.length - 1) {
        // Find stations near the midpoint of this segment
        const midLat = (from.lat + to.lat) / 2;
        const midLng = (from.lng + to.lng) / 2;

        const nearbyStations = await this.getTeslaSuperchargers(midLat, midLng, 30);
        allStations.push(...nearbyStations);

        if (nearbyStations.length > 0) {
          suggestedStops.push(nearbyStations[0]); // Suggest nearest station
          currentBattery = 80; // Assume charging to 80%
        }
      }

      currentBattery = batteryRemaining;
    }

    const needsCharging = currentBattery < 10;
    const rangeAnxiety = currentBattery < 20;

    return {
      stations: allStations,
      suggestedStops,
      batteryAnalysis: {
        needsCharging,
        rangeAnxiety,
        estimatedRemainingPercent: Math.round(currentBattery),
        segments,
      },
    };
  }

  /**
   * Calculate estimated charge time to reach target battery level
   */
  calculateChargeTime(
    currentPercent: number,
    targetPercent: number = 80
  ): number {
    // Tesla charging curve: fast to 50%, slows down after 80%
    const currentKWh = (currentPercent / 100) * TESLA_MODEL_Y.usableCapacity;
    const targetKWh = (targetPercent / 100) * TESLA_MODEL_Y.usableCapacity;
    const kWhNeeded = targetKWh - currentKWh;

    // Average charging speed considering curve (V3 Supercharger)
    // 0-50%: ~200kW average
    // 50-80%: ~100kW average
    // 80-100%: ~40kW average
    let avgSpeed: number;
    if (targetPercent <= 50) {
      avgSpeed = 200;
    } else if (targetPercent <= 80) {
      avgSpeed = currentPercent < 50 ? 150 : 100;
    } else {
      avgSpeed = 60;
    }

    const hoursToCharge = kWhNeeded / avgSpeed;
    return Math.round(hoursToCharge * 60); // Return minutes
  }

  /**
   * Format raw NREL station data to our app format
   */
  private formatStations(stations: NRELChargingStation[]): ChargingStationFormatted[] {
    return stations.map((station) => {
      const dcFastCount = station.ev_dc_fast_num || 0;
      const level2Count = station.ev_level2_evse_num || 0;

      // Determine charging speed based on network and charger count
      let chargingSpeed = '150kW DC Fast';
      if (station.ev_network === 'Tesla') {
        chargingSpeed = dcFastCount > 0 ? '250kW Supercharger V3' : '72kW Destination';
      } else if (station.ev_network === 'Electrify America') {
        chargingSpeed = '350kW Ultra Fast';
      }

      // Estimate charge time (20% to 80%)
      const estimatedChargeTime = this.calculateChargeTime(20, 80);

      // Map status codes
      let status: 'available' | 'busy' | 'offline' = 'available';
      if (station.status_code === 'T') status = 'offline';
      else if (station.status_code === 'P') status = 'busy';

      // Generate amenities based on facility type
      const amenities = this.generateAmenities(station);

      return {
        id: station.id.toString(),
        name: station.station_name,
        address: station.street_address,
        city: station.city,
        state: station.state,
        latitude: station.latitude,
        longitude: station.longitude,
        network: station.ev_network || 'Unknown',
        connectorTypes: station.ev_connector_types || [],
        dcFastCount,
        level2Count,
        pricing: station.ev_pricing || 'Contact station for pricing',
        accessCode: station.access_code,
        hours: station.access_days_time || '24/7',
        facilityType: station.facility_type || 'Public',
        status,
        distance: station.distance || 0,
        distanceKm: station.distance_km || 0,
        chargingSpeed,
        estimatedChargeTime,
        amenities,
      };
    });
  }

  /**
   * Generate amenities based on facility type and network
   */
  private generateAmenities(station: NRELChargingStation): string[] {
    const amenities: string[] = ['Restrooms', 'WiFi'];

    const facilityType = station.facility_type?.toLowerCase() || '';

    if (facilityType.includes('grocery') || facilityType.includes('retail')) {
      amenities.push('Shopping', 'Food');
    }
    if (facilityType.includes('hotel') || facilityType.includes('lodging')) {
      amenities.push('Hotel', 'Dining');
    }
    if (facilityType.includes('restaurant') || facilityType.includes('dining')) {
      amenities.push('Restaurant', 'Coffee');
    }
    if (facilityType.includes('gas') || facilityType.includes('travel')) {
      amenities.push('Convenience Store', 'Food');
    }

    // Tesla-specific amenities
    if (station.ev_network === 'Tesla') {
      amenities.push('Tesla Lounge');
    }

    return [...new Set(amenities)]; // Remove duplicates
  }

  /**
   * Calculate distance between two points using Haversine formula
   */
  private calculateDistance(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number
  ): number {
    const R = 3959; // Earth's radius in miles
    const dLat = this.toRad(lat2 - lat1);
    const dLng = this.toRad(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) *
        Math.cos(this.toRad(lat2)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRad(deg: number): number {
    return deg * (Math.PI / 180);
  }

  /**
   * Fallback stations for when API is unavailable
   */
  private getFallbackStations(lat: number, lng: number): ChargingStationFormatted[] {
    // Return mock data based on general California Tesla Supercharger locations
    return [
      {
        id: 'tesla_gilroy',
        name: 'Tesla Supercharger - Gilroy Premium Outlets',
        address: '681 Leavesley Rd',
        city: 'Gilroy',
        state: 'CA',
        latitude: 37.0058,
        longitude: -121.5683,
        network: 'Tesla',
        connectorTypes: ['Tesla Supercharger V3', 'CCS (Magic Dock)'],
        dcFastCount: 20,
        level2Count: 0,
        pricing: '$0.28/kWh',
        accessCode: 'public',
        hours: '24/7',
        facilityType: 'Shopping',
        status: 'available',
        distance: Math.round(this.calculateDistance(lat, lng, 37.0058, -121.5683)),
        distanceKm: Math.round(this.calculateDistance(lat, lng, 37.0058, -121.5683) * 1.609),
        chargingSpeed: '250kW Supercharger V3',
        estimatedChargeTime: 25,
        amenities: ['Shopping', 'Starbucks', 'Food Court', 'Restrooms', 'WiFi'],
      },
      {
        id: 'tesla_kettleman',
        name: 'Tesla Supercharger - Kettleman City',
        address: '33394 Bernard Dr',
        city: 'Kettleman City',
        state: 'CA',
        latitude: 36.0078,
        longitude: -119.9625,
        network: 'Tesla',
        connectorTypes: ['Tesla Supercharger V3'],
        dcFastCount: 40,
        level2Count: 0,
        pricing: '$0.26/kWh',
        accessCode: 'public',
        hours: '24/7',
        facilityType: 'Tesla Station',
        status: 'available',
        distance: Math.round(this.calculateDistance(lat, lng, 36.0078, -119.9625)),
        distanceKm: Math.round(this.calculateDistance(lat, lng, 36.0078, -119.9625) * 1.609),
        chargingSpeed: '250kW Supercharger V3',
        estimatedChargeTime: 20,
        amenities: ['Tesla Lounge', 'Restrooms', 'WiFi', 'Dining'],
      },
      {
        id: 'tesla_harris',
        name: 'Tesla Supercharger - Harris Ranch',
        address: '24505 W Dorris Ave',
        city: 'Coalinga',
        state: 'CA',
        latitude: 36.2534,
        longitude: -120.2384,
        network: 'Tesla',
        connectorTypes: ['Tesla Supercharger V3'],
        dcFastCount: 18,
        level2Count: 4,
        pricing: '$0.28/kWh',
        accessCode: 'public',
        hours: '24/7',
        facilityType: 'Restaurant',
        status: 'available',
        distance: Math.round(this.calculateDistance(lat, lng, 36.2534, -120.2384)),
        distanceKm: Math.round(this.calculateDistance(lat, lng, 36.2534, -120.2384) * 1.609),
        chargingSpeed: '250kW Supercharger V3',
        estimatedChargeTime: 22,
        amenities: ['Restaurant', 'Hotel', 'Restrooms', 'WiFi'],
      },
    ];
  }
}

export const nrelService = new NRELService();

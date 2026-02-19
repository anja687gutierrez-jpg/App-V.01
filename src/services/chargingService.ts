/**
 * Charging Service - Tesla Supercharger Integration
 *
 * Provides charging station data from NREL API (Alternative Fuel Stations Database)
 * and calculates battery estimates for Tesla vehicles along routes.
 *
 * NREL API Documentation: https://developer.nrel.gov/docs/transportation/alt-fuel-stations-v1/
 */

export interface ChargingStation {
  id: string;
  name: string;
  lat: number;
  lng: number;
  address: string;
  city: string;
  state: string;
  zip: string;
  phone?: string;
  evNetwork: string;
  evConnectorTypes: string[];
  evDCFastNum: number;
  evLevel2Num: number;
  evPricing?: string;
  accessDaysTime?: string;
  distanceFromRoute?: number; // miles
  status: 'open' | 'planned' | 'temporarily_unavailable';
}

export interface BatteryEstimate {
  waypointId: number;
  waypointName: string;
  arrivalBattery: number; // percentage
  departBattery: number; // percentage
  distanceToNext: number; // miles
  batteryUsed: number; // percentage
  needsCharging: boolean;
  suggestedChargeTo: number; // percentage
  warningLevel: 'ok' | 'low' | 'critical';
}

export interface ChargingPlan {
  totalDistance: number;
  estimates: BatteryEstimate[];
  recommendedStops: ChargingStation[];
  warnings: string[];
}

import { TESLA_MODEL_Y_SPECS } from '@/types/vehicle';

// Tesla Model Y specs — derived from shared constants
const TESLA_SPECS = {
  MODEL_Y_RANGE: TESLA_MODEL_Y_SPECS.EPA_RANGE_MILES,
  MODEL_Y_EFFICIENCY: TESLA_MODEL_Y_SPECS.EFFICIENCY_KWH_PER_MILE,
  BATTERY_CAPACITY: TESLA_MODEL_Y_SPECS.BATTERY_CAPACITY_KWH,
  COMFORTABLE_MIN_BATTERY: TESLA_MODEL_Y_SPECS.COMFORTABLE_MIN_BATTERY,
  CHARGE_TARGET: TESLA_MODEL_Y_SPECS.CHARGE_TARGET,
  SUPERCHARGER_RATE: TESLA_MODEL_Y_SPECS.SUPERCHARGER_RATE_MPH,
};

class ChargingService {
  private apiKey: string | null = null;
  private cache: Map<string, { data: ChargingStation[]; timestamp: number }> = new Map();
  private CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

  constructor() {
    // NREL API key from environment
    this.apiKey = import.meta.env.VITE_NREL_API_KEY || null;
  }

  /**
   * Fetch Tesla Superchargers near a route
   */
  async getChargersNearRoute(
    waypoints: Array<{ lat: number; lng: number }>,
    radiusMiles: number = 10
  ): Promise<ChargingStation[]> {
    if (waypoints.length < 2) return [];

    // Generate cache key from route bounds
    const bounds = this.calculateRouteBounds(waypoints);
    const cacheKey = `${bounds.minLat}-${bounds.maxLat}-${bounds.minLng}-${bounds.maxLng}`;

    // Check cache
    const cached = this.cache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.data;
    }

    try {
      const stations = await this.fetchFromNREL(bounds, radiusMiles);
      this.cache.set(cacheKey, { data: stations, timestamp: Date.now() });
      return stations;
    } catch (error) {
      console.warn('NREL API failed, using fallback data:', error);
      return this.getFallbackChargers(waypoints);
    }
  }

  /**
   * Fetch from NREL Alternative Fuel Stations API
   */
  private async fetchFromNREL(
    bounds: { minLat: number; maxLat: number; minLng: number; maxLng: number },
    radiusMiles: number
  ): Promise<ChargingStation[]> {
    // If no API key, use fallback
    if (!this.apiKey) {
      throw new Error('No NREL API key configured');
    }

    const baseUrl = 'https://developer.nrel.gov/alt-fuel-stations/v1.json';
    const params = new URLSearchParams({
      api_key: this.apiKey,
      fuel_type: 'ELEC',
      ev_network: 'Tesla,Tesla Destination', // Tesla Superchargers
      status: 'E', // Available (E = Open)
      access: 'public',
      latitude: ((bounds.minLat + bounds.maxLat) / 2).toString(),
      longitude: ((bounds.minLng + bounds.maxLng) / 2).toString(),
      radius: radiusMiles.toString(),
      limit: '50',
    });

    const response = await fetch(`${baseUrl}?${params}`);
    if (!response.ok) {
      throw new Error(`NREL API error: ${response.status}`);
    }

    const data = await response.json();
    return this.transformNRELResponse(data.fuel_stations || []);
  }

  /**
   * Transform NREL API response to our format
   */
  private transformNRELResponse(stations: any[]): ChargingStation[] {
    return stations.map(station => ({
      id: station.id.toString(),
      name: station.station_name,
      lat: station.latitude,
      lng: station.longitude,
      address: station.street_address,
      city: station.city,
      state: station.state,
      zip: station.zip,
      phone: station.station_phone,
      evNetwork: station.ev_network,
      evConnectorTypes: station.ev_connector_types || [],
      evDCFastNum: station.ev_dc_fast_num || 0,
      evLevel2Num: station.ev_level2_evse_num || 0,
      evPricing: station.ev_pricing,
      accessDaysTime: station.access_days_time,
      status: station.status_code === 'E' ? 'open' :
              station.status_code === 'P' ? 'planned' : 'temporarily_unavailable',
    }));
  }

  /**
   * Get fallback charger data (mock Tesla Superchargers)
   * Used when NREL API is unavailable
   */
  private getFallbackChargers(waypoints: Array<{ lat: number; lng: number }>): ChargingStation[] {
    // Mock Tesla Supercharger locations along common California routes
    const mockSuperchargers: ChargingStation[] = [
      {
        id: 'sc-tracy',
        name: 'Tesla Supercharger - Tracy',
        lat: 37.7396,
        lng: -121.4252,
        address: '2551 Naglee Rd',
        city: 'Tracy',
        state: 'CA',
        zip: '95304',
        evNetwork: 'Tesla',
        evConnectorTypes: ['TESLA'],
        evDCFastNum: 20,
        evLevel2Num: 0,
        evPricing: '$0.28/kWh',
        accessDaysTime: '24 hours',
        status: 'open',
      },
      {
        id: 'sc-manteca',
        name: 'Tesla Supercharger - Manteca',
        lat: 37.7974,
        lng: -121.2161,
        address: '1100 N Main St',
        city: 'Manteca',
        state: 'CA',
        zip: '95336',
        evNetwork: 'Tesla',
        evConnectorTypes: ['TESLA'],
        evDCFastNum: 16,
        evLevel2Num: 0,
        evPricing: '$0.31/kWh',
        accessDaysTime: '24 hours',
        status: 'open',
      },
      {
        id: 'sc-modesto',
        name: 'Tesla Supercharger - Modesto',
        lat: 37.6607,
        lng: -120.9988,
        address: '3401 Dale Rd',
        city: 'Modesto',
        state: 'CA',
        zip: '95356',
        evNetwork: 'Tesla',
        evConnectorTypes: ['TESLA'],
        evDCFastNum: 12,
        evLevel2Num: 0,
        evPricing: '$0.29/kWh',
        accessDaysTime: '24 hours',
        status: 'open',
      },
      {
        id: 'sc-merced',
        name: 'Tesla Supercharger - Merced',
        lat: 37.3022,
        lng: -120.4829,
        address: '3260 R St',
        city: 'Merced',
        state: 'CA',
        zip: '95340',
        evNetwork: 'Tesla',
        evConnectorTypes: ['TESLA'],
        evDCFastNum: 8,
        evLevel2Num: 0,
        evPricing: '$0.28/kWh',
        accessDaysTime: '24 hours',
        status: 'open',
      },
      {
        id: 'sc-fresno',
        name: 'Tesla Supercharger - Fresno',
        lat: 36.8081,
        lng: -119.7908,
        address: '7735 N Blackstone Ave',
        city: 'Fresno',
        state: 'CA',
        zip: '93720',
        evNetwork: 'Tesla',
        evConnectorTypes: ['TESLA'],
        evDCFastNum: 24,
        evLevel2Num: 0,
        evPricing: '$0.27/kWh',
        accessDaysTime: '24 hours',
        status: 'open',
      },
      {
        id: 'sc-mariposa',
        name: 'Tesla Supercharger - Mariposa',
        lat: 37.4849,
        lng: -119.9663,
        address: '5089 Hwy 140',
        city: 'Mariposa',
        state: 'CA',
        zip: '95338',
        evNetwork: 'Tesla',
        evConnectorTypes: ['TESLA'],
        evDCFastNum: 8,
        evLevel2Num: 4,
        evPricing: '$0.32/kWh',
        accessDaysTime: '24 hours',
        status: 'open',
      },
      {
        id: 'sc-oakhurst',
        name: 'Tesla Supercharger - Oakhurst',
        lat: 37.3281,
        lng: -119.6495,
        address: '40530 Hwy 41',
        city: 'Oakhurst',
        state: 'CA',
        zip: '93644',
        evNetwork: 'Tesla',
        evConnectorTypes: ['TESLA'],
        evDCFastNum: 12,
        evLevel2Num: 0,
        evPricing: '$0.30/kWh',
        accessDaysTime: '24 hours',
        status: 'open',
      },
    ];

    // Filter to chargers near the route
    return mockSuperchargers.filter(charger => {
      const nearRoute = waypoints.some(wp => {
        const distance = this.haversineDistance(wp.lat, wp.lng, charger.lat, charger.lng);
        charger.distanceFromRoute = Math.min(charger.distanceFromRoute ?? Infinity, distance);
        return distance <= 15; // Within 15 miles of route
      });
      return nearRoute;
    });
  }

  /**
   * Calculate battery estimates for a route
   */
  calculateBatteryEstimates(
    waypoints: Array<{ id: number; name: string; lat: number; lng: number }>,
    startBattery: number = 100
  ): BatteryEstimate[] {
    const estimates: BatteryEstimate[] = [];
    let currentBattery = startBattery;

    for (let i = 0; i < waypoints.length; i++) {
      const wp = waypoints[i];
      const nextWp = waypoints[i + 1];

      let distanceToNext = 0;
      let batteryUsed = 0;

      if (nextWp) {
        distanceToNext = this.haversineDistance(wp.lat, wp.lng, nextWp.lat, nextWp.lng);
        // Battery usage: roughly 1% per 2.8 miles (280 mile range / 100%)
        batteryUsed = Math.round((distanceToNext / TESLA_SPECS.MODEL_Y_RANGE) * 100);
      }

      const arrivalBattery = currentBattery;
      const afterDrivingBattery = Math.max(0, currentBattery - batteryUsed);

      // Determine warning level
      let warningLevel: 'ok' | 'low' | 'critical' = 'ok';
      if (afterDrivingBattery < 10) {
        warningLevel = 'critical';
      } else if (afterDrivingBattery < TESLA_SPECS.COMFORTABLE_MIN_BATTERY) {
        warningLevel = 'low';
      }

      // Calculate if charging is needed
      const needsCharging = afterDrivingBattery < TESLA_SPECS.COMFORTABLE_MIN_BATTERY;
      const suggestedChargeTo = needsCharging ? TESLA_SPECS.CHARGE_TARGET : arrivalBattery;

      estimates.push({
        waypointId: wp.id,
        waypointName: wp.name,
        arrivalBattery,
        departBattery: needsCharging ? suggestedChargeTo : arrivalBattery,
        distanceToNext,
        batteryUsed,
        needsCharging,
        suggestedChargeTo,
        warningLevel,
      });

      // Update battery for next iteration
      currentBattery = needsCharging ? suggestedChargeTo - batteryUsed : afterDrivingBattery;
    }

    return estimates;
  }

  /**
   * Generate a complete charging plan for a route
   */
  async generateChargingPlan(
    waypoints: Array<{ id: number; name: string; lat: number; lng: number }>,
    startBattery: number = 100
  ): Promise<ChargingPlan> {
    const estimates = this.calculateBatteryEstimates(waypoints, startBattery);
    const coords = waypoints.map(wp => ({ lat: wp.lat, lng: wp.lng }));
    const chargers = await this.getChargersNearRoute(coords);

    const warnings: string[] = [];
    const recommendedStops: ChargingStation[] = [];

    // Check each leg for issues
    estimates.forEach((est, idx) => {
      if (est.warningLevel === 'critical') {
        warnings.push(
          `Critical: Battery will drop to ${Math.round(est.arrivalBattery - est.batteryUsed)}% before ${
            estimates[idx + 1]?.waypointName || 'destination'
          }. Add a charging stop.`
        );

        // Find nearest charger before this leg
        const currentWp = waypoints[idx];
        const nearestCharger = chargers
          .filter(c => {
            const dist = this.haversineDistance(currentWp.lat, currentWp.lng, c.lat, c.lng);
            return dist < est.distanceToNext * 0.7; // Within 70% of the leg
          })
          .sort((a, b) => (a.distanceFromRoute || 0) - (b.distanceFromRoute || 0))[0];

        if (nearestCharger && !recommendedStops.find(s => s.id === nearestCharger.id)) {
          recommendedStops.push(nearestCharger);
        }
      } else if (est.warningLevel === 'low') {
        warnings.push(
          `Warning: Battery will be low (${Math.round(est.arrivalBattery - est.batteryUsed)}%) after reaching ${
            estimates[idx + 1]?.waypointName || 'destination'
          }. Consider charging.`
        );
      }
    });

    // Calculate total distance
    const totalDistance = estimates.reduce((sum, est) => sum + est.distanceToNext, 0);

    return {
      totalDistance,
      estimates,
      recommendedStops,
      warnings,
    };
  }

  /**
   * Calculate estimated charging time
   */
  calculateChargingTime(
    currentBattery: number,
    targetBattery: number
  ): { minutes: number; display: string } {
    // Supercharger rate varies by battery level
    // Faster at lower battery, slower above 80%
    const batteryToAdd = targetBattery - currentBattery;
    const rangeToAdd = (batteryToAdd / 100) * TESLA_SPECS.MODEL_Y_RANGE;

    let minutes: number;
    if (targetBattery <= 50) {
      minutes = rangeToAdd / (TESLA_SPECS.SUPERCHARGER_RATE / 60);
    } else if (targetBattery <= 80) {
      minutes = rangeToAdd / (TESLA_SPECS.SUPERCHARGER_RATE * 0.7 / 60);
    } else {
      minutes = rangeToAdd / (TESLA_SPECS.SUPERCHARGER_RATE * 0.4 / 60);
    }

    minutes = Math.round(minutes);
    const display = minutes < 60 ? `${minutes}min` : `${Math.floor(minutes / 60)}h ${minutes % 60}min`;

    return { minutes, display };
  }

  /**
   * Calculate route bounds
   */
  private calculateRouteBounds(waypoints: Array<{ lat: number; lng: number }>) {
    const lats = waypoints.map(wp => wp.lat);
    const lngs = waypoints.map(wp => wp.lng);

    return {
      minLat: Math.min(...lats) - 0.5,
      maxLat: Math.max(...lats) + 0.5,
      minLng: Math.min(...lngs) - 0.5,
      maxLng: Math.max(...lngs) + 0.5,
    };
  }

  /**
   * Haversine distance formula
   */
  private haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 3959; // Earth's radius in miles
    const dLat = this.toRad(lat2 - lat1);
    const dLng = this.toRad(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRad(deg: number): number {
    return deg * (Math.PI / 180);
  }
}

// Export singleton instance
export const chargingService = new ChargingService();

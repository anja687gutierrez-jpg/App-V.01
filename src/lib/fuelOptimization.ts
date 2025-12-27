/**
 * Fuel Cost Optimization Service
 * Provides intelligent fuel planning and cost analysis for traditional vehicles
 */

import type { GasStation, RouteStop } from '@/types';

// Vehicle efficiency specs
export const vehicleSpecs = {
  car: { mpg: 28, tankSize: 14, avgPrice: 3.50, brand: 'Standard Sedan' },
  suv: { mpg: 22, tankSize: 16, avgPrice: 3.50, brand: 'SUV' },
  rv: { mpg: 10, tankSize: 75, avgPrice: 3.50, brand: 'RV' },
  hybrid: { mpg: 48, tankSize: 11, avgPrice: 3.50, brand: 'Hybrid' }
};

export const evSpecs = {
  efficiency: 0.25, // kWh per mile
  chargePrice: 0.15, // $ per kWh average
  fastChargePrice: 0.30 // $ per kWh for superchargers
};

/**
 * Find optimal refueling stops based on cost and location
 * @param route Array of route stops
 * @param vehicleType Type of vehicle
 * @param currentFuel Current fuel level
 * @returns Array of recommended refueling stops
 */
export async function findOptimalRefuelingStops(
  route: RouteStop[],
  vehicleType: string,
  currentFuel: number
): Promise<{ stops: GasStation[]; recommendation: string }> {
  try {
    const specs = vehicleSpecs[vehicleType as keyof typeof vehicleSpecs];
    if (!specs) return { stops: [], recommendation: 'Invalid vehicle type' };

    // Calculate trip distance
    const totalDistance = calculateTripDistance(route);
    const fuelNeeded = totalDistance / specs.mpg;
    const refuelStops = Math.ceil(fuelNeeded / specs.tankSize);

    // Mock real-time gas price lookup (in production, use GasBuddy API)
    const gasStations = await fetchGasStationPrices(route, vehicleType);

    // Sort by price (cheapest first) but also consider distance
    const sortedStations = gasStations.sort((a, b) => {
      const aPriority = a.pricePerGallon + (a.distance * 0.001); // Factor in distance
      const bPriority = b.pricePerGallon + (b.distance * 0.001);
      return aPriority - bPriority;
    });

    // Select optimal stops based on distance intervals
    const optimalStops = selectOptimalStops(sortedStations, refuelStops, totalDistance, specs.mpg);

    const recommendation = `Plan ${refuelStops} refueling stops to minimize ${fuelNeeded.toFixed(1)} gallons needed`;

    return { stops: optimalStops, recommendation };
  } catch (error) {
    console.error('Error finding refueling stops:', error);
    return { stops: [], recommendation: 'Error finding refueling stops' };
  }
}

/**
 * Calculate estimated fuel cost for trip
 * @param tripDistance Total distance in miles
 * @param vehicleType Type of vehicle
 * @param avgGasPrice Average gas price per gallon
 * @returns Estimated fuel cost
 */
export function calculateFuelCost(
  tripDistance: number,
  vehicleType: string,
  avgGasPrice: number = 3.50
): number {
  const specs = vehicleSpecs[vehicleType as keyof typeof vehicleSpecs];
  if (!specs) return 0;

  const gallonsNeeded = tripDistance / specs.mpg;
  return gallonsNeeded * avgGasPrice;
}

/**
 * Calculate EV charging cost for trip
 * @param tripDistance Total distance in miles
 * @param chargeType 'home' | 'public' | 'supercharger'
 * @returns Estimated charging cost
 */
export function calculateEVChargingCost(
  tripDistance: number,
  chargeType: 'home' | 'public' | 'supercharger' = 'public'
): number {
  const kwhNeeded = tripDistance * evSpecs.efficiency;
  const pricePerKwh = chargeType === 'home' ? 0.13 : chargeType === 'supercharger' ? 0.30 : 0.15;
  return kwhNeeded * pricePerKwh;
}

/**
 * Compare costs between vehicle types for same trip
 * @param tripDistance Total distance in miles
 * @returns Cost comparison object
 */
export function compareCosts(tripDistance: number) {
  return {
    car: calculateFuelCost(tripDistance, 'car'),
    suv: calculateFuelCost(tripDistance, 'suv'),
    rv: calculateFuelCost(tripDistance, 'rv'),
    hybrid: calculateFuelCost(tripDistance, 'hybrid'),
    ev: calculateEVChargingCost(tripDistance),
    evFast: calculateEVChargingCost(tripDistance, 'supercharger'),
    evHome: calculateEVChargingCost(tripDistance, 'home')
  };
}

/**
 * Calculate fuel savings with loyalty programs
 * @param gasStations Array of gas stations
 * @param preferredBrands Brands user has loyalty with
 * @returns Estimated savings
 */
export function calculateLoyaltySavings(
  gasStations: GasStation[],
  preferredBrands: string[] = ['Shell', 'Chevron', 'Costco']
): number {
  return gasStations
    .filter(station => preferredBrands.includes(station.brand))
    .reduce((total, station) => total + Math.abs(station.loyaltyDiscount) * 15, 0); // 15 gal average
}

/**
 * Find cheapest refueling option along route
 * @param gasStations Array of gas stations
 * @returns Cheapest station
 */
export function findCheapestOption(gasStations: GasStation[]): GasStation | null {
  if (gasStations.length === 0) return null;
  
  return gasStations.reduce((cheapest, current) => {
    const currentPrice = current.pricePerGallon + current.loyaltyDiscount;
    const cheapestPrice = cheapest.pricePerGallon + cheapest.loyaltyDiscount;
    return currentPrice < cheapestPrice ? current : cheapest;
  });
}

/**
 * Estimate fuel consumption savings from reducing speed
 * @param tripDistance Total distance
 * @param currentMpg Current MPG
 * @param speedReduction Percentage speed reduction (0-0.3)
 * @returns Estimated savings
 */
export function calculateSpeedReductionSavings(
  tripDistance: number,
  currentMpg: number,
  speedReduction: number = 0.1 // 10% speed reduction
): number {
  // General rule: 5% speed reduction ≈ 5% fuel savings
  const improvedMpg = currentMpg * (1 + speedReduction);
  const standardCost = (tripDistance / currentMpg) * 3.50;
  const optimizedCost = (tripDistance / improvedMpg) * 3.50;
  return standardCost - optimizedCost;
}

/**
 * Generate fuel optimization report
 * @param route Array of route stops
 * @param vehicleType Type of vehicle
 * @param fuelStops Planned fuel stops
 * @returns Optimization report
 */
export function generateFuelOptimizationReport(
  route: RouteStop[],
  vehicleType: string,
  fuelStops: RouteStop[]
) {
  const totalDistance = calculateTripDistance(route);
  const baselineCost = calculateFuelCost(totalDistance, 'car'); // Compare to base car
  const currentCost = calculateFuelCost(totalDistance, vehicleType);
  const evCost = calculateEVChargingCost(totalDistance);

  const loyaltySavings = fuelStops.reduce((sum, stop) => {
    return sum + Math.abs(stop.fuelInfo?.loyaltyDiscount || 0) * 15;
  }, 0);

  const avgPrice = fuelStops.length > 0
    ? fuelStops.reduce((sum, stop) => sum + (stop.fuelInfo?.pricePerGallon || 3.50), 0) / fuelStops.length
    : 3.50;

  return {
    distance: totalDistance,
    vehicleType,
    baselineCost,
    currentCost,
    evCost,
    savings: baselineCost - currentCost,
    evSavings: baselineCost - evCost,
    loyaltySavings,
    averagePrice: avgPrice,
    recommendedStops: fuelStops.length,
    costPerMile: currentCost / totalDistance
  };
}

// --- Helper Functions ---

function calculateTripDistance(route: RouteStop[]): number {
  return route.reduce((acc, stop, index) => {
    if (index === 0) return 0;
    const prevStop = route[index - 1];
    const distance = Math.sqrt(
      Math.pow(stop.latitude - prevStop.latitude, 2) +
      Math.pow(stop.longitude - prevStop.longitude, 2)
    ) * 69; // rough miles conversion
    return acc + distance;
  }, 0);
}

async function fetchGasStationPrices(
  route: RouteStop[],
  vehicleType: string
): Promise<GasStation[]> {
  // Mock implementation - in production would call GasBuddy API
  const mockStations: GasStation[] = [
    {
      id: 'station_1',
      name: 'Shell - Downtown',
      latitude: 36.7,
      longitude: -119.8,
      pricePerGallon: 3.45,
      brand: 'Shell',
      fuelTypes: ['Regular', 'Plus', 'Premium', 'Diesel'],
      amenities: ['Restaurant', 'Restrooms', 'WiFi'],
      distance: 50,
      rating: 4.3,
      availability: 'open',
      loyaltyDiscount: -0.15
    },
    {
      id: 'station_2',
      name: 'Costco Gas',
      latitude: 36.8,
      longitude: -119.7,
      pricePerGallon: 3.15,
      brand: 'Costco',
      fuelTypes: ['Regular', 'Plus', 'Premium'],
      amenities: ['Fast Service', 'Restrooms'],
      distance: 75,
      rating: 4.7,
      availability: 'open',
      loyaltyDiscount: -0.35
    },
    {
      id: 'station_3',
      name: 'Chevron',
      latitude: 36.5,
      longitude: -119.9,
      pricePerGallon: 3.55,
      brand: 'Chevron',
      fuelTypes: ['Regular', 'Plus', 'Premium', 'Diesel'],
      amenities: ['Restrooms', 'Convenience Store'],
      distance: 85,
      rating: 4.1,
      availability: 'open',
      loyaltyDiscount: -0.10
    }
  ];

  return mockStations;
}

function selectOptimalStops(
  stations: GasStation[],
  count: number,
  totalDistance: number,
  mpg: number
): GasStation[] {
  if (stations.length === 0) return [];
  if (stations.length <= count) return stations;

  const selected: GasStation[] = [];
  const distancePerStop = totalDistance / (count + 1);

  for (let i = 0; i < count; i++) {
    const targetDistance = (i + 1) * distancePerStop;
    
    // Find station closest to target distance, not already selected
    const candidates = stations.filter(s => !selected.includes(s));
    const best = candidates.reduce((prev, current) => {
      const prevDiff = Math.abs(prev.distance - targetDistance);
      const currentDiff = Math.abs(current.distance - targetDistance);
      return currentDiff < prevDiff ? current : prev;
    });

    selected.push(best);
  }

  return selected.sort((a, b) => a.distance - b.distance);
}

/**
 * Calculate break-even analysis for EV vs Gas vehicle
 * @param annualMiles Annual miles driven
 * @param evPrice EV purchase price
 * @param gasPrice Gas car purchase price
 * @returns Years to break even
 */
export function calculateEvBreakeven(
  annualMiles: number,
  evPrice: number = 45000, // Tesla Model 3
  gasPrice: number = 30000 // Standard sedan
): number {
  const yearlyFuelCost = calculateFuelCost(annualMiles, 'car');
  const yearlyChargeCost = calculateEVChargingCost(annualMiles);
  const yearlySavings = yearlyFuelCost - yearlyChargeCost;
  
  const priceDifference = evPrice - gasPrice;
  return priceDifference / yearlySavings;
}

/**
 * Mock Vehicle Data
 *
 * Realistic Tesla Model Y Long Range data for mock-first development.
 * Simulates a 2-year-old vehicle with authentic degradation patterns.
 */

import type { VehicleState, VehicleHealthSnapshot } from '@/types/vehicle';

export const MOCK_VEHICLE_STATE: VehicleState = {
  batteryPercent: 73,
  rangeMiles: 241,
  chargeState: 'disconnected',
  chargeLimitPercent: 80,
  tirePressure: {
    frontLeft: 44,
    frontRight: 45,
    rearLeft: 43,
    rearRight: 45,
  },
  odometer: 28450,
  softwareVersion: '2024.38.25',
  nominalFullPackEnergy: 72.8,
  dataSource: 'mock',
  timestamp: new Date().toISOString(),
};

/**
 * 12 monthly full-charge snapshots showing authentic degradation:
 * - Rapid initial drop in first 3 months (new battery conditioning)
 * - Gradual plateau afterward (typical Li-ion aging curve)
 * - 75.2 → 72.8 kWh over 12 months (~3.2% degradation)
 */
export const MOCK_HEALTH_HISTORY: VehicleHealthSnapshot[] = [
  {
    userId: 'mock-user',
    timestamp: '2025-03-15T08:00:00Z',
    batteryPercent: 100,
    rangeMiles: 330,
    nominalFullPackEnergy: 75.2,
    odometer: 1200,
    tirePressure: { frontLeft: 45, frontRight: 45, rearLeft: 45, rearRight: 45 },
    softwareVersion: '2024.26.3',
    trigger: 'full_charge',
  },
  {
    userId: 'mock-user',
    timestamp: '2025-04-15T08:00:00Z',
    batteryPercent: 100,
    rangeMiles: 327,
    nominalFullPackEnergy: 74.8,
    odometer: 3600,
    tirePressure: { frontLeft: 45, frontRight: 44, rearLeft: 45, rearRight: 44 },
    softwareVersion: '2024.26.3',
    trigger: 'full_charge',
  },
  {
    userId: 'mock-user',
    timestamp: '2025-05-15T08:00:00Z',
    batteryPercent: 100,
    rangeMiles: 325,
    nominalFullPackEnergy: 74.5,
    odometer: 5800,
    tirePressure: { frontLeft: 44, frontRight: 45, rearLeft: 44, rearRight: 45 },
    softwareVersion: '2024.28.5',
    trigger: 'full_charge',
  },
  {
    userId: 'mock-user',
    timestamp: '2025-06-15T08:00:00Z',
    batteryPercent: 100,
    rangeMiles: 323,
    nominalFullPackEnergy: 74.2,
    odometer: 8100,
    tirePressure: { frontLeft: 45, frontRight: 45, rearLeft: 43, rearRight: 45 },
    softwareVersion: '2024.30.1',
    trigger: 'full_charge',
  },
  {
    userId: 'mock-user',
    timestamp: '2025-07-15T08:00:00Z',
    batteryPercent: 100,
    rangeMiles: 322,
    nominalFullPackEnergy: 74.0,
    odometer: 10500,
    tirePressure: { frontLeft: 44, frontRight: 44, rearLeft: 44, rearRight: 44 },
    softwareVersion: '2024.30.1',
    trigger: 'full_charge',
  },
  {
    userId: 'mock-user',
    timestamp: '2025-08-15T08:00:00Z',
    batteryPercent: 100,
    rangeMiles: 320,
    nominalFullPackEnergy: 73.8,
    odometer: 12900,
    tirePressure: { frontLeft: 45, frontRight: 45, rearLeft: 45, rearRight: 45 },
    softwareVersion: '2024.32.7',
    trigger: 'full_charge',
  },
  {
    userId: 'mock-user',
    timestamp: '2025-09-15T08:00:00Z',
    batteryPercent: 100,
    rangeMiles: 319,
    nominalFullPackEnergy: 73.6,
    odometer: 15200,
    tirePressure: { frontLeft: 44, frontRight: 45, rearLeft: 44, rearRight: 45 },
    softwareVersion: '2024.32.7',
    trigger: 'full_charge',
  },
  {
    userId: 'mock-user',
    timestamp: '2025-10-15T08:00:00Z',
    batteryPercent: 100,
    rangeMiles: 318,
    nominalFullPackEnergy: 73.4,
    odometer: 17600,
    tirePressure: { frontLeft: 45, frontRight: 44, rearLeft: 43, rearRight: 44 },
    softwareVersion: '2024.34.2',
    trigger: 'full_charge',
  },
  {
    userId: 'mock-user',
    timestamp: '2025-11-15T08:00:00Z',
    batteryPercent: 100,
    rangeMiles: 317,
    nominalFullPackEnergy: 73.3,
    odometer: 19800,
    tirePressure: { frontLeft: 44, frontRight: 44, rearLeft: 44, rearRight: 44 },
    softwareVersion: '2024.36.10',
    trigger: 'full_charge',
  },
  {
    userId: 'mock-user',
    timestamp: '2025-12-15T08:00:00Z',
    batteryPercent: 100,
    rangeMiles: 316,
    nominalFullPackEnergy: 73.1,
    odometer: 22100,
    tirePressure: { frontLeft: 45, frontRight: 45, rearLeft: 44, rearRight: 45 },
    softwareVersion: '2024.36.10',
    trigger: 'full_charge',
  },
  {
    userId: 'mock-user',
    timestamp: '2026-01-15T08:00:00Z',
    batteryPercent: 100,
    rangeMiles: 315,
    nominalFullPackEnergy: 73.0,
    odometer: 25300,
    tirePressure: { frontLeft: 44, frontRight: 45, rearLeft: 43, rearRight: 45 },
    softwareVersion: '2024.38.25',
    trigger: 'full_charge',
  },
  {
    userId: 'mock-user',
    timestamp: '2026-02-15T08:00:00Z',
    batteryPercent: 100,
    rangeMiles: 314,
    nominalFullPackEnergy: 72.8,
    odometer: 28450,
    tirePressure: { frontLeft: 44, frontRight: 45, rearLeft: 43, rearRight: 45 },
    softwareVersion: '2024.38.25',
    trigger: 'full_charge',
  },
];

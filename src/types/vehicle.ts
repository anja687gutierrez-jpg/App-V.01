/**
 * Vehicle Intelligence Types
 *
 * Type definitions for the EV Brain feature — Tesla vehicle state,
 * health tracking, trip analysis, and service alerts.
 */

// --- Vehicle State (current snapshot) ---

export type ChargeState = 'charging' | 'disconnected' | 'complete' | 'stopped';
export type DataSource = 'mock' | 'tesla_api' | 'manual';

export interface TirePressurePSI {
  frontLeft: number;
  frontRight: number;
  rearLeft: number;
  rearRight: number;
}

export interface VehicleState {
  batteryPercent: number;
  rangeMiles: number;
  chargeState: ChargeState;
  chargeLimitPercent: number;
  tirePressure: TirePressurePSI;
  odometer: number;
  softwareVersion: string;
  nominalFullPackEnergy: number; // kWh — degrades over time
  dataSource: DataSource;
  timestamp: string; // ISO
}

// --- Health History (Firestore document) ---

export interface VehicleHealthSnapshot {
  id?: string;
  userId: string;
  timestamp: string; // ISO
  batteryPercent: number;
  rangeMiles: number;
  nominalFullPackEnergy: number;
  odometer: number;
  tirePressure: TirePressurePSI;
  softwareVersion: string;
  trigger: 'full_charge' | 'trip_start' | 'trip_end' | 'manual';
}

// --- Degradation Trend ---

export type TrendDirection = 'improving' | 'stable' | 'degrading' | 'insufficient_data';

export interface VehicleHealthTrend {
  currentKWh: number;
  baselineKWh: number;
  degradationPercent: number; // e.g. 3.2 means 3.2% degraded
  trend: TrendDirection;
  dataPoints: number;
}

// --- Service Alerts ---

export type AlertType = 'tire_pressure' | 'battery' | 'software' | 'service_due' | 'recall';
export type AlertSeverity = 'info' | 'warning' | 'critical';

export interface VehicleServiceAlert {
  id: string;
  type: AlertType;
  severity: AlertSeverity;
  title: string;
  description: string;
  timestamp: string;
}

// --- Trip Range Analysis ---

export type WarningTier = 'comfortable' | 'tight' | 'risky' | 'insufficient';

export interface TripRangeAnalysis {
  confidenceScore: number; // 0-100
  canCompleteTrip: boolean;
  bufferMiles: number;
  routeMiles: number;
  availableRangeMiles: number;
  warningTier: WarningTier;
}

// --- NHTSA Recall ---

export interface NHTSARecall {
  NHTSACampaignNumber: string;
  NHTSAActionNumber: string;
  ReportReceivedDate: string;
  Component: string;
  Summary: string;
  Consequence: string;
  Remedy: string;
  ModelYear: string;
  Make: string;
  Model: string;
}

// --- Constants ---

export const TESLA_MODEL_Y_SPECS = {
  EPA_RANGE_MILES: 330,
  BATTERY_CAPACITY_KWH: 75,
  SUPERCHARGER_MAX_KW: 250,
  EFFICIENCY_KWH_PER_MILE: 0.25,
  COMFORTABLE_MIN_BATTERY: 20,
  CHARGE_TARGET: 80,
  SUPERCHARGER_RATE_MPH: 170, // miles of range per hour at peak
} as const;

export const TIRE_PRESSURE_SPEC_PSI = {
  front: 45,
  rear: 45,
  tolerancePSI: 4,
} as const;

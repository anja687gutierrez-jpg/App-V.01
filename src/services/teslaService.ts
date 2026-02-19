/**
 * Tesla Service — EV Brain Intelligence
 *
 * Mock-first service providing vehicle state, health tracking,
 * degradation analysis, trip confidence, and NHTSA recalls.
 * Interface contract ready for Tesla Fleet API swap (Phase 6).
 */

import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { MOCK_VEHICLE_STATE, MOCK_HEALTH_HISTORY } from '@/data/mockVehicle';
import {
  TESLA_MODEL_Y_SPECS,
  TIRE_PRESSURE_SPEC_PSI,
  type VehicleState,
  type VehicleHealthSnapshot,
  type VehicleHealthTrend,
  type VehicleServiceAlert,
  type TripRangeAnalysis,
  type NHTSARecall,
  type TrendDirection,
  type WarningTier,
} from '@/types/vehicle';

class TeslaService {
  private mode: 'mock' | 'api' = 'mock';

  /**
   * Get current vehicle state.
   * Mock mode: returns realistic data with slight battery randomization.
   */
  async getVehicleState(): Promise<VehicleState> {
    if (this.mode === 'mock') {
      const jitter = (Math.random() - 0.5) * 4; // ±2%
      const batteryPercent = Math.round(
        Math.max(5, Math.min(100, MOCK_VEHICLE_STATE.batteryPercent + jitter))
      );
      const rangeMiles = Math.round(
        (batteryPercent / 100) * TESLA_MODEL_Y_SPECS.EPA_RANGE_MILES *
        (MOCK_VEHICLE_STATE.nominalFullPackEnergy / TESLA_MODEL_Y_SPECS.BATTERY_CAPACITY_KWH)
      );

      return {
        ...MOCK_VEHICLE_STATE,
        batteryPercent,
        rangeMiles,
        timestamp: new Date().toISOString(),
      };
    }

    // Future: Tesla Fleet API call
    throw new Error('Tesla API mode not yet implemented');
  }

  /**
   * Get health history from Firestore, falling back to mock data.
   */
  async getHealthHistory(userId?: string): Promise<VehicleHealthSnapshot[]> {
    if (!userId) return [...MOCK_HEALTH_HISTORY];

    try {
      const db = getFirestore();
      const ref = collection(db, `users/${userId}/vehicleHealth`);
      const q = query(ref, where('userId', '==', userId), orderBy('timestamp', 'asc'));
      const snap = await getDocs(q);

      if (snap.empty) return [...MOCK_HEALTH_HISTORY];

      return snap.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as VehicleHealthSnapshot[];
    } catch {
      // Firestore unavailable — use mock
      return [...MOCK_HEALTH_HISTORY];
    }
  }

  /**
   * Save a health snapshot to Firestore.
   */
  async saveHealthSnapshot(snapshot: Omit<VehicleHealthSnapshot, 'id'>): Promise<void> {
    try {
      const auth = getAuth();
      if (!auth.currentUser) return;

      const db = getFirestore();
      const ref = collection(db, `users/${auth.currentUser.uid}/vehicleHealth`);
      await addDoc(ref, {
        ...snapshot,
        createdAt: serverTimestamp(),
      });
    } catch (err) {
      console.warn('[TeslaService] Failed to save health snapshot:', err);
    }
  }

  /**
   * Calculate battery degradation trend from health history.
   */
  calculateDegradation(history: VehicleHealthSnapshot[]): VehicleHealthTrend {
    if (history.length < 2) {
      return {
        currentKWh: history[0]?.nominalFullPackEnergy ?? TESLA_MODEL_Y_SPECS.BATTERY_CAPACITY_KWH,
        baselineKWh: TESLA_MODEL_Y_SPECS.BATTERY_CAPACITY_KWH,
        degradationPercent: 0,
        trend: 'insufficient_data',
        dataPoints: history.length,
      };
    }

    const baseline = history[0].nominalFullPackEnergy;
    const current = history[history.length - 1].nominalFullPackEnergy;
    const degradationPercent = ((baseline - current) / baseline) * 100;

    // Determine trend from last 3 data points
    let trend: TrendDirection = 'stable';
    if (history.length >= 3) {
      const recent = history.slice(-3);
      const recentDrop = recent[0].nominalFullPackEnergy - recent[2].nominalFullPackEnergy;
      const avgMonthlyDrop = (baseline - current) / (history.length - 1);

      if (recentDrop > avgMonthlyDrop * 2) {
        trend = 'degrading';
      } else if (recentDrop < 0) {
        trend = 'improving'; // Recalibration can cause apparent improvement
      } else {
        trend = 'stable';
      }
    }

    return {
      currentKWh: current,
      baselineKWh: baseline,
      degradationPercent: Math.round(degradationPercent * 10) / 10,
      trend,
      dataPoints: history.length,
    };
  }

  /**
   * Calculate trip confidence: can the vehicle complete a given route?
   */
  calculateTripConfidence(state: VehicleState, routeMiles: number): TripRangeAnalysis {
    const availableRange = state.rangeMiles;
    const bufferMiles = availableRange - routeMiles;
    const ratio = availableRange / Math.max(routeMiles, 1);

    let confidenceScore: number;
    let warningTier: WarningTier;

    if (ratio >= 1.5) {
      confidenceScore = 95 + Math.min(5, (ratio - 1.5) * 10);
      warningTier = 'comfortable';
    } else if (ratio >= 1.2) {
      confidenceScore = 75 + ((ratio - 1.2) / 0.3) * 20;
      warningTier = 'comfortable';
    } else if (ratio >= 1.0) {
      confidenceScore = 50 + ((ratio - 1.0) / 0.2) * 25;
      warningTier = 'tight';
    } else if (ratio >= 0.8) {
      confidenceScore = 20 + ((ratio - 0.8) / 0.2) * 30;
      warningTier = 'risky';
    } else {
      confidenceScore = Math.max(0, ratio * 25);
      warningTier = 'insufficient';
    }

    confidenceScore = Math.round(Math.min(100, Math.max(0, confidenceScore)));

    return {
      confidenceScore,
      canCompleteTrip: ratio >= 1.0,
      bufferMiles: Math.round(bufferMiles),
      routeMiles: Math.round(routeMiles),
      availableRangeMiles: Math.round(availableRange),
      warningTier,
    };
  }

  /**
   * Generate service alerts from current vehicle state.
   */
  getServiceAlerts(state: VehicleState): VehicleServiceAlert[] {
    const alerts: VehicleServiceAlert[] = [];
    const now = new Date().toISOString();
    const { tolerancePSI } = TIRE_PRESSURE_SPEC_PSI;

    // Tire pressure checks
    const tires = [
      { key: 'frontLeft' as const, label: 'Front Left' },
      { key: 'frontRight' as const, label: 'Front Right' },
      { key: 'rearLeft' as const, label: 'Rear Left' },
      { key: 'rearRight' as const, label: 'Rear Right' },
    ];

    const spec = (key: string) =>
      key.startsWith('front') ? TIRE_PRESSURE_SPEC_PSI.front : TIRE_PRESSURE_SPEC_PSI.rear;

    for (const tire of tires) {
      const psi = state.tirePressure[tire.key];
      const target = spec(tire.key);
      const diff = Math.abs(psi - target);

      if (diff > tolerancePSI + 1) {
        alerts.push({
          id: `tire-${tire.key}`,
          type: 'tire_pressure',
          severity: 'critical',
          title: `${tire.label} Tire: ${psi} PSI`,
          description: `${diff} PSI ${psi < target ? 'below' : 'above'} spec (${target} PSI). Check immediately.`,
          timestamp: now,
        });
      } else if (diff > 1) {
        alerts.push({
          id: `tire-${tire.key}`,
          type: 'tire_pressure',
          severity: 'warning',
          title: `${tire.label} Tire: ${psi} PSI`,
          description: `${diff} PSI ${psi < target ? 'below' : 'above'} spec (${target} PSI).`,
          timestamp: now,
        });
      }
    }

    // Battery health check
    const healthPercent = (state.nominalFullPackEnergy / TESLA_MODEL_Y_SPECS.BATTERY_CAPACITY_KWH) * 100;
    if (healthPercent < 85) {
      alerts.push({
        id: 'battery-health',
        type: 'battery',
        severity: 'warning',
        title: `Battery Health: ${Math.round(healthPercent)}%`,
        description: 'Battery degradation is above typical levels. Consider a service appointment.',
        timestamp: now,
      });
    }

    // Odometer-based service reminders
    const milesSinceLastService = state.odometer % 12500;
    if (milesSinceLastService > 11000) {
      alerts.push({
        id: 'service-due',
        type: 'service_due',
        severity: 'info',
        title: 'Service Approaching',
        description: `${12500 - milesSinceLastService} miles until next tire rotation / inspection.`,
        timestamp: now,
      });
    }

    return alerts;
  }

  /**
   * Fetch NHTSA recall data (free public API, no key needed).
   */
  async getNHTSARecalls(make: string, model: string, year: string): Promise<NHTSARecall[]> {
    try {
      const encodedModel = encodeURIComponent(model);
      const url = `https://api.nhtsa.gov/recalls/recallsByVehicle?make=${make}&model=${encodedModel}&modelYear=${year}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`NHTSA API error: ${response.status}`);
      }

      const data = await response.json();
      return (data.results || []) as NHTSARecall[];
    } catch (err) {
      console.warn('[TeslaService] NHTSA recall fetch failed:', err);
      return [];
    }
  }
}

export const teslaService = new TeslaService();

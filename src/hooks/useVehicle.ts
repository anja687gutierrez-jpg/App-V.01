/**
 * useVehicle Hook
 *
 * Provides vehicle state, health history, degradation trend,
 * service alerts, and trip confidence analysis.
 */

import { useState, useEffect, useCallback } from 'react';
import { teslaService } from '@/services/teslaService';
import { useAuth } from '@/contexts/AuthContext';
import type {
  VehicleState,
  VehicleHealthSnapshot,
  VehicleHealthTrend,
  VehicleServiceAlert,
  TripRangeAnalysis,
} from '@/types/vehicle';

interface UseVehicleResult {
  vehicle: VehicleState | null;
  healthHistory: VehicleHealthSnapshot[];
  trend: VehicleHealthTrend | null;
  alerts: VehicleServiceAlert[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  tripAnalysis: (routeMiles: number) => TripRangeAnalysis | null;
}

const POLL_INTERVAL_MS = 30_000; // 30s in mock mode

export function useVehicle(): UseVehicleResult {
  const { user } = useAuth();
  const [vehicle, setVehicle] = useState<VehicleState | null>(null);
  const [healthHistory, setHealthHistory] = useState<VehicleHealthSnapshot[]>([]);
  const [trend, setTrend] = useState<VehicleHealthTrend | null>(null);
  const [alerts, setAlerts] = useState<VehicleServiceAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadData = useCallback(async () => {
    try {
      setError(null);

      const [state, history] = await Promise.all([
        teslaService.getVehicleState(),
        teslaService.getHealthHistory(user?.uid),
      ]);

      setVehicle(state);
      setHealthHistory(history);
      setTrend(teslaService.calculateDegradation(history));
      setAlerts(teslaService.getServiceAlerts(state));
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  // Initial load
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Polling
  useEffect(() => {
    const interval = setInterval(loadData, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [loadData]);

  const tripAnalysis = useCallback(
    (routeMiles: number): TripRangeAnalysis | null => {
      if (!vehicle) return null;
      return teslaService.calculateTripConfidence(vehicle, routeMiles);
    },
    [vehicle]
  );

  return {
    vehicle,
    healthHistory,
    trend,
    alerts,
    loading,
    error,
    refetch: loadData,
    tripAnalysis,
  };
}

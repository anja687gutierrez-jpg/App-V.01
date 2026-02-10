/**
 * useCurrentTrip Hook
 * 
 * Provides access to the current active trip with auto-refresh capability.
 * 
 * Usage:
 *   const { trip, loading, endTrip, addCheckpoint } = useCurrentTrip();
 */

import { useState, useEffect, useCallback } from 'react';
import { tripService } from '@/services';

interface Trip {
  id: string;
  routeId: string;
  userId: string;
  name?: string;
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
    notes?: string | null;
  }>;
  rating: number | null;
  notes: string | null;
  status: 'active' | 'completed';
  nextPoi?: string;
  eta?: string;
  progress?: number;
}

interface UseCurrentTripResult {
  trip: Trip | null;
  loading: boolean;
  error: Error | null;
  endTrip: (finalData: { rating?: number; notes?: string }) => Promise<Trip | null>;
  addCheckpoint: (checkpoint: { location: string; notes?: string }) => Promise<void>;
  recordPOIVisit: (poiId: string) => Promise<void>;
  refetch: () => Promise<void>;
  isActive: boolean;
  elapsedTime: number; // in minutes
}

export function useCurrentTrip(): UseCurrentTripResult {
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);

  const loadCurrentTrip = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await tripService.getCurrentTrip();
      setTrip(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      setTrip(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Calculate elapsed time
  useEffect(() => {
    if (!trip || trip.status !== 'active') {
      setElapsedTime(0);
      return;
    }

    const interval = setInterval(() => {
      const start = new Date(trip.startTime).getTime();
      const now = Date.now();
      const minutes = Math.floor((now - start) / (1000 * 60));
      setElapsedTime(minutes);
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [trip]);

  // Load on mount
  useEffect(() => {
    loadCurrentTrip();
  }, [loadCurrentTrip]);

  const handleEndTrip = useCallback(
    async (finalData: { rating?: number; notes?: string }) => {
      if (!trip) return null;
      try {
        const completed = await tripService.endTrip(trip.id, finalData);
        setTrip(completed);
        return completed;
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        return null;
      }
    },
    [trip]
  );

  const handleAddCheckpoint = useCallback(
    async (checkpoint: { location: string; notes?: string }) => {
      if (!trip) return;
      try {
        await tripService.addCheckpoint(trip.id, checkpoint);
        await loadCurrentTrip();
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
      }
    },
    [trip, loadCurrentTrip]
  );

  const handleRecordPOIVisit = useCallback(
    async (poiId: string) => {
      if (!trip) return;
      try {
        await tripService.recordPOIVisit(trip.id, poiId);
        await loadCurrentTrip();
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
      }
    },
    [trip, loadCurrentTrip]
  );

  return {
    trip,
    loading,
    error,
    endTrip: handleEndTrip,
    addCheckpoint: handleAddCheckpoint,
    recordPOIVisit: handleRecordPOIVisit,
    refetch: loadCurrentTrip,
    isActive: trip?.status === 'active' || false,
    elapsedTime,
  };
}

/**
 * usePOIs Hook
 * 
 * Provides convenient access to points of interest with filtering and search.
 * 
 * Usage:
 *   const { pois, loading } = usePOIs();
 *   const { pois: parking } = usePOIs({ type: 'parking' });
 *   const { pois: nearby } = useNearbyPOIs(37.7749, -122.4194, 5);
 */

import { useState, useEffect } from 'react';
import { poiService } from '@/services';
import { POI } from '@/types';

interface UsePOIsOptions {
  type?: string;
  autoLoad?: boolean;
}

interface UsePOIsResult {
  pois: POI[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function usePOIs(options: UsePOIsOptions = {}): UsePOIsResult {
  const { type, autoLoad = true } = options;

  const [pois, setPOIs] = useState<POI[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadPOIs = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = type
        ? await poiService.getPOIsByType(type)
        : await poiService.getAllPOIs();
      setPOIs(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      setPOIs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (autoLoad) {
      loadPOIs();
    }
  }, [autoLoad, type]);

  return {
    pois,
    loading,
    error,
    refetch: loadPOIs,
  };
}

/**
 * useNearbyPOIs Hook
 * 
 * Search for POIs near a location.
 * 
 * Usage:
 *   const { pois: nearby } = useNearbyPOIs(lat, lng, 5);
 */

interface UseNearbyPOIsOptions {
  radiusKm?: number;
  autoLoad?: boolean;
}

interface UseNearbyPOIsResult extends UsePOIsResult {
  distance?: number[];
}

export function useNearbyPOIs(
  lat: number,
  lng: number,
  options: UseNearbyPOIsOptions = {}
): UseNearbyPOIsResult {
  const { radiusKm = 5, autoLoad = true } = options;

  const [pois, setPOIs] = useState<POI[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadNearby = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await poiService.searchNearby(lat, lng, radiusKm);
      setPOIs(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      setPOIs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (autoLoad) {
      loadNearby();
    }
  }, [autoLoad, lat, lng, radiusKm]);

  return {
    pois,
    loading,
    error,
    refetch: loadNearby,
  };
}

/**
 * useNearbyParking Hook
 * 
 * Smart parking search with filters.
 * 
 * Usage:
 *   const { pois: parking } = useNearbyParking(lat, lng, { maxPrice: 5 });
 */

interface UseNearbyParkingOptions {
  maxPricePerHour?: number;
  radiusKm?: number;
  minRating?: number;
  requireCharging?: boolean;
  autoLoad?: boolean;
}

export function useNearbyParking(
  lat: number,
  lng: number,
  options: UseNearbyParkingOptions = {}
): UsePOIsResult {
  const { autoLoad = true } = options;

  const [pois, setPOIs] = useState<POI[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadParking = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await poiService.searchParking(lat, lng, options);
      setPOIs(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      setPOIs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (autoLoad) {
      loadParking();
    }
  }, [autoLoad, lat, lng, options.maxPricePerHour, options.radiusKm]);

  return {
    pois,
    loading,
    error,
    refetch: loadParking,
  };
}

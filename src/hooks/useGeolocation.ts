/**
 * useGeolocation Hook
 * React hook for accessing GPS location with automatic cleanup
 */

import { useState, useEffect } from 'react';
import { geolocationService, type GeolocationPosition, type GeolocationError } from '@/services/geolocationService';

interface UseGeolocationOptions {
  watch?: boolean; // Whether to continuously watch position
  immediate?: boolean; // Whether to get position immediately on mount
}

interface UseGeolocationReturn {
  position: GeolocationPosition | null;
  error: GeolocationError | null;
  loading: boolean;
  isSupported: boolean;
  refresh: () => Promise<void>;
}

export function useGeolocation(options: UseGeolocationOptions = {}): UseGeolocationReturn {
  const { watch = true, immediate = true } = options;

  const [position, setPosition] = useState<GeolocationPosition | null>(
    geolocationService.getLastPosition()
  );
  const [error, setError] = useState<GeolocationError | null>(null);
  const [loading, setLoading] = useState(immediate);

  // Get current position once
  const refresh = async () => {
    setLoading(true);
    setError(null);

    try {
      const pos = await geolocationService.getCurrentPosition();
      setPosition(pos);
    } catch (err) {
      setError(err as GeolocationError);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!geolocationService.isSupported()) {
      console.warn('[useGeolocation] Geolocation not supported');
      setError({
        code: 0,
        message: 'Geolocation is not supported by this browser',
      });
      setLoading(false);
      return;
    }

    if (watch) {
      // Subscribe to continuous updates
      const unsubscribe = geolocationService.subscribe(
        (pos) => {
          setPosition(pos);
          setLoading(false);
          setError(null);
        },
        (err) => {
          console.warn('[useGeolocation] Error:', err.message);
          setError(err);
          setLoading(false);
        }
      );

      return unsubscribe;
    } else if (immediate) {
      // Get position once
      refresh();
    }
  }, [watch, immediate]);

  return {
    position,
    error,
    loading,
    isSupported: geolocationService.isSupported(),
    refresh,
  };
}

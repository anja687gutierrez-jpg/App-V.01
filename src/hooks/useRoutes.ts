/**
 * useRoutes Hook
 * 
 * Provides convenient access to routes with automatic loading and error handling.
 * 
 * Usage:
 *   const { routes, loading, error, refetch } = useRoutes();
 *   const { routes: active } = useRoutes({ activeOnly: true });
 */

import { useState, useEffect } from 'react';
import { routeService } from '@/services';
import { Route } from '@/types';

interface UseRoutesOptions {
  activeOnly?: boolean;
  autoLoad?: boolean;
}

interface UseRoutesResult {
  routes: Route[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useRoutes(options: UseRoutesOptions = {}): UseRoutesResult {
  const { activeOnly = false, autoLoad = true } = options;

  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadRoutes = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = activeOnly
        ? await routeService.getActiveRoutes()
        : await routeService.getAllRoutes();
      setRoutes(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      setRoutes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (autoLoad) {
      loadRoutes();
    }
  }, [autoLoad, activeOnly]);

  return {
    routes,
    loading,
    error,
    refetch: loadRoutes,
  };
}

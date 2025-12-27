/**
 * Error Handling Patterns
 * 
 * Common patterns and examples for error handling in the application.
 * Copy and paste these patterns as needed.
 */

// ============================================================================
// PATTERN 1: Simple Safe Call (Most Common)
// ============================================================================
// Use this when you want errors handled automatically (toast + log)

import { safeCall } from '@/lib/errorHandler';
import { routeService } from '@/services';

async function loadRoutes() {
  const routes = await safeCall(
    () => routeService.getAllRoutes(),
    'Failed to load routes' // User-friendly message
  );
  
  if (routes) {
    console.log('Routes loaded:', routes);
  }
}

// ============================================================================
// PATTERN 2: Try/Catch (When You Need Control)
// ============================================================================
// Use this when you want to handle errors yourself

import { tryCatch } from '@/lib/errorHandler';

async function updateRoute(id: string, data: any) {
  const { data: updated, error } = await tryCatch(
    () => routeService.updateRoute(id, data),
    { showToast: false } // Don't show toast, handle yourself
  );
  
  if (error) {
    console.error('Update failed:', error.message);
    // Custom error handling here
    return null;
  }
  
  console.log('Route updated:', updated);
  return updated;
}

// ============================================================================
// PATTERN 3: Retry Logic (For Flaky Operations)
// ============================================================================
// Use this when operation might fail due to network issues

import { retryCall } from '@/lib/errorHandler';

async function loadPOIsWithRetry() {
  const pois = await retryCall(
    () => poiService.searchNearby(37.7749, -122.4194, 5),
    3,        // max retries
    1000,     // initial delay (1s)
    'Failed to find nearby parking after 3 attempts'
  );
  
  return pois;
}

// ============================================================================
// PATTERN 4: Timeout Protection (For Long Operations)
// ============================================================================
// Use this when operation might hang

import { withTimeout } from '@/lib/errorHandler';

async function generateItineraryWithTimeout() {
  const itinerary = await withTimeout(
    () => aiService.generateItinerary({ duration: 7 }),
    30000, // 30 second timeout
    'Itinerary generation took too long'
  );
  
  return itinerary;
}

// ============================================================================
// PATTERN 5: Input Validation (Before Operation)
// ============================================================================
// Use this to validate before executing

import { withValidation } from '@/lib/errorHandler';

async function createTrip(tripData: any) {
  const result = await withValidation(
    tripData,
    (data) => data.routeId && data.userId && data.startLocation,
    'Trip data is invalid: missing required fields',
    () => tripService.createTrip(tripData)
  );
  
  return result;
}

// ============================================================================
// PATTERN 6: Multiple Operations (Batch Processing)
// ============================================================================
// Use this when executing multiple operations

import { batchCall } from '@/lib/errorHandler';

async function loadDashboardData() {
  const { results, errors } = await batchCall(
    [
      () => routeService.getAllRoutes(),
      () => poiService.getAllPOIs(),
      () => tripService.getTripStats(),
    ],
    true // Continue even if one fails
  );
  
  if (errors.length > 0) {
    console.warn(`${errors.length} operations failed during dashboard load`);
  }
  
  const [routes, pois, stats] = results;
  return { routes, pois, stats };
}

// ============================================================================
// PATTERN 7: Debounced Calls (Prevent Spam)
// ============================================================================
// Use this for search/filter operations that fire frequently

import { debouncedCall } from '@/lib/errorHandler';

const debouncedSearch = debouncedCall(
  () => routeService.searchRoutes({ difficulty: 'moderate' }),
  500, // Wait 500ms after user stops typing
  'Search failed'
);

// In React component:
// const handleSearch = () => debouncedSearch();

// ============================================================================
// PATTERN 8: Error Boundary (Component Level)
// ============================================================================
// Use this to catch component rendering errors

import { ErrorBoundary } from '@/components/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        console.error('Component failed:', error);
      }}
    >
      <Dashboard />
    </ErrorBoundary>
  );
}

// ============================================================================
// PATTERN 9: Hook-Based Error Handling
// ============================================================================
// Use this in functional components

import { useErrorHandler } from '@/components/ErrorBoundary';

function MyComponent() {
  const { error, hasError, handleError, clearError } = useErrorHandler();
  
  const handleClick = async () => {
    try {
      const data = await routeService.getAllRoutes();
      // Process data
    } catch (err) {
      handleError(err); // Shows error in component
    }
  };
  
  if (hasError) {
    return (
      <div>
        Error: {error?.message}
        <button onClick={clearError}>Dismiss</button>
      </div>
    );
  }
  
  return <button onClick={handleClick}>Load Routes</button>;
}

// ============================================================================
// PATTERN 10: Combining Multiple Patterns
// ============================================================================
// Complex real-world scenario

async function processTrip() {
  // Validate input
  const { data: validated, error: validationError } = await tryCatch(
    async () => {
      if (!tripData.routeId) throw new Error('Route is required');
      return tripData;
    }
  );
  
  if (!validated) return null;
  
  // Try with retry and timeout
  const trip = await retryCall(
    () => withTimeout(
      () => tripService.createTrip(validated),
      10000
    ),
    2,
    'Failed to create trip'
  );
  
  return trip;
}

// ============================================================================
// ERROR HANDLING IN REACT COMPONENTS (Hooks Integration)
// ============================================================================

import { useRoutes, useDashboardStats } from '@/hooks';

function Dashboard() {
  const { stats, loading, error: statsError, refetch } = useDashboardStats();
  
  if (statsError) {
    return (
      <div className="text-red-600">
        <p>Failed to load dashboard: {statsError.message}</p>
        <button onClick={refetch}>Retry</button>
      </div>
    );
  }
  
  if (loading) return <div>Loading...</div>;
  
  return <div>{/* Render stats */}</div>;
}

// ============================================================================
// CUSTOM ERROR TYPES
// ============================================================================

import { AppError } from '@/lib/errorHandler';

// Create specific errors
const routeNotFound = new AppError(
  'Route not found',
  'ROUTE_NOT_FOUND',
  404
);

const networkError = new AppError(
  'Network connection failed',
  'NETWORK_ERROR',
  0
);

// Use in error handlers
try {
  // some operation
} catch (err) {
  if (err instanceof AppError) {
    if (err.code === 'ROUTE_NOT_FOUND') {
      // Handle not found
    }
  }
}

// ============================================================================
// BEST PRACTICES SUMMARY
// ============================================================================

/*
1. USE SAFECALL for:
   - Simple operations where you want automatic error handling
   - Toast notifications for user feedback
   
2. USE TRYCATCH for:
   - Operations where you need control over error handling
   - Conditional logic based on success/failure
   
3. USE RETRYCALL for:
   - Network operations that might be flaky
   - Operations that might fail temporarily
   
4. USE WITHTIMEOUT for:
   - Long-running operations
   - Preventing promise hangs
   
5. USE WITHVALIDATION for:
   - User input validation
   - Data integrity checks
   
6. USE BATCHCALL for:
   - Multiple related operations
   - Dashboard data loading
   
7. USE ERRORBOUNDARY for:
   - Component-level error catching
   - Preventing white-screen-of-death
   
8. ALWAYS:
   - Provide user-friendly error messages
   - Log errors to console in development
   - Consider error tracking service for production
   - Test error scenarios during development
   
9. AVOID:
   - Bare try/catch without logging
   - Ignoring errors silently
   - Generic "Something went wrong" messages
   - Unhandled promise rejections
*/

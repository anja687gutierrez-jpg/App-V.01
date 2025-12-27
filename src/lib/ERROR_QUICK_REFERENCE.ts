/**
 * Error Handling Quick Reference
 * 
 * Cheat sheet for the most common error handling patterns.
 * Keep this handy while coding.
 */

// ============================================================================
// QUICK START: 5 MOST COMMON PATTERNS
// ============================================================================

// 1. SIMPLE OPERATION (Auto Error Handling)
import { safeCall } from '@/lib/errorHandler';
const routes = await safeCall(
  () => routeService.getAllRoutes(),
  'Failed to load routes'
);

// 2. NEED TO HANDLE ERROR YOURSELF
import { tryCatch } from '@/lib/errorHandler';
const { data: routes, error } = await tryCatch(
  () => routeService.getAllRoutes()
);
if (error) { /* custom handling */ }

// 3. FLAKY NETWORK OPERATION (Retry)
import { retryCall } from '@/lib/errorHandler';
const data = await retryCall(
  () => apiCall(),
  3,     // max retries
  1000   // delay
);

// 4. LONG OPERATION (Add Timeout)
import { withTimeout } from '@/lib/errorHandler';
const result = await withTimeout(
  () => longOperation(),
  30000  // 30 second timeout
);

// 5. VALIDATE BEFORE EXECUTING
import { withValidation } from '@/lib/errorHandler';
const result = await withValidation(
  data,
  (d) => d.id && d.name,  // validation function
  'Invalid data',
  () => operation(data)
);

// ============================================================================
// IN REACT COMPONENTS
// ============================================================================

// Hook-based error handling
import { useErrorHandler } from '@/components/ErrorBoundary';

function MyComponent() {
  const { error, handleError, clearError } = useErrorHandler();
  
  const handleClick = () => {
    try {
      // operation
    } catch (err) {
      handleError(err);
    }
  };
  
  return error ? (
    <div>Error: {error.message} <button onClick={clearError}>×</button></div>
  ) : (
    <button onClick={handleClick}>Action</button>
  );
}

// Component error boundary
import { ErrorBoundary } from '@/components/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <Dashboard />
    </ErrorBoundary>
  );
}

// ============================================================================
// WITH HOOKS (Most Common in This App)
// ============================================================================

import { useRoutes, useDashboardStats } from '@/hooks';

function Dashboard() {
  // Hooks handle errors automatically
  const { stats, loading, error, refetch } = useDashboardStats();
  
  if (error) {
    return (
      <div>
        Error: {error.message}
        <button onClick={refetch}>Retry</button>
      </div>
    );
  }
  
  if (loading) return <div>Loading...</div>;
  return <div>{/* render */}</div>;
}

// ============================================================================
// CHEAT SHEET: WHICH PATTERN TO USE
// ============================================================================

// Simple operation + show error to user
// → safeCall()

// Need to handle error yourself
// → tryCatch()

// Network might fail temporarily
// → retryCall()

// Operation might take too long
// → withTimeout()

// Validate input first
// → withValidation()

// Multiple operations at once
// → batchCall()

// Search/filter with lots of events
// → debouncedCall()

// Component rendering error
// → <ErrorBoundary>

// Functional component error
// → useErrorHandler()

// ============================================================================
// COMPLETE EXAMPLE
// ============================================================================

import { useRoutes } from '@/hooks';
import { safeCall } from '@/lib/errorHandler';

function TripPlanner() {
  // Hooks handle loading/error automatically
  const { routes, loading, error: routesError } = useRoutes();
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [creating, setCreating] = useState(false);
  
  // Manual error handling for specific action
  const handleCreateTrip = async (routeId: string) => {
    setCreating(true);
    
    const trip = await safeCall(
      () => tripService.createTrip({ routeId, userId: 'user-1' }),
      'Failed to create trip'
    );
    
    if (trip) {
      console.log('Trip created:', trip);
      // Navigate or update state
    }
    
    setCreating(false);
  };
  
  if (routesError) {
    return (
      <div className="error">
        Failed to load routes: {routesError.message}
      </div>
    );
  }
  
  if (loading) return <div>Loading routes...</div>;
  
  return (
    <div>
      {routes.map(route => (
        <div key={route.id}>
          <h3>{route.name}</h3>
          <button
            onClick={() => handleCreateTrip(route.id)}
            disabled={creating}
          >
            Create Trip
          </button>
        </div>
      ))}
    </div>
  );
}

// ============================================================================
// PRODUCTION SETUP
// ============================================================================

// When you're ready to send errors to a service like Sentry:

// 1. Install Sentry:
//    npm install @sentry/react @sentry/tracing

// 2. In src/main.tsx, wrap your app:
//    import * as Sentry from "@sentry/react";
//    
//    Sentry.init({
//      dsn: "https://YOUR_KEY@sentry.io/YOUR_ID",
//      environment: import.meta.env.MODE,
//    });

// 3. In errorHandler.ts, update sendToServer:
//    if (window.Sentry) {
//      window.Sentry.captureException(error);
//    }

// 4. Enable error logging:
//    safeCall(fn, msg, { logToServer: true })

// ============================================================================
// TESTING ERRORS
// ============================================================================

// In development, test error handling with:

// Manual error
const testError = () => {
  throw new Error('Test error');
};

// Async error
const testAsyncError = async () => {
  throw new Error('Test async error');
};

// In component:
// <button onClick={() => safeCall(testError, 'Test error')}>
//   Trigger Error
// </button>

// ============================================================================
// ADDITIONAL FUNCTIONS
// ============================================================================

export {
  safeCall,          // Auto error handling + toast
  tryCatch,          // Manual error handling
  retryCall,         // Retry with exponential backoff
  withTimeout,       // Add timeout protection
  withValidation,    // Validate before executing
  batchCall,         // Handle multiple operations
  debouncedCall,     // Prevent spam
  AppError,          // Custom error class
} from '@/lib/errorHandler';

export {
  ErrorBoundary,           // Class component error catching
  ErrorBoundaryWrapper,    // Functional component wrapper
  useErrorHandler,         // Hook-based error handling
} from '@/components/ErrorBoundary';

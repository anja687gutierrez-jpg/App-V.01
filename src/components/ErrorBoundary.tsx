/**
 * Error Boundary Component
 * 
 * React error boundary for catching and displaying component errors.
 * Automatically logs errors and shows user-friendly error UI.
 * 
 * Usage:
 *   <ErrorBoundary>
 *     <YourComponent />
 *   </ErrorBoundary>
 */

import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  resetKeys?: Array<string | number>;
  isolate?: boolean; // If true, only show error, don't break entire app
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  errorCount: number;
}

/**
 * Error Boundary Component
 * 
 * Catches React rendering errors and displays a fallback UI.
 * Supports error logging, custom fallbacks, and error recovery.
 */
export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorCount: 0,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error
    console.error('Error Boundary caught:', error, errorInfo);

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Update state with error info
    this.setState((prevState) => ({
      errorInfo,
      errorCount: prevState.errorCount + 1,
    }));

    // Optionally send to error tracking service
    this.reportError(error, errorInfo);
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    // Reset error boundary if resetKeys change
    if (
      this.props.resetKeys &&
      prevProps.resetKeys &&
      this.props.resetKeys.some((key, i) => key !== prevProps.resetKeys?.[i])
    ) {
      this.resetError();
    }
  }

  resetError = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  private reportError(error: Error, errorInfo: React.ErrorInfo) {
    // TODO: Send to error tracking service (Sentry, LogRocket, etc.)
    const errorData = {
      message: error.toString(),
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
    };

    console.debug('[ERROR REPORT]', errorData);

    // Uncomment when error tracking service is set up:
    // if (typeof window !== 'undefined' && window.errorTracker) {
    //   window.errorTracker.captureException(error, { extra: errorData });
    // }
  }

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
          <div className="max-w-md w-full">
            <div className="bg-white rounded-lg shadow-lg p-6 md:p-8">
              {/* Error Icon */}
              <div className="flex justify-center mb-4">
                <div className="rounded-full bg-red-100 p-3">
                  <AlertCircle className="h-6 w-6 text-red-600" />
                </div>
              </div>

              {/* Error Message */}
              <h1 className="text-xl md:text-2xl font-bold text-center text-gray-900 mb-2">
                Something went wrong
              </h1>

              <p className="text-center text-gray-600 mb-6">
                We encountered an unexpected error. Please try again or contact support if the
                problem persists.
              </p>

              {/* Error Details (Development only) */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="bg-gray-100 rounded-md p-4 mb-6 max-h-32 overflow-auto">
                  <p className="text-xs font-mono text-gray-700 whitespace-pre-wrap">
                    {this.state.error.toString()}
                  </p>
                  {this.state.errorInfo?.componentStack && (
                    <p className="text-xs font-mono text-gray-600 mt-2 whitespace-pre-wrap">
                      {this.state.errorInfo.componentStack.slice(0, 200)}...
                    </p>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={this.resetError}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>

                <Button
                  onClick={() => window.location.href = '/'}
                  variant="outline"
                  className="flex-1"
                >
                  Go Home
                </Button>
              </div>

              {/* Error Counter (for repeated errors) */}
              {this.state.errorCount > 1 && (
                <p className="text-center text-xs text-gray-500 mt-4">
                  Error occurred {this.state.errorCount} times. Consider refreshing the page.
                </p>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Error Boundary Wrapper Component
 * 
 * Functional component version for easier usage with hooks.
 * 
 * Usage:
 *   <ErrorBoundaryWrapper onError={handleError}>
 *     <YourComponent />
 *   </ErrorBoundaryWrapper>
 */
interface ErrorBoundaryWrapperProps {
  children: React.ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

export function ErrorBoundaryWrapper({
  children,
  onError,
}: ErrorBoundaryWrapperProps) {
  return (
    <ErrorBoundary onError={onError}>
      {children}
    </ErrorBoundary>
  );
}

/**
 * useErrorHandler Hook
 * 
 * Hook version for handling errors in functional components.
 * 
 * Usage:
 *   const { error, handleError, clearError } = useErrorHandler();
 *   
 *   const handleClick = () => {
 *     try {
 *       // some operation
 *     } catch (err) {
 *       handleError(err);
 *     }
 *   };
 */
export function useErrorHandler() {
  const [error, setError] = React.useState<Error | null>(null);

  const handleError = (error: unknown) => {
    const appError =
      error instanceof Error ? error : new Error(String(error));
    setError(appError);
    console.error('Error:', appError);
  };

  const clearError = () => setError(null);

  return {
    error,
    hasError: error !== null,
    handleError,
    clearError,
  };
}

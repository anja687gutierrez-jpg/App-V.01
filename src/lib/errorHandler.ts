/**
 * Error Handler Utility
 * 
 * Provides consistent error handling across the application.
 * Automatically logs errors and shows user-friendly messages.
 * 
 * Usage:
 *   const data = await safeCall(() => routeService.getAllRoutes(), 'Failed to load routes');
 *   
 *   const { data, error } = await tryCatch(() => poiService.searchNearby(...));
 */

import { useToast } from '@/hooks/use-toast';

// Simple toast function (can't use hook in utility)
const showToastNotification = (title: string, description: string) => {
  console.log(`[${title}] ${description}`);
  alert(`${title}\n${description}`);
};

/**
 * Custom error class for app-specific errors
 */
export class AppError extends Error {
  constructor(
    public message: string,
    public code?: string,
    public statusCode?: number,
    public originalError?: Error
  ) {
    super(message);
    this.name = 'AppError';
  }

  static from(error: unknown, defaultMessage = 'An unexpected error occurred'): AppError {
    if (error instanceof AppError) {
      return error;
    }

    if (error instanceof Error) {
      return new AppError(error.message, 'UNKNOWN', undefined, error);
    }

    return new AppError(defaultMessage, 'UNKNOWN');
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      statusCode: this.statusCode,
    };
  }
}

/**
 * Error logger configuration
 */
interface ErrorLogConfig {
  logToConsole?: boolean;
  logToServer?: boolean;
  showToast?: boolean;
  toastType?: 'error' | 'warning' | 'info';
}

const DEFAULT_CONFIG: ErrorLogConfig = {
  logToConsole: true,
  logToServer: false, // Set to true when backend is ready
  showToast: true,
  toastType: 'error',
};

/**
 * Logger - handles error logging to console, server, and UI
 */
class ErrorLogger {
  private static instance: ErrorLogger;

  private constructor() {}

  static getInstance(): ErrorLogger {
    if (!ErrorLogger.instance) {
      ErrorLogger.instance = new ErrorLogger();
    }
    return ErrorLogger.instance;
  }

  /**
   * Log an error with optional toast notification
   */
  log(error: AppError | Error, config: ErrorLogConfig = {}) {
    const finalConfig = { ...DEFAULT_CONFIG, ...config };

    // Log to console in development
    if (finalConfig.logToConsole) {
      console.error('[ERROR]', error instanceof AppError ? error.toJSON() : error.message);
      if (error instanceof AppError && error.originalError) {
        console.error('[STACK]', error.originalError.stack);
      }
    }

    // Show toast notification
    if (finalConfig.showToast) {
      const message = error instanceof Error ? error.message : String(error);
      showToastNotification('Error', message);
    }

    // Log to server (when backend is ready)
    if (finalConfig.logToServer) {
      this.sendToServer(error);
    }
  }

  /**
   * Send error to server for logging/monitoring
   * @internal
   */
  private sendToServer(error: AppError | Error) {
    // TODO: Send to error tracking service (Sentry, LogRocket, etc.)
    // This is a placeholder for future integration
    const errorData = error instanceof AppError ? error.toJSON() : { message: error.message };
    console.debug('[SERVER LOG]', errorData);
  }
}

/**
 * Safe call wrapper - executes function and returns result or null
 * Shows error toast automatically
 * 
 * @param fn - Function to execute
 * @param errorMessage - User-friendly error message
 * @param config - Error logging configuration
 * @returns Promise<T | null>
 */
export async function safeCall<T>(
  fn: () => Promise<T>,
  errorMessage: string = 'An error occurred',
  config: ErrorLogConfig = {}
): Promise<T | null> {
  try {
    return await fn();
  } catch (error) {
    const appError = AppError.from(error, errorMessage);
    ErrorLogger.getInstance().log(appError, { ...config, showToast: true });
    return null;
  }
}

/**
 * Try/catch wrapper - executes function and returns result + error
 * Useful when you want to handle error yourself
 * 
 * @param fn - Function to execute
 * @param config - Error logging configuration
 * @returns Promise<{ data: T | null, error: AppError | null }>
 */
export async function tryCatch<T>(
  fn: () => Promise<T>,
  config: ErrorLogConfig = { showToast: false } // Don't show toast by default
): Promise<{ data: T | null; error: AppError | null }> {
  try {
    const data = await fn();
    return { data, error: null };
  } catch (error) {
    const appError = AppError.from(error);
    ErrorLogger.getInstance().log(appError, config);
    return { data: null, error: appError };
  }
}

/**
 * Retry wrapper - retries function with exponential backoff
 * 
 * @param fn - Function to execute
 * @param maxRetries - Maximum number of retries (default: 3)
 * @param delayMs - Initial delay in milliseconds (default: 1000)
 * @param errorMessage - Error message if all retries fail
 * @returns Promise<T | null>
 */
export async function retryCall<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delayMs: number = 1000,
  errorMessage: string = 'Failed after multiple attempts'
): Promise<T | null> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt < maxRetries - 1) {
        // Exponential backoff: 1s, 2s, 4s, etc.
        const waitTime = delayMs * Math.pow(2, attempt);
        console.warn(`Attempt ${attempt + 1} failed, retrying in ${waitTime}ms...`);
        await new Promise((resolve) => setTimeout(resolve, waitTime));
      }
    }
  }

  const appError = AppError.from(lastError || new Error(errorMessage), errorMessage);
  ErrorLogger.getInstance().log(appError, { showToast: true });
  return null;
}

/**
 * Timeout wrapper - adds timeout to function execution
 * 
 * @param fn - Function to execute
 * @param timeoutMs - Timeout in milliseconds (default: 30000)
 * @param errorMessage - Error message on timeout
 * @returns Promise<T | null>
 */
export async function withTimeout<T>(
  fn: () => Promise<T>,
  timeoutMs: number = 30000,
  errorMessage: string = 'Request timed out'
): Promise<T | null> {
  try {
    return await Promise.race([
      fn(),
      new Promise<T>((_, reject) =>
        setTimeout(() => reject(new Error(errorMessage)), timeoutMs)
      ),
    ]);
  } catch (error) {
    const appError = AppError.from(error, errorMessage);
    ErrorLogger.getInstance().log(appError, { showToast: true });
    return null;
  }
}

/**
 * Validation wrapper - validates input before executing
 * 
 * @param data - Data to validate
 * @param validator - Validation function (returns true if valid)
 * @param errorMessage - Error message if validation fails
 * @param fn - Function to execute if valid
 * @returns Promise<T | null>
 */
export async function withValidation<T, D>(
  data: D,
  validator: (data: D) => boolean,
  errorMessage: string,
  fn: () => Promise<T>
): Promise<T | null> {
  if (!validator(data)) {
    const error = new AppError(errorMessage, 'VALIDATION_ERROR');
    ErrorLogger.getInstance().log(error, { showToast: true });
    return null;
  }

  return safeCall(fn, 'Operation failed after validation');
}

/**
 * Batch error handler - handles multiple operations with error collection
 * 
 * @param operations - Array of async operations
 * @param continueOnError - Continue on error or stop (default: false)
 * @returns Promise<{ results: Array<T | null>, errors: Error[] }>
 */
export async function batchCall<T>(
  operations: Array<() => Promise<T>>,
  continueOnError: boolean = false
): Promise<{ results: Array<T | null>; errors: Error[] }> {
  const results: Array<T | null> = [];
  const errors: Error[] = [];

  for (const operation of operations) {
    try {
      const result = await operation();
      results.push(result);
    } catch (error) {
      const appError = AppError.from(error);
      errors.push(appError);
      results.push(null);

      if (!continueOnError) {
        ErrorLogger.getInstance().log(appError, { showToast: true });
        break;
      }
    }
  }

  return { results, errors };
}

/**
 * Debounced error handler - prevents error spam
 * 
 * @param fn - Function to execute
 * @param delayMs - Debounce delay in milliseconds
 * @param errorMessage - Error message
 * @returns Function that executes with debounce
 */
export function debouncedCall<T>(
  fn: () => Promise<T>,
  delayMs: number = 1000,
  errorMessage: string = 'An error occurred'
) {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return async (): Promise<T | null> => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    return new Promise((resolve) => {
      timeoutId = setTimeout(async () => {
        const result = await safeCall(fn, errorMessage);
        resolve(result);
      }, delayMs);
    });
  };
}

export const errorHandler = {
  safeCall,
  tryCatch,
  retryCall,
  withTimeout,
  withValidation,
  batchCall,
  debouncedCall,
  AppError,
};

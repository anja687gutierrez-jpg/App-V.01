/**
 * Geolocation Service
 * Handles GPS tracking and location updates with permission management
 */

export interface GeolocationPosition {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
}

export interface GeolocationError {
  code: number;
  message: string;
}

type LocationCallback = (position: GeolocationPosition) => void;
type ErrorCallback = (error: GeolocationError) => void;

class GeolocationService {
  private watchId: number | null = null;
  private locationCallbacks: Set<LocationCallback> = new Set();
  private errorCallbacks: Set<ErrorCallback> = new Set();
  private currentPosition: GeolocationPosition | null = null;
  private isTracking = false;

  /**
   * Check if geolocation is supported
   */
  isSupported(): boolean {
    return 'geolocation' in navigator;
  }

  /**
   * Get current position (one-time)
   */
  async getCurrentPosition(): Promise<GeolocationPosition> {
    if (!this.isSupported()) {
      throw new Error('Geolocation is not supported by this browser');
    }

    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const geoPosition: GeolocationPosition = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp,
          };
          this.currentPosition = geoPosition;
          resolve(geoPosition);
        },
        (error) => {
          const geoError: GeolocationError = {
            code: error.code,
            message: this.getErrorMessage(error.code),
          };
          reject(geoError);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    });
  }

  /**
   * Start watching position (continuous tracking)
   */
  startTracking(): void {
    if (!this.isSupported()) {
      console.warn('Geolocation not supported');
      return;
    }

    if (this.isTracking) {
      return;
    }

    this.watchId = navigator.geolocation.watchPosition(
      (position) => {
        const geoPosition: GeolocationPosition = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp,
        };

        this.currentPosition = geoPosition;
        this.isTracking = true;

        // Notify all subscribers
        this.locationCallbacks.forEach((callback) => callback(geoPosition));
      },
      (error) => {
        const geoError: GeolocationError = {
          code: error.code,
          message: this.getErrorMessage(error.code),
        };

        // Only log errors that aren't permission-related (avoid spam)
        if (error.code !== 1) {
          console.warn('[Geolocation]', geoError.message);
        }

        this.errorCallbacks.forEach((callback) => callback(geoError));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 30000, // Cache position for 30 seconds
      }
    );
  }

  /**
   * Stop watching position
   */
  stopTracking(): void {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
      this.isTracking = false;
    }
  }

  /**
   * Subscribe to location updates
   */
  subscribe(onLocation: LocationCallback, onError?: ErrorCallback): () => void {
    this.locationCallbacks.add(onLocation);
    if (onError) {
      this.errorCallbacks.add(onError);
    }

    // If we already have a position, call the callback immediately
    if (this.currentPosition) {
      onLocation(this.currentPosition);
    }

    // Start tracking if not already
    if (!this.isTracking) {
      this.startTracking();
    }

    // Return unsubscribe function
    return () => {
      this.locationCallbacks.delete(onLocation);
      if (onError) {
        this.errorCallbacks.delete(onError);
      }

      // Stop tracking if no more subscribers
      if (this.locationCallbacks.size === 0) {
        this.stopTracking();
      }
    };
  }

  /**
   * Get last known position
   */
  getLastPosition(): GeolocationPosition | null {
    return this.currentPosition;
  }

  /**
   * Calculate distance between two coordinates (Haversine formula)
   * Returns distance in meters
   */
  calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  }

  /**
   * Convert error code to human-readable message
   */
  private getErrorMessage(code: number): string {
    switch (code) {
      case 1:
        return 'Permission denied. Please enable location access.';
      case 2:
        return 'Position unavailable. GPS signal not found.';
      case 3:
        return 'Request timeout. Please try again.';
      default:
        return 'Unknown error occurred.';
    }
  }

  /**
   * Request permission (if needed)
   */
  async requestPermission(): Promise<PermissionState> {
    if ('permissions' in navigator) {
      try {
        const result = await navigator.permissions.query({ name: 'geolocation' });
        return result.state;
      } catch (error) {
        console.warn('Permission API not supported');
        return 'prompt';
      }
    }
    return 'prompt';
  }

  /**
   * Format coordinates for display
   */
  formatCoordinates(position: GeolocationPosition): string {
    const lat = position.latitude.toFixed(6);
    const lon = position.longitude.toFixed(6);
    const latDir = position.latitude >= 0 ? 'N' : 'S';
    const lonDir = position.longitude >= 0 ? 'E' : 'W';
    return `${Math.abs(parseFloat(lat))}°${latDir}, ${Math.abs(parseFloat(lon))}°${lonDir}`;
  }
}

// Export singleton instance
export const geolocationService = new GeolocationService();

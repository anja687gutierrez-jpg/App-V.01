// Initialize Cloud Functions base URL from environment
// This will be set when you deploy to Firebase

export const getFirebaseConfig = () => ({
  // Cloud Functions URL - set in .env.local
  functionsUrl: process.env.REACT_APP_FIREBASE_FUNCTIONS_URL || 
    'http://localhost:5001/your-project-id/us-central1',
  
  // Use sample data when offline
  useSampleData: process.env.REACT_APP_USE_SAMPLE_DATA === 'true',
  
  // Cache settings
  cacheRoutes: true,
  cachePOIs: true,
  routeCacheDuration: 1000 * 60 * 60 * 24 * 365, // 1 year
  poiCacheDuration: 1000 * 60 * 60 * 24 * 365, // 1 year
  statsCacheDuration: 1000 * 60 * 5, // 5 minutes
});

/**
 * Helper to make Firebase Function calls
 */
export async function callFirebaseFunction<T>(
  functionName: string,
  options?: {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
    body?: any;
    userId?: string;
    queryParams?: Record<string, any>;
  }
): Promise<T> {
  const config = getFirebaseConfig();
  const url = new URL(`${config.functionsUrl}/${functionName}`);
  
  // Add query parameters
  if (options?.queryParams) {
    Object.entries(options.queryParams).forEach(([key, value]) => {
      if (value !== undefined) {
        url.searchParams.append(key, String(value));
      }
    });
  }
  
  // Add userId if provided
  if (options?.userId) {
    url.searchParams.append('uid', options.userId);
  }

  const response = await fetch(url.toString(), {
    method: options?.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    body: options?.body ? JSON.stringify(options.body) : undefined,
  });

  if (!response.ok) {
    throw new Error(`Firebase Function error: ${response.statusText}`);
  }

  const data = await response.json();
  
  if (!data.success) {
    throw new Error(data.error || 'Firebase Function failed');
  }

  return data.data;
}

/**
 * Helper to cache data in localStorage
 */
export function getCachedData(key: string): any | null {
  try {
    const cached = localStorage.getItem(key);
    if (!cached) return null;
    
    const { data, timestamp, duration } = JSON.parse(cached);
    
    // Check if cache is still fresh
    if (Date.now() - timestamp < duration) {
      return data;
    }
    
    // Cache expired
    localStorage.removeItem(key);
    return null;
  } catch (error) {
    console.error('Error reading cache:', error);
    return null;
  }
}

export function setCachedData(key: string, data: any, duration: number) {
  try {
    localStorage.setItem(key, JSON.stringify({
      data,
      timestamp: Date.now(),
      duration
    }));
  } catch (error) {
    console.error('Error writing cache:', error);
  }
}

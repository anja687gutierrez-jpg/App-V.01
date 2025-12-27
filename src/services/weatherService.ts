/**
 * Weather Service
 * Integrates with OpenWeatherMap API for real-time weather data
 */

interface WeatherData {
  temperature: number;
  description: string;
  icon: string;
  humidity: number;
  windSpeed: number;
  feelsLike: number;
}

interface WeatherApiResponse {
  main: {
    temp: number;
    feels_like: number;
    humidity: number;
  };
  weather: Array<{
    main: string;
    description: string;
    icon: string;
  }>;
  wind: {
    speed: number;
  };
}

class WeatherService {
  private apiKey: string;
  private baseUrl = 'https://api.openweathermap.org/data/2.5/weather';
  private cacheMap = new Map<string, { data: WeatherData; timestamp: number }>();
  private cacheDuration = 5 * 60 * 1000; // 5 minutes in milliseconds

  constructor() {
    this.apiKey = import.meta.env.VITE_WEATHER_API_KEY || '';
  }

  /**
   * Fetch weather for a specific latitude and longitude
   */
  async getWeatherByCoordinates(
    latitude: number,
    longitude: number
  ): Promise<WeatherData> {
    const cacheKey = `${latitude},${longitude}`;

    // Check cache first
    const cached = this.cacheMap.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.cacheDuration) {
      return cached.data;
    }

    if (!this.apiKey) {
      console.warn('Weather API key not configured');
      return this.getDefaultWeather();
    }

    try {
      const params = new URLSearchParams({
        lat: latitude.toString(),
        lon: longitude.toString(),
        units: 'metric', // Use Celsius
        appid: this.apiKey
      });

      const response = await fetch(`${this.baseUrl}?${params}`);

      if (response.status === 401) {
        console.warn('Weather API key is invalid or unauthorized. Using default weather.');
        return this.getDefaultWeather();
      }

      if (!response.ok) {
        throw new Error(`Weather API error: ${response.statusText}`);
      }

      const data: WeatherApiResponse = await response.json();

      const weatherData: WeatherData = {
        temperature: Math.round(data.main.temp),
        description: data.weather[0].main,
        icon: data.weather[0].icon,
        humidity: data.main.humidity,
        windSpeed: Math.round(data.wind.speed * 10) / 10,
        feelsLike: Math.round(data.main.feels_like)
      };

      // Cache the result
      this.cacheMap.set(cacheKey, {
        data: weatherData,
        timestamp: Date.now()
      });

      return weatherData;
    } catch (error) {
      console.error('Error fetching weather:', error);
      return this.getDefaultWeather();
    }
  }

  /**
   * Fetch weather for a city name
   */
  async getWeatherByCity(city: string): Promise<WeatherData> {
    const cacheKey = `city:${city}`;

    // Check cache first
    const cached = this.cacheMap.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < this.cacheDuration) {
      return cached.data;
    }

    if (!this.apiKey) {
      console.warn('Weather API key not configured');
      return this.getDefaultWeather();
    }

    try {
      const params = new URLSearchParams({
        q: city,
        units: 'metric',
        appid: this.apiKey
      });

      const response = await fetch(`${this.baseUrl}?${params}`);

      if (response.status === 401) {
        console.warn('Weather API key is invalid or unauthorized. Using default weather.');
        return this.getDefaultWeather();
      }

      if (!response.ok) {
        throw new Error(`Weather API error: ${response.statusText}`);
      }

      const data: WeatherApiResponse = await response.json();

      const weatherData: WeatherData = {
        temperature: Math.round(data.main.temp),
        description: data.weather[0].main,
        icon: data.weather[0].icon,
        humidity: data.main.humidity,
        windSpeed: Math.round(data.wind.speed * 10) / 10,
        feelsLike: Math.round(data.main.feels_like)
      };

      // Cache the result
      this.cacheMap.set(cacheKey, {
        data: weatherData,
        timestamp: Date.now()
      });

      return weatherData;
    } catch (error) {
      console.error('Error fetching weather:', error);
      return this.getDefaultWeather();
    }
  }

  /**
   * Format weather data for display
   */
  formatWeatherDisplay(weather: WeatherData, useFahrenheit = true): string {
    const temp = useFahrenheit
      ? Math.round((weather.temperature * 9) / 5 + 32)
      : weather.temperature;

    const unit = useFahrenheit ? '°F' : '°C';
    return `${weather.description}, ${temp}${unit}`;
  }

  /**
   * Get default weather fallback
   */
  private getDefaultWeather(): WeatherData {
    return {
      temperature: 20,
      description: 'Clear',
      icon: '01d',
      humidity: 60,
      windSpeed: 5,
      feelsLike: 20
    };
  }

  /**
   * Clear cache (useful for testing)
   */
  clearCache(): void {
    this.cacheMap.clear();
  }
}

// Export singleton instance
export const weatherService = new WeatherService();
export type { WeatherData };

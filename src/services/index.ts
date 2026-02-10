/**
 * Services Index
 *
 * Barrel export for all services.
 * This provides convenient access to all service modules throughout the app.
 *
 * Usage:
 *   import { routeService, poiService, tripService } from '@/services';
 *
 * Or import individual services:
 *   import { routeService } from '@/services/routeService';
 */

export { routeService } from './routeService';
export { poiService } from './poiService';
export { tripService } from './tripService';
export { openRouteService } from './openRouteService';
export { geolocationService } from './geolocationService';
export { favoritesService } from './favoritesService';
export { nrelService } from './nrelService';
export { aiService } from './aiService';
export type { ChargingStationFormatted } from './nrelService';
export type { ChatMessage, RouteContext, AIResponse } from './aiService';

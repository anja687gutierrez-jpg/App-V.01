/**
 * AI Service
 *
 * Handles AI chat completions using Gemini via Firebase AI Logic.
 * Provides route-aware travel recommendations for Tesla road trips.
 * Falls back to demo responses when Gemini is unavailable.
 */

import { geminiModel } from '../lib/firebaseConfig';
import type { ChatSession } from 'firebase/ai';
import { PERSONAS, getPersonaSystemPrompt } from '../lib/personas';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface RouteContext {
  tripName?: string;
  startLocation?: string;
  endLocation?: string;
  waypoints?: Array<{ name: string; type: string }>;
  totalDistance?: number;
  totalDuration?: number;
}

export interface AIResponse {
  message: string;
  suggestions?: Array<{
    name: string;
    type: 'attraction' | 'restaurant' | 'photo-spot' | 'hidden-gem' | 'charging';
    description: string;
    lat?: number;
    lng?: number;
  }>;
  error?: string;
}

// System prompts are now sourced from src/lib/personas.ts via getPersonaSystemPrompt()

class AIService {
  private chatSession: ChatSession | null = null;
  private currentPersona: string = 'guide';

  /**
   * Check if AI service is available
   */
  isAvailable(): boolean {
    return geminiModel !== null;
  }

  /**
   * Get which provider is being used
   */
  getProvider(): 'gemini' | 'demo' {
    return geminiModel ? 'gemini' : 'demo';
  }

  /**
   * Build context message from route data
   */
  private buildRouteContext(routeContext?: RouteContext): string {
    if (!routeContext) return '';

    const parts: string[] = [];

    if (routeContext.tripName) {
      parts.push(`Current trip: "${routeContext.tripName}"`);
    }

    if (routeContext.startLocation && routeContext.endLocation) {
      parts.push(`Route: ${routeContext.startLocation} → ${routeContext.endLocation}`);
    }

    if (routeContext.waypoints && routeContext.waypoints.length > 0) {
      const waypointNames = routeContext.waypoints.map(w => w.name).join(' → ');
      parts.push(`Planned stops: ${waypointNames}`);
    }

    if (routeContext.totalDistance) {
      parts.push(`Total distance: ${routeContext.totalDistance.toFixed(0)} km`);
    }

    if (routeContext.totalDuration) {
      parts.push(`Estimated duration: ${(routeContext.totalDuration / 60).toFixed(1)} hours`);
    }

    return parts.length > 0
      ? `\n\n[User's current route context]\n${parts.join('\n')}`
      : '';
  }

  /**
   * Get or create a Gemini chat session with the appropriate persona
   */
  private getOrCreateChatSession(persona?: string): ChatSession | null {
    if (!geminiModel) return null;

    const targetPersona = persona || 'guide';

    // If persona changed or no session exists, create a new one
    if (this.chatSession === null || this.currentPersona !== targetPersona) {
      this.currentPersona = targetPersona;
      const systemText = getPersonaSystemPrompt(targetPersona);

      this.chatSession = geminiModel.startChat({
        systemInstruction: { role: 'system', parts: [{ text: systemText }] },
      });
      console.log(`[AIService] New Gemini chat session (persona: ${targetPersona})`);
    }

    return this.chatSession;
  }

  /**
   * Send a message to the AI and get a response
   */
  async chat(
    userMessage: string,
    routeContext?: RouteContext,
    persona?: string
  ): Promise<AIResponse> {
    const contextMessage = this.buildRouteContext(routeContext);
    const fullUserMessage = userMessage + contextMessage;

    // Try Gemini
    if (geminiModel) {
      try {
        return await this.callGemini(fullUserMessage, persona);
      } catch (error) {
        console.error('[AIService] Gemini error, falling back to demo:', error);
      }
    }

    // Demo mode fallback
    console.log('[AIService] Using demo mode');
    return this.getDemoResponse(userMessage, routeContext);
  }

  /**
   * Call Gemini via Firebase AI Logic
   */
  private async callGemini(userMessage: string, persona?: string): Promise<AIResponse> {
    const session = this.getOrCreateChatSession(persona);
    if (!session) throw new Error('Gemini session not available');

    const result = await session.sendMessage(userMessage);
    const responseText = result.response.text();

    console.log('[AIService] Gemini response received (provider: gemini)');

    return {
      message: responseText,
      suggestions: this.extractSuggestions(responseText),
    };
  }

  /**
   * Demo mode responses when Gemini is unavailable
   */
  private getDemoResponse(userMessage: string, routeContext?: RouteContext): AIResponse {
    const lowerMessage = userMessage.toLowerCase();

    // Route-aware responses
    if (routeContext?.waypoints?.length) {
      const firstStop = routeContext.waypoints[0]?.name || 'your destination';

      if (lowerMessage.includes('what to see') || lowerMessage.includes('suggestions')) {
        return {
          message: `Since you're heading to ${firstStop}, I'd recommend stopping at some scenic viewpoints along the way! The Pacific Coast Highway has amazing overlooks. Also, check out any local farmers markets - they're great for grabbing fresh snacks for the road.`,
          suggestions: [
            { name: 'Scenic Overlook', type: 'photo-spot', description: 'Great sunset views' },
            { name: 'Local Farmers Market', type: 'hidden-gem', description: 'Fresh local produce' },
          ],
        };
      }

      if (lowerMessage.includes('eat') || lowerMessage.includes('food') || lowerMessage.includes('restaurant')) {
        return {
          message: `Oh, you're going to love the food scene near ${firstStop}! I'd suggest looking for local diners - they usually have the best comfort food. Don't miss any roadside BBQ joints either - some of the best food is found at the most unassuming places!`,
          suggestions: [
            { name: 'Roadside Diner', type: 'restaurant', description: 'Classic American comfort food' },
            { name: 'Local BBQ Joint', type: 'restaurant', description: 'Authentic smoked meats' },
          ],
        };
      }
    }

    // Generic helpful responses
    if (lowerMessage.includes('charging') || lowerMessage.includes('supercharger')) {
      return {
        message: `Great question about charging! I always recommend planning your Supercharger stops to arrive with about 10-20% battery. This gives you the fastest charging speeds. The Tesla nav usually does a good job, but it's nice to have backup options too!`,
        suggestions: [
          { name: 'Tesla Supercharger', type: 'charging', description: 'Fast charging stop' },
        ],
      };
    }

    if (lowerMessage.includes('hidden gem') || lowerMessage.includes('secret')) {
      return {
        message: `I love finding hidden gems! Some of my favorites are small local museums, vintage roadside attractions, and scenic pullouts that aren't on the main tourist maps. Ask locals at coffee shops - they always know the best spots!`,
        suggestions: [
          { name: 'Local History Museum', type: 'hidden-gem', description: 'Quirky local artifacts' },
          { name: 'Vintage Roadside Attraction', type: 'hidden-gem', description: 'Classic Americana' },
        ],
      };
    }

    if (lowerMessage.includes('photo') || lowerMessage.includes('picture') || lowerMessage.includes('instagram')) {
      return {
        message: `For amazing photos, timing is everything! Golden hour (sunrise/sunset) gives you the best light. I'd suggest finding elevated viewpoints, interesting rock formations, or classic American roadside scenes. Reflections in lakes are always stunning too!`,
        suggestions: [
          { name: 'Sunset Viewpoint', type: 'photo-spot', description: 'Perfect golden hour shots' },
          { name: 'Mirror Lake', type: 'photo-spot', description: 'Beautiful reflections' },
        ],
      };
    }

    // Default response
    return {
      message: `Hey there! I'm your Travel Bestie, here to help make your road trip amazing. I can suggest places to eat, hidden gems to discover, photo spots, and help plan your charging stops. What would you like to know about your trip?`,
      suggestions: [],
    };
  }

  /**
   * Extract location suggestions from AI response
   */
  private extractSuggestions(text: string): AIResponse['suggestions'] {
    // Simple extraction - look for patterns like "visit X" or "stop at X"
    // In a production app, you'd use structured output or better parsing
    return [];
  }

  /**
   * Clear conversation history
   */
  clearHistory(): void {
    this.chatSession = null;
    console.log('[AIService] Chat history cleared');
  }

  /**
   * Get quick suggestion prompts based on route
   */
  getQuickPrompts(routeContext?: RouteContext): string[] {
    const basePrompts = [
      'What should I see?',
      'Where should I eat?',
      'Any hidden gems?',
      'Best photo spots?',
    ];

    if (routeContext?.waypoints?.length) {
      return [
        `What's special about ${routeContext.waypoints[0]?.name || 'this area'}?`,
        ...basePrompts.slice(0, 3),
      ];
    }

    return basePrompts;
  }
}

export const aiService = new AIService();

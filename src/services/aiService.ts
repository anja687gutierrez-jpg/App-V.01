/**
 * AI Service
 *
 * Handles AI chat completions using Groq (preferred) or Anthropic Claude.
 * Provides route-aware travel recommendations for Tesla road trips.
 */

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

const SYSTEM_PROMPT = `You are a friendly, enthusiastic travel guide named "Travel Bestie" helping users plan Tesla road trips through American national parks and scenic routes.

Your personality:
- Warm, friendly, and conversational (like a knowledgeable friend)
- Passionate about discovering hidden gems and local experiences
- Knowledgeable about EV charging, range planning, and Tesla-specific tips
- Focused on experiences, not just destinations

Guidelines:
- Give concise, helpful recommendations (2-3 sentences max per suggestion)
- Mention specific places by name when possible
- Consider EV charging needs for long trips
- Highlight photo opportunities and scenic viewpoints
- Suggest local food spots and hidden gems off the beaten path
- Be encouraging and build excitement for the trip

When suggesting locations, format them clearly so they can be added to the route.
If the user has a route context, reference specific waypoints and suggest stops along the way.`;

class AIService {
  private groqApiKey: string | null = null;
  private anthropicApiKey: string | null = null;
  private conversationHistory: ChatMessage[] = [];

  constructor() {
    // Check for API keys from environment
    this.groqApiKey = import.meta.env.VITE_GROQ_API_KEY || null;
    this.anthropicApiKey = import.meta.env.VITE_ANTHROPIC_API_KEY || null;
  }

  /**
   * Check if AI service is available
   */
  isAvailable(): boolean {
    return !!(this.groqApiKey || this.anthropicApiKey);
  }

  /**
   * Get which provider is being used
   */
  getProvider(): 'groq' | 'anthropic' | 'demo' {
    if (this.groqApiKey) return 'groq';
    if (this.anthropicApiKey) return 'anthropic';
    return 'demo';
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
   * Send a message to the AI and get a response
   */
  async chat(
    userMessage: string,
    routeContext?: RouteContext
  ): Promise<AIResponse> {
    const contextMessage = this.buildRouteContext(routeContext);
    const fullUserMessage = userMessage + contextMessage;

    // Add to conversation history
    this.conversationHistory.push({
      role: 'user',
      content: fullUserMessage,
    });

    // Try Groq first (faster, cheaper)
    if (this.groqApiKey) {
      try {
        return await this.callGroq(fullUserMessage);
      } catch (error) {
        console.error('[AIService] Groq API error:', error);
        // Fall through to demo mode
      }
    }

    // Try Anthropic
    if (this.anthropicApiKey) {
      try {
        return await this.callAnthropic(fullUserMessage);
      } catch (error) {
        console.error('[AIService] Anthropic API error:', error);
        // Fall through to demo mode
      }
    }

    // Demo mode - return contextual responses
    return this.getDemoResponse(userMessage, routeContext);
  }

  /**
   * Call Groq API
   */
  private async callGroq(userMessage: string): Promise<AIResponse> {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.groqApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-70b-versatile',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...this.conversationHistory.slice(-10), // Keep last 10 messages
        ],
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`Groq API error: ${response.status}`);
    }

    const data = await response.json();
    const assistantMessage = data.choices[0]?.message?.content || 'Sorry, I couldn\'t generate a response.';

    // Add to history
    this.conversationHistory.push({
      role: 'assistant',
      content: assistantMessage,
    });

    return {
      message: assistantMessage,
      suggestions: this.extractSuggestions(assistantMessage),
    };
  }

  /**
   * Call Anthropic API
   */
  private async callAnthropic(userMessage: string): Promise<AIResponse> {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': this.anthropicApiKey!,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 500,
        system: SYSTEM_PROMPT,
        messages: this.conversationHistory.slice(-10).map(m => ({
          role: m.role === 'assistant' ? 'assistant' : 'user',
          content: m.content,
        })),
      }),
    });

    if (!response.ok) {
      throw new Error(`Anthropic API error: ${response.status}`);
    }

    const data = await response.json();
    const assistantMessage = data.content[0]?.text || 'Sorry, I couldn\'t generate a response.';

    // Add to history
    this.conversationHistory.push({
      role: 'assistant',
      content: assistantMessage,
    });

    return {
      message: assistantMessage,
      suggestions: this.extractSuggestions(assistantMessage),
    };
  }

  /**
   * Demo mode responses when no API key is available
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
    this.conversationHistory = [];
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

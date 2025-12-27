/**
 * Voice Service
 * Handles AI text generation, voice synthesis, and conversation management
 */

import type { Message } from '@/types';

export interface VoiceOption {
  id: string;
  name: string;
  personality: string;
  language: string;
}

export interface AIResponseOptions {
  tourName: string;
  currentStop?: string;
  destination?: string;
  interests?: string[];
  location?: { lat: number; lon: number };
  weather?: { temperature: number; description: string };
  conversationHistory: Message[];
  voice: string;
}

export interface AIResponse {
  text: string;
  confidence: number;
}

// Voice options with different personalities
const VOICE_OPTIONS: VoiceOption[] = [
  {
    id: 'nova',
    name: 'Nova',
    personality: 'Neutral, friendly, and informative guide',
    language: 'en-US'
  },
  {
    id: 'alloy',
    name: 'Alloy',
    personality: 'Professional, detailed, and authoritative',
    language: 'en-US'
  },
  {
    id: 'fable',
    name: 'Fable',
    personality: 'Warm, storytelling, and engaging narrator',
    language: 'en-US'
  },
  {
    id: 'onyx',
    name: 'Onyx',
    personality: 'Deep, historical facts, and interesting anecdotes',
    language: 'en-US'
  }
];

export function getVoiceOptions(): VoiceOption[] {
  return VOICE_OPTIONS;
}

/**
 * Generate context-aware system prompt based on voice personality
 */
function getSystemPrompt(voice: string): string {
  const voiceOption = VOICE_OPTIONS.find((v) => v.id === voice);
  if (!voiceOption) return 'You are a helpful travel assistant.';

  return `You are an AI travel guide with the following personality: ${voiceOption.personality}

Your role is to:
- Answer questions about the tour and locations
- Provide contextual information about stops and attractions
- Suggest experiences and activities
- Give practical travel advice
- Be conversational and engaging

Always keep responses concise (2-3 sentences max for casual questions, longer for detailed inquiries).
Be friendly and personable while maintaining accuracy about the destination.`;
}

/**
 * Build context-aware prompt with tour information
 */
function buildPrompt(userMessage: string, options: AIResponseOptions): string {
  const contextParts: string[] = [];

  if (options.tourName) {
    contextParts.push(`Current tour: ${options.tourName}`);
  }

  if (options.currentStop) {
    contextParts.push(`Currently at: ${options.currentStop}`);
  }

  if (options.destination) {
    contextParts.push(`Destination: ${options.destination}`);
  }

  if (options.interests && options.interests.length > 0) {
    contextParts.push(`User interests: ${options.interests.join(', ')}`);
  }

  if (options.weather) {
    contextParts.push(
      `Weather: ${options.weather.temperature}°F, ${options.weather.description}`
    );
  }

  if (options.location) {
    contextParts.push(
      `Location: ${options.location.lat.toFixed(4)}, ${options.location.lon.toFixed(4)}`
    );
  }

  let contextString = '';
  if (contextParts.length > 0) {
    contextString = `Context:\n${contextParts.join('\n')}\n\n`;
  }

  // Include conversation history for continuity
  let historyString = '';
  if (options.conversationHistory.length > 0) {
    const recentMessages = options.conversationHistory.slice(-4); // Last 4 messages for context
    historyString =
      'Recent conversation:\n' +
      recentMessages
        .map(
          (msg) =>
            `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`
        )
        .join('\n') +
      '\n\n';
  }

  return contextString + historyString + `User question: ${userMessage}`;
}

/**
 * Generate AI response using a mock API
 * In production, this would call an actual AI service (OpenAI, Anthropic, etc.)
 */
export async function generateAIResponse(
  userMessage: string,
  options: AIResponseOptions
): Promise<AIResponse> {
  const systemPrompt = getSystemPrompt(options.voice);
  const fullPrompt = buildPrompt(userMessage, options);

  try {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Mock AI responses based on common questions
    const lowerMessage = userMessage.toLowerCase();

    let responseText = '';

    // Response logic based on question type
    if (
      lowerMessage.includes('weather') ||
      lowerMessage.includes('rain') ||
      lowerMessage.includes('temperature')
    ) {
      responseText = options.weather
        ? `It's currently ${options.weather.temperature}°F with ${options.weather.description}. Perfect conditions for exploring!`
        : 'The weather looks great for your tour today.';
    } else if (
      lowerMessage.includes('distance') ||
      lowerMessage.includes('how far') ||
      lowerMessage.includes('long')
    ) {
      responseText = options.currentStop
        ? `We're at ${options.currentStop}. The next stop is about 15-20 minutes away by car.`
        : 'Distance varies depending on which stop you want to reach.';
    } else if (
      lowerMessage.includes('what') ||
      lowerMessage.includes('tell me') ||
      lowerMessage.includes('about')
    ) {
      responseText = options.currentStop
        ? `${options.currentStop} is a remarkable destination with rich history and unique attractions. Would you like to know more about specific aspects?`
        : 'I can tell you more about any stop on your ${options.tourName} tour. Which location interests you?';
    } else if (
      lowerMessage.includes('recommend') ||
      lowerMessage.includes('suggest') ||
      lowerMessage.includes('best')
    ) {
      if (options.interests && options.interests.length > 0) {
        responseText = `Based on your interest in ${options.interests[0]}, I'd recommend exploring the unique attractions related to that theme at this stop.`;
      } else {
        responseText = 'Based on this location, I recommend checking out the local attractions and taking photos at the scenic viewpoints.';
      }
    } else if (
      lowerMessage.includes('time') ||
      lowerMessage.includes('how long') ||
      lowerMessage.includes('spend')
    ) {
      responseText =
        'I recommend spending at least 45 minutes to an hour at each stop to fully appreciate the experience. Some places warrant longer visits depending on your interests.';
    } else if (
      lowerMessage.includes('nearby') ||
      lowerMessage.includes('around') ||
      lowerMessage.includes('close')
    ) {
      responseText = options.currentStop
        ? `Around ${options.currentStop}, you'll find excellent dining, shopping, and entertainment options. Perfect for breaks during your journey.`
        : 'There are many amenities and attractions nearby. What specifically are you looking for?';
    } else if (
      lowerMessage.includes('eat') ||
      lowerMessage.includes('food') ||
      lowerMessage.includes('restaurant') ||
      lowerMessage.includes('lunch')
    ) {
      responseText = `There are wonderful dining options nearby! From casual cafes to fine dining, you'll find something to suit your taste. What type of cuisine interests you?`;
    } else if (
      lowerMessage.includes('help') ||
      lowerMessage.includes('problem') ||
      lowerMessage.includes('issue')
    ) {
      responseText =
        "I'm here to help! You can ask me about the tour details, attractions, weather, navigation, dining recommendations, and much more. What can I assist you with?";
    } else {
      // Default response for unknown questions
      responseText = `That's an interesting question about your journey through ${options.tourName}! ${
        options.currentStop
          ? `While we're visiting ${options.currentStop}, `
          : ''
      }I'd be happy to provide more specific information if you can tell me more about what you're interested in.`;
    }

    return {
      text: responseText,
      confidence: 0.95
    };
  } catch (error) {
    console.error('Error generating AI response:', error);
    throw new Error('Failed to generate response');
  }
}

/**
 * Speak text using Web Speech API or a TTS service
 * Uses the browser's native text-to-speech capabilities
 */
export async function speakText(text: string, voice: string = 'nova'): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      // Check if browser supports Speech Synthesis
      const synth = window.speechSynthesis;
      if (!synth) {
        reject(new Error('Speech Synthesis not supported'));
        return;
      }

      // Cancel any ongoing speech
      synth.cancel();

      const utterance = new SpeechSynthesisUtterance(text);

      // Set voice properties based on voice personality
      utterance.rate = 1.0;
      utterance.pitch = voice === 'onyx' ? 0.7 : 1.0; // Slightly lower pitch for Onyx
      utterance.volume = 1.0;
      utterance.lang = 'en-US';

      // Handle completion
      utterance.onend = () => {
        resolve();
      };

      utterance.onerror = (event) => {
        reject(new Error(`Speech synthesis error: ${event.error}`));
      };

      // Get available voices and select appropriate one
      const voices = synth.getVoices();
      if (voices.length > 0) {
        // Select voice based on personality
        const selectedVoiceIndex = getVoiceIndexByPersonality(voice, voices.length);
        if (selectedVoiceIndex < voices.length) {
          utterance.voice = voices[selectedVoiceIndex];
        }
      }

      synth.speak(utterance);
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Helper to select voice index based on personality
 */
function getVoiceIndexByPersonality(voice: string, voiceCount: number): number {
  // Map voice personalities to voice indices
  // This uses available system voices (varies by OS)
  const mapping: Record<string, number> = {
    nova: 0, // First voice (usually female)
    alloy: 2, // Third voice (varies)
    fable: 1, // Second voice (varies)
    onyx: 3 // Fourth voice or cycle back
  };

  const index = mapping[voice] || 0;
  return index % voiceCount;
}

/**
 * Save conversation to local storage
 * In production, this would save to a database
 */
export async function saveConversation(
  tourId: string,
  messages: Message[],
  voicePreference: string
): Promise<string> {
  try {
    const conversationData = {
      id: `conv_${Date.now()}`,
      tourId,
      voicePreference,
      messages,
      timestamp: new Date().toISOString(),
      messageCount: messages.length
    };

    // For now, save to localStorage
    const conversations = JSON.parse(
      localStorage.getItem('ai_conversations') || '[]'
    );
    conversations.push(conversationData);
    localStorage.setItem('ai_conversations', JSON.stringify(conversations));

    // In production, would make API call:
    // const response = await fetch('/api/conversations', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(conversationData)
    // });
    // return response.json().id;

    return conversationData.id;
  } catch (error) {
    console.error('Error saving conversation:', error);
    throw error;
  }
}

/**
 * Load conversation history from storage
 */
export async function loadConversationHistory(tourId: string): Promise<Message[]> {
  try {
    const conversations = JSON.parse(
      localStorage.getItem('ai_conversations') || '[]'
    );
    const tourConversations = conversations.filter((c) => c.tourId === tourId);

    if (tourConversations.length > 0) {
      return tourConversations[0].messages;
    }

    return [];
  } catch (error) {
    console.error('Error loading conversation history:', error);
    return [];
  }
}

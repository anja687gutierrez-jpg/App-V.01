export interface ChatMessage {
  text: string;
  sender: 'user' | 'ai';
  timestamp: number;
}

export interface Interaction {
  suggestionId: string;
  action: 'accepted' | 'rejected';
  timestamp: number;
}

// This is a mock in-memory store for user interactions.
// In a real app, this would be stored in a database.
const interactionHistory: Interaction[] = [];
const chatHistory: ChatMessage[] = [];

export async function trackSuggestionInteraction(suggestionId: string, action: 'accepted' | 'rejected'): Promise<void> {
  const interaction: Interaction = {
    suggestionId,
    action,
    timestamp: Date.now(),
  };

  console.log('Tracking interaction:', interaction);
  interactionHistory.push(interaction);
  // In a real app, this would be saved to a user's profile or an analytics service.
}

export async function getInteractionHistory(): Promise<Interaction[]> {
  // In a real app, this would fetch from a database.
  return Promise.resolve(interactionHistory);
}

export async function saveChatMessage(message: Omit<ChatMessage, 'timestamp'>): Promise<ChatMessage> {
  const fullMessage: ChatMessage = {
    ...message,
    timestamp: Date.now(),
  };
  console.log('Saving chat message:', fullMessage);
  chatHistory.push(fullMessage);
  return fullMessage;
}

export async function getChatHistory(): Promise<ChatMessage[]> {
  return Promise.resolve(chatHistory);
}

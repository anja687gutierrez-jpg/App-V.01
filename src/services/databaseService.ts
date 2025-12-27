/**
 * Database Service for Persistence
 * Handles saving conversations, narration scripts, and user preferences
 */

import type { Message } from '@/types';

export interface ConversationRecord {
  id: string;
  tourId: string;
  userId?: string;
  messages: Message[];
  voicePreference: string;
  messageCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface NarrationScriptRecord {
  id: string;
  tourId: string;
  stopId: string;
  title: string;
  script: string;
  duration: number;
  audioUrl?: string;
  createdAt: string;
}

export interface UserVoicePreference {
  userId: string;
  preferredVoice: string;
  autoPlayEnabled: boolean;
  savedConversations: string[];
  lastUpdated: string;
}

class DatabaseService {
  private baseUrl = import.meta.env.VITE_API_URL || '/api';

  /**
   * Save a conversation to the database
   */
  async saveConversation(
    tourId: string,
    messages: Message[],
    voicePreference: string
  ): Promise<ConversationRecord> {
    try {
      const conversationData: Omit<ConversationRecord, 'id'> = {
        tourId,
        messages,
        voicePreference,
        messageCount: messages.length,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Try API call first (production)
      try {
        const response = await fetch(`${this.baseUrl}/conversations`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(conversationData)
        });

        if (response.ok) {
          return response.json();
        }
      } catch (apiError) {
        console.warn('API unavailable, falling back to localStorage:', apiError);
      }

      // Fallback to localStorage
      return this.saveConversationLocal(tourId, messages, voicePreference);
    } catch (error) {
      console.error('Error saving conversation:', error);
      throw error;
    }
  }

  /**
   * Save conversation to localStorage (fallback)
   */
  private saveConversationLocal(
    tourId: string,
    messages: Message[],
    voicePreference: string
  ): ConversationRecord {
    const record: ConversationRecord = {
      id: `conv_${Date.now()}`,
      tourId,
      messages,
      voicePreference,
      messageCount: messages.length,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const conversations = JSON.parse(
      localStorage.getItem('ai_conversations') || '[]'
    );
    conversations.push(record);
    localStorage.setItem('ai_conversations', JSON.stringify(conversations));

    return record;
  }

  /**
   * Load conversation history for a tour
   */
  async loadConversationHistory(tourId: string): Promise<Message[]> {
    try {
      // Try API first
      try {
        const response = await fetch(`${this.baseUrl}/conversations?tourId=${tourId}`);
        if (response.ok) {
          const data = await response.json();
          if (data && data.length > 0) {
            return data[0].messages;
          }
        }
      } catch (apiError) {
        console.warn('API unavailable, falling back to localStorage:', apiError);
      }

      // Fallback to localStorage
      return this.loadConversationHistoryLocal(tourId);
    } catch (error) {
      console.error('Error loading conversation history:', error);
      return [];
    }
  }

  /**
   * Load conversation from localStorage (fallback)
   */
  private loadConversationHistoryLocal(tourId: string): Message[] {
    const conversations = JSON.parse(
      localStorage.getItem('ai_conversations') || '[]'
    );
    const tourConversation = conversations.find((c) => c.tourId === tourId);

    return tourConversation ? tourConversation.messages : [];
  }

  /**
   * Save narration script to database
   */
  async saveNarrationScript(
    tourId: string,
    stopId: string,
    title: string,
    script: string,
    duration: number,
    audioUrl?: string
  ): Promise<NarrationScriptRecord> {
    try {
      const scriptData: Omit<NarrationScriptRecord, 'id'> = {
        tourId,
        stopId,
        title,
        script,
        duration,
        audioUrl,
        createdAt: new Date().toISOString()
      };

      // Try API call first
      try {
        const response = await fetch(`${this.baseUrl}/narration-scripts`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(scriptData)
        });

        if (response.ok) {
          return response.json();
        }
      } catch (apiError) {
        console.warn('API unavailable, falling back to localStorage:', apiError);
      }

      // Fallback to localStorage
      return this.saveNarrationScriptLocal(
        tourId,
        stopId,
        title,
        script,
        duration,
        audioUrl
      );
    } catch (error) {
      console.error('Error saving narration script:', error);
      throw error;
    }
  }

  /**
   * Save narration script to localStorage (fallback)
   */
  private saveNarrationScriptLocal(
    tourId: string,
    stopId: string,
    title: string,
    script: string,
    duration: number,
    audioUrl?: string
  ): NarrationScriptRecord {
    const record: NarrationScriptRecord = {
      id: `script_${Date.now()}`,
      tourId,
      stopId,
      title,
      script,
      duration,
      audioUrl,
      createdAt: new Date().toISOString()
    };

    const scripts = JSON.parse(
      localStorage.getItem('narration_scripts') || '[]'
    );
    scripts.push(record);
    localStorage.setItem('narration_scripts', JSON.stringify(scripts));

    return record;
  }

  /**
   * Get narration scripts for a tour
   */
  async getNarrationScripts(tourId: string): Promise<NarrationScriptRecord[]> {
    try {
      // Try API first
      try {
        const response = await fetch(
          `${this.baseUrl}/narration-scripts?tourId=${tourId}`
        );
        if (response.ok) {
          return response.json();
        }
      } catch (apiError) {
        console.warn('API unavailable, falling back to localStorage:', apiError);
      }

      // Fallback to localStorage
      return this.getNarrationScriptsLocal(tourId);
    } catch (error) {
      console.error('Error getting narration scripts:', error);
      return [];
    }
  }

  /**
   * Get narration scripts from localStorage (fallback)
   */
  private getNarrationScriptsLocal(tourId: string): NarrationScriptRecord[] {
    const scripts = JSON.parse(
      localStorage.getItem('narration_scripts') || '[]'
    );
    return scripts.filter((s) => s.tourId === tourId);
  }

  /**
   * Save user voice preferences
   */
  async saveVoicePreference(
    userId: string,
    voicePreference: Partial<UserVoicePreference>
  ): Promise<UserVoicePreference> {
    try {
      const preferenceData: UserVoicePreference = {
        userId,
        preferredVoice: voicePreference.preferredVoice || 'nova',
        autoPlayEnabled: voicePreference.autoPlayEnabled ?? true,
        savedConversations: voicePreference.savedConversations || [],
        lastUpdated: new Date().toISOString()
      };

      // Try API call first
      try {
        const response = await fetch(`${this.baseUrl}/user-preferences`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(preferenceData)
        });

        if (response.ok) {
          return response.json();
        }
      } catch (apiError) {
        console.warn('API unavailable, falling back to localStorage:', apiError);
      }

      // Fallback to localStorage
      return this.saveVoicePreferenceLocal(userId, preferenceData);
    } catch (error) {
      console.error('Error saving voice preference:', error);
      throw error;
    }
  }

  /**
   * Save voice preference to localStorage (fallback)
   */
  private saveVoicePreferenceLocal(
    userId: string,
    preference: UserVoicePreference
  ): UserVoicePreference {
    const preferences = JSON.parse(
      localStorage.getItem('user_preferences') || '{}'
    );
    preferences[userId] = preference;
    localStorage.setItem('user_preferences', JSON.stringify(preferences));

    return preference;
  }

  /**
   * Get user voice preferences
   */
  async getVoicePreference(userId: string): Promise<UserVoicePreference | null> {
    try {
      // Try API first
      try {
        const response = await fetch(
          `${this.baseUrl}/user-preferences/${userId}`
        );
        if (response.ok) {
          return response.json();
        }
      } catch (apiError) {
        console.warn('API unavailable, falling back to localStorage:', apiError);
      }

      // Fallback to localStorage
      return this.getVoicePreferenceLocal(userId);
    } catch (error) {
      console.error('Error getting voice preference:', error);
      return null;
    }
  }

  /**
   * Get voice preference from localStorage (fallback)
   */
  private getVoicePreferenceLocal(userId: string): UserVoicePreference | null {
    const preferences = JSON.parse(
      localStorage.getItem('user_preferences') || '{}'
    );
    return preferences[userId] || null;
  }
}

export const dbService = new DatabaseService();

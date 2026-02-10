import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Mic,
  MicOff,
  Send,
  Volume2,
  Loader,
  MessageCircle,
  Sparkles,
  Copy,
  RefreshCw,
  Save
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { startListening, stopListening } from '@/lib/voice';
import { generateAIResponse, speakText, getVoiceOptions } from '@/services/voiceService';
import { dbService } from '@/services/databaseService';
import type { Tour, RouteStop, TourPreferences, Message } from '@/types';

interface VoiceAssistantProps {
  activeTour: Tour;
  currentStop?: RouteStop;
  userPreferences?: TourPreferences;
  currentLocation?: { lat: number; lon: number };
  weather?: { temperature: number; description: string };
  onClose?: () => void;
}

export function VoiceAssistant({
  activeTour,
  currentStop,
  userPreferences,
  currentLocation,
  weather,
  onClose
}: VoiceAssistantProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState('nova');
  const [autoPlay, setAutoPlay] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const voiceOptions = getVoiceOptions();

  // Load conversation history on mount
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const history = await dbService.loadConversationHistory(activeTour.id);
        if (history && history.length > 0) {
          setMessages(history);
        }
      } catch (error) {
        console.error('Failed to load conversation history:', error);
      }
    };

    loadHistory();
  }, [activeTour.id]);

  // Auto-scroll to latest message
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSaveConversation = React.useCallback(async () => {
    if (messages.length === 0) {
      toast({
        title: 'Nothing to save',
        description: 'Start a conversation first.'
      });
      return;
    }

    setIsSaving(true);
    try {
      await dbService.saveConversation(activeTour.id, messages, selectedVoice);

      toast({
        title: '✅ Conversation Saved',
        description: `Saved ${messages.length} messages to your tour history.`
      });
    } catch (error) {
      console.error('Error saving conversation:', error);
      toast({
        title: 'Save Failed',
        description: 'Could not save conversation. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
  }, [messages, selectedVoice, activeTour.id, toast]);

  const handleVoiceInput = React.useCallback(async () => {
    if (isListening) {
      stopListening();
      setIsListening(false);
      return;
    }

    setIsListening(true);
    setTranscript('');

    try {
      startListening((result) => {
        setTranscript(result.transcript);

        if (result.isFinal) {
          handleSendMessage(result.transcript);
          setIsListening(false);
        }
      });
    } catch (error) {
      console.error('Voice input error:', error);
      toast({
        title: 'Voice Input Error',
        description: 'Could not start voice recognition. Please check your microphone.',
        variant: 'destructive'
      });
      setIsListening(false);
    }
  }, [isListening, toast]);

  const handleSendMessage = async (userMessage: string) => {
    if (!userMessage.trim()) return;

    // Add user message
    const userMsg: Message = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content: userMessage,
      timestamp: new Date()
    };

    setMessages((prev) => [...prev, userMsg]);
    setTranscript('');
    setIsLoading(true);

    try {
      // Generate AI response with context
      const aiResponse = await generateAIResponse(userMessage, {
        tourName: activeTour.name,
        currentStop: currentStop?.name,
        destination: userPreferences?.destination,
        interests: userPreferences?.interests,
        location: currentLocation,
        weather: weather,
        conversationHistory: messages,
        voice: selectedVoice
      });

      const assistantMsg: Message = {
        id: `msg_${Date.now() + 1}`,
        role: 'assistant',
        content: aiResponse.text,
        timestamp: new Date(),
        voicePersonality: selectedVoice
      };

      setMessages((prev) => [...prev, assistantMsg]);

      // Auto-play response if enabled
      if (autoPlay && !isSpeaking) {
        setIsSpeaking(true);
        await speakText(aiResponse.text, selectedVoice);
        setIsSpeaking(false);
      }

      toast({
        title: '✨ AI Response Generated',
        description: 'Your question has been answered.'
      });
    } catch (error) {
      console.error('AI response error:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate response. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSpeakMessage = async (message: Message) => {
    if (isSpeaking) return;

    setIsSpeaking(true);
    try {
      await speakText(message.content, selectedVoice);
    } catch (error) {
      console.error('Speech synthesis error:', error);
      toast({
        title: 'Speech Error',
        description: 'Could not play audio.',
        variant: 'destructive'
      });
    } finally {
      setIsSpeaking(false);
    }
  };

  const handleCopyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
    toast({
      title: 'Copied!',
      description: 'Message copied to clipboard.'
    });
  };

  const handleClearHistory = () => {
    setMessages([]);
    toast({
      title: 'Cleared',
      description: 'Conversation history cleared.'
    });
  };

  return (
    <Card className="h-full flex flex-col bg-gradient-to-br from-card/80 to-card/40">
      {/* Header */}
      <CardHeader className="pb-4 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="h-5 w-5 text-purple-500" />
            <CardTitle>AI Voice Assistant</CardTitle>
            {messages.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {messages.length} messages
              </Badge>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {messages.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleSaveConversation}
                disabled={isSaving}
                className="flex items-center space-x-1"
              >
                <Save className="h-4 w-4" />
                <span className="hidden sm:inline">Save</span>
              </Button>
            )}
            {onClose && (
              <Button variant="ghost" size="icon" onClick={onClose}>
                ✕
              </Button>
            )}
          </div>
        </div>

        {/* Voice Selection */}
        <div className="mt-3 flex items-center space-x-2 flex-wrap gap-2">
          <span className="text-xs font-medium text-muted-foreground">Voice:</span>
          {voiceOptions.map((voice) => (
            <Badge
              key={voice.id}
              variant={selectedVoice === voice.id ? 'default' : 'outline'}
              className="cursor-pointer"
              onClick={() => setSelectedVoice(voice.id)}
            >
              {voice.name}
            </Badge>
          ))}
        </div>

        {/* Auto-play toggle */}
        <div className="mt-2 flex items-center space-x-2">
          <Button
            variant={autoPlay ? 'default' : 'outline'}
            size="sm"
            onClick={() => setAutoPlay(!autoPlay)}
            className="flex items-center space-x-1"
          >
            <Volume2 className="h-4 w-4" />
            <span>Auto-play</span>
          </Button>
        </div>
      </CardHeader>

      {/* Messages */}
      <CardContent className="flex-1 overflow-hidden flex flex-col p-4">
        <ScrollArea className="flex-1 mb-4 pr-4">
          <div className="space-y-4">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-center text-muted-foreground">
                <MessageCircle className="h-8 w-8 mb-2 opacity-40" />
                <p className="text-sm">
                  Ask me anything about your journey through <strong>{activeTour.name}</strong>
                </p>
                {currentStop && (
                  <p className="text-xs mt-2">
                    Currently at: <strong>{currentStop.name}</strong>
                  </p>
                )}
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg p-3 ${
                      msg.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    <p className="text-sm">{msg.content}</p>

                    {msg.role === 'assistant' && (
                      <div className="flex items-center space-x-1 mt-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => handleSpeakMessage(msg)}
                          disabled={isSpeaking}
                        >
                          <Volume2 className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={() => handleCopyMessage(msg.content)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                        {msg.voicePersonality && (
                          <Badge variant="secondary" className="text-xs ml-1">
                            {msg.voicePersonality}
                          </Badge>
                        )}
                      </div>
                    )}

                    <span className="text-xs opacity-70 mt-1 block">
                      {msg.timestamp instanceof Date ? msg.timestamp.toLocaleTimeString() : new Date(msg.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                </div>
              ))
            )}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-lg p-3 flex items-center space-x-2">
                  <Loader className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Thinking...</span>
                </div>
              </div>
            )}

            <div ref={scrollRef} />
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="flex flex-col space-y-2 border-t pt-3">
          {/* Transcript Display */}
          {transcript && (
            <div className="bg-blue-50 dark:bg-blue-950 rounded p-2 text-sm border border-blue-200 dark:border-blue-800">
              <span className="text-muted-foreground">Listening: </span>
              <span className="font-medium">{transcript}</span>
            </div>
          )}

          {/* Input Controls */}
          <div className="flex items-center space-x-2">
            <Button
              variant={isListening ? 'destructive' : 'default'}
              size="sm"
              onClick={handleVoiceInput}
              className="flex items-center space-x-2 flex-1"
              disabled={isLoading}
            >
              {isListening ? (
                <>
                  <Mic className="h-4 w-4 animate-pulse" />
                  <span>Listening...</span>
                </>
              ) : (
                <>
                  <Mic className="h-4 w-4" />
                  <span>Voice Input</span>
                </>
              )}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => handleClearHistory()}
              className="flex items-center space-x-1"
              disabled={messages.length === 0}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>

          {/* Text Input Alternative */}
          <div className="flex items-center space-x-2">
            <input
              type="text"
              placeholder="Or type your question..."
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !isLoading) {
                  handleSendMessage(transcript);
                }
              }}
              className="flex-1 px-3 py-2 rounded border border-input bg-background text-sm"
              disabled={isLoading}
            />
            <Button
              size="sm"
              onClick={() => handleSendMessage(transcript)}
              disabled={isLoading || !transcript.trim()}
              className="flex items-center space-x-1"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

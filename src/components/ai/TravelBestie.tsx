/**
 * TravelBestie - AI Chat Component
 *
 * A floating chat widget that provides AI-powered travel recommendations.
 * Features:
 * - Collapsible chat window
 * - Message history with typing indicators
 * - Quick suggestion buttons
 * - Route-aware context
 * - Glass morphism styling
 * - Mobile-optimized with safe area support
 */

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import {
  MessageCircle,
  X,
  Send,
  Sparkles,
  MapPin,
  Utensils,
  Camera,
  Zap,
  Heart,
  Loader2,
  ChevronDown,
} from 'lucide-react';
import { aiService, type RouteContext, type AIResponse } from '@/services/aiService';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  suggestions?: AIResponse['suggestions'];
  timestamp: Date;
}

interface TravelBestieProps {
  routeContext?: RouteContext;
  onAddToRoute?: (suggestion: { name: string; lat?: number; lng?: number }) => void;
  className?: string;
}

export function TravelBestie({ routeContext, onAddToRoute, className }: TravelBestieProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const provider = aiService.getProvider();
  const quickPrompts = aiService.getQuickPrompts(routeContext);

  // Add welcome message on first open
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage: Message = {
        id: 'welcome',
        role: 'assistant',
        content: routeContext?.tripName
          ? `Hey! I see you're planning "${routeContext.tripName}" - exciting! I can help you find amazing stops, great food, and hidden gems along your route. What would you like to know?`
          : `Hey there! I'm your Travel Bestie, here to help make your road trip unforgettable. Ask me about places to see, where to eat, photo spots, or charging stops. What's on your mind?`,
        timestamp: new Date(),
      };
      setMessages([welcomeMessage]);
    }
  }, [isOpen, routeContext]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && !isMinimized && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, isMinimized]);

  const handleSend = async (text: string) => {
    if (!text.trim() || isTyping) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    try {
      const response = await aiService.chat(text, routeContext);

      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: 'assistant',
        content: response.message,
        suggestions: response.suggestions,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('[TravelBestie] Error:', error);
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: 'Oops, I hit a small bump in the road! Could you try asking again?',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleQuickPrompt = (prompt: string) => {
    handleSend(prompt);
  };

  const handleAddToRoute = (suggestion: NonNullable<AIResponse['suggestions']>[0]) => {
    if (onAddToRoute) {
      onAddToRoute({
        name: suggestion.name,
        lat: suggestion.lat,
        lng: suggestion.lng,
      });
    }
  };

  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case 'restaurant':
        return <Utensils className="h-3 w-3" />;
      case 'photo-spot':
        return <Camera className="h-3 w-3" />;
      case 'charging':
        return <Zap className="h-3 w-3" />;
      case 'hidden-gem':
        return <Sparkles className="h-3 w-3" />;
      default:
        return <MapPin className="h-3 w-3" />;
    }
  };

  // Floating button when closed
  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className={cn(
          'fixed z-50 h-14 w-14 rounded-full shadow-lg touch-target',
          'bg-gradient-to-br from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700',
          'transition-all duration-300 hover:scale-110 active:scale-95',
          // Safe area positioning for mobile
          'right-4 sm:right-6',
          'bottom-[calc(1.5rem+env(safe-area-inset-bottom,0px))] sm:bottom-6',
          className
        )}
        size="icon"
      >
        <Heart className="h-6 w-6 text-white fill-white" />
        <span className="absolute -top-1 -right-1 h-4 w-4 bg-green-500 rounded-full border-2 border-white animate-pulse" />
      </Button>
    );
  }

  return (
    <div
      className={cn(
        'fixed z-50 animate-scale-in',
        // Mobile-first positioning with safe area support
        'right-2 sm:right-6',
        'bottom-[calc(1rem+env(safe-area-inset-bottom,0px))] sm:bottom-6',
        // Responsive width
        'w-[calc(100vw-1rem)] sm:w-[380px] max-w-[400px]',
        'rounded-2xl shadow-2xl',
        'bg-white/95 backdrop-blur-xl border border-white/20',
        'transition-all duration-300',
        isMinimized ? 'h-16' : 'h-[480px] sm:h-[520px] max-h-[calc(100vh-6rem)]',
        className
      )}
    >
      {/* Header */}
      <div
        className={cn(
          'flex items-center justify-between px-4 py-3',
          'bg-gradient-to-r from-pink-500 to-rose-600',
          'rounded-t-2xl cursor-pointer touch-target'
        )}
        onClick={() => setIsMinimized(!isMinimized)}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
            <Heart className="h-5 w-5 text-white fill-white" />
          </div>
          <div>
            <h3 className="font-bold text-white text-sm">Travel Bestie</h3>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
              <span className="text-[10px] text-white/80 uppercase tracking-wide">
                {provider === 'demo' ? 'Demo Mode' : 'AI Active'}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 touch-target text-white/80 hover:text-white hover:bg-white/10 active:scale-95"
            onClick={(e) => {
              e.stopPropagation();
              setIsMinimized(!isMinimized);
            }}
          >
            <ChevronDown className={cn('h-4 w-4 transition-transform', isMinimized && 'rotate-180')} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 touch-target text-white/80 hover:text-white hover:bg-white/10 active:scale-95"
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen(false);
            }}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Chat Content */}
      {!isMinimized && (
        <>
          {/* Messages */}
          <ScrollArea className="flex-1 h-[300px] sm:h-[340px] p-4" ref={scrollRef}>
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    'flex gap-3',
                    message.role === 'user' ? 'flex-row-reverse' : ''
                  )}
                >
                  {/* Avatar */}
                  <div
                    className={cn(
                      'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
                      message.role === 'assistant'
                        ? 'bg-gradient-to-br from-pink-100 to-rose-100 text-pink-600'
                        : 'bg-slate-100 text-slate-600'
                    )}
                  >
                    {message.role === 'assistant' ? (
                      <Heart className="h-4 w-4" />
                    ) : (
                      <MessageCircle className="h-4 w-4" />
                    )}
                  </div>

                  {/* Message Bubble */}
                  <div
                    className={cn(
                      'max-w-[80%] px-4 py-2.5 rounded-2xl',
                      message.role === 'assistant'
                        ? 'bg-slate-50 text-slate-700 rounded-tl-sm'
                        : 'bg-gradient-to-br from-pink-500 to-rose-600 text-white rounded-tr-sm'
                    )}
                  >
                    <p className="text-sm leading-relaxed">{message.content}</p>

                    {/* Suggestions */}
                    {message.suggestions && message.suggestions.length > 0 && (
                      <div className="mt-3 space-y-2">
                        {message.suggestions.map((suggestion, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between gap-2 p-2 bg-white rounded-lg border border-slate-100"
                          >
                            <div className="flex items-center gap-2">
                              <div className="p-1.5 rounded-md bg-pink-50 text-pink-600">
                                {getSuggestionIcon(suggestion.type)}
                              </div>
                              <div>
                                <p className="text-xs font-semibold text-slate-900">
                                  {suggestion.name}
                                </p>
                                <p className="text-[10px] text-slate-500">
                                  {suggestion.description}
                                </p>
                              </div>
                            </div>
                            {onAddToRoute && (
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 text-[10px] px-2 touch-target"
                                onClick={() => handleAddToRoute(suggestion)}
                              >
                                <MapPin className="h-3 w-3 mr-1" />
                                Add
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {/* Typing Indicator */}
              {isTyping && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-100 to-rose-100 flex items-center justify-center text-pink-600">
                    <Heart className="h-4 w-4" />
                  </div>
                  <div className="bg-slate-50 px-4 py-3 rounded-2xl rounded-tl-sm">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Quick Prompts */}
          <div className="px-4 pb-2">
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {quickPrompts.map((prompt, idx) => (
                <Badge
                  key={idx}
                  variant="outline"
                  className="cursor-pointer whitespace-nowrap bg-white hover:bg-pink-50 hover:border-pink-200 hover:text-pink-700 transition-colors touch-target py-2"
                  onClick={() => handleQuickPrompt(prompt)}
                >
                  {prompt}
                </Badge>
              ))}
            </div>
          </div>

          {/* Input */}
          <div className="p-4 pt-2 border-t border-slate-100 safe-bottom">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend(inputValue);
              }}
              className="flex gap-2"
            >
              <Input
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Ask me anything about your trip..."
                className="flex-1 bg-slate-50 border-slate-200 focus-visible:ring-pink-500 h-11"
                disabled={isTyping}
              />
              <Button
                type="submit"
                size="icon"
                disabled={isTyping || !inputValue.trim()}
                className="h-11 w-11 touch-target bg-gradient-to-br from-pink-500 to-rose-600 hover:from-pink-600 hover:to-rose-700 active:scale-95"
              >
                {isTyping ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </form>

            {/* Provider indicator */}
            {provider === 'demo' && (
              <p className="text-[10px] text-slate-400 text-center mt-2">
                Demo mode - Add VITE_GROQ_API_KEY for full AI
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}

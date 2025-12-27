import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageSquare, Send } from 'lucide-react';
import { getChatHistory, saveChatMessage } from '@/lib/learning';

interface Message {
  text: string;
  sender: 'user' | 'ai';
}

// A more advanced mock AI that can respond to keywords
async function getAIResponse(userMessage: string, history: Message[]): Promise<string> {
  await new Promise(resolve => setTimeout(resolve, 1000));
  const lowerCaseMessage = userMessage.toLowerCase();

  if (lowerCaseMessage.includes('restaurant')) {
    return 'I found a highly-rated Italian restaurant nearby called "La Trattoria". Would you like to add it to your route?';
  }
  if (lowerCaseMessage.includes('history')) {
    return 'The Golden Gate Bridge was completed in 1937 and was the longest suspension bridge in the world at the time.';
  }
  if (history.length > 2) {
    return 'Is there anything else I can help you with on your journey?';
  }
  return 'I can help with recommendations, historical facts, or trip adjustments. What would you like to know?';
}

export function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadHistory = async () => {
      const history = await getChatHistory();
      setMessages(history);
    };
    loadHistory();
  }, []);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (inputValue.trim() === '' || isLoading) return;

    const userMessage: Message = { text: inputValue, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);
    saveChatMessage(userMessage);
    setInputValue('');
    setIsLoading(true);

    const aiResponseText = await getAIResponse(userMessage.text, messages);
    const aiMessage: Message = { text: aiResponseText, sender: 'ai' };

    setMessages(prev => [...prev, aiMessage]);
    saveChatMessage(aiMessage);
    setIsLoading(false);
  };

  return (
    <Card className="w-full h-[400px] flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><MessageSquare className="h-5 w-5" /> AI Chat</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-4 overflow-hidden">
        <ScrollArea className="flex-1 pr-4" ref={scrollAreaRef}>
          <div className="space-y-4">
            {messages.map((msg, index) => (
              <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`px-4 py-2 rounded-lg ${msg.sender === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                  {msg.text}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
        <div className="flex gap-2">
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Ask a question..."
          />
          <Button onClick={handleSendMessage}><Send className="h-4 w-4" /></Button>
        </div>
      </CardContent>
    </Card>
  );
}

import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { avatarStyles } from '@/data/options';
import { Check, Zap, Brain, Smile } from 'lucide-react';

interface AvatarSelectorProps {
  selectedAvatar: string;
  onSelect: (id: string) => void;
}

export function AvatarSelector({ selectedAvatar, onSelect }: AvatarSelectorProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {avatarStyles.map((avatar) => {
        const isSelected = selectedAvatar === avatar.id;
        
        return (
          <div 
            key={avatar.id}
            onClick={() => onSelect(avatar.id)}
            className={`
              relative cursor-pointer group transition-all duration-300 transform
              ${isSelected ? 'scale-105 ring-4 ring-primary ring-offset-2' : 'hover:scale-105 hover:opacity-90'}
            `}
          >
            <Card className={`overflow-hidden border-2 ${isSelected ? 'border-primary' : 'border-transparent'}`}>
              {/* Character Image Area */}
              <div className={`h-32 ${avatar.color} flex items-center justify-center relative`}>
                <img 
                  src={`https://api.dicebear.com/9.x/${avatar.id}/svg?seed=${avatar.seed}`}
                  alt={avatar.name}
                  className="w-24 h-24 drop-shadow-lg transition-transform duration-500 group-hover:-translate-y-2"
                  onError={(e) => {
                    // Fallback if image fails to load
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
                {isSelected && (
                  <div className="absolute top-2 right-2 bg-primary text-white rounded-full p-1 shadow-md">
                    <Check className="h-4 w-4" />
                  </div>
                )}
              </div>

              {/* Character Stats & Info */}
              <div className="p-4 bg-card">
                <h3 className="font-bold text-lg text-center mb-1">{avatar.name}</h3>
                <p className="text-xs text-muted-foreground text-center mb-4 min-h-[32px]">
                  {avatar.description}
                </p>

                {/* "Game Stats" Bars */}
                <div className="space-y-2">
                  <div className="flex items-center text-xs">
                    <Zap className="h-3 w-3 mr-2 text-yellow-500" />
                    <div className="w-full bg-secondary h-1.5 rounded-full overflow-hidden">
                      <div className="bg-yellow-500 h-full" style={{ width: `${avatar.stats.speed}%` }} />
                    </div>
                  </div>
                  <div className="flex items-center text-xs">
                    <Brain className="h-3 w-3 mr-2 text-blue-500" />
                    <div className="w-full bg-secondary h-1.5 rounded-full overflow-hidden">
                      <div className="bg-blue-500 h-full" style={{ width: `${avatar.stats.knowledge}%` }} />
                    </div>
                  </div>
                  <div className="flex items-center text-xs">
                    <Smile className="h-3 w-3 mr-2 text-pink-500" />
                    <div className="w-full bg-secondary h-1.5 rounded-full overflow-hidden">
                      <div className="bg-pink-500 h-full" style={{ width: `${avatar.stats.humor}%` }} />
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        );
      })}
    </div>
  );
}


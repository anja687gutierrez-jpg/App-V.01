import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Clock, 
  Star, 
  MapPin,
  ChevronRight,
  Lightbulb
} from 'lucide-react';

interface SmartSuggestionItem {
  id: string;
  type: 'detour' | 'stop' | 'optimization' | 'discovery';
  title: string;
  description: string;
  timeAdded: string;
  rating: number;
  icon?: React.ReactNode;
  category?: string;
  details?: {
    distance?: string;
    address?: string;
    tags?: string[];
  };
}

interface SmartSuggestionsProps {
  suggestions?: SmartSuggestionItem[];
  onAccept?: (suggestionId: string) => void;
  onReject?: (suggestionId: string) => void;
  loading?: boolean;
}

export function SmartSuggestion({
  suggestions = [],
  onAccept = () => {},
  onReject = () => {},
  loading = false
}: SmartSuggestionsProps) {
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());

  const handleAccept = (suggestionId: string) => {
    onAccept(suggestionId);
    setDismissedIds(new Set([...dismissedIds, suggestionId]));
  };

  const handleReject = (suggestionId: string) => {
    onReject(suggestionId);
    setDismissedIds(new Set([...dismissedIds, suggestionId]));
  };

  const visibleSuggestions = suggestions.filter(s => !dismissedIds.has(s.id));

  if (visibleSuggestions.length === 0 && !loading) {
    return null;
  }

  return (
    <div className="space-y-4">
      {visibleSuggestions.map((suggestion) => (
        <Card 
          key={suggestion.id}
          className="overflow-hidden border-l-4 border-l-purple-500 hover:shadow-md transition-shadow"
        >
          <CardContent className="p-0">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 sm:p-6 gap-4">
              {/* Left Content */}
              <div className="flex-1 min-w-0">
                {/* Header with Badge */}
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <Lightbulb className="h-4 w-4 text-purple-600 dark:text-purple-400 flex-shrink-0" />
                    <Badge 
                      variant="secondary"
                      className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-700"
                    >
                      Smart Suggestion
                    </Badge>
                  </div>
                </div>

                {/* Title and Category */}
                <div className="mb-3">
                  <h3 className="text-lg font-semibold text-foreground break-words">
                    {suggestion.type === 'detour' ? 'Detour:' : ''} {suggestion.title}
                  </h3>
                  {suggestion.description && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {suggestion.description}
                    </p>
                  )}
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-3">
                  {/* Time Added */}
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-blue-500 flex-shrink-0" />
                    <span className="text-muted-foreground">
                      <span className="font-medium text-foreground">Time Added:</span> {suggestion.timeAdded}
                    </span>
                  </div>

                  {/* Rating */}
                  <div className="flex items-center gap-2 text-sm">
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 flex-shrink-0" />
                      <span className="text-muted-foreground">
                        <span className="font-medium text-foreground">{suggestion.rating.toFixed(1)}</span>/5.0
                      </span>
                    </div>
                  </div>

                  {/* Distance or Category */}
                  {suggestion.details?.distance && (
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-green-500 flex-shrink-0" />
                      <span className="text-muted-foreground">{suggestion.details.distance}</span>
                    </div>
                  )}
                </div>

                {/* Tags */}
                {suggestion.details?.tags && suggestion.details.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {suggestion.details.tags.map((tag, idx) => (
                      <Badge 
                        key={idx}
                        variant="outline"
                        className="text-xs"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="flex gap-2 sm:flex-col sm:gap-2 w-full sm:w-auto flex-shrink-0">
                <Button
                  onClick={() => handleAccept(suggestion.id)}
                  className="flex-1 sm:w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                  size="sm"
                >
                  <span className="hidden sm:inline">Accept</span>
                  <span className="sm:hidden">Accept</span>
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
                <Button
                  onClick={() => handleReject(suggestion.id)}
                  variant="outline"
                  size="sm"
                  className="flex-1 sm:w-full"
                >
                  Dismiss
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Loading State */}
      {loading && (
        <Card className="border-l-4 border-l-purple-500/50">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="h-4 w-4 bg-purple-500 rounded-full animate-spin" />
              <p className="text-muted-foreground">AI is thinking of suggestions...</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

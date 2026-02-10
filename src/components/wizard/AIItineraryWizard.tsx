import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Sparkles, Wand2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { fetchUserProfile } from '@/lib/user';
import { travelStyles, vehicleTypes, interests, budgetLevels, accommodationTypes } from '@/data/options';
import type { TourPreferences, Tour, RouteStop } from '@/types';

interface AIItineraryWizardProps {
  trigger?: React.ReactNode;
  onTourGenerated?: (tour: Tour, routeStops: RouteStop[]) => void;
}


export function AIItineraryWizard({ trigger, onTourGenerated }: AIItineraryWizardProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [preferences, setPreferences] = useState<TourPreferences>({
    destination: '',
    duration: 3,
    interests: [],
    accommodationType: 'hotel',
    vehicleType: 'ev',
    vehicleRange: 300,
    budget: 'medium',
    travelStyle: 'adventure',
    avatarStyle: 'guide',
    currency: 'USD',
    pace: 'Balanced'
  });
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      const loadProfile = async () => {
        setLoading(true);
        try {
          const userProfile = await fetchUserProfile();
          setPreferences(userProfile.preferences);
        } catch (error) {
          console.error("Failed to load user profile", error);
          toast({
            title: "Could not load profile",
            description: "Using default preferences.",
            variant: "destructive",
          });
        } finally {
          setLoading(false);
        }
      };
      loadProfile();
    }
  }, [open, toast]);

  const parseAIPrompt = async (prompt: string): Promise<Partial<TourPreferences>> => {
    if (!prompt.trim()) return {};
    // Mock AI parsing
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay
    const mockParsedData: Partial<TourPreferences> = {
      destination: 'California Coast',
      duration: 5,
      interests: ['beaches', 'nature', 'food'],
      vehicleType: 'car',
      budget: 'medium',
      travelStyle: 'cultural',
      accommodationType: 'hotel'
    };
    return mockParsedData;
  };

  const handleAIPromptSubmit = async () => {
    if (!aiPrompt.trim()) return;
    setLoading(true);
    try {
      const parsed = await parseAIPrompt(aiPrompt);
      setPreferences(prev => ({
        ...prev,
        ...parsed,
        interests: Array.isArray(parsed.interests) ? parsed.interests : prev.interests,
        vehicleRange: vehicleTypes.find(v => v.id === parsed.vehicleType)?.range || prev.vehicleRange
      }));

      toast({ title: 'AI Analysis Complete', description: 'Preferences updated.' });
    } catch { 
      toast({ title: 'AI Parsing Failed', description: 'You can set preferences manually.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const generateIntelligentItinerary = async () => {
    if (!preferences.destination || !preferences.interests.length) {
      toast({ title: 'Missing Information', description: 'Please specify a destination and at least one interest.', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      const tourName = `${preferences.destination} ${preferences.travelStyle.charAt(0).toUpperCase() + preferences.travelStyle.slice(1)} Journey`;

      const tour: Tour = {
        id: `tour_${Date.now()}`,
        name: tourName,
        destination: preferences.destination,
        preferences,
        status: 'draft',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      
      const routeStops: RouteStop[] = [];
      let stopOrder = 1;

      for (const interest of preferences.interests.slice(0, 5)) {
        const lat = 37.7749 + (Math.random() - 0.5) * 0.1;
        const lng = -122.4194 + (Math.random() - 0.5) * 0.1;
        const stop: RouteStop = {
          id: `stop_${Date.now()}_${stopOrder}`,
          tourId: tour.id,
          type: interest === 'food' ? 'restaurant' : 'poi',
          name: `${interest.charAt(0).toUpperCase() + interest.slice(1)} Experience`,
          description: `Curated ${interest} experience in ${preferences.destination}`,
          location: { lat, lng },
          address: preferences.destination || 'Unknown',
          order: stopOrder,
          latitude: lat,
          longitude: lng,
          stopOrder,
          rating: 4 + Math.random(),
          estimatedTime: 60 + Math.random() * 120,
          createdAt: new Date().toISOString()
        };
        routeStops.push(stop);
        stopOrder++;
      }

      if (preferences.vehicleType === 'ev') {
        const lat = 37.7849 + (Math.random() - 0.5) * 0.1;
        const lng = -122.4094 + (Math.random() - 0.5) * 0.1;
        const chargingStop: RouteStop = {
          id: `charging_${Date.now()}`,
          tourId: tour.id,
          type: 'charging',
          name: 'Tesla Supercharger',
          description: '250kW fast charging with amenities',
          location: { lat, lng },
          address: 'Tesla Supercharger Station',
          order: stopOrder,
          latitude: lat,
          longitude: lng,
          stopOrder,
          estimatedTime: 30,
          chargingInfo: { connectorTypes: ['Tesla Supercharger', 'CCS'], maxPower: 250, pricing: '$0.28/kWh' },
          amenities: JSON.stringify(['Restaurant', 'WiFi', 'Restrooms', 'Shopping']),
          createdAt: new Date().toISOString()
        };
        routeStops.push(chargingStop);
      }

      if (routeStops.length > 0) {
        // Data is now handled in-memory, no database call needed
      }

      toast({ title: 'Intelligent Itinerary Created!', description: `Your ${preferences.duration}-day ${preferences.destination} adventure is ready!` });

      onTourGenerated?.(tour, routeStops);
      setOpen(false);
      setAiPrompt('');
      setPreferences({ destination: '', duration: 3, interests: [], accommodationType: 'hotel', vehicleType: 'ev', vehicleRange: 300, budget: 'medium', travelStyle: 'adventure', avatarStyle: 'guide', currency: 'USD', pace: 'Balanced' });
    } catch (error) {
      console.error('Failed to generate itinerary:', error);
      toast({ title: 'Generation Failed', description: 'Unable to create itinerary. Please try again.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const toggleInterest = (interestId: string) => {
    setPreferences(prev => ({
      ...prev,
      interests: prev.interests.includes(interestId) ? prev.interests.filter(i => i !== interestId) : [...prev.interests, interestId]
    }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
            <Sparkles className="h-4 w-4 mr-2" />
            AI Trip Wizard
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Wand2 className="h-5 w-5 text-purple-600" />
            <span>AI-Powered Trip Wizard</span>
          </DialogTitle>
          <DialogDescription>Describe your dream trip in natural language, and I'll create the perfect intelligent itinerary for you.</DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-3">
            <Label htmlFor="ai-prompt" className="flex items-center space-x-2">
              <Sparkles className="h-4 w-4 text-purple-600" />
              <span>Tell me about your dream trip</span>
            </Label>
            <Textarea id="ai-prompt" placeholder="I want to explore California's coast for 5 days..." value={aiPrompt} onChange={(e) => setAiPrompt(e.target.value)} rows={4} className="resize-none" />
            <Button onClick={handleAIPromptSubmit} disabled={loading || !aiPrompt.trim()} variant="outline" className="w-full">
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                  Analyzing your preferences...
                </div>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Parse with AI
                </>
              )}
            </Button>
          </div>

          <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent" />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="destination">Destination</Label>
              <Input id="destination" placeholder="e.g., San Francisco, CA" value={preferences.destination} onChange={(e) => setPreferences(prev => ({ ...prev, destination: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Duration: {preferences.duration} days</Label>
              <Slider value={[preferences.duration]} onValueChange={([value]) => setPreferences(prev => ({ ...prev, duration: value }))} max={14} min={1} step={1} className="mt-2" />
            </div>
          </div>

          <div className="space-y-3">
            <Label>Travel Style</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {travelStyles.map((style) => (
                <button key={style.id} className={`p-4 rounded-lg border-2 transition-all ${preferences.travelStyle === style.id ? 'border-purple-500 bg-purple-50 ring-2 ring-purple-200' : 'border-gray-200 hover:border-gray-300'}`} onClick={() => setPreferences(prev => ({ ...prev, travelStyle: style.id }))}>
                  <div className="text-2xl mb-2">{style.emoji}</div>
                  <h4 className="font-semibold text-sm">{style.name}</h4>
                  <p className="text-xs text-muted-foreground mt-1">{style.description}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <Label>Vehicle Type</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {vehicleTypes.map((vehicle) => (
                <button key={vehicle.id} className={`p-3 rounded-lg border-2 transition-all text-center ${preferences.vehicleType === vehicle.id ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200' : 'border-gray-200 hover:border-gray-300'}`} onClick={() => setPreferences(prev => ({ ...prev, vehicleType: vehicle.id as 'car' | 'ev' | 'suv' | 'rv', vehicleRange: vehicle.range }))}>
                  <div className="text-xl mb-1">{vehicle.emoji}</div>
                  <div className="text-sm font-semibold">{vehicle.name}</div>
                  <div className="text-xs text-muted-foreground">{vehicle.range} mi range</div>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <Label>What interests you? (Select multiple)</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {interests.map((interest) => {
                const isSelected = preferences.interests.includes(interest.id);
                return (
                  <button key={interest.id} className={`p-3 rounded-lg border transition-all ${isSelected ? 'border-green-500 bg-green-50 text-green-800' : 'border-gray-200 hover:border-gray-300 text-gray-700'}`} onClick={() => toggleInterest(interest.id)}>
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{interest.emoji}</span>
                      <span className="text-sm font-medium">{interest.name}</span>
                    </div>
                  </button>
                );
              })}
            </div>
            {preferences.interests.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {preferences.interests.map((interestId) => {
                  const interest = interests.find(i => i.id === interestId);
                  return <Badge key={interestId} variant="secondary">{interest?.emoji} {interest?.name}</Badge>;
                })}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label>Budget Level</Label>
              <div className="space-y-2">
                {budgetLevels.map((budget) => (
                  <button key={budget.id} className={`w-full p-3 rounded-lg border transition-all ${preferences.budget === budget.id ? 'border-yellow-500 bg-yellow-50 text-yellow-800' : 'border-gray-200 hover:border-gray-300'}`} onClick={() => setPreferences(prev => ({ ...prev, budget: budget.id as 'low' | 'medium' | 'high' }))}>
                    <span className="text-lg mr-2">{budget.emoji}</span>
                    {budget.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <Label>Accommodation</Label>
              <div className="space-y-2">
                {accommodationTypes.map((acc) => (
                  <button key={acc.id} className={`w-full p-3 rounded-lg border transition-all ${preferences.accommodationType === acc.id ? 'border-green-500 bg-green-50 text-green-800' : 'border-gray-200 hover:border-gray-300'}`} onClick={() => setPreferences(prev => ({ ...prev, accommodationType: acc.id as 'hotel' | 'camping' }))}>
                    <span className="text-lg mr-2">{acc.emoji}</span>
                    {acc.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-6 border-t">
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={generateIntelligentItinerary} disabled={loading || !preferences.destination} className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Creating Your Adventure...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Generate Intelligent Itinerary
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

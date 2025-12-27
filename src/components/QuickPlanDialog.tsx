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
import { Badge } from '@/components/ui/badge';
import { 
  Route, 
  MapPin, 
  Car,
  Battery,
  Utensils,
  Camera,
  Fuel
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { fetchUserProfile } from '@/lib/user';

interface Route {
  id: string;
  userId: string;
  name: string;
  startLocation: string;
  endLocation: string;
  distanceKm: number;
  estimatedDurationHours: number;
  preferences: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface QuickPlanDialogProps {
  trigger?: React.ReactNode;
  onRouteCreated?: (route: Route) => void;
}

const travelStyles = [
  { id: 'adventure', name: 'Adventure', description: 'Outdoor activities, hiking, camping' },
  { id: 'luxury', name: 'Luxury', description: 'Fine dining, premium hotels, spas' },
  { id: 'family', name: 'Family', description: 'Kid-friendly activities, playgrounds' },
  { id: 'budget', name: 'Budget', description: 'Affordable options, free attractions' },
  { id: 'business', name: 'Business', description: 'Efficient travel, work-friendly stops' }
];

const vehicleTypes = [
  { id: 'car', name: 'Car', icon: Car },
  { id: 'ev', name: 'Electric Vehicle', icon: Battery },
  { id: 'suv', name: 'SUV', icon: Car },
  { id: 'rv', name: 'RV', icon: Car }
];

const interests = [
  { id: 'restaurants', name: 'Restaurants', icon: Utensils },
  { id: 'attractions', name: 'Attractions', icon: Camera },
  { id: 'gas_stations', name: 'Gas Stations', icon: Fuel },
  { id: 'hotels', name: 'Hotels', icon: MapPin },
  { id: 'parks', name: 'Parks', icon: Camera },
  { id: 'shopping', name: 'Shopping', icon: MapPin }
];

export function QuickPlanDialog({ trigger, onRouteCreated }: QuickPlanDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    startLocation: '',
    endLocation: '',
    travelStyle: 'adventure',
    vehicleType: 'car',
    selectedInterests: [] as string[]
  });
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      const loadProfile = async () => {
        try {
          const userProfile = await fetchUserProfile();
          setFormData(prev => ({
            ...prev,
            travelStyle: userProfile.preferences.travelStyle,
            vehicleType: userProfile.preferences.vehicleType,
            selectedInterests: userProfile.preferences.interests.slice(0, 3), // Limit to a few for quick plan
          }));
        } catch (error) {
          console.error("Failed to load user profile for Quick Plan", error);
        }
      };
      loadProfile();
    }
  }, [open]);

  const handleSubmit = async () => {
    if (!formData.startLocation || !formData.endLocation) {
      toast({
        title: 'Missing Information',
        description: 'Please enter both start and end locations.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay

      const routeName = formData.name || `${formData.startLocation} to ${formData.endLocation}`;

      const route = {
        id: `route_${Date.now()}`,
        userId: 'user_demo',
        name: routeName,
        startLocation: formData.startLocation,
        endLocation: formData.endLocation,
        distanceKm: Math.random() * 500 + 50,
        estimatedDurationHours: Math.random() * 8 + 1,
        preferences: JSON.stringify({
          travelStyle: formData.travelStyle,
          vehicleType: formData.vehicleType,
          interests: formData.selectedInterests,
        }),
        status: 'draft',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const samplePois = formData.selectedInterests.slice(0, 3).map((interest, index) => ({
        id: `poi_${Date.now()}_${index}`,
        routeId: route.id,
        userId: 'user_demo',
        name: `Sample ${interest.charAt(0).toUpperCase() + interest.slice(1)}`,
        description: `Recommended ${interest} along your route`,
        category: interest,
        latitude: 37.7749 + (Math.random() - 0.5) * 2,
        longitude: -122.4194 + (Math.random() - 0.5) * 2,
        address: '123 Sample St, Sample City',
        rating: 4 + Math.random(),
        isFavorite: 0,
        visitStatus: 'planned',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));

      console.log('Mock POIs created:', samplePois);

      toast({
        title: 'Route Created! 🎉',
        description: `Your ${routeName} route is ready for adventure.`,
      });

      onRouteCreated?.(route);
      setOpen(false);
      setFormData({
        name: '',
        startLocation: '',
        endLocation: '',
        travelStyle: 'adventure',
        vehicleType: 'car',
        selectedInterests: [],
      });
    } catch (error) {
      console.error('Error creating route:', error);
      toast({
        title: 'Error',
        description: 'Failed to create route. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleInterest = (interestId: string) => {
    setFormData(prev => ({
      ...prev,
      selectedInterests: prev.selectedInterests.includes(interestId)
        ? prev.selectedInterests.filter(id => id !== interestId)
        : [...prev.selectedInterests, interestId]
    }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Route className="h-4 w-4 mr-2" />
            Quick Plan
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Route className="h-5 w-5 text-primary" />
            <span>Quick Route Planner</span>
          </DialogTitle>
          <DialogDescription>
            Create a personalized route with AI-powered recommendations in seconds.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Route Details */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="route-name">Route Name (Optional)</Label>
              <Input
                id="route-name"
                placeholder="e.g., California Coast Adventure"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start">Start Location</Label>
                <Input
                  id="start"
                  placeholder="e.g., San Francisco, CA"
                  value={formData.startLocation}
                  onChange={(e) => setFormData(prev => ({ ...prev, startLocation: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end">End Location</Label>
                <Input
                  id="end"
                  placeholder="e.g., Los Angeles, CA"
                  value={formData.endLocation}
                  onChange={(e) => setFormData(prev => ({ ...prev, endLocation: e.target.value }))}
                />
              </div>
            </div>
          </div>

          {/* Travel Style */}
          <div className="space-y-3">
            <Label>Travel Style</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {travelStyles.map((style) => (
                <div
                  key={style.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    formData.travelStyle === style.id
                      ? 'border-primary bg-primary/5 ring-1 ring-primary'
                      : 'border-border hover:border-primary/50'
                  }`}
                  onClick={() => setFormData(prev => ({ ...prev, travelStyle: style.id }))}
                >
                  <h4 className="font-medium">{style.name}</h4>
                  <p className="text-xs text-muted-foreground">{style.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Vehicle Type */}
          <div className="space-y-3">
            <Label>Vehicle Type</Label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {vehicleTypes.map((vehicle) => {
                const Icon = vehicle.icon;
                return (
                  <div
                    key={vehicle.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-all text-center ${
                      formData.vehicleType === vehicle.id
                        ? 'border-primary bg-primary/5 ring-1 ring-primary'
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => setFormData(prev => ({ ...prev, vehicleType: vehicle.id }))}
                  >
                    <Icon className="h-5 w-5 mx-auto mb-1" />
                    <p className="text-sm font-medium">{vehicle.name}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Interests */}
          <div className="space-y-3">
            <Label>What interests you? (Select all that apply)</Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {interests.map((interest) => {
                const Icon = interest.icon;
                const isSelected = formData.selectedInterests.includes(interest.id);
                return (
                  <div
                    key={interest.id}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      isSelected
                        ? 'border-primary bg-primary/5 ring-1 ring-primary'
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => toggleInterest(interest.id)}
                  >
                    <div className="flex items-center space-x-2">
                      <Icon className="h-4 w-4" />
                      <span className="text-sm font-medium">{interest.name}</span>
                    </div>
                  </div>
                );
              })}
            </div>
            {formData.selectedInterests.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {formData.selectedInterests.map((interestId) => {
                  const interest = interests.find(i => i.id === interestId);
                  return (
                    <Badge key={interestId} variant="secondary">
                      {interest?.name}
                    </Badge>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                Creating Route...
              </>
            ) : (
              <>
                <Route className="h-4 w-4 mr-2" />
                Create Route
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
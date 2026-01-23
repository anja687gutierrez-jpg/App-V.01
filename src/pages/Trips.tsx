import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Calendar,
  MapPin,
  Clock,
  ArrowRight,
  MoreHorizontal,
  Car,
  CheckCircle2,
  Trash2,
  Loader2,
  Route
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { firestoreService, authService, SavedTrip } from '@/lib/firebaseConfig';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export function Trips() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [trips, setTrips] = useState<SavedTrip[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingTripId, setDeletingTripId] = useState<string | null>(null);

  // Load trips from Firestore on mount
  useEffect(() => {
    const loadTrips = async () => {
      setIsLoading(true);
      try {
        const userId = authService.getUserId();
        const userTrips = await firestoreService.getUserTrips(userId);
        setTrips(userTrips);
      } catch (error) {
        console.error('Error loading trips:', error);
        toast({
          title: 'Error',
          description: 'Failed to load trips. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadTrips();
  }, [toast]);

  // Delete a trip
  const handleDeleteTrip = async (tripId: string) => {
    setDeletingTripId(tripId);
    try {
      if (tripId.startsWith('local-')) {
        firestoreService.deleteFromLocalStorage(tripId);
      } else {
        await firestoreService.deleteTrip(tripId);
      }
      setTrips((prev) => prev.filter((t) => t.id !== tripId));
      toast({
        title: 'Trip Deleted',
        description: 'Your trip has been removed.',
      });
    } catch (error) {
      console.error('Error deleting trip:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete trip. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setDeletingTripId(null);
    }
  };

  // Categorize trips by status
  const activeTrips = trips.filter((t) => t.status === 'active');
  const plannedTrips = trips.filter((t) => t.status === 'planned');
  const completedTrips = trips.filter((t) => t.status === 'completed');

  // Format distance for display
  const formatDistance = (meters?: number) => {
    if (!meters) return 'N/A';
    const miles = meters / 1609.34;
    return `${miles.toFixed(0)} mi`;
  };

  // Format duration for display
  const formatDuration = (seconds?: number) => {
    if (!seconds) return 'N/A';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
  };

  // Format date for display
  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'Unknown date';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Render a trip card
  const renderTripCard = (trip: SavedTrip, showDelete = true) => {
    const startLocation = trip.startLocation?.name || trip.waypoints?.[0]?.name || 'Start';
    const endLocation = trip.endLocation?.name || trip.waypoints?.[trip.waypoints.length - 1]?.name || 'End';

    return (
      <Card key={trip.id} className="group hover:shadow-lg transition-all">
        <CardContent className="p-5">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h3 className="text-xl font-bold mb-2">{trip.name}</h3>
              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2" />
                  {formatDate(trip.createdAt)}
                </div>
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2" />
                  {startLocation} → {endLocation}
                </div>
                <div className="flex items-center gap-4">
                  <span className="flex items-center">
                    <Route className="h-4 w-4 mr-1" />
                    {formatDistance(trip.totalDistance)}
                  </span>
                  <span className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    {formatDuration(trip.totalDuration)}
                  </span>
                </div>
                <div className="flex items-center">
                  <Car className="h-4 w-4 mr-2" />
                  {trip.waypoints?.length || 0} stops
                </div>
              </div>
            </div>
            <Badge
              variant={trip.status === 'active' ? 'default' : trip.status === 'completed' ? 'secondary' : 'outline'}
              className={trip.status === 'active' ? 'bg-green-500' : ''}
            >
              {trip.status === 'active' ? 'Active' : trip.status === 'completed' ? 'Completed' : 'Planned'}
            </Badge>
          </div>

          <div className="mt-4 flex justify-between items-center">
            <Button
              variant="outline"
              className="flex-1 mr-2 group-hover:bg-primary group-hover:text-primary-foreground"
              onClick={() => navigate(`/plan?tripId=${trip.id}`)}
            >
              View Details
            </Button>
            {showDelete && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                    {deletingTripId === trip.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Trip</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete "{trip.name}"? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      onClick={() => handleDeleteTrip(trip.id!)}
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  // Empty state component
  const EmptyState = ({ title, description }: { title: string; description: string }) => (
    <div className="text-center py-12 bg-muted/20 rounded-lg">
      <Car className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
      <h3 className="text-lg font-medium">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Trips</h1>
          <p className="text-muted-foreground mt-1">Manage your ongoing adventures and trip history.</p>
        </div>
        <Button onClick={() => navigate('/plan')}>
          <PlusIcon className="h-4 w-4 mr-2" />
          Plan New Trip
        </Button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-3 text-muted-foreground">Loading your trips...</span>
        </div>
      ) : (
        <Tabs defaultValue="planned" className="w-full">
          <TabsList className="grid w-full grid-cols-3 max-w-[400px]">
            <TabsTrigger value="active">
              Active {activeTrips.length > 0 && `(${activeTrips.length})`}
            </TabsTrigger>
            <TabsTrigger value="planned">
              Planned {plannedTrips.length > 0 && `(${plannedTrips.length})`}
            </TabsTrigger>
            <TabsTrigger value="completed">
              History {completedTrips.length > 0 && `(${completedTrips.length})`}
            </TabsTrigger>
          </TabsList>

          {/* ACTIVE TRIPS */}
          <TabsContent value="active" className="mt-6">
            {activeTrips.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {activeTrips.map((trip) => renderTripCard(trip))}
              </div>
            ) : (
              <EmptyState
                title="No active trips"
                description="Ready to hit the road? Start a new journey!"
              />
            )}
          </TabsContent>

          {/* PLANNED TRIPS */}
          <TabsContent value="planned" className="mt-6">
            {plannedTrips.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {plannedTrips.map((trip) => renderTripCard(trip))}
              </div>
            ) : (
              <EmptyState
                title="No planned trips"
                description="Plan your next adventure to see it here!"
              />
            )}
          </TabsContent>

          {/* COMPLETED TRIPS */}
          <TabsContent value="completed" className="mt-6">
            {completedTrips.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {completedTrips.map((trip) => renderTripCard(trip))}
              </div>
            ) : (
              <EmptyState
                title="No completed trips"
                description="Completed trips will appear here."
              />
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}

// Simple Plus Icon component to avoid import errors if lucide version varies
function PlusIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24" height="24" viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      className={className}
    >
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
  );
}

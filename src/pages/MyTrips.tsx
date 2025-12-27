import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
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
  Plus
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// 1. YOUR PREFERRED MOCK DATA
const mockTrips = {
  active: [
    {
      id: 'trip-active-1',
      name: 'Pacific Coast Road Trip',
      dates: 'Oct 15 - Oct 22',
      status: 'In Progress',
      progress: 45,
      currentLocation: 'Big Sur, CA',
      image: 'https://images.unsplash.com/photo-1449034446853-66c86144b0ad?auto=format&fit=crop&q=80&w=1000'
    }
  ],
  upcoming: [
    {
      id: 'trip-up-1',
      name: 'Yosemite National Park',
      dates: 'Nov 10 - Nov 14',
      status: 'Planned',
      days: 4,
      stops: 8,
      image: 'https://images.unsplash.com/photo-1532274402911-5a369e4c4bb5?auto=format&fit=crop&q=80&w=1000'
    },
    {
      id: 'trip-up-2',
      name: 'Grand Canyon Adventure',
      dates: 'Dec 20 - Dec 28',
      status: 'Draft',
      days: 8,
      stops: 12,
      image: 'https://images.unsplash.com/photo-1474044159687-1ee9f03fd3f4?auto=format&fit=crop&q=80&w=1000'
    }
  ],
  past: [
    {
      id: 'trip-past-1',
      name: 'Napa Valley Weekend',
      dates: 'Sep 05 - Sep 07',
      status: 'Completed',
      miles: 120,
      rating: 5,
      image: 'https://images.unsplash.com/photo-1516570161426-3843d11d7352?auto=format&fit=crop&q=80&w=1000'
    },
    {
      id: 'trip-past-2',
      name: 'Lake Tahoe Ski Trip',
      dates: 'Jan 15 - Jan 20',
      status: 'Completed',
      miles: 450,
      rating: 4,
      image: 'https://images.unsplash.com/photo-1548782062-1262d083b45a?auto=format&fit=crop&q=80&w=1000'
    }
  ]
};

export function MyTrips() {
  const navigate = useNavigate();
  const [savedTrips, setSavedTrips] = useState<any[]>([]);

  // 2. LOGIC TO READ SAVED TRIPS FROM BROWSER STORAGE
  useEffect(() => {
    const saved = localStorage.getItem('myTrips');
    if (saved) {
      setSavedTrips(JSON.parse(saved));
    }
  }, []);

  // 3. MERGE SAVED TRIPS WITH MOCK UPCOMING
  // Newest saved trips appear first
  const allUpcomingTrips = [...savedTrips, ...mockTrips.upcoming];

  return (
    <div className="space-y-6 animate-fade-in max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Trips</h1>
          <p className="text-muted-foreground mt-1">Manage your ongoing adventures and trip history.</p>
        </div>
        <Button onClick={() => navigate('/planner')}>
          <Plus className="h-4 w-4 mr-2" />
          Plan New Trip
        </Button>
      </div>

      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full grid-cols-3 max-w-[400px]">
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="past">History</TabsTrigger>
        </TabsList>

        {/* ACTIVE TRIPS */}
        <TabsContent value="active" className="mt-6">
          {mockTrips.active.length > 0 ? (
            <div className="grid grid-cols-1 gap-6">
              {mockTrips.active.map((trip) => (
                <Card key={trip.id} className="border-l-4 border-l-green-500 overflow-hidden">
                  <div className="flex flex-col md:flex-row">
                    <div className="md:w-64 h-48 md:h-auto relative">
                      <img src={trip.image} alt={trip.name} className="w-full h-full object-cover" />
                      <Badge className="absolute top-2 right-2 bg-green-500 animate-pulse">Live</Badge>
                    </div>
                    <CardContent className="flex-1 p-6">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-2xl font-bold">{trip.name}</h3>
                          <div className="flex items-center text-muted-foreground mt-2 space-x-4">
                            <span className="flex items-center"><Calendar className="h-4 w-4 mr-1" /> {trip.dates}</span>
                            <span className="flex items-center"><MapPin className="h-4 w-4 mr-1" /> {trip.currentLocation}</span>
                          </div>
                        </div>
                        <Button variant="outline" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                      </div>
                      
                      <div className="mt-6">
                        <div className="flex justify-between text-sm mb-2">
                          <span className="font-medium">Trip Progress</span>
                          <span>{trip.progress}%</span>
                        </div>
                        <div className="h-2 bg-secondary rounded-full overflow-hidden">
                          <div className="h-full bg-green-500 transition-all duration-1000" style={{ width: `${trip.progress}%` }} />
                        </div>
                      </div>

                      <div className="mt-6 flex justify-end">
                        <Button onClick={() => navigate('/navigation')}>
                          Resume Navigation <ArrowRight className="h-4 w-4 ml-2" />
                        </Button>
                      </div>
                    </CardContent>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-muted/20 rounded-lg">
              <Car className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
              <h3 className="text-lg font-medium">No active trips</h3>
              <p className="text-muted-foreground">Ready to hit the road? Start a new journey!</p>
            </div>
          )}
        </TabsContent>

        {/* UPCOMING TRIPS (Saved + Mock) */}
        <TabsContent value="upcoming" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {allUpcomingTrips.map((trip) => (
              <Card key={trip.id} className="group hover:shadow-lg transition-all cursor-pointer">
                <div className="h-48 relative overflow-hidden rounded-t-lg bg-gray-100">
                  <img src={trip.image} alt={trip.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <Badge variant="secondary" className="absolute top-2 right-2 backdrop-blur-md bg-white/50">{trip.status || 'Planned'}</Badge>
                </div>
                <CardContent className="p-5">
                  <h3 className="text-xl font-bold mb-2">{trip.name}</h3>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center"><Calendar className="h-4 w-4 mr-2" /> {trip.dates || 'Flexible Dates'}</div>
                    <div className="flex items-center"><Clock className="h-4 w-4 mr-2" /> {trip.days || 3} Days • {trip.stops || 5} Stops</div>
                  </div>
                  <Button variant="outline" className="w-full mt-4 group-hover:bg-primary group-hover:text-primary-foreground" onClick={() => navigate('/trips/1')}>View Itinerary</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* PAST TRIPS */}
        <TabsContent value="past" className="mt-6">
          <div className="space-y-4">
            {mockTrips.past.map((trip) => (
              <Card key={trip.id} className="flex flex-col sm:flex-row items-center p-4 gap-4 hover:bg-muted/50 transition-colors">
                 <div className="w-full sm:w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                   <img src={trip.image} alt={trip.name} className="w-full h-full object-cover" />
                 </div>
                 <div className="flex-1 text-center sm:text-left">
                   <h3 className="font-bold text-lg">{trip.name}</h3>
                   <p className="text-sm text-muted-foreground">{trip.dates}</p>
                 </div>
                 <div className="flex items-center gap-4">
                   <div className="text-right hidden sm:block">
                     <p className="text-sm font-medium">{trip.miles} miles</p>
                     <p className="text-xs text-muted-foreground">Completed</p>
                   </div>
                   <Badge variant="outline" className="h-8 w-8 rounded-full p-0 flex items-center justify-center border-green-500 text-green-600">
                     <CheckCircle2 className="h-4 w-4" />
                   </Badge>
                 </div>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

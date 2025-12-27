import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  MapPin, 
  Route, 
  PlayCircle, 
  Star, 
  Trash2,
  Share2
} from 'lucide-react';
import { SAMPLE_VIDEOS } from '@/data/sampleVideos';

// --- ROBUST DATA: ALL PEXELS (No Blocking) ---
const savedPlaces = [
  { 
    id: 1, 
    name: 'Griffith Observatory', 
    location: 'Los Angeles, CA', 
    type: 'Attraction', 
    rating: 4.8, 
    // Pexels: Night Skyline / Observatory vibe
    image: 'https://images.pexels.com/photos/1660603/pexels-photo-1660603.jpeg?auto=compress&cs=tinysrgb&w=800' 
  },
  { 
    id: 2, 
    name: 'Pike Place Market', 
    location: 'Seattle, WA', 
    type: 'Food & Dining', 
    rating: 4.9, 
    // Pexels: Seattle Public Market Center Sign
    image: 'https://images.pexels.com/photos/14290074/pexels-photo-14290074.jpeg?auto=compress&cs=tinysrgb&w=800' 
  },
];

const savedRoutes = [
  { 
    id: 1, 
    name: 'Pacific Coast Highway', 
    stops: 12, 
    miles: 450, 
    // Pexels: California Coast Road
    image: 'https://images.pexels.com/photos/2526105/pexels-photo-2526105.jpeg?auto=compress&cs=tinysrgb&w=800' 
  },
];

export function Favorites() {
  // Graceful error handling
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const target = e.currentTarget;
    target.style.display = 'none'; 
    target.parentElement?.classList.add('bg-gradient-to-r', 'from-blue-100', 'to-purple-100');
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Favorites</h1>
          <p className="text-muted-foreground mt-1">Your personal collection of dream destinations and ideas.</p>
        </div>
      </div>

      <Tabs defaultValue="places" className="w-full">
        <TabsList className="grid w-full grid-cols-3 max-w-[400px]">
          <TabsTrigger value="places">Places</TabsTrigger>
          <TabsTrigger value="routes">Routes</TabsTrigger>
          <TabsTrigger value="videos">Inspiration</TabsTrigger>
        </TabsList>

        {/* SAVED PLACES */}
        <TabsContent value="places" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedPlaces.map((place) => (
              <Card key={place.id} className="group overflow-hidden hover:shadow-lg transition-all">
                <div className="h-48 relative bg-gray-100 overflow-hidden">
                  <img 
                    src={place.image} 
                    alt={place.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                    onError={handleImageError}
                  />
                  <Button size="icon" variant="secondary" className="absolute top-2 right-2 h-8 w-8 bg-white/80 hover:bg-red-50 hover:text-red-500">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                <CardContent className="p-5">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-bold text-lg">{place.name}</h3>
                      <div className="flex items-center text-sm text-muted-foreground">
                        <MapPin className="h-3 w-3 mr-1" /> {place.location}
                      </div>
                    </div>
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" /> {place.rating}
                    </Badge>
                  </div>
                  <Button className="w-full mt-4" variant="outline">View Details</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* SAVED ROUTES */}
        <TabsContent value="routes" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {savedRoutes.map((route) => (
              <Card key={route.id} className="group overflow-hidden hover:shadow-lg transition-all">
                <div className="h-48 relative bg-gray-100 overflow-hidden">
                  <img 
                    src={route.image} 
                    alt={route.name} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={handleImageError}
                  />
                  <Badge className="absolute bottom-2 left-2 bg-black/50 text-white backdrop-blur-md">
                    <Route className="h-3 w-3 mr-1 inline" /> {route.miles} miles
                  </Badge>
                </div>
                <CardContent className="p-5">
                  <h3 className="font-bold text-lg mb-2">{route.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{route.stops} spectacular stops along the coast.</p>
                  <div className="flex gap-2">
                    <Button className="flex-1">Start Trip</Button>
                    <Button variant="outline" size="icon"><Share2 className="h-4 w-4" /></Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* SAVED VIDEOS */}
        <TabsContent value="videos" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {SAMPLE_VIDEOS.slice(0, 3).map((video) => (
              <Card key={video.id} className="group overflow-hidden hover:shadow-lg transition-all border-none shadow-none bg-transparent">
                <div className="relative rounded-xl overflow-hidden aspect-video shadow-md bg-gray-100">
                  <img 
                    src={video.thumbnailUrl} 
                    alt={video.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={handleImageError}
                   />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                    <PlayCircle className="h-12 w-12 text-white opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all drop-shadow-lg" />
                  </div>
                  <Badge className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-1.5 py-0.5">
                    {Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, '0')}
                  </Badge>
                </div>
                <div className="pt-3">
                  <h3 className="font-semibold text-base leading-tight group-hover:text-primary transition-colors line-clamp-2">
                    {video.title}
                  </h3>
                  <div className="flex items-center mt-2 text-sm text-muted-foreground">
                    <span className="font-medium text-foreground mr-2">{video.influencer.name}</span>
                    <span>• {video.viewCount.toLocaleString()} views</span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
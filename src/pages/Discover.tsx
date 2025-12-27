import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MapPin, Search, Star, ArrowRight, Compass } from 'lucide-react';

// --- ROBUST PEXELS DATA ---
const featuredDestinations = [
  {
    id: 1,
    name: 'Zion National Park',
    location: 'Utah',
    rating: 4.9,
    category: 'Nature',
    image: 'https://images.pexels.com/photos/1125278/pexels-photo-1125278.jpeg?auto=compress&cs=tinysrgb&w=800'
  },
  {
    id: 2,
    name: 'Savannah Historic District',
    location: 'Georgia',
    rating: 4.7,
    category: 'City',
    image: 'https://images.pexels.com/photos/1959023/pexels-photo-1959023.jpeg?auto=compress&cs=tinysrgb&w=800'
  },
  {
    id: 3,
    name: 'Lake Tahoe',
    location: 'California / Nevada',
    rating: 4.8,
    category: 'Nature',
    image: 'https://images.pexels.com/photos/2440021/pexels-photo-2440021.jpeg?auto=compress&cs=tinysrgb&w=800'
  },
  {
    id: 4,
    name: 'French Quarter',
    location: 'New Orleans, LA',
    rating: 4.6,
    category: 'City',
    image: 'https://images.pexels.com/photos/3757144/pexels-photo-3757144.jpeg?auto=compress&cs=tinysrgb&w=800'
  }
];

const categories = [
  { name: 'National Parks', image: 'https://images.pexels.com/photos/388415/pexels-photo-388415.jpeg?auto=compress&cs=tinysrgb&w=400' },
  { name: 'Coastal Drives', image: 'https://images.pexels.com/photos/1032650/pexels-photo-1032650.jpeg?auto=compress&cs=tinysrgb&w=400' },
  { name: 'City Escapes', image: 'https://images.pexels.com/photos/374870/pexels-photo-374870.jpeg?auto=compress&cs=tinysrgb&w=400' },
  { name: 'Hidden Gems', image: 'https://images.pexels.com/photos/2161449/pexels-photo-2161449.jpeg?auto=compress&cs=tinysrgb&w=400' },
];

export function Discover() {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="space-y-8 animate-fade-in max-w-6xl mx-auto pb-10">
      
      {/* Hero Search Section */}
      <div className="relative h-[300px] rounded-3xl overflow-hidden shadow-xl">
        <img 
          src="https://images.pexels.com/photos/238622/pexels-photo-238622.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1" 
          alt="Discover" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center p-6 text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Find Your Next Adventure</h1>
          <p className="text-gray-200 mb-6 max-w-lg">Explore curated routes, hidden gems, and top-rated destinations across America.</p>
          
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            <Input 
              placeholder="Search destinations (e.g., 'Grand Canyon')" 
              className="pl-10 h-12 bg-white/95 border-none text-black shadow-lg"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="space-y-4">
        <div className="flex justify-between items-center px-1">
          <h2 className="text-2xl font-bold">Browse by Category</h2>
          <Button variant="ghost" className="text-primary">View All <ArrowRight className="ml-1 h-4 w-4" /></Button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map((cat, idx) => (
            <Card key={idx} className="group cursor-pointer overflow-hidden border-none shadow-md">
              <div className="h-32 relative">
                <img 
                  src={cat.image} 
                  alt={cat.name} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                  <span className="text-white font-bold text-lg">{cat.name}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Trending Destinations */}
      <div className="space-y-4">
         <div className="flex justify-between items-center px-1">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Compass className="h-6 w-6 text-primary" /> Trending Now
          </h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredDestinations.filter(d => d.name.toLowerCase().includes(searchTerm.toLowerCase())).map((dest) => (
            <Card key={dest.id} className="group overflow-hidden hover:shadow-lg transition-all">
              <div className="h-48 relative overflow-hidden">
                <img 
                  src={dest.image} 
                  alt={dest.name} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                />
                <Badge className="absolute top-2 left-2 bg-white/90 text-black shadow-sm">
                  {dest.category}
                </Badge>
              </div>
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-lg leading-tight">{dest.name}</h3>
                  <div className="flex items-center text-sm font-medium text-yellow-600">
                    <Star className="h-3 w-3 fill-yellow-500 mr-1" />
                    {dest.rating}
                  </div>
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <MapPin className="h-3 w-3 mr-1" />
                  {dest.location}
                </div>
                <Button className="w-full mt-4" variant="outline">Explore</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

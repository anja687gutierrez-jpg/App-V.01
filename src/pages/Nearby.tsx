import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Fuel, 
  Coffee, 
  Utensils, 
  BedDouble, 
  Car, 
  ShoppingBag,
  MapPin,
  Navigation,
  Star,
  Search
} from 'lucide-react';

// Quick Categories
const categories = [
  { id: 'fuel', label: 'Fuel & EV', icon: Fuel, color: 'bg-blue-100 text-blue-700 border-blue-200' },
  { id: 'coffee', label: 'Coffee', icon: Coffee, color: 'bg-amber-100 text-amber-700 border-amber-200' },
  { id: 'food', label: 'Food', icon: Utensils, color: 'bg-orange-100 text-orange-700 border-orange-200' },
  { id: 'parking', label: 'Parking', icon: Car, color: 'bg-slate-100 text-slate-700 border-slate-200' },
  { id: 'hotel', label: 'Hotels', icon: BedDouble, color: 'bg-indigo-100 text-indigo-700 border-indigo-200' },
  { id: 'shop', label: 'Shops', icon: ShoppingBag, color: 'bg-pink-100 text-pink-700 border-pink-200' },
];

// Mock Data with Pexels Images (Added Hotels & Shops!)
const mockResults = [
  {
    id: 1,
    name: 'Shell Station & EV Charge',
    type: 'fuel',
    distance: '0.4 mi',
    address: '123 Main St, Los Angeles',
    rating: 4.2,
    open: 'Open 24 Hours',
    image: 'https://images.pexels.com/photos/9799723/pexels-photo-9799723.jpeg?auto=compress&cs=tinysrgb&w=800'
  },
  {
    id: 2,
    name: 'Blue Bottle Coffee',
    type: 'coffee',
    distance: '0.6 mi',
    address: '456 Arts District, Los Angeles',
    rating: 4.8,
    open: 'Closes at 6 PM',
    image: 'https://images.pexels.com/photos/1235706/pexels-photo-1235706.jpeg?auto=compress&cs=tinysrgb&w=800'
  },
  {
    id: 3,
    name: 'In-N-Out Burger',
    type: 'food',
    distance: '1.2 mi',
    address: 'Sunset Blvd, Los Angeles',
    rating: 4.7,
    open: 'Open until 1 AM',
    image: 'https://images.pexels.com/photos/1639557/pexels-photo-1639557.jpeg?auto=compress&cs=tinysrgb&w=800'
  },
  {
    id: 4,
    name: 'Downtown Public Parking',
    type: 'parking',
    distance: '0.2 mi',
    address: 'Grand Ave, Los Angeles',
    rating: 3.5,
    open: '24/7 Access',
    image: 'https://images.pexels.com/photos/1756957/pexels-photo-1756957.jpeg?auto=compress&cs=tinysrgb&w=800'
  },
  // --- NEW ITEMS ADDED BELOW ---
  {
    id: 5,
    name: 'The Ace Hotel',
    type: 'hotel',
    distance: '0.8 mi',
    address: '929 S Broadway, Los Angeles',
    rating: 4.6,
    open: 'Check-in 3 PM',
    image: 'https://images.pexels.com/photos/261102/pexels-photo-261102.jpeg?auto=compress&cs=tinysrgb&w=800'
  },
  {
    id: 6,
    name: 'City Target',
    type: 'shop',
    distance: '1.5 mi',
    address: '735 S Figueroa St',
    rating: 4.4,
    open: 'Until 10 PM',
    image: 'https://images.pexels.com/photos/264636/pexels-photo-264636.jpeg?auto=compress&cs=tinysrgb&w=800'
  }
];

export function Nearby() {
  const [activeCategory, setActiveCategory] = useState('fuel');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter Logic
  const filteredResults = mockResults.filter(item => {
    const matchesCategory = activeCategory === 'all' || item.type === activeCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return (item.type === activeCategory) || (searchQuery.length > 0 && matchesSearch);
  });

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Nearby</h1>
        <p className="text-muted-foreground mt-1">Quickly find essential services around you.</p>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input 
          placeholder="Search for 'Gas', 'Tacos', 'ATM'..." 
          className="pl-9 h-12 text-lg" 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Category Chips */}
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`
              flex items-center gap-2 px-4 py-3 rounded-xl border-2 transition-all whitespace-nowrap
              ${activeCategory === cat.id 
                ? `${cat.color} font-bold shadow-sm scale-105` 
                : 'bg-white border-transparent hover:bg-slate-50 text-slate-600'}
            `}
          >
            <cat.icon className="h-5 w-5" />
            {cat.label}
          </button>
        ))}
      </div>

      {/* Results List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredResults.length > 0 ? (
          filteredResults.map((place) => (
            <Card key={place.id} className="group overflow-hidden hover:shadow-lg transition-all">
              <div className="h-40 relative overflow-hidden bg-gray-100">
                <img 
                  src={place.image} 
                  alt={place.name} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                />
                <Badge className="absolute top-2 right-2 bg-white/90 text-black shadow-sm">
                  {place.distance}
                </Badge>
              </div>
              <CardContent className="p-4">
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-bold text-lg leading-tight">{place.name}</h3>
                  <div className="flex items-center text-sm font-medium text-yellow-600">
                    <Star className="h-3 w-3 fill-yellow-500 mr-1" />
                    {place.rating}
                  </div>
                </div>
                
                <div className="flex items-center text-sm text-muted-foreground mb-3">
                  <MapPin className="h-3 w-3 mr-1" />
                  {place.address}
                </div>

                <div className="flex items-center justify-between mt-4">
                  <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full">
                    {place.open}
                  </span>
                  <Button size="sm" className="gap-2">
                    <Navigation className="h-3 w-3" /> Go
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full text-center py-20 bg-muted/20 rounded-2xl border-2 border-dashed">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold">No nearby results</h3>
            <p className="text-muted-foreground">Try selecting a different category.</p>
          </div>
        )}
      </div>
    </div>
  );
}

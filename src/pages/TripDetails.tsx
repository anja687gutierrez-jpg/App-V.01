import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Calendar, 
  MapPin, 
  Clock, 
  Navigation, 
  Sun, 
  Moon, 
  Coffee, 
  Utensils,
  Camera,
  ArrowLeft
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function TripDetails() {
  const navigate = useNavigate();

  // Mock Itinerary Data for Yosemite
  const itinerary = [
    {
      day: 1,
      date: 'Nov 10',
      title: 'Arrival & Tunnel View',
      weather: '65°F Sunny',
      activities: [
        { time: '09:00 AM', title: 'Depart Los Angeles', type: 'drive', duration: '4h 30m', icon: Navigation },
        { time: '01:30 PM', title: 'Check-in at Yosemite Lodge', type: 'stay', icon: Coffee },
        { time: '03:00 PM', title: 'Tunnel View Sunset', type: 'sight', icon: Camera, notes: 'Best photo op!' },
        { time: '07:00 PM', title: 'Dinner at Mountain Room', type: 'food', icon: Utensils },
      ]
    },
    {
      day: 2,
      date: 'Nov 11',
      title: 'The Valley Floor Loop',
      weather: '62°F Partly Cloudy',
      activities: [
        { time: '08:00 AM', title: 'Breakfast at Base Camp', type: 'food', icon: Coffee },
        { time: '09:30 AM', title: 'El Capitan Meadow', type: 'sight', icon: Sun },
        { time: '12:00 PM', title: 'Picnic at Cathedral Beach', type: 'food', icon: Utensils },
        { time: '02:00 PM', title: 'Lower Yosemite Fall Hike', type: 'hike', icon: MapPin, notes: '1.2 miles, Easy' },
      ]
    }
  ];

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto pb-10">
      
      {/* Back Button */}
      <Button variant="ghost" className="pl-0 hover:pl-2 transition-all" onClick={() => navigate('/trips')}>
        <ArrowLeft className="h-4 w-4 mr-2" /> Back to My Trips
      </Button>

      {/* Hero Header */}
      <div className="relative h-64 rounded-3xl overflow-hidden shadow-xl group">
        <img 
          src="https://images.pexels.com/photos/1666021/pexels-photo-1666021.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1" 
          alt="Yosemite" 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-8">
          <Badge className="w-fit mb-2 bg-blue-500 hover:bg-blue-600 border-none">Upcoming Trip</Badge>
          <h1 className="text-4xl font-bold text-white mb-2">Yosemite National Park</h1>
          <div className="flex items-center text-gray-200 gap-4 text-sm font-medium">
            <span className="flex items-center gap-1"><Calendar className="h-4 w-4" /> Nov 10 - Nov 14</span>
            <span className="flex items-center gap-1"><MapPin className="h-4 w-4" /> 4 Days</span>
            <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> 8 Stops</span>
          </div>
        </div>
      </div>

      {/* Days Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
        {/* Left Col: Itinerary */}
        <div className="lg:col-span-2 space-y-8">
          {itinerary.map((day) => (
            <div key={day.day} className="space-y-4">
              <div className="flex items-center justify-between bg-secondary/30 p-4 rounded-xl border border-secondary">
                <div>
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    <Badge variant="outline" className="text-base px-3 py-1 bg-white">Day {day.day}</Badge> 
                    {day.title}
                  </h3>
                  <p className="text-muted-foreground ml-1 mt-1 text-sm">{day.date}</p>
                </div>
                <div className="flex items-center gap-2 text-sm font-medium text-orange-600 bg-orange-50 px-3 py-1 rounded-full">
                  <Sun className="h-4 w-4" /> {day.weather}
                </div>
              </div>

              {/* Timeline Items */}
              <div className="relative pl-6 border-l-2 border-gray-100 space-y-6 ml-4">
                {day.activities.map((activity, idx) => (
                  <div key={idx} className="relative group">
                    {/* Dot on timeline */}
                    <div className="absolute -left-[31px] top-1 h-4 w-4 rounded-full bg-primary border-4 border-white shadow-sm group-hover:scale-125 transition-transform" />
                    
                    <Card className="hover:shadow-md transition-all duration-300 border-l-4 border-l-transparent hover:border-l-primary cursor-pointer">
                      <CardContent className="p-4 flex gap-4 items-start">
                        <div className="p-3 bg-muted rounded-xl text-muted-foreground">
                          <activity.icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <h4 className="font-semibold text-base">{activity.title}</h4>
                            <span className="text-xs font-mono bg-slate-100 px-2 py-1 rounded text-slate-600">{activity.time}</span>
                          </div>
                          
                          {activity.type === 'drive' && (
                            <p className="text-sm text-blue-600 mt-1 flex items-center gap-1 font-medium">
                              <Navigation className="h-3 w-3" /> {activity.duration} drive
                            </p>
                          )}
                          
                          {activity.notes && (
                            <p className="text-sm text-muted-foreground mt-1 italic">
                              "{activity.notes}"
                            </p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Right Col: Trip Stats / Map Placeholder */}
        <div className="space-y-6">
           <Card className="bg-primary text-primary-foreground overflow-hidden relative border-none shadow-xl">
             <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl -mr-10 -mt-10" />
             <CardContent className="p-6 relative z-10 text-center">
               <h3 className="font-bold text-lg mb-1">Ready to go?</h3>
               <p className="text-primary-foreground/80 text-sm mb-4">Start the AI Copilot navigation for Day 1.</p>
               <Button variant="secondary" className="w-full font-bold shadow-sm hover:shadow-lg transition-all" onClick={() => navigate('/navigation')}>
                 <Navigation className="h-4 w-4 mr-2" /> Start Navigation
               </Button>
             </CardContent>
           </Card>

           <Card className="overflow-hidden h-64 relative border-none shadow-md">
             {/* Live Map Embed (Yosemite Valley) */}
             <iframe 
               width="100%" 
               height="100%" 
               frameBorder="0" 
               scrolling="no" 
               marginHeight={0} 
               marginWidth={0} 
               title="Yosemite Map"
               className="w-full h-full opacity-90 hover:opacity-100 transition-opacity"
               src="https://www.openstreetmap.org/export/embed.html?bbox=-119.65,37.70,-119.50,37.80&layer=mapnik"
             ></iframe>

             {/* Interactive Overlay */}
             <div className="absolute inset-0 pointer-events-none border-2 border-black/5 rounded-xl" />
             
             <div className="absolute bottom-4 right-4 pointer-events-auto">
               <Button 
                 size="sm" 
                 variant="default" 
                 className="shadow-lg bg-white text-black hover:bg-gray-100 font-semibold"
                 onClick={() => window.open('https://www.google.com/maps/search/Yosemite+National+Park', '_blank')}
               >
                 <MapPin className="h-3 w-3 mr-2 text-red-500" /> Open in Google Maps
               </Button>
             </div>
           </Card>
        </div>
      </div>
    </div>
  );
}

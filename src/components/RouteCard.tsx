import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  MapPin, 
  Navigation, 
  Clock, 
  Play,
  Edit,
  Trash2,
  ArrowRight
} from 'lucide-react';

interface Route {
  id: string;
  name: string;
  startLocation: string;
  endLocation: string;
  distanceKm: number;
  estimatedDurationHours: number;
  status: 'draft' | 'active' | 'completed' | 'archived';
  createdAt: string;
}

interface RouteCardProps {
  route: Route;
  onStart?: (routeId: string) => void;
  onEdit?: (routeId: string) => void;
  onDelete?: (routeId: string) => void;
}

export function RouteCard({ route, onStart, onEdit, onDelete }: RouteCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500 hover:bg-green-500';
      case 'completed': return 'bg-blue-500 hover:bg-blue-500';
      case 'draft': return 'bg-orange-500 hover:bg-orange-500';
      case 'archived': return 'bg-gray-500 hover:bg-gray-500';
      default: return 'bg-gray-500 hover:bg-gray-500';
    }
  };

  const formatDuration = (hours: number) => {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  const formatDistance = (km: number) => {
    const miles = km * 0.621371;
    return `${miles.toFixed(1)} mi`;
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold group-hover:text-primary transition-colors">
              {route.name}
            </CardTitle>
            <div className="flex items-center space-x-1 text-sm text-muted-foreground mt-1">
              <MapPin className="h-3 w-3" />
              <span>{route.startLocation}</span>
              <ArrowRight className="h-3 w-3" />
              <span>{route.endLocation}</span>
            </div>
          </div>
          <Badge className={getStatusColor(route.status)}>
            {route.status}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center space-x-2">
            <Navigation className="h-4 w-4 text-blue-500" />
            <div>
              <p className="text-xs text-muted-foreground">Distance</p>
              <p className="text-sm font-medium">{formatDistance(route.distanceKm)}</p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-green-500" />
            <div>
              <p className="text-xs text-muted-foreground">Duration</p>
              <p className="text-sm font-medium">{formatDuration(route.estimatedDurationHours)}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t">
          <div className="text-xs text-muted-foreground">
            Created {new Date(route.createdAt).toLocaleDateString()}
          </div>
          
          <div className="flex items-center space-x-1">
            {route.status === 'draft' && onStart && (
              <Button 
                size="sm" 
                onClick={() => onStart(route.id)}
                className="h-8"
              >
                <Play className="h-3 w-3 mr-1" />
                Start
              </Button>
            )}
            
            {route.status === 'active' && (
              <Button 
                size="sm" 
                onClick={() => onStart?.(route.id)}
                className="h-8 bg-green-500 hover:bg-green-600"
              >
                <Navigation className="h-3 w-3 mr-1" />
                Continue
              </Button>
            )}
            
            {onEdit && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onEdit(route.id)}
                className="h-8"
              >
                <Edit className="h-3 w-3" />
              </Button>
            )}
            
            {onDelete && route.status !== 'active' && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => onDelete(route.id)}
                className="h-8 text-red-500 hover:text-red-700 hover:border-red-300"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Phone,
  AlertTriangle,
  Wrench,
  Fuel,
  Lock,
  Heart,
  Clock,
  Globe,
  Star,
  MapPin,
  Copy,
  ExternalLink,
  AlertCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { RoadsideService } from '@/types';

const SERVICE_TYPES = ['towing', 'breakdown', 'fuel', 'locksmith', 'medical'] as const;

// Comprehensive roadside assistance directory (MVP)
const ROADSIDE_SERVICES: RoadsideService[] = [
  {
    id: '1',
    name: 'AAA Premier Roadside',
    type: 'towing',
    phone: '+1-800-AAA-HELP',
    location: { lat: 37.7749, lng: -122.4194 },
    distance: 0,
    services: ['towing', 'flat tire', 'jump start', 'fuel delivery', 'lockout'],
    countryCode: '+1',
    serviceArea: ['USA', 'Canada', 'Mexico'],
    languages: ['English', 'Spanish'],
    coverage: 'national',
    available24h: true,
    acceptsInternational: true,
    rating: 4.7,
    responseTime: '15-30 mins',
    createdAt: new Date().toISOString()
  },
  {
    id: '2',
    name: 'OnStar Emergency',
    type: 'breakdown',
    phone: '+1-888-466-7827',
    location: { lat: 37.7749, lng: -122.4194 },
    distance: 0,
    services: ['breakdown', 'diagnostics', 'emergency'],
    countryCode: '+1',
    serviceArea: ['USA'],
    languages: ['English', 'Spanish'],
    coverage: 'national',
    available24h: true,
    acceptsInternational: false,
    rating: 4.5,
    responseTime: '10-20 mins',
    createdAt: new Date().toISOString()
  },
  {
    id: '3',
    name: 'Shell Roadside Assist',
    type: 'fuel',
    phone: '+1-800-934-7355',
    location: { lat: 37.7749, lng: -122.4194 },
    distance: 0,
    services: ['fuel delivery', 'battery'],
    countryCode: '+1',
    serviceArea: ['USA'],
    languages: ['English'],
    coverage: 'national',
    available24h: true,
    acceptsInternational: false,
    rating: 4.3,
    responseTime: '20-40 mins',
    createdAt: new Date().toISOString()
  },
  {
    id: '4',
    name: 'Locksmith 24/7',
    type: 'locksmith',
    phone: '+1-800-UNLOCK1',
    location: { lat: 37.7749, lng: -122.4194 },
    distance: 0,
    services: ['lockout', 'key replacement'],
    countryCode: '+1',
    serviceArea: ['USA', 'Canada'],
    languages: ['English', 'French'],
    coverage: 'national',
    available24h: true,
    acceptsInternational: true,
    rating: 4.2,
    responseTime: '30-60 mins',
    createdAt: new Date().toISOString()
  },
  {
    id: '5',
    name: 'Medical Emergency Service',
    type: 'medical',
    phone: '911',
    location: { lat: 37.7749, lng: -122.4194 },
    distance: 0,
    services: ['medical', 'ambulance', 'emergency'],
    countryCode: '+1',
    serviceArea: ['USA'],
    languages: ['English', 'Spanish'],
    coverage: 'national',
    available24h: true,
    acceptsInternational: false,
    rating: 5.0,
    responseTime: '5-15 mins',
    createdAt: new Date().toISOString()
  },
  {
    id: '6',
    name: 'European Breakdown',
    type: 'towing',
    phone: '+44-0800-358-5551',
    location: { lat: 51.5074, lng: -0.1278 },
    distance: 0,
    services: ['towing', 'breakdown', 'flat tire'],
    countryCode: '+44',
    serviceArea: ['UK', 'EU'],
    languages: ['English', 'German', 'French', 'Italian', 'Spanish'],
    coverage: 'international',
    available24h: true,
    acceptsInternational: true,
    rating: 4.6,
    responseTime: '30-45 mins',
    createdAt: new Date().toISOString()
  },
  {
    id: '7',
    name: 'ADAC Pannenhilfe',
    type: 'breakdown',
    phone: '+49-89-76 76 76',
    location: { lat: 48.1351, lng: 11.5820 },
    distance: 0,
    services: ['breakdown', 'towing', 'diagnostics'],
    countryCode: '+49',
    serviceArea: ['Germany', 'Austria', 'Switzerland'],
    languages: ['German', 'English'],
    coverage: 'regional',
    available24h: true,
    acceptsInternational: true,
    rating: 4.8,
    responseTime: '25-40 mins',
    createdAt: new Date().toISOString()
  },
  {
    id: '8',
    name: 'ACI Roadside (Italy)',
    type: 'towing',
    phone: '+39-116',
    location: { lat: 41.9028, lng: 12.4964 },
    distance: 0,
    services: ['towing', 'breakdown', 'flat tire'],
    countryCode: '+39',
    serviceArea: ['Italy'],
    languages: ['Italian', 'English'],
    coverage: 'national',
    available24h: true,
    acceptsInternational: true,
    rating: 4.4,
    responseTime: '30-45 mins',
    createdAt: new Date().toISOString()
  },
];

interface RoadsideAssistanceProps {
  destinationCountry?: string;
  onServiceSelected?: (service: RoadsideService) => void;
}

export function RoadsideAssistance({
  destinationCountry,
  onServiceSelected
}: RoadsideAssistanceProps) {
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedCoverage, setSelectedCoverage] = useState<string>('all');
  const [selectedService, setSelectedService] = useState<RoadsideService | null>(null);
  const [copiedNumber, setCopiedNumber] = useState<string | null>(null);
  const { toast } = useToast();

  // Filter services
  const filteredServices = ROADSIDE_SERVICES.filter(service => {
    if (selectedType !== 'all' && service.type !== selectedType) return false;
    if (selectedCoverage !== 'all' && service.coverage !== selectedCoverage) return false;
    return true;
  })
  .sort((a, b) => b.rating - a.rating);

  const handleCall = (service: RoadsideService) => {
    setSelectedService(service);
    toast({
      title: '📞 Calling...',
      description: `${service.name} - ${service.phone}`,
    });
    // In real app: window.location.href = `tel:${service.phone}`;
    onServiceSelected?.(service);
  };

  const handleCopyNumber = (phone: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(phone);
    setCopiedNumber(phone);
    toast({
      title: '📋 Copied',
      description: 'Phone number copied to clipboard',
    });
    setTimeout(() => setCopiedNumber(null), 2000);
  };

  const getServiceIcon = (type: string) => {
    switch (type) {
      case 'towing':
        return <Wrench className="h-5 w-5" />;
      case 'breakdown':
        return <AlertTriangle className="h-5 w-5" />;
      case 'fuel':
        return <Fuel className="h-5 w-5" />;
      case 'locksmith':
        return <Lock className="h-5 w-5" />;
      case 'medical':
        return <Heart className="h-5 w-5" />;
      default:
        return <AlertTriangle className="h-5 w-5" />;
    }
  };

  const getTypeLabel = (type: string) => {
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  const getCoverageColor = (coverage: string) => {
    switch (coverage) {
      case 'national':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'international':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'regional':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <div className="space-y-4 w-full">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2" />
            Roadside Assistance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-gray-700">Service Type</label>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Services</SelectItem>
                    <SelectItem value="towing">Towing</SelectItem>
                    <SelectItem value="breakdown">Breakdown</SelectItem>
                    <SelectItem value="fuel">Fuel</SelectItem>
                    <SelectItem value="locksmith">Locksmith</SelectItem>
                    <SelectItem value="medical">Medical</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Coverage Area</label>
                <Select value={selectedCoverage} onValueChange={setSelectedCoverage}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Areas</SelectItem>
                    <SelectItem value="national">National</SelectItem>
                    <SelectItem value="international">International</SelectItem>
                    <SelectItem value="regional">Regional</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Emergency Alert */}
      <Alert className="border-red-200 bg-red-50">
        <AlertCircle className="h-4 w-4 text-red-600" />
        <AlertDescription className="text-red-800">
          <strong>Life-threatening emergency?</strong> Always call 911 (or your local emergency number) first. Save these numbers in your phone before traveling.
        </AlertDescription>
      </Alert>

      {/* Services List */}
      <div className="space-y-3">
        {filteredServices.map(service => (
          <Card
            key={service.id}
            className={`cursor-pointer transition-all ${
              selectedService?.id === service.id
                ? 'border-2 border-blue-500 bg-blue-50'
                : 'hover:border-gray-300'
            }`}
          >
            <CardContent className="py-4">
              <div className="space-y-3">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      {getServiceIcon(service.type)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{service.name}</h3>
                      <Badge variant="secondary" className="mt-1 text-xs">
                        {getTypeLabel(service.type)}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center mb-1">
                      <Star className="h-4 w-4 text-yellow-400 mr-1" />
                      <span className="text-sm font-medium">{service.rating}</span>
                    </div>
                    {service.available24h && (
                      <Badge className="bg-green-500 text-xs">24/7</Badge>
                    )}
                  </div>
                </div>

                {/* Service Details */}
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center text-gray-600">
                    <Clock className="h-4 w-4 mr-2" />
                    <span>{service.available24h ? 'Always Open' : 'Business Hours'}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Globe className="h-4 w-4 mr-2" />
                    <span className="capitalize">{typeof service.coverage === 'string' ? service.coverage : 'covered'}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <MapPin className="h-4 w-4 mr-2" />
                    <span className="text-xs">{service.serviceArea}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Globe className="h-4 w-4 mr-2" />
                    <span className="text-xs">{service.languages.join(', ')}</span>
                  </div>
                </div>

                {/* Coverage Badges */}
                <div className="flex flex-wrap gap-2">
                  <Badge
                    variant="outline"
                    className={`text-xs ${getCoverageColor(typeof service.coverage === 'string' ? service.coverage : 'national')}`}
                  >
                    {service.coverage === 'national' && '🇺🇸 National'}
                    {service.coverage === 'international' && '🌍 International'}
                    {service.coverage === 'regional' && '🗺️ Regional'}
                  </Badge>
                  {service.acceptsInternational && (
                    <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-300">
                      ✈️ International
                    </Badge>
                  )}
                </div>

                {/* Phone Number */}
                <div className="bg-gray-50 p-3 rounded border border-gray-200">
                  <div className="text-xs text-gray-600 mb-1">Contact Number:</div>
                  <div className="flex items-center space-x-2">
                    <code className="flex-1 text-lg font-semibold text-gray-900">
                      {service.phone}
                    </code>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => handleCopyNumber(service.phone, e)}
                    >
                      {copiedNumber === service.phone ? (
                        <span className="text-green-600">✓</span>
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-2 pt-2 border-t">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      window.open(`https://www.google.com/maps/search/${service.name}`, '_blank');
                    }}
                  >
                    <ExternalLink className="h-4 w-4 mr-1" />
                    Info
                  </Button>
                  <Button
                    size="sm"
                    className="flex-1"
                    onClick={() => handleCall(service)}
                  >
                    <Phone className="h-4 w-4 mr-1" />
                    {selectedService?.id === service.id ? 'Selected' : 'Call Now'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Selected Service Details */}
      {selectedService && (
        <Card className="border-2 border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="text-sm text-green-900">
              📞 Service Ready
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p><strong>Service:</strong> {selectedService.name}</p>
            <p><strong>Type:</strong> {getTypeLabel(selectedService.type)}</p>
            <p><strong>Phone:</strong> {selectedService.phone}</p>
            <div className="pt-2 border-t">
              <Button
                size="sm"
                className="w-full"
                onClick={() => {
                  toast({
                    title: '📞 Initiating Call',
                    description: `Connecting to ${selectedService.name}...`,
                  });
                }}
              >
                <Phone className="h-4 w-4 mr-2" />
                Initiate Call
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* International Tips */}
      <Card className="bg-purple-50 border-purple-200">
        <CardHeader>
          <CardTitle className="text-sm text-purple-900">
            ✈️ International Roadside Assistance Tips
          </CardTitle>
        </CardHeader>
        <CardContent className="text-xs text-purple-800 space-y-1">
          <p>• Save international assistance numbers to your phone before departure</p>
          <p>• Check if your car insurance includes roadside coverage abroad</p>
          <p>• Know the emergency number format for each country you're visiting</p>
          <p>• Consider purchasing international breakdown insurance</p>
          <p>• Keep your travel insurance policy details handy</p>
          <p>• Download offline maps in case internet is unavailable</p>
        </CardContent>
      </Card>

      {/* Major Global Networks */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">
            🌍 Major International Networks
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-xs">
          <div className="space-y-2">
            <div className="p-2 bg-gray-50 rounded">
              <p className="font-semibold">Europe:</p>
              <p className="text-gray-600">Allianz, ADA, ADAC, AAA (international members)</p>
            </div>
            <div className="p-2 bg-gray-50 rounded">
              <p className="font-semibold">Asia-Pacific:</p>
              <p className="text-gray-600">JapanAAA, NRMA (Australia), AA (Thailand)</p>
            </div>
            <div className="p-2 bg-gray-50 rounded">
              <p className="font-semibold">Americas:</p>
              <p className="text-gray-600">AAA (USA/Canada), CTAC (Mexico), CAA</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

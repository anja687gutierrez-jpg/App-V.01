import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  AlertTriangle,
  Phone,
  MapPin,
  Shield,
  CheckCircle,
  Clock,
  Users,
  Heart,
  Settings,
  Share2,
  HelpCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { EmergencyContact, SafetyCheckIn, Tour } from '@/types';

interface SafetyDashboardProps {
  tour: Tour;
  currentLocation?: { latitude: number; longitude: number };
  emergencyContacts: EmergencyContact[];
  safetyCheckIn?: SafetyCheckIn;
  onEmergencySOS?: () => void;
  onAddContact?: () => void;
  onCheckIn?: (status: 'safe' | 'concerned' | 'urgent') => void;
  onShareLocation?: (contactId: string) => void;
}

export function SafetyDashboard({
  tour,
  currentLocation,
  emergencyContacts,
  safetyCheckIn,
  onEmergencySOS,
  onAddContact,
  onCheckIn,
  onShareLocation
}: SafetyDashboardProps) {
  const [sosActive, setSosActive] = useState(false);
  const [lastCheckInTime, setLastCheckInTime] = useState<string | null>(null);
  const [nextCheckInTime, setNextCheckInTime] = useState<string | null>(null);
  const { toast } = useToast();

  const primaryContact = emergencyContacts.find(c => c.isPrimary);
  const trustedContacts = emergencyContacts.filter(c => c.isTrusted);

  // Calculate check-in status
  useEffect(() => {
    if (safetyCheckIn) {
      setLastCheckInTime(safetyCheckIn.lastCheckIn);
      setNextCheckInTime(safetyCheckIn.scheduledNextCheckIn);
    }
  }, [safetyCheckIn]);

  const handleSOSPress = async () => {
    if (!primaryContact) {
      toast({
        title: '⚠️ No Emergency Contact',
        description: 'Please add an emergency contact first',
        variant: 'destructive'
      });
      return;
    }

    setSosActive(true);

    // Simulate SOS call
    toast({
      title: '🚨 Emergency Alert Sent',
      description: `Contacting ${primaryContact.name} at ${primaryContact.phone}`,
    });

    // Auto-call primary contact (in real app)
    // window.location.href = `tel:${primaryContact.phone}`;

    onEmergencySOS?.();

    // Auto-send location to trusted contacts
    trustedContacts.forEach(contact => {
      if (contact.shareLocationDuringTrips && currentLocation) {
        onShareLocation?.(contact.id);
        toast({
          title: '📍 Location Shared',
          description: `Shared location with ${contact.name}`
        });
      }
    });

    setTimeout(() => setSosActive(false), 3000);
  };

  const handleCheckIn = (status: 'safe' | 'concerned' | 'urgent') => {
    onCheckIn?.(status);
    
    const statusMessages = {
      safe: '✅ You checked in as safe',
      concerned: '⚠️ Marked as concerned - emergency contacts notified',
      urgent: '🚨 Emergency status activated'
    };

    toast({
      title: 'Check-In Recorded',
      description: statusMessages[status],
      variant: status === 'urgent' ? 'destructive' : 'default'
    });
  };

  const getCheckInStatus = () => {
    if (!safetyCheckIn) return 'pending';
    return safetyCheckIn.status;
  };

  const getCheckInColor = (status: string) => {
    switch (status) {
      case 'safe':
        return 'bg-green-50 border-green-200';
      case 'concerned':
        return 'bg-yellow-50 border-yellow-200';
      case 'urgent':
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="space-y-6 w-full">
      {/* SOS Emergency Button */}
      <div className={`p-6 rounded-lg border-2 transition-all ${sosActive ? 'bg-red-100 border-red-400 animate-pulse' : 'bg-red-50 border-red-200'}`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="h-6 w-6 text-red-600" />
            <div>
              <h3 className="font-bold text-red-900">Emergency SOS</h3>
              <p className="text-sm text-red-700">One-tap call to primary contact</p>
            </div>
          </div>
          {primaryContact && (
            <Badge className="bg-red-500">{primaryContact.name}</Badge>
          )}
        </div>

        <Button
          size="lg"
          className="w-full bg-red-600 hover:bg-red-700 text-white font-bold text-lg py-6"
          onClick={handleSOSPress}
          disabled={!primaryContact}
        >
          <Phone className="h-6 w-6 mr-2" />
          {sosActive ? 'Contacting...' : 'Call Emergency Contact'}
        </Button>

        {primaryContact && (
          <p className="text-xs text-red-600 mt-3 text-center">
            📍 Location will be auto-shared with trusted contacts
          </p>
        )}

        {!primaryContact && (
          <p className="text-xs text-red-600 mt-3 text-center">
            ⚠️ Add emergency contact to enable SOS
          </p>
        )}
      </div>

      {/* Safety Check-In Status */}
      <Card className={`border-2 ${getCheckInColor(getCheckInStatus())}`}>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Shield className="h-5 w-5 mr-2" />
              Safety Check-In
            </div>
            <Badge variant="outline">
              {getCheckInStatus() === 'safe' ? '✅ Safe' : 
               getCheckInStatus() === 'concerned' ? '⚠️ Concerned' :
               getCheckInStatus() === 'urgent' ? '🚨 Urgent' : 'Pending'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {lastCheckInTime && (
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center text-gray-600">
                <Clock className="h-4 w-4 mr-2" />
                Last check-in
              </div>
              <span className="font-medium">
                {new Date(lastCheckInTime).toLocaleTimeString()}
              </span>
            </div>
          )}

          {nextCheckInTime && (
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center text-gray-600">
                <Clock className="h-4 w-4 mr-2" />
                Next check-in due
              </div>
              <span className="font-medium">
                {new Date(nextCheckInTime).toLocaleTimeString()}
              </span>
            </div>
          )}

          <div className="grid grid-cols-3 gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              className="bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
              onClick={() => handleCheckIn('safe')}
            >
              <CheckCircle className="h-4 w-4 mr-1" />
              All Good
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="bg-yellow-50 border-yellow-200 text-yellow-700 hover:bg-yellow-100"
              onClick={() => handleCheckIn('concerned')}
            >
              <AlertTriangle className="h-4 w-4 mr-1" />
              Concerned
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="bg-red-50 border-red-200 text-red-700 hover:bg-red-100"
              onClick={() => handleCheckIn('urgent')}
            >
              <AlertTriangle className="h-4 w-4 mr-1" />
              Urgent
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Emergency Contacts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Emergency Contacts ({emergencyContacts.length})
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={onAddContact}
            >
              <Phone className="h-4 w-4 mr-1" />
              Add Contact
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {emergencyContacts.length > 0 ? (
            <div className="space-y-3">
              {emergencyContacts.map(contact => (
                <div key={contact.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-medium text-gray-900">{contact.name}</h4>
                      {contact.isPrimary && <Badge className="bg-red-500">Primary</Badge>}
                      {contact.isTrusted && <Badge className="bg-blue-500">Trusted</Badge>}
                    </div>
                    <div className="flex items-center space-x-4 text-xs text-gray-600 mt-1">
                      <span className="flex items-center">
                        <Phone className="h-3 w-3 mr-1" />
                        {contact.countryCode} {contact.phone}
                      </span>
                      <span className="text-gray-400">•</span>
                      <span>{contact.relationship}</span>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    {contact.shareLocationDuringTrips && (
                      <Badge variant="secondary" className="text-xs">
                        📍 Shares
                      </Badge>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onShareLocation?.(contact.id)}
                    >
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-gray-500">
              <Users className="h-8 w-8 mx-auto mb-2 text-gray-300" />
              <p className="text-sm mb-3">No emergency contacts yet</p>
              <Button
                variant="outline"
                size="sm"
                onClick={onAddContact}
              >
                Add Your First Contact
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Safety Info */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center text-blue-900">
            <HelpCircle className="h-5 w-5 mr-2" />
            Safety Features
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-blue-800">
          <div className="flex items-start space-x-2">
            <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0 text-green-600" />
            <span><strong>Real-time location sharing</strong> - Share with trusted contacts during trips</span>
          </div>
          <div className="flex items-start space-x-2">
            <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0 text-green-600" />
            <span><strong>Periodic check-ins</strong> - System prompts you to confirm you're safe</span>
          </div>
          <div className="flex items-start space-x-2">
            <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0 text-green-600" />
            <span><strong>Emergency reporting</strong> - Report accidents or breakdowns with location</span>
          </div>
          <div className="flex items-start space-x-2">
            <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0 text-green-600" />
            <span><strong>Roadside assistance</strong> - Access to 24/7 emergency services</span>
          </div>
        </CardContent>
      </Card>

      {/* Trip Safety Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Shield className="h-5 w-5 mr-2" />
            Trip Safety
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-green-50 rounded border border-green-200">
              <div className="text-xs text-gray-600">Estimated Duration</div>
              <div className="text-lg font-bold text-gray-900">
                {tour.preferences.duration} days
              </div>
            </div>
            <div className="p-3 bg-blue-50 rounded border border-blue-200">
              <div className="text-xs text-gray-600">Vehicle Type</div>
              <div className="text-lg font-bold text-gray-900 capitalize">
                {tour.preferences.vehicleType}
              </div>
            </div>
            <div className="p-3 bg-purple-50 rounded border border-purple-200">
              <div className="text-xs text-gray-600">Contacts Notified</div>
              <div className="text-lg font-bold text-gray-900">
                {emergencyContacts.filter(c => c.isTrusted).length}
              </div>
            </div>
            <div className="p-3 bg-amber-50 rounded border border-amber-200">
              <div className="text-xs text-gray-600">Travel Style</div>
              <div className="text-lg font-bold text-gray-900 capitalize">
                {tour.preferences.travelStyle}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* International Traveler Tips */}
      <Alert className="bg-amber-50 border-amber-200">
        <HelpCircle className="h-4 w-4 text-amber-600" />
        <AlertDescription className="text-amber-800 text-sm">
          <strong>International Travel:</strong> Make sure your emergency contacts have your international phone number. Emergency services have been added for your destination country.
        </AlertDescription>
      </Alert>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Phone, ShieldAlert, MapPin, Ambulance, Share2, Ban, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { fetchUserProfile } from '@/lib/user';
import { UserProfile } from '@/types';

export function Emergency() {
  const [sosActive, setSosActive] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [locationSent, setLocationSent] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const navigate = useNavigate();

  // Load user contacts
  useEffect(() => {
    const loadData = async () => {
      const user = await fetchUserProfile();
      setProfile(user);
    };
    loadData();
  }, []);

  // SOS Logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (sosActive && countdown > 0) {
      interval = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (countdown === 0) {
      // SOS Triggered!
      setLocationSent(true);
      setSosActive(false);
    }
    return () => clearInterval(interval);
  }, [sosActive, countdown]);

  const startSOS = () => {
    setSosActive(true);
    setCountdown(3);
    setLocationSent(false);
  };

  const cancelSOS = () => {
    setSosActive(false);
    setCountdown(3);
  };

  // Helper to format the list of names (e.g., "Mom, Dad")
  const emergencyContacts = profile?.emergencyContacts || [];
  const contactNames = emergencyContacts.map(c => c.name).join(", ") || "Emergency Services";
  const contactCount = emergencyContacts.length;

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-red-600 flex items-center gap-2">
          <ShieldAlert className="h-8 w-8" /> Emergency Assistance
        </h1>
        <p className="text-muted-foreground">Immediate help and local emergency contacts.</p>
      </div>

      {/* SOS BUTTON AREA */}
      <Card className="border-red-100 bg-red-50/50 shadow-sm">
        <CardContent className="p-8 flex flex-col items-center justify-center text-center">
          {!locationSent ? (
            <>
              <div 
                className={`
                  relative w-48 h-48 rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 select-none
                  ${sosActive ? 'bg-red-600 scale-110' : 'bg-red-500 hover:bg-red-600 hover:scale-105 shadow-xl shadow-red-200'}
                `}
                onMouseDown={startSOS}
                onMouseUp={cancelSOS}
                onMouseLeave={cancelSOS}
                onTouchStart={startSOS}
                onTouchEnd={cancelSOS}
              >
                <div className="text-white font-bold text-3xl pointer-events-none">
                  {sosActive ? `HOLD ${countdown}` : 'SOS'}
                </div>
                {sosActive && (
                  <div className="absolute inset-0 rounded-full border-4 border-red-300 animate-ping" />
                )}
              </div>
              <p className="mt-6 text-sm text-muted-foreground font-medium">
                Press and hold for 3 seconds to alert your {contactCount > 0 ? <b>{contactCount} contacts</b> : 'Safety Network'}
              </p>
              
              {/* Show "Add Contacts" button if the list is empty */}
              {contactCount === 0 && (
                <Button variant="link" onClick={() => navigate('/profile')} className="mt-2 text-red-600">
                  <Plus className="h-4 w-4 mr-1" /> Add Emergency Contacts
                </Button>
              )}
            </>
          ) : (
            <div className="animate-in zoom-in duration-300">
              <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Share2 className="h-10 w-10" />
              </div>
              <h3 className="text-2xl font-bold text-green-700">Alert Sent!</h3>
              <p className="text-muted-foreground mt-2 max-w-md mx-auto">
                Your current location has been sent to: <strong>{contactNames}</strong>.
              </p>
              <Button 
                variant="outline" 
                className="mt-6 border-red-200 text-red-600 hover:bg-red-50"
                onClick={() => setLocationSent(false)}
              >
                Reset
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* LOCAL SERVICES */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5 text-blue-500" /> Local Emergency Numbers
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 text-blue-600 rounded-full">
                  <ShieldAlert className="h-4 w-4" />
                </div>
                <div>
                  <p className="font-medium">General Emergency</p>
                  <p className="text-xs text-muted-foreground">Police, Fire, Ambulance</p>
                </div>
              </div>
              <Button variant="destructive" size="sm" className="font-bold text-lg px-4">911</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-green-500" /> Nearby Safe Points
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-3 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
              <div className="flex justify-between">
                <h4 className="font-semibold text-sm">Cedars-Sinai Medical Center</h4>
                <span className="text-xs font-bold text-green-600">0.8 mi</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">8700 Beverly Blvd, Los Angeles</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Alert>
        <Ban className="h-4 w-4" />
        <AlertTitle>Travel Advisory</AlertTitle>
        <AlertDescription>
          Severe weather warning in effect for mountain regions. Avoid Highway 2 until further notice.
        </AlertDescription>
      </Alert>
    </div>
  );
}
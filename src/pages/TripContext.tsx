import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { UserProfile, TourPreferences, Tour } from '@/types';

// Define the shape of our Shared Brain
interface TripContextType {
  // State
  userProfile: UserProfile | null;
  activeTour: Tour | null;
  isLoading: boolean;
  isSurpriseMode: boolean; // <--- The Magic Toggle
  
  // Actions
  updateProfile: (profile: UserProfile) => void;
  updatePreferences: (prefs: TourPreferences) => void;
  toggleSurpriseMode: (active: boolean) => void;
  loadActiveTour: (tourId: string) => Promise<void>;
}

// Create the Context
const TripContext = createContext<TripContextType | undefined>(undefined);

// --- THE PROVIDER COMPONENT ---
export function TripProvider({ children }: { children: ReactNode }) {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [activeTour, setActiveTour] = useState<Tour | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSurpriseMode, setIsSurpriseMode] = useState<boolean>(false);

  // 1. Load Initial Data (Simulates 'Remembering' the User)
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      // Simulate network delay
      setTimeout(() => {
        // Default "Fresh" Profile - Matches your Profile.tsx defaults
        setUserProfile({
          id: 'user_123',
          name: 'Explorer',
          email: 'user@example.com',
          preferences: {
            avatarStyle: 'guide', // Default Companion (Travel Bestie)
            travelStyle: 'scenic',
            budget: '250',
            currency: 'USD',
            pace: 'Balanced',
            interests: ['Nature', 'Photography'],
            vehicleType: 'ev',
            vehicleRange: 300
          },
          emergencyContacts: []
        });
        setIsLoading(false);
      }, 500);
    };
    loadData();
  }, []);

  // 2. Action: Update Full Profile
  const updateProfile = (profile: UserProfile) => {
    setUserProfile(profile);
    console.log("TripContext: Profile synced.", profile);
  };

  // 3. Action: Update Just Preferences (The 'Save' button connects here)
  const updatePreferences = (prefs: TourPreferences) => {
    if (!userProfile) return;
    
    // Auto-detect Surprise Mode
    if (prefs.interests.includes('Surprise Me!')) {
       setIsSurpriseMode(true);
    } else {
       setIsSurpriseMode(false);
    }

    const updatedProfile = { ...userProfile, preferences: prefs };
    setUserProfile(updatedProfile);
    console.log("TripContext: Preferences updated. AI Guide should switch.", prefs.avatarStyle);
  };

  // 4. Action: Toggle Surprise Manually
  const toggleSurpriseMode = (active: boolean) => {
    setIsSurpriseMode(active);
  };

  // 5. Action: Load a specific Tour
  const loadActiveTour = async (tourId: string) => {
    setIsLoading(true);
    console.log(`Loading tour ${tourId}...`);
    // API logic would go here
    setIsLoading(false);
  };

  return (
    <TripContext.Provider value={{
      userProfile,
      activeTour,
      isLoading,
      isSurpriseMode,
      updateProfile,
      updatePreferences,
      toggleSurpriseMode,
      loadActiveTour
    }}>
      {children}
    </TripContext.Provider>
  );
}

// --- HOOK FOR EASY ACCESS (This is the export your Dashboard is looking for!) ---
export function useTrip() {
  const context = useContext(TripContext);
  if (context === undefined) {
    throw new Error('useTrip must be used within a TripProvider');
  }
  return context;
}
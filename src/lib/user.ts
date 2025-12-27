import { TourPreferences, UserProfile } from '@/types';

// Mock Data - This acts as your "Database" for now
let currentUser: UserProfile = {
  id: 'user-1',
  name: 'Alex Rover',
  email: 'alex.rover@example.com',
  preferences: {
    travelStyle: 'adventure',
    interests: ['nature', 'photography'],
    budget: 'medium',
    accommodationType: 'hotel',
    vehicleType: 'ev',
    vehicleRange: 300,
    duration: 5,
    voice: 'nova'
  },
  emergencyContacts: []
};

export const fetchUserProfile = async (): Promise<UserProfile> => {
  // Simulate API delay
  return new Promise((resolve) => {
    setTimeout(() => resolve({ ...currentUser }), 500);
  });
};

export const updateUserProfile = async (data: UserProfile): Promise<UserProfile> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      currentUser = data;
      resolve({ ...currentUser });
    }, 500);
  });
};
export type { UserProfile };

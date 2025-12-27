import { Battery, Car } from 'lucide-react';

// --- NEW: Avatar Styles for Character Selection ---
export const avatarStyles = [
  { 
    id: 'bottts', 
    name: 'Tech Droid', 
    description: 'Precise, logical, and helpful.', 
    seed: 'IconicAI', // Keeps it consistent
    color: 'bg-blue-100',
    stats: { speed: 90, humor: 40, knowledge: 100 }
  },
  { 
    id: 'avataaars', 
    name: 'Local Guide', 
    description: 'Friendly, casual, and knows the best spots.', 
    seed: 'Felix',
    color: 'bg-green-100',
    stats: { speed: 70, humor: 85, knowledge: 80 }
  },
  { 
    id: 'notionists', 
    name: 'Happy Blob', 
    description: 'Always cheerful and loves hidden gems!', 
    seed: 'Happy',
    color: 'bg-yellow-100',
    stats: { speed: 60, humor: 100, knowledge: 60 }
  },
  { 
    id: 'lorelei', 
    name: 'The Artist', 
    description: 'Creative suggestions and scenic routes.', 
    seed: 'Bella',
    color: 'bg-purple-100',
    stats: { speed: 50, humor: 70, knowledge: 95 }
  }
];

// --- Existing Options ---

export const travelStyles = [
  { id: 'adventure', name: 'Adventure', description: 'Outdoor activities, hiking, nature', emoji: '🏔️' },
  { id: 'luxury', name: 'Luxury', description: 'Premium experiences, fine dining, spas', emoji: '✨' },
  { id: 'cultural', name: 'Cultural', description: 'Museums, historical sites, local culture', emoji: '🎭' },
  { id: 'foodie', name: 'Foodie', description: 'Culinary experiences, local cuisine', emoji: '🍳' },
  { id: 'family', name: 'Family', description: 'Kid-friendly activities, entertainment', emoji: '👨‍👩‍👧‍👦' }
];

export const vehicleTypes = [
  { id: 'ev', name: 'Electric Vehicle', icon: Battery, range: 300, emoji: '🔋' },
  { id: 'car', name: 'Gas Car', icon: Car, range: 400, emoji: '🚗' },
  { id: 'suv', name: 'SUV', icon: Car, range: 350, emoji: '🚙' },
  { id: 'rv', name: 'RV/Motorhome', icon: Car, range: 200, emoji: '🚐' }
];

export const interests = [
  { id: 'nature', name: 'Nature & Wildlife', emoji: '🌲' },
  { id: 'history', name: 'Historical Sites', emoji: '🏛️' },
  { id: 'food', name: 'Food & Dining', emoji: '🍽️' },
  { id: 'adventure', name: 'Adventure Sports', emoji: '🎿' },
  { id: 'art', name: 'Art & Culture', emoji: '🎨' },
  { id: 'photography', name: 'Photography', emoji: '📸' },
  { id: 'wine', name: 'Wine & Breweries', emoji: '🍷' },
  { id: 'beaches', name: 'Beaches & Coast', emoji: '🏖️' },
  { id: 'mountains', name: 'Mountains', emoji: '⛰️' },
  { id: 'shopping', name: 'Shopping', emoji: '🛍️' }
];

export const budgetLevels = [
  { id: 'low', name: 'Budget', emoji: '💰' },
  { id: 'medium', name: 'Moderate', emoji: '💳' },
  { id: 'high', name: 'Luxury', emoji: '💎' }
];

export const voiceOptions = [
  { id: 'nova', name: 'Nova' },
  { id: 'alloy', name: 'Alloy' },
  { id: 'echo', name: 'Echo' },
  { id: 'fable', name: 'Fable' },
  { id: 'onyx', name: 'Onyx' },
  { id: 'shimmer', name: 'Shimmer' },
];

export const accommodationTypes = [
  { id: 'hotel', name: 'Hotels & Resorts', emoji: '🏨' },
  { id: 'camping', name: 'Camping & RV', emoji: '🏕️' }
];
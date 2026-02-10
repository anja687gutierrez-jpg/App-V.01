import type { Suggestion, TourPreferences } from '@/types';
import { getInteractionHistory } from './learning';

// --- Placeholder for a real AI API call ---
async function generateAISuggestions(preferences: TourPreferences): Promise<Partial<Suggestion>[]> {
  // In a real app, this would call an AI model (e.g., OpenAI, Gemini)
  // The model would receive the user's preferences and return a list of suggestion ideas.
  await new Promise(resolve => setTimeout(resolve, 1200)); // Simulate network delay

  const ideas: { title: string; type: Suggestion['type']; interest: string }[] = [
    { title: 'Hidden Waterfall Hike', type: 'detour', interest: 'nature' },
    { title: 'Acclaimed Local Seafood Restaurant', type: 'stop', interest: 'food' },
    { title: 'Scenic Coastal Drive', type: 'optimization', interest: 'photography' },
    { title: 'Historic Lighthouse Tour', type: 'discovery', interest: 'history' },
    { title: 'Modern Art Museum', type: 'stop', interest: 'art' },
  ];

  // Filter ideas based on user interests for personalization
  const relevantIdeas = ideas.filter(idea => preferences.interests.includes(idea.interest));

  return relevantIdeas.map(idea => ({ ...idea, description: `A highly-rated ${idea.interest} experience.` }));
}

// --- Placeholder for a real Location Search API (e.g., Google Places) ---
async function searchPlaces(query: string): Promise<any> {
  // In a real app, this would call a service like Google Places API.
  // IMPORTANT: This would require an API key, which should be handled securely.
  await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay

  // Return mock data for a single place
  return {
    rating: 4.5 + Math.random() * 0.5,
    address: '123 Mockingbird Lane, Faketown, USA',
    distance: `${(Math.random() * 15).toFixed(1)} miles`,
    tags: ['popular', 'well-rated'],
  };
}

// --- NEW: Placeholder for Hidden Gem AI call ---
async function findHiddenGems(preferences: TourPreferences): Promise<Partial<Suggestion>[]> {
  // This simulates a more specific AI call to find "off-the-beaten-path" locations.
  await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network delay

  const gems: { title: string; why_hidden: string; interest: string }[] = [
    { title: 'Secret Beach Cove', why_hidden: 'Only accessible via a small, unmarked trail.', interest: 'nature' },
    { title: 'Al\'s Speakeasy', why_hidden: 'Hidden behind a fake laundromat entrance.', interest: 'food' },
    { title: 'The Lost Mural of Downtown', why_hidden: 'Located in a private alleyway, rarely seen by the public.', interest: 'art' },
  ];

  const relevantGems = gems.filter(gem => preferences.interests.includes(gem.interest));

  return relevantGems.map(gem => ({
    ...gem,
    type: 'discovery',
    description: 'A true hidden gem, away from the crowds.'
  }));
}

// --- Main function to generate full, personalized suggestions ---
export async function getSmartSuggestions(preferences: TourPreferences): Promise<Suggestion[]> {
  const interactionHistory = await getInteractionHistory();
  const rejectedSuggestionIds = new Set(
    interactionHistory.filter(i => i.action === 'rejected').map(i => i.suggestionId)
  );
  try {
    // 1. Get initial ideas and hidden gems from the AI in parallel
    const [aiIdeas, hiddenGems] = await Promise.all([
      generateAISuggestions(preferences),
      findHiddenGems(preferences)
    ]);

    let allIdeas = [...aiIdeas, ...hiddenGems];

    // Filter out ideas that have been previously rejected
    allIdeas = allIdeas.filter(idea => !rejectedSuggestionIds.has(idea.id!));

    if (allIdeas.length === 0) {
      return [];
    }

    // 2. Enrich each idea with real-world data
    const enrichedSuggestions = await Promise.all(
      allIdeas.map(async (idea) => {
        // Use the AI-generated title to search for a real place
        const placeData = await searchPlaces(idea.title!);

        return {
          id: idea.id || `suggest_${Date.now()}_${Math.random()}`,
          type: idea.type || 'discovery',
          why_hidden: idea.why_hidden,
          title: idea.title!,
          description: idea.description!,
          timeAdded: `+${Math.floor(Math.random() * 30) + 15} min`,
          rating: parseFloat(placeData.rating.toFixed(1)),
          details: {
            distance: placeData.distance,
            address: placeData.address,
            tags: placeData.tags,
          },
        };
      })
    );

    return enrichedSuggestions as Suggestion[];
  } catch (error) {
    console.error('Failed to get smart suggestions:', error);
    return [];
  }
}

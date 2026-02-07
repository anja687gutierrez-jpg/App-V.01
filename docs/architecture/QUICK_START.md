# 🚀 Quick Start - Voice Assistant

## 30-Second Setup

### 1. Add to your page
```tsx
import { VoiceAssistant } from '@/components/tour/VoiceAssistant';

<VoiceAssistant
  activeTour={tour}
  currentStop={stop}
  userPreferences={prefs}
  currentLocation={{lat, lon}}
  weather={{temperature, description}}
/>
```

### 2. Update Header for voice button
```tsx
import { Header } from '@/components/layout/Header';

<Header
  activeTour={tour}
  currentStop={stop}
  userPreferences={prefs}
  currentLocation={location}
  weather={weather}
/>
```

### 3. Save conversations (optional)
```tsx
import { dbService } from '@/services/databaseService';

// Automatically loaded from previous sessions
const history = await dbService.loadConversationHistory(tourId);
```

---

## What Users Can Do

1. **Click "Voice Guide"** button in header
2. **Speak a question** like "What should I see here?"
3. **Get an answer** in the voice of their choice
4. **Read previous conversations** anytime they return

---

## Customization

### Change default voice
In `VoiceAssistant.tsx` line 63:
```tsx
const [selectedVoice, setSelectedVoice] = useState('nova'); // nova|alloy|fable|onyx
```

### Auto-play responses
Enable/disable in component:
```tsx
const [autoPlay, setAutoPlay] = useState(true); // Change to false to disable
```

### Add AI integration
In `voiceService.ts` replace `generateAIResponse()`:
```tsx
// Before: Pattern matching
// After: Call your AI API
const response = await openai.createChatCompletion({...});
```

---

## Browser Support

- ✅ Chrome 25+
- ✅ Safari 14.1+
- ✅ Edge 15+
- ⚠️ Firefox (limited voice options)
- ❌ Mobile browsers (limited microphone access)

**Best tested on:** Chrome/Safari on desktop

---

## Troubleshooting

**"Microphone not working"**
- Grant microphone permission to browser
- Check Settings → Privacy → Microphone

**"Voice not heard"**
- Check volume is not muted
- Ensure speaker is connected
- Check browser volume settings

**"No responses"**
- Ensure internet connection
- Check browser console for errors
- Verify AI service is running (if using real API)

---

## File Locations

| Feature | File |
|---------|------|
| Voice Interface | `src/components/tour/VoiceAssistant.tsx` |
| AI & TTS | `src/services/voiceService.ts` |
| Persistence | `src/services/databaseService.ts` |
| Voice Button | `src/components/layout/Header.tsx` |
| Type Definitions | `src/types/index.ts` |

---

## API Reference

### VoiceAssistant Props
```tsx
interface VoiceAssistantProps {
  activeTour: Tour;              // Current tour
  currentStop?: RouteStop;        // Current location
  userPreferences?: TourPreferences; // User interests
  currentLocation?: {lat, lon};  // GPS coordinates
  weather?: {temperature, description}; // Weather data
  onClose?: () => void;          // Close callback
}
```

### Database Functions
```tsx
// Save conversation
await dbService.saveConversation(tourId, messages, voice);

// Load conversation history
const messages = await dbService.loadConversationHistory(tourId);

// Save user preferences
await dbService.saveVoicePreference(userId, preferences);

// Get user preferences
const prefs = await dbService.getVoicePreference(userId);
```

### Voice Service Functions
```tsx
// Generate AI response
const response = await generateAIResponse(userMessage, options);

// Speak text
await speakText(text, voiceId); // 'nova'|'alloy'|'fable'|'onyx'

// Get voice options
const voices = getVoiceOptions();
```

---

## Next Steps

1. ✅ Copy/paste setup code above
2. ✅ Test voice recording in your app
3. ✅ Replace mock AI with real API (optional)
4. ✅ Customize voices and responses
5. ✅ Deploy to production

---

## Performance Tips

- Lazy load VoiceAssistant for faster initial page load
- Use React.memo to prevent unnecessary re-renders
- Implement conversation pagination for long histories
- Cache generated responses

---

## Security Checklist

- [ ] Hide API keys in environment variables
- [ ] Validate user input on backend
- [ ] Implement rate limiting
- [ ] Add CORS headers
- [ ] Sanitize responses before display
- [ ] Log suspicious activity

---

**Need help?** See `VOICE_ASSISTANT_GUIDE.md` for detailed documentation.

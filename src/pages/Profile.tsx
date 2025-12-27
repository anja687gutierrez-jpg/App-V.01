import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { 
  Plus, Trash2, Phone, Shield, Wallet, Globe, CheckCircle2, 
  Bot, Heart, Mountain, Palette, Sparkles, MapPin, Zap, 
  Ticket, Star, Volume2, Languages, Wand2, Info, Save, User, ShieldCheck, Utensils
} from 'lucide-react';

// --- LOCAL TYPES ---
interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  relation: string;
}

interface TourPreferences {
  avatarStyle: string;
  travelStyle: string;
  budget: string;
  currency: string;
  pace: string;
  interests: string[];
}

interface UserProfile {
  name: string;
  email: string;
  phone?: string;
  preferences: TourPreferences;
  emergencyContacts: EmergencyContact[];
}

interface ToastNotification {
  id: string;
  title: string;
  expectation: string;
}

// --- DATA DEFINITIONS ---
const COMPANIONS = [
  { id: 'tech', name: 'Tech Droid', role: 'The Optimizer', desc: 'Precise, logical, and obsessed with efficiency.', color: 'bg-indigo-100 text-indigo-600', icon: Bot },
  { id: 'guide', name: 'Local Guide', role: 'The Bestie', desc: 'Knows the best photo ops and hidden cafes.', color: 'bg-pink-100 text-pink-600', icon: Heart },
  { id: 'ranger', name: 'Ranger Scout', role: 'The Explorer', desc: 'Focuses on nature, safety, and trails.', color: 'bg-emerald-100 text-emerald-600', icon: Mountain },
  { id: 'foodie', name: 'Flavor Scout', role: 'The Bon Vivant', desc: 'Expert on local bites, food fairs, and hidden bars.', color: 'bg-orange-100 text-orange-600', icon: Utensils },
  { id: 'artist', name: 'The Artist', role: 'The Aesthete', desc: 'Loves Mid-Century Modernism and Neon Art.', color: 'bg-purple-100 text-purple-600', icon: Palette },
  { id: 'celebrity', name: 'Star Spotter', role: 'The Insider', desc: 'Expert on celebrity estates and filming locations.', color: 'bg-yellow-100 text-yellow-700', icon: Star },
  { id: 'event', name: 'The Event Pro', role: 'The Fixer', desc: 'Finds the best sports, concerts, and theme park deals.', color: 'bg-cyan-100 text-cyan-600', icon: Ticket },
];

const EXTENDED_TRAVEL_STYLES = [
  { id: 'scenic', name: 'Scenic Cruiser', emoji: '🛣️', desc: 'Beautiful drives & comfort.', tags: ['Nature', 'Photography'] },
  { id: 'history', name: 'History Buff', emoji: '🏛️', desc: 'Museums & heritage sites.', tags: ['History', 'Modernism', 'Art'] },
  { id: 'luxury', name: 'Luxury & Leisure', emoji: '🥂', desc: 'Top-tier comfort & dining.', tags: ['Food', 'Wellness', 'Shopping'] },
  // REMOVED 'Surprise Me!' from Adventure & Foodie below to prevent auto-shuffle
  { id: 'adventure', name: 'Adventure', emoji: '🧗', desc: 'Hiking & off-grid thrills.', tags: ['Hiking', 'Nature'] }, 
  { id: 'nomad', name: 'Digital Nomad', emoji: '💻', desc: 'Cafes with WiFi & views.', tags: ['City', 'Coffee', 'Nightlife'] },
  { id: 'eco', name: 'Eco-Conscious', emoji: '🌿', desc: 'Sustainable & nature-first.', tags: ['Nature', 'Hiking', 'Wellness'] },
  { id: 'foodie', name: 'Foodie', emoji: '🍜', desc: 'Local eats & hidden gems.', tags: ['Food', 'Nightlife'] }, 
  { id: 'culture', name: 'Arts & Culture', emoji: '🎨', desc: 'Galleries & local events.', tags: ['Art', 'Modernism', 'Concerts'] },
];

export function Profile() {
  // --- STATE ---
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [preferences, setPreferences] = useState<TourPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSyncNote, setShowSyncNote] = useState(false);
  const [activeToasts, setActiveToasts] = useState<ToastNotification[]>([]);
  
  const [budget, setBudget] = useState('250');
  const [currency, setCurrency] = useState('USD');
  const [pace, setPace] = useState('Balanced');
  const [interests, setInterests] = useState<string[]>(['Nature', 'Photography']);
  const [voiceLanguage, setVoiceLanguage] = useState('en-US');
  const [voiceGender, setVoiceGender] = useState('female');
  
  const [newContactName, setNewContactName] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('');

  const { toast } = useToast();
  const availableInterests = ['Nature', 'City', 'Food', 'History', 'Photography', 'Hiking', 'Art', 'Nightlife', 'Wellness', 'Shopping', 'Sports', 'Concerts', 'Modernism', 'Surprise Me!'];

  // --- MOCKED DATA LOADING ---
  useEffect(() => {
    setTimeout(() => {
      const mockProfile: UserProfile = {
        name: "User Name",
        email: "user@example.com",
        phone: "+1 (555) 012-3456",
        preferences: {
          avatarStyle: 'tech',
          travelStyle: 'scenic',
          budget: '250',
          currency: 'USD',
          pace: 'Balanced',
          interests: ['Nature', 'Photography']
        },
        emergencyContacts: []
      };
      setProfile(mockProfile);
      setPreferences(mockProfile.preferences);
      setLoading(false);
    }, 800);
  }, []);

  // --- EXPANDED TOAST LOGIC ---
  const triggerExpectationToast = (mode: string) => {
    let title = `${mode} Mode Ready`;
    let expectation = "Your AI companion is re-calculating the best path.";

    switch(mode) {
      // --- COMPANIONS ---
      case 'tech': title = "The Optimizer 🤖"; expectation = "Expect a route calculated for maximum efficiency and speed."; break;
      case 'guide': title = "Local Guide 💖"; expectation = "Expect curated photo ops and cozy hidden cafes."; break;
      case 'ranger': title = "Ranger Scout 🏔️"; expectation = "Expect scenic national parks and safe outdoor trails."; break;
      case 'foodie': title = "Flavor Scout 🍔"; expectation = "Expect local diners, food fairs, and unique eats."; break;
      case 'artist': title = "The Artist 🎨"; expectation = "Expect architectural landmarks and neon art."; break;
      case 'celebrity': title = "Star Spotter 🌟"; expectation = "Expect an 'Insider' tour past famous filming locations."; break;
      case 'event': title = "The Event Pro 🎟️"; expectation = "Expect a route synced with sports and concerts."; break;
      
      // --- TRAVEL STYLES ---
      case 'scenic': title = "Scenic Cruiser 🛣️"; expectation = "We're prioritizing byways, panoramic views, and comfort stops."; break;
      case 'history': title = "History Buff 🏛️"; expectation = "Your route will now focus on heritage sites and museums."; break;
      case 'luxury': title = "Luxury & Leisure 🥂"; expectation = "Prioritizing 5-star dining, premium charging, and spas."; break;
      case 'adventure': title = "Adventure Mode 🧗"; expectation = "Seeking off-grid thrills, hiking paths, and rugged terrain."; break;
      case 'nomad': title = "Digital Nomad 💻"; expectation = "Ensuring all stops have high-speed Wi-Fi and workspaces."; break;
      case 'eco': title = "Eco-Conscious 🌿"; expectation = "Optimizing for maximum range efficiency and sustainable stops."; break;
      case 'culture': title = "Arts & Culture 🎨"; expectation = "Adding galleries, street art districts, and music venues."; break;
      
      // --- SPECIAL ---
      case 'Surprise': title = "Magic Mode Activated! ✨"; expectation = "Expect total spontaneity—hidden gems await."; break;
      default: break;
    }

    const newToast = { id: Math.random().toString(), title, expectation };
    setActiveToasts((prev) => [...prev, newToast]);

    setTimeout(() => {
      setActiveToasts((prev) => prev.filter(t => t.id !== newToast.id));
    }, 6000);
  };

  const handleSaveChanges = async () => {
    if (!profile || !preferences) return;
    setLoading(true);
    
    setTimeout(() => {
      // Trigger expectation for the selected companion
      triggerExpectationToast(preferences.avatarStyle || 'tech');
      
      toast({ title: 'Preferences Saved', description: `Your companion is now ready.` });
      setLoading(false);
    }, 1000);
  };

  const triggerSurpriseShuffle = () => {
    const randomCompanion = COMPANIONS[Math.floor(Math.random() * COMPANIONS.length)];
    const randomStyle = EXTENDED_TRAVEL_STYLES[Math.floor(Math.random() * EXTENDED_TRAVEL_STYLES.length)];
    
    setPreferences(prev => ({ ...prev!, avatarStyle: randomCompanion.id, travelStyle: randomStyle.id }));
    setInterests([...randomStyle.tags, 'Surprise Me!']);
    setBudget(((Math.floor(Math.random() * 9) + 1) * 100).toString());
    
    triggerExpectationToast('Surprise');
    toast({ title: 'Vibe Shuffled!', description: `Surprise! You are now an ${randomStyle.name} with ${randomCompanion.name}.` });
  };

  // --- HANDLERS ---
  const handleStyleSelect = (style: typeof EXTENDED_TRAVEL_STYLES[0]) => {
    setPreferences(prev => ({ ...prev!, travelStyle: style.id }));
    setInterests(style.tags);
    setShowSyncNote(true);
    
    // TRIGGER THE STYLE TOAST HERE
    triggerExpectationToast(style.id);

    // This check now only passes if a style EXPLICITLY has the tag (which none do now)
    if (style.tags.includes('Surprise Me!')) triggerSurpriseShuffle();
    
    setTimeout(() => setShowSyncNote(false), 3500);
  };

  const toggleInterest = (interest: string) => {
    const isActivating = !interests.includes(interest);
    if (isActivating) {
      if (interest === 'Surprise Me!') {
        triggerSurpriseShuffle();
      } else {
        setInterests([...interests, interest]);
      }
    } else {
      setInterests(interests.filter(i => i !== interest));
    }
  };

  const addContact = () => {
    if (!newContactName || !newContactPhone || !profile) return;
    const newContact: EmergencyContact = { id: Date.now().toString(), name: newContactName, phone: newContactPhone, relation: 'Family' };
    const updatedContacts = [...(profile.emergencyContacts || []), newContact];
    setProfile({ ...profile, emergencyContacts: updatedContacts });
    setNewContactName(''); setNewContactPhone('');
  };

  const removeContact = (id: string) => {
    if (!profile) return;
    const updatedContacts = (profile.emergencyContacts || []).filter(c => c.id !== id);
    setProfile({ ...profile, emergencyContacts: updatedContacts });
  };

  if (loading && !profile) return <div className="p-8">Loading profile...</div>;

  return (
    <div className="animate-fade-in pb-20 max-w-7xl p-6 md:p-10 space-y-10 relative">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
         <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Profile & Settings</h1>
            <p className="text-slate-500 mt-1">Design your perfect journey companion.</p>
         </div>
         <Button onClick={handleSaveChanges} disabled={loading} size="lg" className="min-w-[140px] bg-blue-600 hover:bg-blue-700 shadow-md">
              <Save className="h-4 w-4 mr-2" /> {loading ? 'Saving...' : 'Save Changes'}
         </Button>
      </div>
      
      {/* SECTION 1: COMPANIONS */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 mb-2">
           <Sparkles className="h-5 w-5 text-purple-600" />
           <h2 className="text-xl font-bold text-slate-900">Choose Your Companion</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3">
          {COMPANIONS.map((comp) => {
             const isSelected = preferences?.avatarStyle === comp.id || (comp.id === 'tech' && !preferences?.avatarStyle);
             return (
               <button
                 key={comp.id}
                 onClick={() => {
                   setPreferences(prev => prev ? ({ ...prev, avatarStyle: comp.id }) : null);
                   // TRIGGER THE COMPANION TOAST HERE
                   triggerExpectationToast(comp.id);
                 }}
                 className={`relative group flex flex-col items-center text-center p-5 rounded-2xl border-2 transition-all duration-300 ${isSelected ? 'border-blue-600 bg-white shadow-xl scale-105 z-10 ring-4 ring-blue-50' : 'border-slate-100 bg-white hover:border-blue-200 hover:shadow-md'}`}
               >
                 <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-4 transition-transform group-hover:scale-110 ${comp.color}`}>
                    <comp.icon className="h-7 w-7" />
                 </div>
                 <h3 className={`font-bold text-xs ${isSelected ? 'text-slate-900' : 'text-slate-700'}`}>{comp.name}</h3>
                 <span className="text-[9px] font-bold uppercase tracking-wider text-slate-400 mb-2">{comp.role}</span>
                 <p className="text-[10px] text-slate-500 leading-relaxed px-1 min-h-[3.5rem]">{comp.desc}</p>
                 {isSelected && <div className="absolute top-2 right-2 bg-blue-600 text-white p-1 rounded-full shadow-sm"><CheckCircle2 className="h-3 w-3" /></div>}
               </button>
             )
          })}
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pt-4">
        
        {/* LEFT COLUMN */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="shadow-sm border-slate-200">
            <CardHeader><CardTitle className="flex items-center gap-2"><User className="h-5 w-5 text-blue-500"/> Personal Information</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2"><Label>Full Name</Label><Input value={profile?.name || ''} readOnly className="bg-slate-50" /></div>
              <div className="space-y-2"><Label>Email Address</Label><Input value={profile?.email || ''} readOnly className="bg-slate-50" /></div>
              <div className="space-y-2"><Label>Phone Number</Label><Input placeholder="+1 (555) 000-0000" value={profile?.phone || ''} onChange={(e) => setProfile(prev => prev ? ({ ...prev, phone: e.target.value }) : null)} /></div>
            </CardContent>
          </Card>

          {/* AI SIDE PIECE */}
          <Card className="border-indigo-100 bg-indigo-50/30 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-md flex items-center gap-2 text-indigo-900">
                <ShieldCheck className="h-4 w-4 text-indigo-600" /> AI Companion Mode
              </CardTitle>
              <CardDescription className="text-[11px]">
                Quick-toggle smart routing behaviors.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4">
              <button 
                className="surprise-me-btn w-full justify-center scale-95" 
                onClick={triggerSurpriseShuffle}
              >
                <Sparkles className="h-4 w-4 mr-2" /> Surprise Me!
              </button>
              <p className="text-[10px] text-center text-slate-400 italic px-2">
                Letting the AI choose secret paths keeps your journeys iconic.
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-red-500 shadow-sm">
            <CardHeader className="pb-3"><CardTitle className="flex items-center gap-2 text-red-600"><Shield className="h-5 w-5" /> Safety Network</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">{(profile?.emergencyContacts || []).map(contact => (
                <div key={contact.id} className="flex justify-between items-center p-3 bg-red-50 rounded-lg border border-red-100 group">
                  <div className="flex items-center gap-3">
                    <div className="bg-white p-2 rounded-full text-red-500 shadow-sm"><Phone className="h-3 w-3" /></div>
                    <div><div className="font-semibold text-sm text-slate-900">{contact.name}</div><div className="text-xs text-slate-500">{contact.phone}</div></div>
                  </div>
                  <Button size="icon" variant="ghost" className="h-8 w-8 text-red-300 hover:text-red-600 opacity-0 group-hover:opacity-100" onClick={() => removeContact(contact.id)}><Trash2 className="h-4 w-4" /></Button>
                </div>
              ))}</div>
              <div className="pt-3 border-t border-slate-100 mt-2"><div className="grid grid-cols-5 gap-2 mb-2"><Input placeholder="Name" className="col-span-3 h-9 text-sm" value={newContactName} onChange={(e) => setNewContactName(e.target.value)} /><Input placeholder="Phone" className="col-span-2 h-9 text-sm" value={newContactPhone} onChange={(e) => setNewContactPhone(e.target.value)} /></div><Button onClick={addContact} disabled={!newContactName || !newContactPhone} size="sm" variant="outline" className="w-full text-red-600 border-red-200"><Plus className="h-3 w-3 mr-2" /> Add Contact</Button></div>
            </CardContent>
          </Card>
        </div>

        {/* RIGHT COLUMN */}
        <div className="lg:col-span-8 space-y-8">
          <Card className="shadow-sm border-slate-200">
            <CardHeader className="flex flex-row items-center justify-between">
              <div><CardTitle>Travel Style</CardTitle><p className="text-sm text-slate-500">Select the vibe that matches your journey.</p></div>
              {showSyncNote && (<div className="flex items-center gap-2 text-[10px] font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100 animate-pulse"><Zap className="h-3 w-3" /> Smart Sync Active</div>)}
            </CardHeader>
            <CardContent><div className="grid grid-cols-2 md:grid-cols-4 gap-4">{EXTENDED_TRAVEL_STYLES.map((style) => { const isSelected = preferences?.travelStyle === style.id; return (<button key={style.id} onClick={() => handleStyleSelect(style)} className={`relative p-4 rounded-xl border-2 text-left transition-all duration-200 flex flex-col gap-2 h-full ${isSelected ? 'border-blue-600 bg-blue-50 ring-1 ring-blue-600 shadow-md transform -translate-y-1' : 'border-slate-100 bg-white hover:border-slate-300 hover:shadow-sm'}`}><div className="flex justify-between items-start w-full"><span className="text-2xl" role="img">{style.emoji}</span>{isSelected && <CheckCircle2 className="h-5 w-5 text-blue-600" />}</div><h4 className={`font-bold text-sm ${isSelected ? 'text-blue-900' : 'text-slate-900'}`}>{style.name}</h4><p className={`text-[11px] mt-1 leading-tight ${isSelected ? 'text-blue-700' : 'text-slate-500'}`}>{style.desc}</p></button>); })}</div></CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="border-b border-slate-100 pb-4"><div className="flex items-center gap-3"><div className="p-2 bg-indigo-50 rounded-lg text-indigo-600"><Wallet className="h-5 w-5" /></div><CardTitle className="text-lg font-bold text-slate-900">Budget & Pace</CardTitle></div></CardHeader>
            <CardContent className="p-6 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8"><div className="space-y-3"><Label>Daily Budget Target</Label><div className="relative"><span className="absolute left-3 top-3 text-slate-400 font-bold">$</span><Input type="number" value={budget} onChange={(e) => setBudget(e.target.value)} className="pl-8 font-mono text-lg h-12" /></div></div><div className="space-y-3"><Label>Currency</Label><select value={currency} onChange={(e) => setCurrency(e.target.value)} className="w-full h-12 px-3 rounded-md border border-slate-200 bg-white"><option value="USD">🇺🇸 USD ($)</option><option value="EUR">🇪🇺 EUR (€)</option></select></div></div>
              <div className="space-y-3"><Label>Preferred Travel Pace</Label><div className="grid grid-cols-3 gap-4">{['Relaxed', 'Balanced', 'Fast'].map((option) => (<button key={option} onClick={() => setPace(option)} className={`h-12 text-sm font-bold rounded-lg border transition-all ${pace === option ? 'bg-slate-900 text-white border-slate-900 shadow-md' : 'bg-white text-slate-600 border-slate-200'}`}>{option}</button>))}</div></div>
            </CardContent>
          </Card>

          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="border-b border-slate-100 pb-4"><div className="flex items-center gap-3"><div className="p-2 bg-pink-50 rounded-lg text-pink-600"><Globe className="h-5 w-5" /></div><CardTitle className="text-lg font-bold text-slate-900">Interests</CardTitle><div className="flex items-center gap-1 text-[10px] text-slate-400 border border-slate-200 px-2 py-0.5 rounded-full"><Info className="h-3 w-3" /> Auto-toggled by Travel Style</div></div></CardHeader>
            <CardContent className="p-6">
              <div className="flex flex-wrap gap-3">
                {availableInterests.map((interest) => {
                  const isSelected = interests.includes(interest);
                  const isSurprise = interest === 'Surprise Me!';
                  return (
                    <button key={interest} onClick={() => toggleInterest(interest)} className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all border ${isSelected ? isSurprise ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white border-transparent shadow-lg scale-105 ring-2 ring-purple-300' : 'bg-blue-600 text-white border-blue-600 shadow-sm' : isSurprise ? 'bg-white text-purple-600 border-purple-200 hover:bg-purple-50' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}>
                      {isSurprise ? <Wand2 className={`h-4 w-4 ${isSelected ? 'animate-bounce' : ''}`} /> : isSelected ? <CheckCircle2 className="h-4 w-4" /> : <div className="w-4" />}
                      {interest}
                    </button>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* TOAST PORTAL */}
      <div className="toast-portal">
        {activeToasts.map((toast) => (
          <div key={toast.id} className="confirmation-toast">
            <span className="toast-title">{toast.title}</span>
            <p className="toast-body">{toast.expectation}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Profile;
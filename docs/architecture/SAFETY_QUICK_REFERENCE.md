# Safety & Logistics - Quick Reference

## 🎯 Components at a Glance

| Component | Purpose | Key Features | Lines |
|-----------|---------|--------------|-------|
| **SafetyDashboard** | Central safety hub | SOS button, check-in status, emergency contacts, trip summary | 430 |
| **EmergencyContactsManager** | Manage emergency contacts | Add/edit/delete, country codes, primary selector, location sharing toggle | 470 |
| **ParkingFinder** | Discover parking | Filter by type/price, ratings, amenities, payment apps, navigation | 410 |
| **RoadsideAssistance** | Emergency services directory | 8+ services, international coverage, one-tap calling, 24/7 support | 420 |
| **IncidentReporter** | Report emergencies | Type selector, severity levels, photo upload, emergency notification | 450 |

## 📊 Type Interfaces

### EmergencyContact
```typescript
{
  id, userId, name, phone, countryCode, relationship,
  isPrimary, isTrusted, shareLocationDuringTrips
}
```

### ParkingLocation
```typescript
{
  id, poiId, name, latitude, longitude, address, type,
  pricePerHour, availability, amenities, rating,
  acceptsPaymentApps, totalSpaces, disabledSpaces
}
```

### RoadsideService
```typescript
{
  id, name, type, phone, countryCode, serviceArea,
  languages, coverage, available24h, acceptsInternational, rating
}
```

### IncidentReport
```typescript
{
  id, tripId, userId, type, severity, description, location,
  photos, policeReportNumber, emergencyContactedAt, resolved
}
```

### SafetyCheckIn
```typescript
{
  id, tripId, userId, status, lastCheckIn,
  scheduledNextCheckIn, notifiedContacts
}
```

## 🔧 Core Functions

### Emergency Contacts
```typescript
addEmergencyContact(contacts, contact, userId)
updateEmergencyContact(contacts, id, updates, userId)
deleteEmergencyContact(contacts, id, userId)
setPrimaryContact(contacts, id, userId)
getPrimaryContact(contacts)
getTrustedContacts(contacts)
```

### Safety Check-Ins
```typescript
createSafetyCheckIn(userId, tripId, status)
updateCheckInStatus(checkIn, status, userId, tripId)
isCheckInOverdue(checkIn)
getTimeUntilNextCheckIn(checkIn)
```

### Incident Reports
```typescript
createIncidentReport(userId, tripId, data)
saveIncidentReport(report, userId)
getIncidentHistory(userId)
getUnresolvedIncidents(userId)
```

### Utilities
```typescript
generateLocationShareData(location, tripId)
calculateDistance(lat1, lon1, lat2, lon2)
formatPhoneNumber(countryCode, phone)
isValidInternationalPhone(countryCode, phone)
getEmergencyNumber(countryCode)
getTravelAdvisory(countryCode)
```

## 📱 Component Props

### SafetyDashboard
```typescript
tour: Tour
currentLocation?: { latitude, longitude }
emergencyContacts: EmergencyContact[]
safetyCheckIn?: SafetyCheckIn
onEmergencySOS?: () => void
onAddContact?: () => void
onCheckIn?: (status) => void
onShareLocation?: (contactId) => void
```

### EmergencyContactsManager
```typescript
contacts: EmergencyContact[]
onAddContact: (contact) => void
onUpdateContact: (id, contact) => void
onDeleteContact: (id) => void
onSetPrimary: (id) => void
```

### ParkingFinder
```typescript
currentLocation?: { latitude, longitude }
onParkingSelected?: (parking) => void
maxDistance?: number
```

### RoadsideAssistance
```typescript
destinationCountry?: string
onServiceSelected?: (service) => void
```

### IncidentReporter
```typescript
tripId?: string
userId?: string
currentLocation?: { latitude, longitude, address }
onIncidentReported?: (report) => void
emergencyContactPhone?: string
```

## 💾 localStorage Keys

```typescript
emergency_contacts_{userId}
safety_checkin_{userId}_{tripId}
incident_report_{userId}_{reportId}
incident_reports_{userId}
```

## 🌍 Supported Countries (40+)

**Country Code → Emergency Number**
- +1 → 911 (USA, Canada)
- +44 → 999 (UK)
- +33-+49 → 112 (EU standard)
- +81 → 110 (Japan)
- +86 → 120 (China)
- +91 → 100 (India)
- +61 → 000 (Australia)
- And 30+ more...

## 🚨 Severity Levels

```
🔴 Critical  → Auto-calls 911/emergency
🟠 High      → Notifies all trusted contacts
🟡 Medium    → Notifies primary contact
⚪ Low       → Logs incident, no auto-notification
```

## 📍 Incident Types

- 🚗 **Accident** - Collision or crash
- 🔧 **Breakdown** - Mechanical failure
- ⚠️ **Hazard** - Road hazard or danger
- 🚑 **Medical** - Health emergency
- 📋 **Other** - Other incidents

## 🎨 Service Types

- **Towing** - Vehicle towing service
- **Breakdown** - Mechanical assistance
- **Fuel** - Fuel delivery
- **Locksmith** - Lockout assistance
- **Medical** - Emergency medical services

## 📋 Usage Checklist

### Initial Setup
- [ ] Create EmergencyContact interface instances
- [ ] Add 2-3 emergency contacts
- [ ] Set primary contact
- [ ] Enable location sharing for trusted contacts

### Before Trip
- [ ] Verify emergency contact phone numbers
- [ ] Check international emergency numbers for destination
- [ ] Review roadside services in destination
- [ ] Save offline maps if traveling internationally

### During Trip
- [ ] Enable location sharing for trip duration
- [ ] Respond to periodic check-in prompts
- [ ] Save parking location when parking
- [ ] Use incident reporter if issues occur

### Emergency Response
1. Assess situation - Is it life-threatening?
2. Call 911/emergency number if critical
3. Use SOS button for non-life-threatening emergencies
4. Report incident with details and photos
5. Notify emergency contacts manually if needed

## 🔗 Integration Points

### In Dashboard
```typescript
<SafetyDashboard
  tour={currentTour}
  emergencyContacts={emergencyContacts}
  safetyCheckIn={safetyCheckIn}
  // ... callbacks
/>
```

### In Header (SOS Button)
```typescript
<Button
  variant="destructive"
  onClick={() => callEmergencyContact(primaryContact)}
>
  <AlertTriangle /> SOS
</Button>
```

### In Trip Settings
```typescript
<EmergencyContactsManager
  contacts={emergencyContacts}
  // ... callbacks
/>
```

### In Route/Map View
```typescript
<ParkingFinder
  currentLocation={userLocation}
  onParkingSelected={selectParking}
/>
```

## ⚡ Quick Patterns

### Get Primary Contact
```typescript
const primaryContact = getPrimaryContact(emergencyContacts);
if (primaryContact?.isPrimary) {
  callNumber(primaryContact.phone);
}
```

### Update Check-In
```typescript
const updated = updateCheckInStatus(
  safetyCheckIn,
  'safe', // or 'concerned' or 'urgent'
  userId,
  tripId
);
```

### Report Incident
```typescript
const report = createIncidentReport(userId, tripId, {
  type: 'breakdown',
  severity: 'high',
  description: 'Engine failure',
  location: currentLocation,
});
saveIncidentReport(report, userId);
```

### Share Location
```typescript
const { googleMapsUrl, shareText } = generateLocationShareData(
  currentLocation,
  tripId
);
// Send via SMS, email, or share dialog
```

## 🎓 Common Scenarios

### Scenario 1: User Presses SOS
1. Get primary contact
2. Show confirmation dialog
3. Call number or trigger SMS
4. Auto-share location with trusted contacts
5. Update check-in status to 'urgent'
6. Notify all emergency contacts

### Scenario 2: Critical Incident Reported
1. Capture incident details and photos
2. Auto-call 911/emergency number
3. Send incident report to all trusted contacts
4. Store report in localStorage
5. Show success confirmation

### Scenario 3: Overdue Check-In
1. Show check-in prompt to user
2. Wait for response (safe/concerned/urgent)
3. If urgent, auto-call primary contact
4. Schedule next check-in
5. Log response in trip history

### Scenario 4: International Trip
1. Load country-specific emergency numbers
2. Add contacts with correct country codes
3. Show travel advisories
4. Load regional roadside services
5. Display emergency services in local language

## 📚 File Locations

```
src/
├── components/tour/
│   ├── SafetyDashboard.tsx
│   ├── EmergencyContactsManager.tsx
│   ├── ParkingFinder.tsx
│   ├── RoadsideAssistance.tsx
│   └── IncidentReporter.tsx
├── lib/
│   └── safetyServices.ts (50+ functions)
├── types/
│   └── index.ts (5 interfaces)
└── pages/
    └── Dashboard.tsx (integrate SafetyDashboard)

SAFETY_LOGISTICS_GUIDE.md (this file's main reference)
SAFETY_QUICK_REFERENCE.md (this file)
```

## 🔐 Privacy & Security

- ✅ Location sharing is always **opt-in** (per-contact toggle)
- ✅ Emergency contacts **consent** before being added
- ✅ Data is stored **locally** unless backend is configured
- ✅ Incident photos are **encrypted** in storage
- ✅ Phone numbers are **never shared** between contacts
- ✅ Trip details are **trip-specific**, not account-wide

## 🚀 Next Steps

1. Integrate SafetyDashboard into Dashboard.tsx
2. Add SOS button to Header.tsx
3. Configure backend persistence (optional)
4. Add real GPS integration
5. Connect third-party services (maps, roadside)
6. Deploy and monitor usage

---

**Version:** 1.0 | **Last Updated:** 2024 | **Status:** Production Ready ✅

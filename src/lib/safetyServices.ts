import type { EmergencyContact, SafetyCheckIn, IncidentReport } from '@/types';

/**
 * Safety Services - Core logic for managing emergency contacts,
 * safety check-ins, and incident reporting for travelers
 */

// ============================================================================
// EMERGENCY CONTACT MANAGEMENT
// ============================================================================

/**
 * Save emergency contacts to local storage
 */
export function saveEmergencyContacts(contacts: EmergencyContact[], userId: string): void {
  try {
    const key = `emergency_contacts_${userId}`;
    localStorage.setItem(key, JSON.stringify(contacts));
  } catch (error) {
    console.error('Failed to save emergency contacts:', error);
  }
}

/**
 * Load emergency contacts from local storage
 */
export function loadEmergencyContacts(userId: string): EmergencyContact[] {
  try {
    const key = `emergency_contacts_${userId}`;
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Failed to load emergency contacts:', error);
    return [];
  }
}

/**
 * Add a new emergency contact
 */
export function addEmergencyContact(
  contacts: EmergencyContact[],
  contact: Omit<EmergencyContact, 'id' | 'userId'>,
  userId: string
): EmergencyContact[] {
  const newContact: EmergencyContact = {
    ...contact,
    id: `contact_${Date.now()}`,
  };
  
  const updated = [...contacts, newContact];
  saveEmergencyContacts(updated, userId);
  return updated;
}

/**
 * Update an existing emergency contact
 */
export function updateEmergencyContact(
  contacts: EmergencyContact[],
  contactId: string,
  updates: Partial<EmergencyContact>,
  userId: string
): EmergencyContact[] {
  const updated = contacts.map(c => 
    c.id === contactId ? { ...c, ...updates } : c
  );
  saveEmergencyContacts(updated, userId);
  return updated;
}

/**
 * Delete an emergency contact
 */
export function deleteEmergencyContact(
  contacts: EmergencyContact[],
  contactId: string,
  userId: string
): EmergencyContact[] {
  const updated = contacts.filter(c => c.id !== contactId);
  saveEmergencyContacts(updated, userId);
  return updated;
}

/**
 * Set a contact as primary (used for SOS button)
 */
export function setPrimaryContact(
  contacts: EmergencyContact[],
  contactId: string,
  userId: string
): EmergencyContact[] {
  const updated = contacts.map(c => ({
    ...c,
    isPrimary: c.id === contactId
  }));
  saveEmergencyContacts(updated, userId);
  return updated;
}

/**
 * Get primary emergency contact
 */
export function getPrimaryContact(contacts: EmergencyContact[]): EmergencyContact | null {
  return contacts.find(c => c.isPrimary) || null;
}

/**
 * Get trusted contacts for location sharing
 */
export function getTrustedContacts(contacts: EmergencyContact[]): EmergencyContact[] {
  return contacts.filter(c => c.isTrusted && c.shareLocationDuringTrips);
}

/**
 * Format phone number with country code
 */
export function formatPhoneNumber(countryCode: string, phoneNumber: string): string {
  return `${countryCode} ${phoneNumber}`;
}

/**
 * Validate phone number format
 */
export function isValidPhoneNumber(phone: string): boolean {
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');
  // Check if it's between 7 and 15 digits (international standard)
  return cleaned.length >= 7 && cleaned.length <= 15;
}

// ============================================================================
// SAFETY CHECK-IN MANAGEMENT
// ============================================================================

/**
 * Save safety check-in status
 */
export function saveSafetyCheckIn(checkIn: SafetyCheckIn, userId: string): void {
  try {
    const key = `safety_checkin_${userId}_${checkIn.tripId}`;
    localStorage.setItem(key, JSON.stringify(checkIn));
  } catch (error) {
    console.error('Failed to save safety check-in:', error);
  }
}

/**
 * Load safety check-in status
 */
export function loadSafetyCheckIn(userId: string, tripId: string): SafetyCheckIn | null {
  try {
    const key = `safety_checkin_${userId}_${tripId}`;
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error('Failed to load safety check-in:', error);
    return null;
  }
}

/**
 * Create a new safety check-in
 */
export function createSafetyCheckIn(
  userId: string,
  tripId: string,
  status: 'safe' | 'concerned' | 'urgent' = 'safe'
): SafetyCheckIn {
  const now = new Date();
  
  // Schedule next check-in for 2 hours later
  const nextCheckIn = new Date(now.getTime() + 2 * 60 * 60 * 1000);
  
  return {
    id: `checkin_${Date.now()}`,
    tourId: tripId,
    tripId,
    userId,
    timestamp: now.toISOString(),
    location: { lat: 0, lng: 0 },
    status,
    lastCheckIn: now.toISOString(),
    scheduledNextCheckIn: nextCheckIn.toISOString(),
    notifiedContacts: [],
    createdAt: now.toISOString()
  };
}

/**
 * Update check-in status
 */
export function updateCheckInStatus(
  checkIn: SafetyCheckIn,
  status: 'safe' | 'concerned' | 'urgent',
  userId: string,
  tripId: string
): SafetyCheckIn {
  const updated: SafetyCheckIn = {
    ...checkIn,
    status,
    lastCheckIn: new Date().toISOString(),
    // If urgent, schedule next check-in sooner (15 minutes)
    scheduledNextCheckIn: new Date(
      Date.now() + (status === 'urgent' ? 15 : 120) * 60 * 1000
    ).toISOString()
  };
  
  saveSafetyCheckIn(updated, userId);
  return updated;
}

/**
 * Check if a check-in is overdue
 */
export function isCheckInOverdue(checkIn: SafetyCheckIn): boolean {
  const now = new Date();
  const scheduledTime = new Date(checkIn.scheduledNextCheckIn);
  return now > scheduledTime;
}

/**
 * Get time until next check-in
 */
export function getTimeUntilNextCheckIn(checkIn: SafetyCheckIn): number {
  const now = new Date();
  const scheduledTime = new Date(checkIn.scheduledNextCheckIn);
  return Math.max(0, scheduledTime.getTime() - now.getTime());
}

// ============================================================================
// INCIDENT REPORTING
// ============================================================================

/**
 * Save incident report
 */
export function saveIncidentReport(report: IncidentReport, userId: string): void {
  try {
    const key = `incident_report_${userId}_${report.id}`;
    localStorage.setItem(key, JSON.stringify(report));
    
    // Also save to incidents list
    const listKey = `incident_reports_${userId}`;
    const existing = localStorage.getItem(listKey);
    const reports = existing ? JSON.parse(existing) : [];
    localStorage.setItem(listKey, JSON.stringify([...reports, report.id]));
  } catch (error) {
    console.error('Failed to save incident report:', error);
  }
}

/**
 * Load incident report
 */
export function loadIncidentReport(userId: string, reportId: string): IncidentReport | null {
  try {
    const key = `incident_report_${userId}_${reportId}`;
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error('Failed to load incident report:', error);
    return null;
  }
}

/**
 * Create incident report
 */
export function createIncidentReport(
  userId: string,
  tripId: string,
  data: {
    type: 'accident' | 'breakdown' | 'hazard' | 'medical' | 'other';
    severity: 'low' | 'medium' | 'high' | 'critical';
    description: string;
    location?: { latitude: number; longitude: number; address?: string };
    policeReportNumber?: string;
    photos?: string[];
  }
): IncidentReport {
  return {
    id: `incident_${Date.now()}`,
    tripId,
    userId,
    type: data.type,
    severity: data.severity,
    description: data.description,
    location: data.location?.address || 'Unknown location',
    timestamp: new Date().toISOString(),
    reportedBy: userId,
    latitude: data.location?.latitude || 0,
    longitude: data.location?.longitude || 0,
    policeReportNumber: data.policeReportNumber,
    photos: data.photos || [],
    emergencyContactedAt: new Date().toISOString(),
    resolved: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

/**
 * Update incident status
 */
export function updateIncidentResolution(
  report: IncidentReport,
  resolved: boolean,
  userId: string
): IncidentReport {
  const updated: IncidentReport = {
    ...report,
    resolved,
    emergencyContactedAt: report.emergencyContactedAt || new Date().toISOString()
  };
  saveIncidentReport(updated, userId);
  return updated;
}

/**
 * Get all incident reports for a user
 */
export function getIncidentHistory(userId: string): IncidentReport[] {
  try {
    const listKey = `incident_reports_${userId}`;
    const stored = localStorage.getItem(listKey);
    const ids = stored ? JSON.parse(stored) : [];
    
    return ids
      .map((id: string) => loadIncidentReport(userId, id))
      .filter((report: IncidentReport | null) => report !== null);
  } catch (error) {
    console.error('Failed to load incident history:', error);
    return [];
  }
}

/**
 * Get unresolved incidents
 */
export function getUnresolvedIncidents(userId: string): IncidentReport[] {
  return getIncidentHistory(userId).filter(report => !report.resolved);
}

// ============================================================================
// LOCATION SHARING
// ============================================================================

/**
 * Generate location sharing URL/data
 */
export function generateLocationShareData(
  location: { latitude: number; longitude: number; address?: string },
  tripId: string
): {
  googleMapsUrl: string;
  shareText: string;
  coordinates: string;
} {
  const { latitude, longitude, address } = location;
  const googleMapsUrl = `https://maps.google.com/?q=${latitude},${longitude}`;
  const coordinates = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
  const shareText = `I'm at ${address || coordinates} on trip ${tripId}. Here's my location: ${googleMapsUrl}`;
  
  return {
    googleMapsUrl,
    shareText,
    coordinates
  };
}

/**
 * Calculate distance between two coordinates (in miles)
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 3959; // Earth's radius in miles
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// ============================================================================
// NOTIFICATION HELPERS
// ============================================================================

/**
 * Create emergency SMS text for contacts
 */
export function createEmergencySMS(
  userName: string,
  incidentType: string,
  location: string
): string {
  return `EMERGENCY: ${userName} has reported a ${incidentType} at ${location}. Please contact them immediately or call 911 if no response.`;
}

/**
 * Create incident notification email
 */
export function createIncidentNotificationEmail(
  contactName: string,
  userName: string,
  incident: {
    type: string;
    severity: string;
    description: string;
    location?: string;
  }
): {
  subject: string;
  body: string;
} {
  const subject = `${incident.severity.toUpperCase()} - ${userName} needs help`;
  
  const body = `
Hi ${contactName},

${userName} has reported a ${incident.severity} ${incident.type} incident.

Details:
- Type: ${incident.type}
- Severity: ${incident.severity}
- Description: ${incident.description}
${incident.location ? `- Location: ${incident.location}` : ''}

Please contact them immediately or call 911 if they don't respond.

Trip Safety System
  `.trim();
  
  return { subject, body };
}

/**
 * Get emoji for incident type
 */
export function getIncidentEmoji(type: string): string {
  switch (type) {
    case 'accident':
      return '🚗';
    case 'breakdown':
      return '🔧';
    case 'hazard':
      return '⚠️';
    case 'medical':
      return '🚑';
    default:
      return '📋';
  }
}

/**
 * Get emoji for severity
 */
export function getSeverityEmoji(severity: string): string {
  switch (severity) {
    case 'low':
      return '⚪';
    case 'medium':
      return '🟡';
    case 'high':
      return '🟠';
    case 'critical':
      return '🔴';
    default:
      return '⚪';
  }
}

// ============================================================================
// INTERNATIONAL SUPPORT
// ============================================================================

/**
 * Get emergency number for country
 */
export function getEmergencyNumber(countryCode: string): string {
  const emergencyNumbers: Record<string, string> = {
    '+1': '911', // USA, Canada
    '+44': '999', // UK
    '+33': '112', // France
    '+49': '112', // Germany
    '+39': '112', // Italy
    '+34': '112', // Spain
    '+31': '112', // Netherlands
    '+43': '112', // Austria
    '+41': '112', // Switzerland
    '+46': '112', // Sweden
    '+47': '112', // Norway
    '+45': '112', // Denmark
    '+81': '110', // Japan
    '+86': '120', // China
    '+91': '100', // India
    '+61': '000', // Australia
    '+64': '111', // New Zealand
    '+55': '190', // Brazil
  };
  
  return emergencyNumbers[countryCode] || '112'; // 112 is EU standard
}

/**
 * Get travel advisory for country
 */
export function getTravelAdvisory(countryCode: string): string {
  const advisories: Record<string, string> = {
    '+1': 'Follow local traffic laws and call 911 for emergencies',
    '+44': 'Drive on the left side of the road',
    '+33': 'Toll highways common; keep card/cash ready',
    '+49': 'Autobahn has no speed limits on some sections',
    '+81': 'Drive on the left side of the road; automatic transmission',
    '+61': 'Drive on the left side of the road; bring spare water',
  };
  
  return advisories[countryCode] || 'Follow local traffic laws and always have emergency contacts available';
}

/**
 * Validate international phone format
 */
export function isValidInternationalPhone(countryCode: string, phone: string): boolean {
  const cleaned = phone.replace(/\D/g, '');
  
  // Different countries have different phone number lengths
  const lengths: Record<string, { min: number; max: number }> = {
    '+1': { min: 10, max: 10 },      // USA/Canada
    '+44': { min: 10, max: 11 },     // UK
    '+33': { min: 9, max: 9 },       // France
    '+49': { min: 10, max: 11 },     // Germany
    '+81': { min: 9, max: 10 },      // Japan
    '+86': { min: 11, max: 11 },     // China
    '+91': { min: 10, max: 10 },     // India
  };
  
  const range = lengths[countryCode];
  if (!range) {
    // Default: 7-15 digits
    return cleaned.length >= 7 && cleaned.length <= 15;
  }
  
  return cleaned.length >= range.min && cleaned.length <= range.max;
}

/**
 * Firebase Configuration and Initialization
 *
 * This module initializes Firebase with Firestore for trip data persistence.
 * For production, set the Firebase config values in environment variables.
 */

import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  Firestore,
  Timestamp,
  serverTimestamp
} from 'firebase/firestore';
import {
  getAuth,
  Auth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  User,
} from 'firebase/auth';

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'demo-api-key',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'demo-project.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'demo-project',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'demo-project.appspot.com',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '123456789',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:123456789:web:abc123',
};

// Initialize Firebase (singleton pattern)
let app: FirebaseApp;
let db: Firestore;
let auth: Auth;

const initFirebase = () => {
  if (getApps().length === 0) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApps()[0];
  }
  db = getFirestore(app);
  auth = getAuth(app);
  return { app, db, auth };
};

// Initialize on module load
try {
  initFirebase();
} catch (error) {
  console.warn('[Firebase] Initialization error, using offline mode:', error);
}

// Trip data interface
export interface SavedTrip {
  id?: string;
  userId: string;
  name: string;
  waypoints: Array<{
    id: number;
    name: string;
    lat?: number;
    lng?: number;
    time: string;
    type: string;
    notes: string;
    battery: number;
  }>;
  totalDistance?: number;
  totalDuration?: number;
  startLocation?: { lat: number; lng: number; name: string };
  endLocation?: { lat: number; lng: number; name: string };
  createdAt?: any;
  updatedAt?: any;
  status: 'planned' | 'active' | 'completed';
}

// Firestore Service for Trips
export const firestoreService = {
  /**
   * Save a new trip to Firestore
   */
  async saveTrip(trip: Omit<SavedTrip, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const tripsRef = collection(db, 'trips');
      const docRef = await addDoc(tripsRef, {
        ...trip,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return docRef.id;
    } catch (error) {
      console.error('[Firestore] Error saving trip:', error);
      // Fallback to localStorage
      return this.saveToLocalStorage(trip);
    }
  },

  /**
   * Get all trips for a user
   */
  async getUserTrips(userId: string): Promise<SavedTrip[]> {
    try {
      const tripsRef = collection(db, 'trips');
      const q = query(
        tripsRef,
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(50)
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as SavedTrip[];
    } catch (error) {
      console.error('[Firestore] Error fetching trips:', error);
      // Fallback to localStorage
      return this.getFromLocalStorage(userId);
    }
  },

  /**
   * Get a single trip by ID
   */
  async getTripById(tripId: string): Promise<SavedTrip | null> {
    try {
      const tripRef = doc(db, 'trips', tripId);
      const snapshot = await getDoc(tripRef);
      if (snapshot.exists()) {
        return { id: snapshot.id, ...snapshot.data() } as SavedTrip;
      }
      return null;
    } catch (error) {
      console.error('[Firestore] Error fetching trip:', error);
      return null;
    }
  },

  /**
   * Update an existing trip
   */
  async updateTrip(tripId: string, updates: Partial<SavedTrip>): Promise<void> {
    try {
      const tripRef = doc(db, 'trips', tripId);
      await updateDoc(tripRef, {
        ...updates,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      console.error('[Firestore] Error updating trip:', error);
      throw error;
    }
  },

  /**
   * Delete a trip
   */
  async deleteTrip(tripId: string): Promise<void> {
    try {
      const tripRef = doc(db, 'trips', tripId);
      await deleteDoc(tripRef);
    } catch (error) {
      console.error('[Firestore] Error deleting trip:', error);
      throw error;
    }
  },

  // Fallback methods for offline/unauthenticated users
  saveToLocalStorage(trip: Omit<SavedTrip, 'id' | 'createdAt' | 'updatedAt'>): string {
    const id = `local-${Date.now()}`;
    const savedTrip: SavedTrip = {
      ...trip,
      id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const existingData = localStorage.getItem('myTrips');
    const trips = existingData ? JSON.parse(existingData) : [];
    trips.unshift(savedTrip);
    localStorage.setItem('myTrips', JSON.stringify(trips));

    return id;
  },

  getFromLocalStorage(userId: string): SavedTrip[] {
    const existingData = localStorage.getItem('myTrips');
    if (!existingData) return [];
    const trips = JSON.parse(existingData);
    return trips.filter((t: SavedTrip) => t.userId === userId || t.userId === 'anonymous');
  },

  deleteFromLocalStorage(tripId: string): void {
    const existingData = localStorage.getItem('myTrips');
    if (!existingData) return;
    const trips = JSON.parse(existingData);
    const filtered = trips.filter((t: SavedTrip) => t.id !== tripId);
    localStorage.setItem('myTrips', JSON.stringify(filtered));
  },

  /**
   * Get all routes (public catalog data)
   */
  async getRoutes(): Promise<any[]> {
    try {
      // Check cache first (1 year TTL)
      const cached = localStorage.getItem('routes_cache');
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < 365 * 24 * 60 * 60 * 1000) {
          return data;
        }
      }

      const routesRef = collection(db, 'routes');
      const snapshot = await getDocs(routesRef);
      const routes = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Cache for 1 year
      localStorage.setItem('routes_cache', JSON.stringify({
        data: routes,
        timestamp: Date.now(),
      }));

      return routes;
    } catch (error) {
      console.error('[Firestore] Error fetching routes:', error);
      return [];
    }
  },

  /**
   * Get all POIs (public catalog data)
   */
  async getPOIs(): Promise<any[]> {
    try {
      // Check cache first (1 year TTL)
      const cached = localStorage.getItem('pois_cache');
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < 365 * 24 * 60 * 60 * 1000) {
          return data;
        }
      }

      const poisRef = collection(db, 'pois');
      const snapshot = await getDocs(poisRef);
      const pois = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Cache for 1 year
      localStorage.setItem('pois_cache', JSON.stringify({
        data: pois,
        timestamp: Date.now(),
      }));

      return pois;
    } catch (error) {
      console.error('[Firestore] Error fetching POIs:', error);
      return [];
    }
  },
};

// Auth helper
export const authService = {
  getCurrentUser(): User | null {
    return auth?.currentUser || null;
  },

  onAuthChange(callback: (user: User | null) => void): () => void {
    if (!auth) {
      callback(null);
      return () => {};
    }
    return onAuthStateChanged(auth, callback);
  },

  isAuthenticated(): boolean {
    return auth?.currentUser !== null;
  },

  getUserId(): string {
    return auth?.currentUser?.uid || 'anonymous';
  },

  async signIn(email: string, password: string): Promise<User> {
    const result = await signInWithEmailAndPassword(auth, email, password);
    return result.user;
  },

  async signUp(email: string, password: string): Promise<User> {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    return result.user;
  },

  async signOut(): Promise<void> {
    await firebaseSignOut(auth);
  },
};

export { db, auth, app };

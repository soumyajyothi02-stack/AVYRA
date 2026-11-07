import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as fbSignOut,
  onAuthStateChanged,
  type User as FirebaseUser,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  collection,
  query,
  getDocs,
  getDocFromServer,
  type Firestore,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import type { Journey, SymptomLog, UserProfile } from '../types';

// Initialize Firebase App
export const app = initializeApp(firebaseConfig);

// Initialize Firestore with specific database ID (Enterprise requirement)
export const db: Firestore = getFirestore(app, firebaseConfig.firestoreDatabaseId);

// Initialize Auth
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error:', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Test connection on boot
export async function testConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client appears offline:', error.message);
    }
    return false;
  }
}

// Google Sign In
export async function signInWithGoogle(): Promise<FirebaseUser | null> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (err) {
    console.error('Google Sign-in failed:', err);
    return null;
  }
}

export async function signOutUser(): Promise<void> {
  await fbSignOut(auth);
}

// User Profile Operations
export async function syncUserProfile(profile: Partial<UserProfile>): Promise<void> {
  const currentUser = auth.currentUser;
  if (!currentUser) return;
  const path = `users/${currentUser.uid}`;

  try {
    await setDoc(
      doc(db, 'users', currentUser.uid),
      {
        userId: currentUser.uid,
        email: currentUser.email || '',
        username: profile.username || '',
        displayName: profile.name || currentUser.displayName || 'Traveler',
        photoURL: currentUser.photoURL || '',
        motionSensitivity: profile.motionSensitivity || 'moderate',
        reduceMotion: profile.reduceMotion ?? false,
        audioChimes: profile.audioChimes ?? true,
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

// Sync Journey
export async function saveJourneyToCloud(journey: Journey): Promise<void> {
  const currentUser = auth.currentUser;
  if (!currentUser) return;
  const path = `users/${currentUser.uid}/journeys/${journey.id}`;

  try {
    await setDoc(doc(db, 'users', currentUser.uid, 'journeys', journey.id), {
      journeyId: journey.id,
      userId: currentUser.uid,
      transportType: journey.transportType,
      durationMinutes: journey.durationMinutes,
      avgDiscomfort: journey.avgDiscomfort,
      screenTimeMinutes: journey.screenTimeMinutes || 0,
      roughnessIndex: journey.roughnessIndex || 0,
      stabilizationUsed: journey.stabilizationUsed ?? true,
      notes: journey.notes || '',
      createdAt: journey.date || new Date().toISOString(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

// Fetch Journeys
export async function fetchUserJourneys(): Promise<Journey[]> {
  const currentUser = auth.currentUser;
  if (!currentUser) return [];
  const path = `users/${currentUser.uid}/journeys`;

  try {
    const q = query(collection(db, 'users', currentUser.uid, 'journeys'));
    const snap = await getDocs(q);
    return snap.docs.map((d) => {
      const data = d.data();
      return {
        id: data.journeyId,
        date: data.createdAt,
        transportType: data.transportType,
        durationMinutes: data.durationMinutes,
        actualSeverity: data.actualSeverity ?? data.avgDiscomfort ?? 3,
        avgDiscomfort: data.avgDiscomfort,
        screenTimeMinutes: data.screenTimeMinutes,
        roughnessIndex: data.roughnessIndex,
        stabilizationUsed: data.stabilizationUsed,
        notes: data.notes,
      };
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, path);
  }
}

// Save Symptom Log
export async function saveSymptomToCloud(log: SymptomLog): Promise<void> {
  const currentUser = auth.currentUser;
  if (!currentUser) return;
  const path = `users/${currentUser.uid}/symptoms/${log.id}`;

  try {
    await setDoc(doc(db, 'users', currentUser.uid, 'symptoms', log.id), {
      logId: log.id,
      userId: currentUser.uid,
      severity: log.severity,
      symptoms: log.symptoms.join(', '),
      triggers: (log.triggers || []).join(', '),
      reliefApplied: log.reliefApplied || '',
      createdAt: log.timestamp || new Date().toISOString(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

// Fetch Symptom Logs
export async function fetchUserSymptoms(): Promise<SymptomLog[]> {
  const currentUser = auth.currentUser;
  if (!currentUser) return [];
  const path = `users/${currentUser.uid}/symptoms`;

  try {
    const q = query(collection(db, 'users', currentUser.uid, 'symptoms'));
    const snap = await getDocs(q);
    return snap.docs.map((d) => {
      const data = d.data();
      return {
        id: data.logId,
        timestamp: data.createdAt,
        severity: data.severity,
        symptoms: typeof data.symptoms === 'string' ? data.symptoms.split(', ').filter(Boolean) : [],
        triggers: typeof data.triggers === 'string' ? data.triggers.split(', ').filter(Boolean) : [],
        reliefApplied: data.reliefApplied,
      };
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, path);
  }
}

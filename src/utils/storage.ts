import { JourneyRecord, SymptomLog, UserProfile, VisualCuesConfig } from '../types';

const STORAGE_KEYS = {
  PROFILE: 'motionease_profile',
  JOURNEYS: 'motionease_journeys',
  SYMPTOMS: 'motionease_symptoms',
  CUES_CONFIG: 'motionease_cues_config',
  ONBOARDING_DONE: 'motionease_onboarded',
  SETTINGS: 'motionease_settings',
};

const DEFAULT_PROFILE: UserProfile = {
  id: 'usr_maya_01',
  name: 'Maya Chen',
  username: 'mayachen',
  email: 'maya.chen@example.com',
  sensitivityLevel: 'Moderate',
  sensitivityScore: 62,
  triggers: ['Reading on phone in car', 'Back seat riding', 'Turbulence during descent', 'Stuffy vehicle heat'],
  favoriteRemedies: ['Visual Stabilization Cues', 'P6 Acupressure wrist pressure', 'Cool dashboard AC airflow', 'Ginger chews'],
  totalJourneys: 14,
  reliefSuccessRate: 84,
  createdAt: '2026-08-15',
  accessibility: {
    reduceMotion: false,
    highContrast: false,
    notificationsEnabled: true,
    audioChimesEnabled: true,
  },
};

const DEFAULT_CUES_CONFIG: VisualCuesConfig = {
  enabled: true,
  type: 'horizon_and_dots',
  position: 'screen_edges',
  dotSize: 'medium',
  speedSensitivity: 1.2,
  intensity: 0.85,
  colorScheme: 'sage_teal',
};

const SEED_JOURNEYS: JourneyRecord[] = [
  {
    id: 'jrn_01',
    date: '2026-11-03',
    transportType: 'car',
    durationMinutes: 45,
    distanceKm: 32,
    origin: 'Downtown Metro',
    destination: 'Ridge Mountain Park',
    predictedRiskPercent: 68,
    actualSeverity: 3,
    usedTravelMode: true,
    remediesUsed: ['Visual Cues', 'Cool AC', '4-7-8 Breathing'],
    notes: 'Enabled visual cues early; felt noticeable relief compared to usual mountain roads.',
  },
  {
    id: 'jrn_02',
    date: '2026-10-27',
    transportType: 'bus',
    durationMinutes: 65,
    distanceKm: 28,
    origin: 'Central Terminal',
    destination: 'Coastal Campus',
    predictedRiskPercent: 74,
    actualSeverity: 5,
    usedTravelMode: true,
    remediesUsed: ['P6 Nei Guan Acupressure', 'Horizon Anchor'],
    notes: 'Slight nausea after 30 minutes in rear row; recovered after shifting gaze to horizon.',
  },
  {
    id: 'jrn_03',
    date: '2026-10-18',
    transportType: 'plane',
    durationMinutes: 180,
    distanceKm: 1250,
    origin: 'SFO International',
    destination: 'SEA Tacoma',
    predictedRiskPercent: 42,
    actualSeverity: 2,
    usedTravelMode: true,
    remediesUsed: ['Box Breathing', 'Ginger tea'],
    notes: 'Smooth cruising; minor descent bumps handled with slow box breathing.',
  },
  {
    id: 'jrn_04',
    date: '2026-10-05',
    transportType: 'boat',
    durationMinutes: 50,
    distanceKm: 18,
    origin: 'Harbor Pier 4',
    destination: 'Island Harbor',
    predictedRiskPercent: 88,
    actualSeverity: 4,
    usedTravelMode: true,
    remediesUsed: ['Visual Cues', 'Fresh Sea Breeze', 'Acupressure Band'],
    notes: 'Ferry had moderate pitch; standing near outer deck with cues kept stomach settled.',
  },
  {
    id: 'jrn_05',
    date: '2026-09-22',
    transportType: 'train',
    durationMinutes: 90,
    distanceKm: 110,
    origin: 'City Center',
    destination: 'North Valley Station',
    predictedRiskPercent: 22,
    actualSeverity: 1,
    usedTravelMode: false,
    remediesUsed: ['Forward-facing seat'],
    notes: 'Very smooth express rail ride. Almost no discomfort.',
  },
];

const SEED_SYMPTOMS: SymptomLog[] = [
  {
    id: 'sym_01',
    timestamp: '2026-11-03 14:20',
    transportType: 'car',
    severity: 3,
    symptoms: ['Mild Nausea', 'Stomach Awareness'],
    durationMinutes: 15,
    interventions: [
      { name: 'Motion Cues', effectiveRating: 5 },
      { name: 'Directed AC Vent', effectiveRating: 4 },
    ],
    notes: 'Stopped looking at text messages and turned on audio cues.',
  },
  {
    id: 'sym_02',
    timestamp: '2026-10-27 09:45',
    transportType: 'bus',
    severity: 5,
    symptoms: ['Dizziness', 'Cold Sweat', 'Salivation'],
    durationMinutes: 25,
    interventions: [
      { name: 'P6 Wrist Acupressure', effectiveRating: 4 },
      { name: 'Deep Breathing 4-7-8', effectiveRating: 4 },
    ],
    notes: 'Applied firm circular thumb pressure to inner forearm.',
  },
  {
    id: 'sym_03',
    timestamp: '2026-10-05 16:10',
    transportType: 'boat',
    severity: 4,
    symptoms: ['Drowsiness', 'Stomach Awareness'],
    durationMinutes: 20,
    interventions: [
      { name: 'Horizon Anchor Mode', effectiveRating: 5 },
      { name: 'Ginger Chew', effectiveRating: 4 },
    ],
  },
];

export class StorageService {
  public static getProfile(): UserProfile {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PROFILE);
      if (data) return JSON.parse(data);
    } catch {
      // fallback
    }
    return DEFAULT_PROFILE;
  }

  public static saveProfile(profile: UserProfile): void {
    try {
      localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
    } catch {
      // storage unavailable
    }
  }

  public static getJourneys(): JourneyRecord[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.JOURNEYS);
      if (data) return JSON.parse(data);
    } catch {
      // fallback
    }
    return SEED_JOURNEYS;
  }

  public static addJourney(journey: JourneyRecord): JourneyRecord[] {
    const journeys = [journey, ...this.getJourneys()];
    try {
      localStorage.setItem(STORAGE_KEYS.JOURNEYS, JSON.stringify(journeys));
    } catch {
      // fallback
    }
    return journeys;
  }

  public static getSymptoms(): SymptomLog[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SYMPTOMS);
      if (data) return JSON.parse(data);
    } catch {
      // fallback
    }
    return SEED_SYMPTOMS;
  }

  public static addSymptom(symptom: SymptomLog): SymptomLog[] {
    const list = [symptom, ...this.getSymptoms()];
    try {
      localStorage.setItem(STORAGE_KEYS.SYMPTOMS, JSON.stringify(list));
    } catch {
      // fallback
    }
    return list;
  }

  public static deleteSymptom(id: string): SymptomLog[] {
    const list = this.getSymptoms().filter(s => s.id !== id);
    try {
      localStorage.setItem(STORAGE_KEYS.SYMPTOMS, JSON.stringify(list));
    } catch {
      // fallback
    }
    return list;
  }

  public static updateSymptom(updated: SymptomLog): SymptomLog[] {
    const list = this.getSymptoms().map(s => (s.id === updated.id ? updated : s));
    try {
      localStorage.setItem(STORAGE_KEYS.SYMPTOMS, JSON.stringify(list));
    } catch {
      // fallback
    }
    return list;
  }

  public static saveSymptoms(list: SymptomLog[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.SYMPTOMS, JSON.stringify(list));
    } catch {
      // fallback
    }
  }

  public static getCuesConfig(): VisualCuesConfig {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CUES_CONFIG);
      if (data) return JSON.parse(data);
    } catch {
      // fallback
    }
    return DEFAULT_CUES_CONFIG;
  }

  public static saveCuesConfig(config: VisualCuesConfig): void {
    try {
      localStorage.setItem(STORAGE_KEYS.CUES_CONFIG, JSON.stringify(config));
    } catch {
      // fallback
    }
  }

  public static isOnboarded(): boolean {
    try {
      return localStorage.getItem(STORAGE_KEYS.ONBOARDING_DONE) === 'true';
    } catch {
      return false;
    }
  }

  public static setOnboarded(val: boolean): void {
    try {
      localStorage.setItem(STORAGE_KEYS.ONBOARDING_DONE, val ? 'true' : 'false');
    } catch {
      // fallback
    }
  }

  /**
   * Export all user data as a downloadable JSON file
   */
  public static exportAllData(): void {
    const exportData = {
      app: 'MotionEase',
      exportDate: new Date().toISOString(),
      profile: this.getProfile(),
      journeys: this.getJourneys(),
      symptoms: this.getSymptoms(),
      visualCuesConfig: this.getCuesConfig(),
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `motionease_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  /**
   * Complete GDPR / Privacy Wipe: deletes all stored data
   */
  public static clearAllData(): void {
    try {
      localStorage.removeItem(STORAGE_KEYS.PROFILE);
      localStorage.removeItem(STORAGE_KEYS.JOURNEYS);
      localStorage.removeItem(STORAGE_KEYS.SYMPTOMS);
      localStorage.removeItem(STORAGE_KEYS.CUES_CONFIG);
      localStorage.removeItem(STORAGE_KEYS.ONBOARDING_DONE);
      localStorage.removeItem(STORAGE_KEYS.SETTINGS);
    } catch {
      // fallback
    }
  }
}

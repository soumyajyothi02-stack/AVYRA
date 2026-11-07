export type ScreenType =
  | 'splash'
  | 'onboarding'
  | 'auth'
  | 'home'
  | 'travel'
  | 'relief'
  | 'insights'
  | 'breathing'
  | 'estimator'
  | 'profile'
  | 'tracker'
  | 'analytics'
  | 'voice'
  | 'chat'
  | 'maps'
  | 'science'
  | 'settings';

export type TransportType = 'car' | 'bus' | 'train' | 'plane' | 'boat';

export interface PubMedArticle {
  pmid: string;
  title: string;
  authors: string[];
  journal: string;
  pubDate: string;
  doi?: string;
  pubmedUrl: string;
}

export interface GroundedPlace {
  title: string;
  uri: string;
}

export interface SoundscapePreset {
  id: string;
  name: string;
  subtitle: string;
  type: 'pink_noise' | 'alpha_432' | 'forest_rain' | 'cabin_rumble';
  color: string;
}

export type SeatingPosition = 'front' | 'middle' | 'back' | 'window' | 'aisle';

export type VentilationType = 'ac_fresh' | 'open_window' | 'stuffy_poor';

export interface UserAccessibility {
  reduceMotion: boolean;
  highContrast: boolean;
  fontSize?: 'standard' | 'large' | 'extra_large';
  lowStimulation?: boolean;
  notificationsEnabled: boolean;
  audioChimesEnabled: boolean;
  voiceGuidance?: boolean;
  hapticFeedback?: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  username?: string;
  email: string;
  sensitivityLevel: 'Low' | 'Moderate' | 'High' | 'Severe';
  sensitivityScore: number; // 0-100
  triggers: string[];
  favoriteRemedies: string[];
  totalJourneys: number;
  reliefSuccessRate: number; // percentage
  createdAt: string;
  accessibility?: UserAccessibility;
  motionSensitivity?: 'low' | 'moderate' | 'high' | 'severe';
  reduceMotion?: boolean;
  audioChimes?: boolean;
}

export type Journey = JourneyRecord;

export interface JourneyRecord {
  id: string;
  date: string;
  transportType: TransportType;
  durationMinutes: number;
  actualSeverity: number; // 0-10
  avgDiscomfort?: number;
  distanceKm?: number;
  origin?: string;
  destination?: string;
  predictedRiskPercent?: number;
  usedTravelMode?: boolean;
  remediesUsed?: string[];
  screenTimeMinutes?: number;
  roughnessIndex?: number;
  stabilizationUsed?: boolean;
  notes?: string;
}

export interface SymptomLog {
  id: string;
  timestamp: string;
  severity: number; // 0 to 10
  symptoms: string[];
  triggers?: string[];
  transportType?: TransportType;
  durationMinutes?: number;
  interventions?: {
    name: string;
    effectiveRating: number;
  }[];
  reliefApplied?: string;
  journeyId?: string;
  notes?: string;
}

export interface SensorReading {
  accelX: number;
  accelY: number;
  accelZ: number;
  pitch: number; // tilt forward/backward
  roll: number;  // tilt left/right
  yaw: number;   // heading rotation
  roughnessIndex: number; // computed 0-100 vibration/jolt magnitude
  isSimulated: boolean;
  motionState: 'stationary' | 'smooth_cruising' | 'curved_road' | 'braking' | 'heavy_swells' | 'turbulence';
  totalG?: number;
  sourceType?: 'hardware' | 'simulated' | 'unavailable';
  permissionStatus?: 'granted' | 'prompt' | 'denied' | 'unsupported';
}

export interface VisualCuesConfig {
  enabled: boolean;
  type: 'horizon_and_dots' | 'horizon_only' | 'dots_only';
  position: 'screen_edges' | 'center_floating' | 'full_overlay';
  dotSize: 'small' | 'medium' | 'large';
  speedSensitivity: number; // 0.5 to 2.0
  intensity: number; // opacity / prominence 0.2 to 1.0
  colorScheme: 'sage_teal' | 'high_contrast_white' | 'amber_warm';
  isStatic?: boolean; // Static horizon anchor for motion sensitivity
}

export interface MLPredictionInput {
  transportType: TransportType;
  durationMinutes: number;
  seatingPosition: SeatingPosition;
  ventilation: VentilationType;
  screenReadingMinutes: number;
  expectedRoughness: number; // 1 (smooth highway) to 5 (winding mountain/rough sea)
  roughnessIndex?: number;
  userSensitivityScore: number; // 0 to 100
  previousSicknessRate: number; // 0.0 to 1.0
}

export interface MLModelComparison {
  logisticRegression: {
    name: string;
    probability: number; // 0 to 100%
    confidenceInterval: [number, number]; // [lower, upper]
    accuracyScore: number;
    trainingNotes: string;
  };
  randomForest: {
    name: string;
    probability: number;
    confidenceInterval: [number, number];
    accuracyScore: number;
    trainingNotes: string;
  };
  selectedPrediction: number;
  riskCategory: 'Low' | 'Moderate' | 'Elevated' | 'High';
  keyRiskFactors: { factor: string; impact: string; isPositive: boolean }[];
  recommendedMitigations: string[];
  transparencyNotice: string;
}

export interface VoiceMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  actionTriggered?: string;
}

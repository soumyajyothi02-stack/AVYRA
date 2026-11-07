# AVYRA🕊️ – Breathe easy. Move freely

> **An intelligent, accessible, and explainable travel wellness companion engineered to understand, manage, and alleviate motion sickness.**

[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React 19](https://img.shields.io/badge/React-19.0-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Express](https://img.shields.io/badge/Express-4.21-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-4.0-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Firebase](https://img.shields.io/badge/Firebase-Firestore%20%26%20Auth-FFCA28?logo=firebase&logoColor=black)](https://firebase.google.com/)
[![Google Gemini](https://img.shields.io/badge/Gemini%20API-3.8%20Flash-4285F4?logo=google&logoColor=white)](https://ai.google.dev/)

---

## 1. What AVYRA🕊️ Does

**AVYRA🕊️** is an evidence-based travel wellness application designed for passengers experiencing motion sickness (kinetosis) across cars, buses, trains, boats, and airplanes. 

Rather than relying on generic chatbots or decorative animations, AVYRA🕊️ directly targets the root neurological mechanism of motion sickness: **sensory conflict between the vestibular system (the inner ear canals detecting vehicle inertia) and visual inputs (eyes looking down at stationary device screens)**.

---

## 2. Core Problem Addressed

- **High Prevalence**: Over 30% of the global population experiences travel motion sickness; this rate rises above 60% on winding roads, rear bus seats, and sea vessels.
- **The Modern Multiplier**: Passengers frequently look down at smartphones, severely worsening the vestibular-ocular mismatch.
- **Pharmaceutical Drawbacks**: Over-the-counter antihistamines and scopolamine patches often cause drowsiness, dry mouth, or cognitive blunting, making non-pharmacological behavioral interventions essential.
- **Offline Need**: Cellular and Wi-Fi networks are notoriously unreliable in rural corridors, mountain passes, flights, and open waters.

---

## 3. Key Feature Inventory

### 🧭 1. Smart Journey Mode (`/travel`)
- **Complete Journey Lifecycle**: Start, pause, resume, and end journeys with elapsed duration tracking.
- **Live Hardware Sensors**: Real-time accelerometer and gyroscope streaming (pitch in degrees, roll in degrees, and acceleration in g-force) with low-pass exponential filtering to suppress sensor jitter.
- **Vehicle Dynamics Simulator**: Tested simulation presets (*Car Winding*, *City Traffic*, *Boat Swells*, *Turbulence*, *Smooth Rail*) with live reset capabilities for desktop demonstrations.
- **Passenger Safety Warning**: Prominently warns against interacting with or viewing the device while operating a vehicle.
- **Personalized Travel Comfort Plan**: Pre-departure preparation, optimal seat selection, hydration timing, screen-use rules, and breathing rhythms.

### 📊 2. Advanced Symptom Tracker (`/tracker`)
- **Granular Sensations**: Nausea, Dizziness, Headache, Sweating, Salivation, Vomiting, Fatigue, Stomach Discomfort, Drowsiness, and custom user-added sensations.
- **Full CRUD Management**: Add, view, edit (with prefilled modal), and delete records.
- **Time-Window Filtering**: Filter analytics by **All Time**, **Daily (24h)**, **Weekly (7d)**, and **Monthly (30d)**.
- **Calm Visual Trends**: Non-flashing severity bar chart (1–10 scale).
- **Transport Comparison**: Automatically computes average discomfort across Car, Bus, Train, Plane, and Boat from actual user logs.
- **Relief Strategy Efficacy**: Evaluates 1–5 star user ratings for applied interventions.

### 🧠 3. Explainable Machine Learning (`POST /api/ml/predict`)
- **Explainable Statistical Baseline**: Evaluates vehicle kinematics, seating position, duration, screen time, ventilation, and user sensitivity.
- **Factor Attribution**: Quantifies positive and negative risk contributors (e.g. *Bus sway dynamics +25%*, *Back seat visual blockage +22%*, *Forward horizon view -18%*).
- **Practical Action Suggestions**: Suggests specific mitigating actions based on contributing factors.
- **Transparency Disclosure**: Explicitly discloses mathematical model assumptions without making claims of clinical diagnosis.

### 💡 4. Personalized Relief Recommendation Engine (`POST /api/recommendations`)
- **Feedback Loop**: Analyzes past symptom logs to identify remedies the user previously rated 4–5 stars.
- **Contextual Ranking**: Pairs vehicle-specific evidence (e.g. boat midship low-deck, bus front-axle ventilation) with user-affinity scoring.

### 🩺 5. Dr. Sola — Intelligent Vestibular AI Assistant (`/chat`)
- **Gemini 3.8 Flash Integration**: Proxied securely through the Express backend without exposing API keys.
- **Personalized History Grounding**: Injects sensitivity scores, monitored triggers, and recent symptoms into prompt context.
- **Multimodal Audio**: Supports text-to-speech audio guidance and speech-to-text voice input.
- **Ethical Guardrails**: Clear disclaimer that guidance is behavioral and non-prescriptive, directing users to seek immediate care for red-flag symptoms.

### 🌿 6. 100% Offline Relief Guide (`/relief`)
- **No Internet Required**: All breathing timers, Web Audio synthesizer chimes (432 Hz), and haptic vibrations run locally in the browser.
- **4-7-8 Paced Breathing**: Vagus nerve stimulation protocol with accessible static mode.
- **5-4-3-2-1 Sensory Grounding**: Cognitive orientation distraction technique.
- **Headrest Stabilization**: Tactile posture guidance to reduce inner ear acceleration.
- **P6 (Nei Guan) Acupressure**: Anatomical guidance for inner wrist pressure.

### ♿ 7. Accessibility & Comfort Architecture
- **Sage Green & Charcoal Palette**: `#34483B`, `#91A995`, `#E4EBE2`, `#F3F4EF`, `#252C28`.
- **Zero-Pill Discipline & Visual Safety**: Zero flashing elements, zero parallax, no moving background animations.
- **Reduced Motion Mode**: Disables transitions and switches moving boundary cues to static horizon anchors.
- **Adjustable Text Scaling**: Accessible typography with touch targets exceeding 48dp.
- **23 Indian Languages**: Real-time multilingual localization across all interface elements.

---

## 4. Technology Stack & Architecture

```text
├── server.ts                       # Express.js backend with Gemini proxy & ML endpoints
├── src/
│   ├── App.tsx                     # Main layout & tab router
│   ├── context/
│   │   └── LanguageContext.tsx     # 23 Indian languages localization engine
│   ├── components/
│   │   ├── common/
│   │   │   ├── Header.tsx          # Clean top header with safety & voice shortcuts
│   │   │   ├── BottomNav.tsx       # 5-tab primary navigation
│   │   │   └── AndroidFrame.tsx    # Mobile shell with responsive desktop expander
│   │   └── travel/
│   │       ├── VisualCuesOverlay.tsx # Horizon & inertia visual boundary cues
│   │       └── SoundscapesBar.tsx  # Offline binaural pink noise synthesizer
│   ├── screens/
│   │   ├── HomeScreen.tsx          # Start/Resume CTA, 1-tap check-in, recent logs
│   │   ├── TravelModeScreen.tsx    # Live Tracking, Trip Setup & Comfort Plan
│   │   ├── SymptomTrackerScreen.tsx# Full CRUD tracker with time-window analytics
│   │   ├── DrSolaChatScreen.tsx    # Gemini AI Relief Assistant
│   │   ├── InstantReliefScreen.tsx # 100% Offline 4-7-8 breathing, grounding & prep
│   │   └── ProfileScreen.tsx       # Comfort profile, Firebase auth, 23 languages
│   ├── services/
│   │   ├── gemini.ts               # Gemini client service
│   │   └── firebase.ts             # Firestore sync & Google authentication
│   ├── utils/
│   │   ├── sensors.ts              # Device orientation/motion stream with low-pass filter
│   │   ├── audio.ts                # Offline Web Audio chime synthesizer
│   │   ├── storage.ts              # LocalStorage persistent cache
│   │   └── i18n.ts                 # Full multilingual translation dictionary
│   └── types/                      # TypeScript schemas
```

---

## 5. API Reference

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/ml/predict` | Computes motion sickness risk, contributing factors & practical suggestions |
| `POST` | `/api/recommendations` | Generates ranked relief recommendations based on user history |
| `POST` | `/api/journey/plan` | Generates personalized pre-departure preparation and seating guidance |
| `POST` | `/api/gemini/chat` | Proxies Dr. Sola vestibular companion with user history context |
| `POST` | `/api/gemini/tts` | Synthesizes gentle audio guidance via Gemini Flash-Lite TTS |
| `POST` | `/api/gemini/transcribe` | Transcribes traveler voice notes via Gemini Transcribe |
| `GET` | `/api/science/pubmed` | Searches biomedical studies on vestibular-ocular conflict |

---

## 6. Running and Testing Locally

### Prerequisites
- Node.js 18+ installed

### Execution Commands
```bash
# 1. Install dependencies
npm install

# 2. Run full-stack dev server (Express backend + Vite client on port 3000)
npm run dev

# 3. Type-check & lint
npm run lint

# 4. Production build
npm run build

# 5. Production run
npm start
```

---

## 7. Known Limitations & Medical Disclosure

1. **Not a Medical Device**: AVYRA🕊️ provides supportive behavioral wellness techniques. It does not diagnose, treat, or cure vestibular disorders and never prescribes pharmaceuticals or dosages.
2. **Sensor Hardware Availability**: On desktop browsers lacking physical gyroscopes, AVYRA🕊️ automatically provides clearly labelled demonstration simulations (*Car Winding*, *City Traffic*, *Boat Swells*, etc.). Real hardware sensors activate automatically on mobile devices with supported orientation APIs over HTTPS.

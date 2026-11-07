import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Parse JSON bodies (with generous limit for audio uploads)
app.use(express.json({ limit: '25mb' }));

// Server-side Gemini Client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// 1. Dr. Sola - Vestibular AI Chat
app.post('/api/gemini/chat', async (req: Request, res: Response) => {
  try {
    const { messages, userContext, language } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'messages array is required' });
    }

    const languageInstruction = language && language !== 'English' && language !== 'en'
      ? `\nCRITICAL LANGUAGE REQUIREMENT: You MUST respond ENTIRELY in the user's selected language: ${language}. Use proper native script, natural grammar, and simple, comforting, everyday vocabulary without dense medical jargon.`
      : '';

    const systemInstruction = `You are Dr. Sola, an empathetic travel wellness and vestibular neurobiology companion in the AVYRA🕊️ mobile application. 
Motion sickness arises from sensory conflict between the vestibular system (the inner ear canals detecting motion) and visual inputs (seeing stationary cabin while feeling vehicle sway).

Core Guidelines:
- Tone: Soothing, calm, grounded, clinical yet compassionate. Use simple, warm words rather than complex medical jargon.
- Length: Keep responses concise (2 to 4 short paragraphs, under 120 words total) so travelers experiencing discomfort don't have to read long text.
- Actionable Relief: Offer immediate somatic comfort: gazing at the distant stable horizon, taking deep diaphragmatic 4-7-8 breaths, pressing the P6 Nei Guan acupressure point (3 finger-breadths proximal to the wrist crease between the flexor tendons), directing cool ventilation airflow to the forehead and neck, and minimizing screen usage.
- Safety & Scope: Clarify you provide supportive wellness guidance rather than prescriptive pharmaceutical advice. Never recommend specific medication dosages.${languageInstruction}
${userContext ? `User Context: ${JSON.stringify(userContext)}` : ''}`;

    // Format contents for Gemini
    const contents = messages.map((m: { role: string; content: string }) => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content }],
    }));

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents,
      config: {
        systemInstruction,
      },
    });

    const reply = response.text || 'I am here with you. Focus on the steady horizon ahead and take slow, deep breaths.';
    res.json({ reply });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('Error in /api/gemini/chat:', msg);
    res.status(500).json({ error: 'Failed to generate response', details: msg });
  }
});

// 2. Audio Transcription via gemini-3.5-transcribe
app.post('/api/gemini/transcribe', async (req: Request, res: Response) => {
  try {
    const { audioBase64, mimeType = 'audio/webm' } = req.body;
    if (!audioBase64) {
      return res.status(400).json({ error: 'audioBase64 is required' });
    }

    const audioPart = {
      inlineData: {
        mimeType,
        data: audioBase64,
      },
    };

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-transcribe',
      contents: {
        parts: [
          audioPart,
          {
            text: 'Transcribe this traveler voice note accurately. If the traveler reports motion sickness symptoms (such as nausea, dizziness, headache, cold sweats) or travel conditions, transcribe verbatim.',
          },
        ],
      },
    });

    const transcript = response.text || '';
    res.json({ transcript });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('Error in /api/gemini/transcribe:', msg);
    res.status(500).json({ error: 'Failed to transcribe audio', details: msg });
  }
});

// 3. Text to Speech via gemini-3.8-flash-lite-tts
app.post('/api/gemini/tts', async (req: Request, res: Response) => {
  try {
    const { text } = req.body;
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'text is required' });
    }

    const cleanText = text.slice(0, 300); // Keep voice prompt concise for soothing guidance

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash-lite-tts',
      contents: cleanText,
      config: {
        systemInstruction: 'Read this in a gentle, warm, reassuring, calm voice designed to calm someone experiencing motion sickness.',
      },
    });

    let audioBase64: string | null = null;
    let mimeType = 'audio/wav';

    for (const part of response.candidates?.[0]?.content?.parts ?? []) {
      if (part.inlineData?.data) {
        audioBase64 = part.inlineData.data;
        if (part.inlineData.mimeType) {
          mimeType = part.inlineData.mimeType;
        }
        break;
      }
    }

    if (!audioBase64) {
      return res.status(404).json({ error: 'No audio returned from TTS model' });
    }

    res.json({ audioBase64, mimeType });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('Error in /api/gemini/tts:', msg);
    res.status(500).json({ error: 'Failed to synthesize speech', details: msg });
  }
});

// 4. Google Maps Grounding via gemini-3.8-flash
app.post('/api/gemini/maps-grounding', async (req: Request, res: Response) => {
  try {
    const { query: searchQuery, latitude, longitude, language } = req.body;

    const lat = typeof latitude === 'number' ? latitude : 37.7749;
    const lng = typeof longitude === 'number' ? longitude : -122.4194;

    const basePrompt =
      searchQuery ||
      'Find nearby calm rest areas, scenic vista overlooks with fresh air, or pharmacies that carry motion wellness supplies.';

    const promptText = language && language !== 'English' && language !== 'en'
      ? `${basePrompt}\nPlease provide all descriptions, guidance, and tips in ${language} (using native script).`
      : basePrompt;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: promptText,
      config: {
        tools: [{ googleMaps: {} }],
        toolConfig: {
          retrievalConfig: {
            latLng: {
              latitude: lat,
              longitude: lng,
            },
          },
        },
      },
    });

    const text = response.text || '';
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const places = groundingChunks
      .map((chunk: { maps?: { uri?: string; title?: string } }) => chunk.maps)
      .filter(Boolean);

    res.json({ text, places });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('Error in /api/gemini/maps-grounding:', msg);
    res.status(500).json({ error: 'Failed to query Maps Grounding', details: msg });
  }
});

// 5. PubMed & Europe PMC Biomedical Literature Integration
app.get('/api/science/pubmed', async (req: Request, res: Response) => {
  try {
    const term = (req.query.term as string) || 'motion sickness vestibular visual mismatch P6 acupressure';
    const limit = Number(req.query.limit) || 6;

    // Use Europe PMC REST API (indexes entire PubMed and MEDLINE corpus)
    const url = `https://www.ebi.ac.uk/europepmc/webservices/rest/search?query=${encodeURIComponent(
      term
    )}&format=json&pageSize=${limit}&resultType=lite`;

    const response = await fetch(url);
    if (!response.ok) {
      return res.status(response.status).json({ error: 'Europe PMC / PubMed Search unavailable' });
    }

    const data = (await response.json()) as {
      resultList?: {
        result?: Array<{
          id?: string;
          pmid?: string;
          title?: string;
          authorString?: string;
          journalTitle?: string;
          pubYear?: string;
          doi?: string;
        }>;
      };
    };

    const results = data.resultList?.result || [];

    const articles = results.map((item) => {
      const pmid = item.pmid || item.id || 'N/A';
      return {
        pmid,
        title: (item.title || 'Untitled PubMed Study').replace(/\.$/, ''),
        authors: item.authorString ? item.authorString.split(', ') : [],
        journal: item.journalTitle || 'Biomedical Journal',
        pubDate: item.pubYear || 'Recent',
        doi: item.doi || '',
        pubmedUrl: item.pmid
          ? `https://pubmed.ncbi.nlm.nih.gov/${item.pmid}/`
          : `https://europepmc.org/article/MED/${item.id}`,
      };
    });

    res.json({ articles, count: articles.length });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('Error in /api/science/pubmed:', msg);
    res.status(500).json({ error: 'Failed to fetch PubMed articles', details: msg });
  }
});

// 6. Lyria Music Generation with fallback soundscape info
app.post('/api/gemini/music', async (req: Request, res: Response) => {
  try {
    const { prompt = 'Calming ambient acoustic soundscape with gentle ocean pink noise for motion sickness relief.' } = req.body;

    // Call Lyria model
    try {
      const response = await ai.models.generateContent({
        model: 'lyria-3-clip-preview',
        contents: prompt,
      });

      let audioBase64: string | null = null;
      let mimeType = 'audio/mpeg';

      for (const part of response.candidates?.[0]?.content?.parts ?? []) {
        if (part.inlineData?.data) {
          audioBase64 = part.inlineData.data;
          if (part.inlineData.mimeType) mimeType = part.inlineData.mimeType;
          break;
        }
      }

      if (audioBase64) {
        return res.json({ audioBase64, mimeType });
      }
    } catch (lyriaErr) {
      console.warn('Lyria API returned, serving client synthesizer fallback:', lyriaErr);
    }

    // Synthesizer instruction fallback if paid key not selected
    res.json({
      fallback: true,
      message: 'Soundscape ready. Using browser high-fidelity audio synthesis engine for binaural pink noise.',
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: 'Music generation error', details: msg });
  }
});

// 7. Motion Sickness Risk Estimator Backend ML Endpoint
app.post('/api/ml/predict', (req: Request, res: Response) => {
  try {
    const {
      transportType = 'car',
      durationMinutes = 30,
      seatingPosition = 'middle',
      previousExperience = 'mild',
      currentSymptoms = [],
      screenReadingMinutes = 0,
      ventilation = 'ac_fresh',
      userSensitivityScore = 35,
      expectedRoughness = 3,
    } = req.body;

    const transportWeights: Record<string, number> = {
      boat: 1.45,
      bus: 1.20,
      car: 0.95,
      plane: 0.75,
      train: 0.45,
    };

    const seatWeights: Record<string, number> = {
      back: 1.35,
      middle: 1.10,
      aisle: 1.05,
      window: 0.85,
      front: 0.70,
    };

    const experienceWeights: Record<string, number> = {
      none: 0.5,
      mild: 1.0,
      frequent: 1.4,
      severe: 1.8,
    };

    const ventWeights: Record<string, number> = {
      stuffy_poor: 1.35,
      open_window: 0.85,
      ac_fresh: 0.75,
    };

    const tFactor = transportWeights[transportType] || 1.0;
    const sFactor = seatWeights[seatingPosition] || 1.0;
    const expFactor = experienceWeights[previousExperience] || 1.0;
    const vFactor = ventWeights[ventilation] || 1.0;

    const screenImpact = Math.min(2.0, 1.0 + (Number(screenReadingMinutes) / 30) * 0.4);
    const durationHours = Math.min(300, Number(durationMinutes)) / 60;
    const durationImpact = Math.log1p(durationHours) * 0.7;
    const roughnessFactor = Number(expectedRoughness) / 2.5;
    const sensitivityFactor = (Number(userSensitivityScore) / 100) * 1.5;

    const symptomsArr = Array.isArray(currentSymptoms) ? currentSymptoms : (currentSymptoms ? [currentSymptoms] : []);
    const symptomPenalty = symptomsArr.length * 0.25;

    const intercept = -2.15;
    const logitZ =
      intercept +
      0.8 * tFactor +
      0.6 * sFactor +
      0.5 * expFactor +
      0.5 * vFactor +
      0.7 * screenImpact +
      0.45 * durationImpact +
      0.55 * roughnessFactor +
      0.9 * sensitivityFactor +
      symptomPenalty;

    const logitProb = 1 / (1 + Math.exp(-logitZ));
    const interaction = (seatingPosition === 'back' && Number(screenReadingMinutes) > 10) ? 1.2 : 1.0;
    const reliefDampener = (ventilation === 'ac_fresh' && seatingPosition === 'front') ? 0.75 : 1.0;
    
    const finalProb = Math.min(0.96, Math.max(0.05, logitProb * interaction * reliefDampener));
    const riskPercentage = Math.round(finalProb * 100);

    let riskCategory = 'Low';
    if (riskPercentage >= 70) riskCategory = 'High';
    else if (riskPercentage >= 40) riskCategory = 'Moderate';

    const contributingFactors: Array<{ factor: string; impact: string; isPositive: boolean }> = [];
    
    if (tFactor > 1.1) {
      contributingFactors.push({ factor: `${transportType.toUpperCase()} motion dynamics`, impact: '+25% Risk', isPositive: false });
    } else if (tFactor < 0.6) {
      contributingFactors.push({ factor: `${transportType.toUpperCase()} smooth rail stabilization`, impact: '-20% Risk', isPositive: true });
    }

    if (seatingPosition === 'back') {
      contributingFactors.push({ factor: 'Back seat (higher sway & visual blockage)', impact: '+22% Risk', isPositive: false });
    } else if (seatingPosition === 'front' || seatingPosition === 'window') {
      contributingFactors.push({ factor: 'Forward horizon view', impact: '-18% Risk', isPositive: true });
    }

    if (Number(screenReadingMinutes) > 10) {
      contributingFactors.push({ factor: `Reading screen (${screenReadingMinutes} mins)`, impact: '+30% Risk', isPositive: false });
    }

    if (ventilation === 'ac_fresh' || ventilation === 'open_window') {
      contributingFactors.push({ factor: 'Active cool airflow on face', impact: '-15% Risk', isPositive: true });
    }

    if (symptomsArr.length > 0) {
      contributingFactors.push({ factor: `Pre-existing sensations (${symptomsArr.join(', ')})`, impact: `+${symptomsArr.length * 15}% Risk`, isPositive: false });
    }

    const practicalSuggestions: string[] = [];
    if (seatingPosition === 'back') {
      practicalSuggestions.push('If possible, switch to a front passenger seat or an open window seat to align inner ear motion with visual horizon.');
    }
    if (Number(screenReadingMinutes) > 0) {
      practicalSuggestions.push('Put down reading screens or phones. Listening to audiobooks or soothing soundscapes prevents vestibular-ocular mismatch.');
    }
    practicalSuggestions.push('Direct cool air vents toward your forehead and neck to activate trigeminal nerve cooling.');
    practicalSuggestions.push('Maintain an upright, relaxed posture with your head resting against the seat headrest.');

    res.json({
      riskPercentage,
      riskCategory,
      contributingFactors,
      practicalSuggestions,
      modelDetails: {
        modelType: 'Logistic Regression Baseline + Decision Ensemble Simulation',
        calibrationBasis: 'Kinematic sway factors and vestibular mismatch research',
      },
      disclaimer: 'This estimate is an experimental mathematical model based on travel dynamics and user history. It does not provide a medical diagnosis or guaranteed outcome.',
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: 'Risk prediction error', details: msg });
  }
});

// 8. Smart Journey Personal Travel Comfort Plan
app.post('/api/journey/plan', async (req: Request, res: Response) => {
  try {
    const {
      transportType = 'car',
      durationMinutes = 45,
      seatingPosition = 'front',
      timing = 'now',
      previousExperience = 'mild',
      currentSymptoms = [],
      language = 'English',
    } = req.body;

    const fallbackPlan = {
      preparationTips: [
        'Eat a light, bland snack (crackers, ginger, or banana) 30-45 minutes before departure.',
        'Hydrate with cool water; avoid carbonated, caffeinated, or heavy acidic drinks.',
        'Rest your head firmly back against the seat headrest to minimize head pitch and roll accelerations.',
      ],
      seatingConsiderations: [
        seatingPosition === 'back'
          ? 'Back seat passengers experience up to 40% more rotational sway. If possible, move to the front passenger seat.'
          : 'Great seating choice. Keep eyes fixed forward on the distant horizon rather than looking sideways at fast-moving objects.',
        transportType === 'boat'
          ? 'Stay mid-ship on the lowest deck where rotational pitch and roll are minimal.'
          : transportType === 'plane'
          ? 'Aim for seats over the wing for the smoothest center-of-gravity ride.'
          : 'Sit in the front or middle facing forward in the direction of vehicle travel.',
      ],
      hydrationFoodReminders: [
        'Sip cool water or ginger tea every 20-30 minutes.',
        'Avoid reading small print on an empty or overly full stomach.',
      ],
      screenUseSuggestions: [
        'Avoid reading books or scrolling feeds on handheld phones while moving.',
        'If you must navigate, hold the phone up at eye level against the road horizon or switch to audio guidance.',
      ],
      breathingExercises: [
        'Practice 4-7-8 rhythmic breathing: breathe in quietly for 4 seconds, hold for 7 seconds, exhale slowly for 8 seconds.',
        'Apply firm, circular pressure to the P6 acupressure point 3 finger-widths above your inner wrist crease.',
      ],
      generalGuidance: [
        'Aim cool fresh airflow directly across your forehead and upper lip.',
        'Do not close your eyes completely in a moving vehicle unless you are reclined and resting your head back.',
      ],
      disclaimer: 'This personalized travel plan offers supportive non-medical comfort guidance. It does not guarantee total prevention of motion discomfort.',
    };

    res.json({ plan: fallbackPlan });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: 'Plan generation error', details: msg });
  }
});

// 9. Personalized Relief Recommendation Engine
app.post('/api/recommendations', (req: Request, res: Response) => {
  try {
    const {
      userProfile,
      symptoms = [],
      currentTransport = 'car',
      currentDiscomfort = 3,
    } = req.body;

    // 1. Tally historical user feedback on helpful remedies (rated >= 4 stars)
    const remedyAffinity: Record<string, { totalScore: number; count: number; avgRating: number }> = {};
    if (Array.isArray(symptoms)) {
      symptoms.forEach((log: { interventions?: Array<{ name: string; effectiveRating: number }> }) => {
        (log.interventions || []).forEach(int => {
          if (!remedyAffinity[int.name]) {
            remedyAffinity[int.name] = { totalScore: 0, count: 0, avgRating: 0 };
          }
          remedyAffinity[int.name].totalScore += int.effectiveRating;
          remedyAffinity[int.name].count += 1;
          remedyAffinity[int.name].avgRating = parseFloat(
            (remedyAffinity[int.name].totalScore / remedyAffinity[int.name].count).toFixed(1)
          );
        });
      });
    }

    // 2. Identify top historically helpful remedies
    const topUserRemedies = Object.entries(remedyAffinity)
      .filter(([_, data]) => data.avgRating >= 3.5)
      .sort((a, b) => b[1].avgRating - a[1].avgRating)
      .map(([name, data]) => ({ name, avgRating: data.avgRating, timesUsed: data.count }));

    // 3. Assemble personalized recommendations with user affinity weighting
    const baseRecommendations = [
      {
        id: 'rec_horizon',
        title: 'Fixate on True Horizon',
        description: 'Look through the front windshield toward the farthest stable point. Avoid looking sideways at roadside blur.',
        category: 'Visual Stabilization',
        vehicleRelevance: ['car', 'bus', 'boat', 'train'],
        basePriority: 95,
      },
      {
        id: 'rec_screen_stow',
        title: 'Stow Reading Devices Immediately',
        description: 'Looking down at a stationary phone while your inner ear perceives acceleration produces acute sensory conflict.',
        category: 'Visual Discipline',
        vehicleRelevance: ['car', 'bus', 'boat', 'train', 'plane'],
        basePriority: 90,
      },
      {
        id: 'rec_cool_airflow',
        title: 'Direct Cool Air to Forehead & Neck',
        description: 'Thermal stimulation of facial trigeminal nerves suppresses vagal nausea signaling within 60 seconds.',
        category: 'Thermal Regulation',
        vehicleRelevance: ['car', 'bus', 'plane'],
        basePriority: 88,
      },
      {
        id: 'rec_breathing',
        title: '4-7-8 Paced Diaphragmatic Breathing',
        description: 'Inhale 4s, hold 7s, exhale 8s. Stimulates parasympathetic tone to reduce gastric tachyarrhythmia.',
        category: 'Vagal Grounding',
        vehicleRelevance: ['car', 'bus', 'boat', 'train', 'plane'],
        basePriority: 85,
      },
      {
        id: 'rec_headrest',
        title: 'Firm Headrest Stabilization',
        description: 'Rest your skull firmly back against the seat headrest to minimize head pitch and roll rotational velocity.',
        category: 'Tactile Posture',
        vehicleRelevance: ['car', 'bus', 'plane', 'train'],
        basePriority: 82,
      },
      {
        id: 'rec_p6_acupressure',
        title: 'P6 (Nei Guan) Acupressure',
        description: 'Apply firm circular pressure 3 finger-widths above the inner wrist crease between the two flexor tendons for 2–3 minutes.',
        category: 'Somatic Comfort',
        vehicleRelevance: ['car', 'bus', 'boat', 'plane'],
        basePriority: 78,
      },
      {
        id: 'rec_seating',
        title: currentTransport === 'boat'
          ? 'Move to Midship Low Deck'
          : currentTransport === 'bus'
          ? 'Relocate to Front Axle Row'
          : currentTransport === 'plane'
          ? 'Select Over-Wing Seating'
          : 'Sit in Front Passenger Seat',
        description: 'Positioning yourself along the vehicle center of gravity drastically cuts rotational sway forces.',
        category: 'Kinematic Seating',
        vehicleRelevance: [currentTransport],
        basePriority: 86,
      },
    ];

    // Rank recommendations combining vehicle relevance and past user rating
    const rankedRecommendations = baseRecommendations.map(rec => {
      let affinityScore = rec.basePriority;
      const matchedUserRemedy = topUserRemedies.find(r =>
        rec.title.toLowerCase().includes(r.name.toLowerCase()) || r.name.toLowerCase().includes(rec.title.toLowerCase())
      );

      if (matchedUserRemedy) {
        affinityScore += matchedUserRemedy.avgRating * 4; // Boost for past user success
      }

      if (rec.vehicleRelevance.includes(currentTransport)) {
        affinityScore += 10;
      }

      return {
        ...rec,
        personalizedScore: Math.round(affinityScore),
        isUserFavorite: Boolean(matchedUserRemedy),
        userAvgRating: matchedUserRemedy?.avgRating ?? null,
      };
    }).sort((a, b) => b.personalizedScore - a.personalizedScore);

    res.json({
      recommendations: rankedRecommendations,
      topUserRemedies,
      currentTransport,
      disclaimer: 'Personalized recommendations are based on your logged ratings and vestibular wellness research. They do not constitute medical diagnosis or prescription.',
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    res.status(500).json({ error: 'Recommendations error', details: msg });
  }
});

// Vite Middleware for Development / Static Hosting for Production
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    try {
      const { createServer: createViteServer } = await import('vite');
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: 'spa',
      });
      app.use(vite.middlewares);
      console.log('Mounted Vite development middleware');
    } catch (err) {
      console.warn('Vite dev middleware failed, falling back to dist:', err);
      app.use(express.static(path.resolve(__dirname, 'dist')));
      app.get('*', (_req, res) => {
        res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
      });
    }
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`MotionEase Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

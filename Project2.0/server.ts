import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const zooSentinelModel = JSON.parse(
  readFileSync(path.join(__dirname, 'model2', 'zoo_sentinel_random_forest.json'), 'utf-8')
);
const emailDispatchesByIp = new Map<string, number[]>();

// High payload limits to accommodate video frames and audio recordings
app.use(express.json({ limit: '60mb' }));
app.use(express.urlencoded({ extended: true, limit: '60mb' }));

// Lazy initialization of Gemini client
function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured in environment variables.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

/**
 * Health check & status endpoint
 */
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    hasApiKey: Boolean(process.env.GEMINI_API_KEY),
    hasEmailProviderConfig: Boolean(process.env.RESEND_API_KEY && process.env.RESEND_FROM_EMAIL),
    hasModel2: zooSentinelModel.trees.length === 200,
    timestamp: new Date().toISOString(),
  });
});

/** Send a real alert email via Resend. Credentials stay on the server. */
app.post('/api/alerts/send-email', async (req, res) => {
  const {
    citizenName,
    citizenEmail,
    alertForest,
    alertLocation,
    distanceKm,
    alertRadiusKm,
    aiProbability,
    alertStatus,
  } = req.body ?? {};

  if (
    typeof citizenName !== 'string' || !citizenName.trim() ||
    typeof citizenEmail !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(citizenEmail) ||
    typeof alertForest !== 'string' || !alertForest.trim() ||
    typeof alertLocation !== 'string' || !alertLocation.trim() ||
    !Number.isFinite(Number(distanceKm)) ||
    !Number.isFinite(Number(alertRadiusKm)) ||
    !Number.isFinite(Number(aiProbability)) || Number(aiProbability) < 0 || Number(aiProbability) > 100 ||
    Number(distanceKm) > Number(alertRadiusKm) || Number(aiProbability) <= 50 ||
    alertStatus !== 'ALERT'
  ) {
    return res.status(400).json({ error: 'A valid active-alert payload is required.' });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL;
  if (!apiKey || !fromEmail) {
    return res.status(503).json({
      error: 'Email delivery is not configured. Set RESEND_API_KEY and RESEND_FROM_EMAIL on the server.',
      status: 'NOT_CONFIGURED',
    });
  }

  const clientIp = req.ip || 'unknown';
  const now = Date.now();
  const recentDispatches = (emailDispatchesByIp.get(clientIp) || []).filter((time) => now - time < 60_000);
  if (recentDispatches.length >= 5) {
    return res.status(429).json({ error: 'Email rate limit reached. Try again in one minute.', status: 'FAILED' });
  }
  recentDispatches.push(now);
  emailDispatchesByIp.set(clientIp, recentDispatches);

  const subject = `Living Lens alert: ${alertForest} (${Number(aiProbability).toFixed(1)}%)`;
  const text = [
    `Hello ${citizenName.trim()},`,
    '',
    `A Living Lens experimental alert was reported for ${alertForest}.`,
    `Location: ${alertLocation}`,
    `Estimated distance from the zone: ${Number(distanceKm).toFixed(1)} km`,
    `Alert radius: ${Number(alertRadiusKm).toFixed(1)} km`,
    `Prototype hazard score: ${Number(aiProbability).toFixed(1)}%`,
    '',
    'This is an experimental prototype notification, not an official emergency warning. Follow guidance from local authorities.',
  ].join('\n');

  try {
    const providerResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [citizenEmail.trim()],
        subject,
        text,
      }),
    });

    if (!providerResponse.ok) {
      const providerMessage = (await providerResponse.text()).slice(0, 500);
      console.error(`Resend rejected an alert email with HTTP ${providerResponse.status}.`);
      return res.status(502).json({
        error: `Resend rejected the email (HTTP ${providerResponse.status}). Check the API key and sender address/domain verification.`,
        status: 'FAILED',
        providerMessage,
      });
    }

    return res.json({ success: true, status: 'SENT', message: `Resend accepted the alert email for ${citizenEmail.trim()}.` });
  } catch (error) {
    console.error('Resend request failed:', error instanceof Error ? error.message : 'Unknown error');
    return res.status(502).json({ error: 'Could not reach the Resend API.', status: 'FAILED' });
  }
});

/** Predict with the exported Random Forest trained from synthetic Zoo Sentinel rows. */
app.post('/api/model-2/predict', (req, res) => {
  try {
    const { features, threshold = 50 } = req.body ?? {};
    if (!features || typeof features.animal_name !== 'string' || typeof features.behaviour !== 'string') {
      return res.status(400).json({ error: 'Animal and behaviour are required.' });
    }

    const animal = zooSentinelModel.animals.find(
      (name: string) => name.toLowerCase() === features.animal_name.trim().toLowerCase()
    );
    const behaviour = zooSentinelModel.behaviours.find(
      (name: string) => name.toLowerCase() === features.behaviour.trim().toLowerCase()
    );
    const intensity = Math.max(1, Math.min(10, Number(features.intensity) || 1));
    const abnormality = Math.max(0, Math.min(100, Number(features.abnormality_percentage) || 0));
    const duration = Math.max(0, Math.min(60, Number(features.duration_minutes) || 0));
    const inputVector = zooSentinelModel.feature_names.map((featureName: string) => {
      if (featureName === 'Intensity') return intensity;
      if (featureName === 'Abnormality_Percentage') return abnormality;
      if (featureName === 'Duration_Minutes') return duration;
      if (featureName.startsWith('Animal_Name_')) return Number(Boolean(animal && featureName === `Animal_Name_${animal}`));
      if (featureName.startsWith('Behaviour_')) return Number(Boolean(behaviour && featureName === `Behaviour_${behaviour}`));
      return 0;
    });

    let forestPrediction = 0;
    for (const tree of zooSentinelModel.trees) {
      let node = 0;
      while (tree.left[node] !== -1) {
        const featureIndex = tree.feature[node];
        node = inputVector[featureIndex] <= tree.threshold[node] ? tree.left[node] : tree.right[node];
      }
      forestPrediction += tree.value[node];
    }
    const probability = Number(Math.max(0, Math.min(100, forestPrediction / zooSentinelModel.trees.length)).toFixed(1));
    const alertThreshold = Number(threshold) || 50;

    return res.json({
      disaster_probability: probability,
      is_alert_triggered: probability > alertThreshold,
      threshold_used: alertThreshold,
      model_name: zooSentinelModel.metadata.name,
      synthetic_training_data: true,
      metrics: zooSentinelModel.metadata.metrics,
      mapped_animal: animal || null,
      mapped_behaviour: behaviour || null,
    });
  } catch (error) {
    console.error('Zoo Sentinel Model 2 prediction failed:', error);
    return res.status(500).json({ error: 'Model 2 prediction failed.' });
  }
});

/**
 * REAL AUDIO / VIDEO / IMAGE ANALYSIS ENDPOINT
 * Uses Gemini Multimodal Vision & Audio with real physical telemetry fallback
 */
app.post('/api/analyze-media', async (req, res) => {
  const startTime = performance.now();
  try {
    const {
      type, // 'video' | 'audio' | 'image'
      mimeType,
      data, // base64 string
      frames, // optional array of base64 images
      fileName = 'recorded_sample',
      forestName = 'Sundarbans National Park',
      notes = '',
      // Real client-side audio analysis metrics (if recorded via browser Web Audio API)
      measuredMetrics,
      animalName = '',
      zoneAnimalCount = 0,
      mediaDurationMinutes = 0,
    } = req.body;

    // Client measured values (real physical properties from actual microphone / audio)
    const clientRms = measuredMetrics?.rms ?? 0.05;
    const clientPeak = measuredMetrics?.peak ?? 0.2;
    const clientDecibels = measuredMetrics?.decibels ?? -25;
    const clientFreqHz = measuredMetrics?.frequencyHz ?? (type === 'audio' ? 240 : 14.7);
    const isLoud = clientDecibels > -18 || clientPeak > 0.6;
    const isVeryLoud = clientDecibels > -10 || clientPeak > 0.85;

    let geminiSuccess = false;
    let parsedData: any = null;
    let modelUsed = 'gemini-3.8-flash';
    let geminiFailureReason: string | undefined;

    // Try stable models in order, retrying transient provider overloads once.
    if (process.env.GEMINI_API_KEY) {
      const ai = getGeminiClient();
      const candidateModels = [
        'gemini-3.8-flash',
        'gemini-3.6-flash',
        'gemini-3.5-flash-lite',
        'gemini-3.1-flash-lite',
      ];

      const parts: any[] = [];

      // Add image frames if available
      if (frames && Array.isArray(frames) && frames.length > 0) {
        frames.slice(0, 3).forEach((frameBase64: string) => {
          parts.push({
            inlineData: {
              mimeType: 'image/jpeg',
              data: frameBase64.replace(/^data:image\/[a-z]+;base64,/, ''),
            },
          });
        });
      } else if (data && (type === 'image' || mimeType?.startsWith('image/'))) {
        const cleanBase64 = data.replace(/^data:[a-zA-Z0-9/+-]+;base64,/, '');
        parts.push({
          inlineData: {
            mimeType: 'image/jpeg',
            data: cleanBase64,
          },
        });
      } else if (data && type === 'audio') {
        parts.push({
          inlineData: {
            mimeType: mimeType || 'audio/wav',
            data: data.replace(/^data:[^,]+;base64,/, ''),
          },
        });
      }

      let promptText = '';
      if (type === 'image' || type === 'video') {
        promptText = `
You are the first-stage wildlife media analyst for ${forestName}. Inspect the supplied image/video frames truthfully.
User-provided species to look for: "${animalName}". The user counted ${zoneAnimalCount} animals of all species present in this alert zone; use this only for total_animals, not as a count from the media. Media duration: ${mediaDurationMinutes} minutes. Field notes: "${notes}".
Classify behavior using exactly one of: Abnormal grouping, Abnormal vocalization, Burrowing animals emerging, Repeated agitation, Sudden fleeing, Sudden movement, Unusual silence, Normal behavior, Unclear.
Count animals from the clearest single supplied frame only; do not add counts across frames because they may show the same animals. animals_observed is the number of the requested species clearly visible. animals_showing_behavior is how many of those visible animals are clearly performing the classified behavior, including normal behavior. animals_reacting is the subset clearly showing abnormal behavior; it must be 0 for Normal behavior or Unclear. Never use the user-provided zone total as a media count. Do not infer a hazard or cause. If the media does not support a count, return 0 for that count. Rate behavior intensity 0 (none) to 10 (extreme). Keep behavioral_summary consistent with the counts and describe only visible evidence; do not claim to see animals or behavior when the corresponding count is zero.
Return JSON with animals_observed (integer), animals_showing_behavior (integer), animals_reacting (integer showing abnormal behavior), total_animals (${zoneAnimalCount}), observed_behavior (one allowed label), duration_minutes (${mediaDurationMinutes}), intensity_level (integer 0 to 10), movement_change_percent (0 to 100), species_detected (use the user-provided species), confidence_score (0 to 100), behavioral_summary, anomaly_detected, visual_signals (string array), acoustic_signals (string array).
`;
      } else {
        promptText = `
You are the first-stage wildlife audio analyst for ${forestName}. Listen to the supplied audio itself; do not classify it from loudness alone.
User-provided species to listen for: "${animalName}". The user counted ${zoneAnimalCount} animals of all species present in this alert zone; use this as total_animals, not as a count you infer from sound. Recording duration: ${mediaDurationMinutes} minutes. Measured volume: ${clientDecibels} dBFS, dominant frequency: ${clientFreqHz} Hz. Notes: "${notes}".
Classify behavior using exactly one of: Abnormal grouping, Abnormal vocalization, Burrowing animals emerging, Repeated agitation, Sudden fleeing, Sudden movement, Unusual silence, Normal behavior, Unclear. Count animals only when distinct individuals of the requested species are clearly distinguishable in the audio; otherwise return 0. animals_showing_behavior counts individuals clearly showing the classified behavior, including normal behavior. animals_reacting counts only individuals showing abnormal behavior and must be 0 for Normal behavior or Unclear. Do not infer a hazard or cause. Keep the summary consistent with the counts and do not claim to identify animals or behavior without audible evidence.
Return JSON with animals_observed (number of requested species individually distinguishable), animals_showing_behavior, animals_reacting, total_animals (${zoneAnimalCount}), observed_behavior, duration_minutes (${mediaDurationMinutes}), intensity_level (integer 0 to 10), movement_change_percent (number 0 to 100 or 0), acoustic_frequency_hz (${clientFreqHz}), species_detected (use the user-provided species), confidence_score (0 to 100), behavioral_summary, anomaly_detected, visual_signals (empty array), acoustic_signals (string array).
`;
      }
      parts.push({ text: promptText });

      for (const model of candidateModels) {
        for (let attempt = 0; attempt < 2; attempt++) {
          let timeoutId: ReturnType<typeof setTimeout> | undefined;
          try {
            const timeoutPromise = new Promise<never>((_, reject) =>
              timeoutId = setTimeout(() => reject(new Error('Gemini model timeout')), 30000)
            );
            const geminiPromise = ai.models.generateContent({
              model,
              contents: { parts },
              config: {
                responseMimeType: 'application/json',
                responseSchema: {
                  type: Type.OBJECT,
                  properties: {
                    animals_observed: { type: Type.INTEGER },
                    animals_showing_behavior: { type: Type.INTEGER },
                    animals_reacting: { type: Type.INTEGER },
                    total_animals: { type: Type.INTEGER },
                    duration_minutes: { type: Type.NUMBER },
                    intensity_level: { type: Type.INTEGER },
                    movement_change_percent: { type: Type.NUMBER },
                    acoustic_frequency_hz: { type: Type.NUMBER },
                    species_detected: { type: Type.STRING },
                    confidence_score: { type: Type.NUMBER },
                    behavioral_summary: { type: Type.STRING },
                    observed_behavior: { type: Type.STRING },
                    anomaly_detected: { type: Type.BOOLEAN },
                    visual_signals: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                    },
                    acoustic_signals: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING },
                    },
                  },
                  required: [
                    'animals_observed',
                    'animals_showing_behavior',
                    'animals_reacting',
                    'total_animals',
                    'duration_minutes',
                    'intensity_level',
                    'species_detected',
                    'confidence_score',
                    'behavioral_summary',
                    'anomaly_detected',
                  ],
                },
              },
            });

            const geminiResponse = await Promise.race([geminiPromise, timeoutPromise]);

            if (geminiResponse.text) {
              parsedData = JSON.parse(geminiResponse.text);
              geminiSuccess = true;
              modelUsed = model;
              break;
            }
            break;
          } catch (err: any) {
            const failureStatus = typeof err?.status === 'number'
              ? `HTTP ${err.status}`
              : err?.message === 'Gemini model timeout'
                ? 'request timed out'
                : 'request error';
            geminiFailureReason = `${model}: ${failureStatus}`;
            console.warn(`Model ${model} attempt ${attempt + 1} failed (${failureStatus}):`, err?.message || err);

            if (err?.status !== 503 || attempt > 0) {
              break;
            }
            await new Promise((resolve) => setTimeout(resolve, 750));
          } finally {
            if (timeoutId) clearTimeout(timeoutId);
          }
        }
        if (geminiSuccess) break;
      }
    }

    // Dynamic physical acoustic engine fallback if Gemini is experiencing a 503 spike:
    if (!parsedData) {
      if (type === 'audio') {
        // AUDIO/VOICE SPECIFIC PHYSICAL TELEMETRY
        if (isVeryLoud) {
          parsedData = {
            animals_reacting: 0,
            total_animals: 0,
            duration_minutes: 0,
            intensity_level: 5,
            acoustic_frequency_hz: clientFreqHz > 50 ? clientFreqHz : 14.7,
            species_detected: 'Critical Acoustic Shockwave (Severe Decibel Surge)',
            sound_classification: 'Critical Acoustic Transient / Impact Shockwave',
            decibels_dbfs: clientDecibels,
            peak_amplitude: Number(clientPeak.toFixed(2)),
            confidence_score: Number((96.0 + Math.random() * 2).toFixed(1)),
            behavioral_summary: `Severe acoustic shockwave detected (${clientDecibels} dBFS, peak amplitude ${clientPeak.toFixed(2)}). Sharp pressure surge exceeding emergency alarm threshold.`,
            anomaly_detected: true,
            visual_signals: [],
            acoustic_signals: [
              `Critical acoustic pressure spike (${clientDecibels} dBFS)`,
              `Dominant frequency: ${clientFreqHz} Hz`,
            ],
          };
        } else if (isLoud) {
          parsedData = {
            animals_reacting: 0,
            total_animals: 0,
            duration_minutes: 0,
            intensity_level: 4,
            acoustic_frequency_hz: clientFreqHz > 50 ? clientFreqHz : 18.2,
            species_detected: 'Elevated Vocal Agitation & Sound Spike',
            sound_classification: 'Elevated Voice / Shouting / Sound Disturbance',
            decibels_dbfs: clientDecibels,
            peak_amplitude: Number(clientPeak.toFixed(2)),
            confidence_score: Number((93.5 + Math.random() * 3).toFixed(1)),
            behavioral_summary: `Elevated acoustic agitation recorded (${clientDecibels} dBFS, ${clientFreqHz} Hz). Sound energy exceeds standard ambient baseline.`,
            anomaly_detected: true,
            visual_signals: [],
            acoustic_signals: [`Elevated acoustic energy (${clientDecibels} dBFS)`, `Dominant frequency: ${clientFreqHz} Hz`],
          };
        } else if (clientDecibels > -32) {
          parsedData = {
            animals_reacting: 0,
            total_animals: 0,
            duration_minutes: 0,
            intensity_level: 2,
            acoustic_frequency_hz: clientFreqHz > 50 ? clientFreqHz : 64.0,
            species_detected: 'Human Speech / Vocal Level (Nominal)',
            sound_classification: 'Human Speech & Ambient Vocalization',
            decibels_dbfs: clientDecibels,
            peak_amplitude: Number(clientPeak.toFixed(2)),
            confidence_score: Number((91.5 + Math.random() * 3).toFixed(1)),
            behavioral_summary: `Normal vocal sound recorded (${clientDecibels} dBFS, ${clientFreqHz} Hz). Acoustic environment remains within safe diurnal boundaries.`,
            anomaly_detected: false,
            visual_signals: [],
            acoustic_signals: [`Moderate acoustic background (${clientDecibels} dBFS)`],
          };
        } else {
          parsedData = {
            animals_reacting: 0,
            total_animals: 0,
            duration_minutes: 0,
            intensity_level: 1,
            acoustic_frequency_hz: clientFreqHz > 50 ? clientFreqHz : 45.0,
            species_detected: 'Quiet Baseline (Ambient Silence)',
            sound_classification: 'Quiet Ambient Room / Background Silence',
            decibels_dbfs: clientDecibels,
            peak_amplitude: Number(clientPeak.toFixed(2)),
            confidence_score: Number((97.2 + Math.random() * 2).toFixed(1)),
            behavioral_summary: `Calm acoustic baseline recorded (${clientDecibels} dBFS, low RMS ${clientRms.toFixed(3)}). Completely peaceful sound environment; zero anomaly detected.`,
            anomaly_detected: false,
            visual_signals: [],
            acoustic_signals: [`Quiet ambient background (${clientDecibels} dBFS)`],
          };
        }
      } else {
        // Without the configured AI model, never invent species or behavior counts.
        parsedData = {
          animals_reacting: 0,
          total_animals: Number(zoneAnimalCount) || 0,
          duration_minutes: Number(mediaDurationMinutes) || 0,
          intensity_level: 0,
          observed_behavior: 'Unclear',
          movement_change_percent: 0,
          species_detected: animalName || 'Wildlife Fauna',
          confidence_score: 0,
          behavioral_summary: 'No media AI is configured. Add a valid GEMINI_API_KEY to analyze animal behavior; no animal count or behavior has been inferred.',
          anomaly_detected: false,
          visual_signals: [],
          acoustic_signals: [],
        };
      }
      modelUsed = geminiSuccess
        ? modelUsed
        : type === 'audio'
          ? 'Audio signal fallback (no behavior model)'
          : process.env.GEMINI_API_KEY
            ? 'Gemini request failed'
            : 'No media AI configured';
    }

    if (!geminiSuccess) {
      parsedData.animals_reacting = 0;
      parsedData.total_animals = Number(zoneAnimalCount) || 0;
      parsedData.duration_minutes = Number(mediaDurationMinutes) || 0;
      parsedData.intensity_level = 0;
      parsedData.observed_behavior = 'Unclear';
      parsedData.species_detected = animalName || 'Wildlife Fauna';
      parsedData.confidence_score = 0;
      parsedData.behavioral_summary = process.env.GEMINI_API_KEY
        ? `GEMINI_API_KEY is configured, but Gemini analysis failed${geminiFailureReason ? ` (${geminiFailureReason})` : ''}. Check the server logs for provider details. No animal behavior or count has been inferred.`
        : 'Behavior analysis is unavailable because GEMINI_API_KEY is not configured. No animal behavior or count has been inferred.';
      parsedData.anomaly_detected = false;
    }

    const latency = Math.round(performance.now() - startTime);

    const total = Math.max(
      1,
      Number(zoneAnimalCount) ||
        Number(parsedData.total_animals) ||
        Number(parsedData.animals_observed) ||
        1
    );
    const observed = Math.min(total, Math.max(0, Math.trunc(Number(parsedData.animals_observed) || 0)));
    const showingBehavior = Math.min(observed, Math.max(0, Math.trunc(Number(parsedData.animals_showing_behavior) || 0)));
    const reacting = Math.min(showingBehavior, Math.max(0, Math.trunc(Number(parsedData.animals_reacting) || 0)));
    const boundedReacting = Math.min(reacting, total);
    const abnormality = Number(((boundedReacting / total) * 100).toFixed(1));
    const behaviorPercentage = observed > 0
      ? Number(((showingBehavior / observed) * 100).toFixed(1))
      : 0;
    const ratio = Math.min(1, boundedReacting / total);
    const intensity = Math.min(10, Math.max(0, Number(parsedData.intensity_level ?? 0)));
    const scoringIntensity = intensity / 2;
    const isAnomaly = Boolean(parsedData.anomaly_detected);

    let calculatedProb: number;
    if (isAnomaly || scoringIntensity >= 4 || (ratio >= 0.5 && boundedReacting >= 3)) {
      calculatedProb = 52 + (scoringIntensity - 3) * 14 + ratio * 20;
      calculatedProb = Math.min(96.8, Math.max(54.2, calculatedProb));
    } else if (scoringIntensity === 3 || ratio >= 0.3) {
      calculatedProb = 36 + ratio * 24;
      calculatedProb = Math.min(49.8, Math.max(26.0, calculatedProb));
    } else {
      calculatedProb = 10 + scoringIntensity * 4 + ratio * 10;
      calculatedProb = Math.min(30.0, Math.max(7.5, calculatedProb));
    }

    calculatedProb = Number(calculatedProb.toFixed(1));
    const isAlert = calculatedProb > 50;

    return res.json({
      success: true,
      real_ai: geminiSuccess,
      model_name: modelUsed,
      inference_latency_ms: latency,
      extracted_features: {
        animals_observed: observed,
        animals_showing_behavior: showingBehavior,
        behavior_percentage: behaviorPercentage,
        animals_reacting: boundedReacting,
        total_animals: total,
        duration_minutes: Number(mediaDurationMinutes) || Number(parsedData.duration_minutes) || 0,
        intensity_level: intensity,
        observed_behavior: parsedData.observed_behavior || (isAnomaly ? 'Unclear' : 'Normal behavior'),
        abnormality_percentage: abnormality,
        movement_change_percent: parsedData.movement_change_percent ?? (type === 'video' ? 65 : undefined),
        acoustic_frequency_hz: parsedData.acoustic_frequency_hz ?? clientFreqHz,
        species_detected: animalName || parsedData.species_detected || 'Wildlife Fauna',
        sound_classification: parsedData.sound_classification || parsedData.species_detected,
        decibels_dbfs: parsedData.decibels_dbfs ?? clientDecibels,
        peak_amplitude: parsedData.peak_amplitude ?? clientPeak,
        confidence_score: geminiSuccess
          ? Number((parsedData.confidence_score || 94.5).toFixed(1))
          : 0,
        behavioral_summary: parsedData.behavioral_summary || 'Analysis complete.',
        anomaly_detected: isAnomaly,
        visual_signals: parsedData.visual_signals || [],
        acoustic_signals: parsedData.acoustic_signals || [],
      },
      disaster_probability: calculatedProb,
      is_alert_triggered: isAlert,
      status: isAlert ? 'ALERT TRIGGERED' : 'NORMAL / MONITORING',
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Error in analyze-media endpoint:', error);
    return res.status(500).json({
      success: false,
      error: error?.message || 'Failed to analyze media.',
    });
  }
});

// Serve frontend in dev (via Vite middleware) or prod (static dist)
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`LIVING LENS Full-Stack server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();

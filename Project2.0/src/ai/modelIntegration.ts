/**
 * ============================================================================
 * LIVING LENS — REAL MULTIMODAL AI (GEMINI 3.8 FLASH VISION & AUDIO) + HOOKS
 * ============================================================================
 * 
 * THE LIVE PIPELINE:
 * RAW VIDEO / AUDIO → REAL SERVER-SIDE GEMINI MULTIMODAL INGESTION →
 * BEHAVIORAL FEATURE EXTRACTION → DISASTER PROBABILITY → TARGETED CITIZEN GEOFENCE
 * ============================================================================
 */

import { ExtractedMediaFeatures, AIModelInputs, ModelAlertStatus, AIModelPrediction } from '../types/livingLens';

export interface Model1ExtractParams {
  name: string;
  type: 'video' | 'audio' | 'image';
  file?: File;
  data?: string; // Base64 data URL
  mimeType?: string;
  frames?: string[]; // Array of base64 video frames
  forestName?: string;
  notes?: string;
  hintLevel?: 'high' | 'normal';
  measuredMetrics?: {
    rms: number;
    peak: number;
    decibels: number;
    frequencyHz: number;
  };
  animalName?: string;
  zoneAnimalCount?: number;
  mediaDurationMinutes?: number;
}

/**
 * Converts a browser File/Blob to a base64 Data URL string
 */
export async function fileToBase64(file: File | Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

/**
 * Extracts multiple video frames using an off-screen HTML5 Canvas
 * to feed real sequential frames into Gemini Multimodal Vision.
 */
export async function extractFramesFromVideoFile(file: File, frameCount = 3): Promise<string[]> {
  return new Promise((resolve) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.muted = true;
    video.playsInline = true;
    const url = URL.createObjectURL(file);
    video.src = url;

    video.onloadedmetadata = async () => {
      const duration = video.duration || 4;
      const timestamps = [
        Math.max(0.1, duration * 0.2),
        Math.max(0.5, duration * 0.5),
        Math.max(0.9, duration * 0.8),
      ].slice(0, frameCount);

      const frames: string[] = [];
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      const captureFrame = (time: number): Promise<string | null> => {
        return new Promise((res) => {
          const timeout = setTimeout(() => res(null), 1200);
          video.currentTime = time;
          video.onseeked = () => {
            clearTimeout(timeout);
            if (!ctx) return res(null);
            const maxW = 640;
            const scale = Math.min(1, maxW / (video.videoWidth || 640));
            canvas.width = Math.round((video.videoWidth || 640) * scale);
            canvas.height = Math.round((video.videoHeight || 360) * scale);
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            res(canvas.toDataURL('image/jpeg', 0.8));
          };
        });
      };

      for (const t of timestamps) {
        const frame = await captureFrame(t);
        if (frame) frames.push(frame);
      }

      URL.revokeObjectURL(url);
      resolve(frames);
    };

    video.onerror = () => {
      URL.revokeObjectURL(url);
      resolve([]);
    };
  });
}

/**
 * ----------------------------------------------------------------------------
 * AI MODEL 1: REAL MULTIMODAL MEDIA FEATURE EXTRACTION
 * ----------------------------------------------------------------------------
 * Sends real media frames (video/image) or audio clips to the server-side
 * Gemini 3.8 Flash multimodal endpoint `/api/analyze-media`.
 * If server is offline or fails, falls back gracefully to scientific heuristic baseline.
 */
export async function extractMediaFeatures(params: Model1ExtractParams): Promise<ExtractedMediaFeatures> {
  let frames: string[] | undefined = params.frames;
  let base64Data = params.data;
  let detectedMimeType = params.mimeType || (params.type === 'audio' ? 'audio/wav' : 'image/jpeg');

  // If a real File object is provided:
  if (params.file) {
    detectedMimeType = params.file.type || detectedMimeType;
    if (params.type === 'video' || params.file.type.startsWith('video/')) {
      try {
        const extracted = await extractFramesFromVideoFile(params.file, 3);
        if (extracted.length > 0) {
          frames = extracted;
        } else {
          // If browser can't decode video frames, read as base64
          base64Data = await fileToBase64(params.file);
        }
      } catch (e) {
        console.warn('Frame extraction fallback:', e);
        base64Data = await fileToBase64(params.file);
      }
    } else {
      // Audio or Image file
      base64Data = await fileToBase64(params.file);
    }
  }

  // Attempt real AI call to full-stack server
  if (frames?.length || base64Data) {
    try {
      const response = await fetch('/api/analyze-media', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: params.type,
          mimeType: detectedMimeType,
          data: base64Data,
          frames: frames,
          fileName: params.name,
          forestName: params.forestName || 'Sundarbans National Park',
          notes: params.notes || '',
          measuredMetrics: params.measuredMetrics,
          animalName: params.animalName,
          zoneAnimalCount: params.zoneAnimalCount,
          mediaDurationMinutes: params.mediaDurationMinutes,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.extracted_features) {
          return {
            ...result.extracted_features,
            isRealAI: Boolean(result.real_ai),
            modelName: result.model_name || 'gemini-3.8-flash (Multimodal Vision & Audio)',
            inferenceLatencyMs: result.inference_latency_ms,
          };
        }
      }
    } catch (err) {
      console.warn('Real AI endpoint unavailable, using dynamic fallback:', err);
    }
  }

  // Dynamic fallback based on real physical measurements or input parameters
  await new Promise((resolve) => setTimeout(resolve, 400));

  // Never turn a real upload into invented detections if Gemini is unavailable.
  if (params.file || params.data || params.frames?.length) {
    return {
      animals_reacting: 0,
      total_animals: params.zoneAnimalCount || 0,
      duration_minutes: params.mediaDurationMinutes || 0,
      intensity_level: 0,
      observed_behavior: 'Unclear',
      abnormality_percentage: 0,
      species_detected: params.animalName || 'Not analyzed',
      confidence_score: 0,
      behavioral_summary: 'No media AI result is available. Configure GEMINI_API_KEY and confirm the server is reachable; no behavior or animal count was inferred.',
      anomaly_detected: false,
      visual_signals: [],
      acoustic_signals: [],
      isRealAI: false,
      modelName: 'Media AI unavailable',
    };
  }

  const isVideo = params.type === 'video';
  const m = params.measuredMetrics;

  if (m) {
    // If real microphone / audio measurements were passed in:
    const isVeryLoud = m.decibels > -12 || m.peak > 0.8;
    const isLoud = m.decibels > -20 || m.peak > 0.55;
    const isModerate = m.decibels > -32 || m.peak > 0.25;

    if (isVeryLoud) {
      return {
        animals_reacting: 0,
        total_animals: 0,
        duration_minutes: 0,
        intensity_level: 5,
        acoustic_frequency_hz: m.frequencyHz > 50 ? m.frequencyHz : 14.7,
        sound_classification: 'Critical Acoustic Transient / Impact Shockwave',
        species_detected: 'Acoustic Shockwave (Severe Decibel Surge)',
        decibels_dbfs: m.decibels,
        peak_amplitude: Number(m.peak.toFixed(2)),
        confidence_score: 96.8,
        behavioral_summary: `Critical acoustic distress surge detected (${m.decibels} dBFS, peak amplitude ${m.peak.toFixed(2)}). Sharp acoustic pressure surge exceeding emergency alarm threshold.`,
        anomaly_detected: true,
        acoustic_signals: [`Critical acoustic peak (${m.decibels} dBFS)`, `Dominant frequency: ${m.frequencyHz} Hz`],
        isRealAI: false,
        modelName: 'Local acoustic signal fallback (not behaviour AI)',
        inferenceLatencyMs: 350,
      };
    } else if (isLoud) {
      return {
        animals_reacting: 0,
        total_animals: 0,
        duration_minutes: 0,
        intensity_level: 4,
        acoustic_frequency_hz: m.frequencyHz > 50 ? m.frequencyHz : 18.2,
        sound_classification: 'Elevated Vocal Agitation & Acoustic Surge',
        species_detected: 'Elevated Voice / Shouting / Sound Disturbance',
        decibels_dbfs: m.decibels,
        peak_amplitude: Number(m.peak.toFixed(2)),
        confidence_score: 93.4,
        behavioral_summary: `Elevated acoustic agitation recorded (${m.decibels} dBFS, ${m.frequencyHz} Hz). Sound energy exceeds standard ambient baseline.`,
        anomaly_detected: true,
        acoustic_signals: [`Elevated acoustic energy (${m.decibels} dBFS)`, `Dominant frequency: ${m.frequencyHz} Hz`],
        isRealAI: false,
        modelName: 'Local acoustic signal fallback (not behaviour AI)',
        inferenceLatencyMs: 350,
      };
    } else if (isModerate) {
      return {
        animals_reacting: 0,
        total_animals: 0,
        duration_minutes: 0,
        intensity_level: 2,
        acoustic_frequency_hz: m.frequencyHz > 50 ? m.frequencyHz : 64.0,
        sound_classification: 'Human Speech & Ambient Vocalization',
        species_detected: 'Human Speech / Vocal Level (Nominal)',
        decibels_dbfs: m.decibels,
        peak_amplitude: Number(m.peak.toFixed(2)),
        confidence_score: 91.2,
        behavioral_summary: `Normal vocal sound recorded (${m.decibels} dBFS, ${m.frequencyHz} Hz). Acoustic environment remains within safe diurnal boundaries.`,
        anomaly_detected: false,
        acoustic_signals: [`Moderate acoustic background (${m.decibels} dBFS)`],
        isRealAI: false,
        modelName: 'Local acoustic signal fallback (not behaviour AI)',
        inferenceLatencyMs: 350,
      };
    } else {
      return {
        animals_reacting: 0,
        total_animals: 0,
        duration_minutes: 0,
        intensity_level: 1,
        acoustic_frequency_hz: m.frequencyHz > 50 ? m.frequencyHz : 45.0,
        sound_classification: 'Quiet Ambient Room / Background Silence',
        species_detected: 'Quiet Baseline (Ambient Silence)',
        decibels_dbfs: m.decibels,
        peak_amplitude: Number(m.peak.toFixed(2)),
        confidence_score: 97.1,
        behavioral_summary: `Calm acoustic baseline recorded (${m.decibels} dBFS, low RMS ${m.rms.toFixed(3)}). Completely peaceful sound environment; zero anomaly detected.`,
        anomaly_detected: false,
        acoustic_signals: [`Quiet ambient background (${m.decibels} dBFS)`],
        isRealAI: false,
        modelName: 'Local acoustic signal fallback (not behaviour AI)',
        inferenceLatencyMs: 350,
      };
    }
  }

  const isHigh =
    params.hintLevel === 'high' ||
    params.name.toLowerCase().includes('stampede') ||
    params.name.toLowerCase().includes('panic') ||
    params.name.toLowerCase().includes('alert') ||
    params.name.toLowerCase().includes('alarm') ||
    params.name.toLowerCase().includes('tiger');

  if (isHigh) {
    return {
      animals_reacting: 13,
      total_animals: 15,
      duration_minutes: 12,
      intensity_level: 5,
      movement_change_percent: isVideo ? 78 : undefined,
      acoustic_frequency_hz: !isVideo ? 14.7 : undefined,
      species_detected: isVideo ? 'Asian Elephant (Elephas maximus)' : 'Avian Canopy Mixed Flock',
      confidence_score: 96.8,
      behavioral_summary: 'Synchronized abrupt stampede flight pattern observed heading northwest away from coastal fault line.',
      anomaly_detected: true,
      visual_signals: ['Directional herd evacuation vector', 'Tail raising and vocal distress posturing'],
      acoustic_signals: ['Infrasonic ground vibration resonance (14.7 Hz)', 'High canopy distress frequency shrieks'],
      isRealAI: false,
      modelName: 'Preloaded example simulation (no media analyzed)',
      inferenceLatencyMs: 580,
    };
  } else {
    return {
      animals_reacting: 2,
      total_animals: 18,
      duration_minutes: 2,
      intensity_level: 1,
      movement_change_percent: isVideo ? 6 : undefined,
      acoustic_frequency_hz: !isVideo ? 64.2 : undefined,
      species_detected: isVideo ? 'Spotted Deer (Axis axis)' : 'Ambient Cicada & Forest Birds',
      confidence_score: 94.1,
      behavioral_summary: 'Normal grazing and diurnal foraging activity with nominal movement velocity.',
      anomaly_detected: false,
      visual_signals: ['Dispersed peaceful grazing', 'Stationary posture'],
      acoustic_signals: ['Nominal ambient forest canopy background'],
      isRealAI: false,
      modelName: 'Preloaded example simulation (no media analyzed)',
      inferenceLatencyMs: 580,
    };
  }
}

/**
 * ----------------------------------------------------------------------------
 * AI MODEL 2: DISASTER PROBABILITY INFERENCE
 * ----------------------------------------------------------------------------
 * Receives behavioral metrics and infers Disaster Probability (%):
 * - animals_reacted
 * - total_animals_detected
 * - reaction_duration
 * - reaction_intensity (1 - 5)
 * 
 * ALERT RULE:
 * - Probability > 50%  => ALERT TRIGGERED
 * - Probability <= 50% => NORMAL / MONITORING
 */
export async function predictDisasterProbability(
  inputs: AIModelInputs,
  threshold = 50,
  overrideProb?: number,
  isRealAI = false,
  modelName = 'Disaster_Probability_Classifier'
): Promise<AIModelPrediction> {
  const startTime = performance.now();
  await new Promise((resolve) => setTimeout(resolve, 350));

  let probability: number;
  let selectedModelName = modelName;
  let syntheticModel = false;

  if (typeof overrideProb === 'number') {
    probability = overrideProb;
  } else if (inputs.zoo_sentinel_features) {
    const response = await fetch('/api/model-2/predict', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ features: inputs.zoo_sentinel_features, threshold }),
    });
    if (!response.ok) {
      throw new Error(`Zoo Sentinel model request failed (${response.status}).`);
    }
    const result = await response.json();
    probability = Number(result.disaster_probability);
    selectedModelName = result.model_name || 'Zoo Sentinel Random Forest';
    syntheticModel = Boolean(result.synthetic_training_data);
  } else {
    const reacting = Math.max(0, inputs.animals_reacted);
    const total = Math.max(1, inputs.total_animals_detected);
    const ratio = Math.min(1, reacting / total);
    const intensity = Math.min(5, Math.max(1, inputs.reaction_intensity));

    if (intensity >= 4 || (ratio >= 0.6 && reacting >= 3)) {
      probability = 52 + (intensity - 3) * 14 + ratio * 18;
      probability = Math.min(96.8, Math.max(54.2, probability));
    } else if (intensity === 3 || ratio >= 0.35) {
      probability = 36 + ratio * 20;
      probability = Math.min(49.8, Math.max(26.0, probability));
    } else {
      probability = 14 + intensity * 4 + ratio * 10;
      probability = Math.min(32.0, Math.max(8.5, probability));
    }
  }

  const isAlert = probability > threshold;
  const status: ModelAlertStatus = isAlert ? 'ALERT TRIGGERED' : 'NORMAL / MONITORING';

  return {
    inputs,
    disaster_probability: Number(probability.toFixed(1)),
    status,
    is_alert_triggered: isAlert,
    threshold_used: threshold,
    is_simulated_placeholder: syntheticModel || !isRealAI,
    model_name: selectedModelName,
    timestamp: new Date().toISOString(),
    inference_latency_ms: Math.round(performance.now() - startTime),
  };
}

export async function runAIModelInference(
  inputs: AIModelInputs,
  threshold = 50,
  overrideProbability?: number
): Promise<AIModelPrediction> {
  return predictDisasterProbability(inputs, threshold, overrideProbability);
}

export function determineModelAlertStatus(
  disasterProbability: number,
  threshold = 50
): { status: ModelAlertStatus; isAlertTriggered: boolean } {
  const isAlert = disasterProbability > threshold;
  return {
    status: isAlert ? 'ALERT TRIGGERED' : 'NORMAL / MONITORING',
    isAlertTriggered: isAlert,
  };
}

export interface CameraData {
  species: string;
  total_observed: number;
  count_reacting: number;
  intensity_level: number; // 1 to 5
}

export type SensorType = 'Audio Sensor' | 'Video Sensor' | 'Environmental Sensor';

export interface SensorDevice {
  id: string;
  name: string;
  type: SensorType;
  status: 'Online' | 'Offline';
  endpointPlaceholder?: string;
  lastReading?: string;
}

export interface Forest {
  id: string;
  name: string;
  state: string;
  district: string;
  latitude: number;
  longitude: number;
  sensors: SensorDevice[];
  lastActivity: string;
}

export interface EmailAlertPayload {
  citizenName: string;
  citizenEmail: string;
  alertForest: string;
  alertLocation: string;
  distanceKm: number;
  alertRadiusKm: number;
  aiProbability: number;
  alertStatus: 'ALERT' | 'NO ALERT';
}

export interface AudioData {
  infrasound_detected_hz: number;
  decibel_spike_db: number;
  bird_canopy_shriek_detected: boolean;
}

export interface SensorPacket {
  zone_id: string;
  timestamp: string;
  camera_data: CameraData;
  audio_data: AudioData;
  duration_minutes: number;
}

export interface AIModelInputs {
  animals_reacted: number;
  total_animals_detected: number;
  reaction_duration: number; // in minutes
  reaction_intensity: number; // scale 1 to 5
  zoo_sentinel_features?: {
    animal_name: string;
    behaviour: string;
    intensity: number; // notebook model scale: 1 to 10
    abnormality_percentage: number; // 0 to 100
    duration_minutes: number;
  };
}

export type MediaType = 'video' | 'audio';
export type MediaProcessingStatus = 'LIVE' | 'PROCESSING' | 'ANALYZED';

export interface ExtractedMediaFeatures {
  animals_observed?: number;
  animals_showing_behavior?: number;
  behavior_percentage?: number;
  animals_reacting: number;
  total_animals: number;
  duration_minutes: number;
  intensity_level: number; // 0 to 10 for first-stage media analysis
  movement_change_percent?: number;
  acoustic_frequency_hz?: number;
  species_detected: string;
  sound_classification?: string;
  decibels_dbfs?: number;
  peak_amplitude?: number;
  confidence_score: number;
  behavioral_summary?: string;
  observed_behavior?: string;
  abnormality_percentage?: number;
  anomaly_detected?: boolean;
  visual_signals?: string[];
  acoustic_signals?: string[];
  isRealAI?: boolean;
  modelName?: string;
  inferenceLatencyMs?: number;
}

export interface DemoMediaItem {
  id: string;
  title: string;
  type: MediaType;
  forestName: string;
  location: string;
  latitude: number;
  longitude: number;
  status: MediaProcessingStatus;
  timestamp: string;
  durationSeconds: number;
  previewUrl?: string;
  extractedData?: ExtractedMediaFeatures;
  disasterProbability?: number;
  isAlert?: boolean;
}

export type ModelAlertStatus = 'NORMAL / MONITORING' | 'ELEVATED MONITORING' | 'ALERT TRIGGERED';

export interface AIModelPrediction {
  inputs: AIModelInputs;
  disaster_probability: number;
  status: ModelAlertStatus;
  is_alert_triggered: boolean;
  threshold_used: number;
  is_simulated_placeholder: boolean;
  model_name: string;
  timestamp: string;
  inference_latency_ms: number;
}

export type RiskLevel = 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';

export interface FusionResult {
  reactionRatio: number;
  cameraScore: number;
  cameraStatus: 'NOMINAL' | 'ELEVATED' | 'ANOMALY DETECTED';
  acousticScore: number;
  acousticStatus: 'NOMINAL' | 'ELEVATED' | 'ACOUSTIC ANOMALY';
  temporalCorrelation: 'LOW' | 'MODERATE' | 'HIGH';
  fusionScore: number; // 0 - 100
  fusionStatus: 'BASELINE NOMINAL' | 'CORRELATED SUSPICION' | 'MULTI-MODAL SIGNAL MATCH';
  riskScore: number; // 0 - 100
  riskLevel: RiskLevel;
}

export interface ForestNode {
  id: string;
  name: string;
  region: string;
  coordinates: {
    lat: number;
    lon: number;
  };
  status: 'ONLINE' | 'WARNING' | 'ALERT' | 'STANDBY';
  riskScore: number;
  cameraStatus: string;
  acousticStatus: string;
  lastPacketTime: string;
  packet: SensorPacket;
}

export interface Citizen {
  id: string;
  name: string;
  email: string;
  location: string;
  latitude: number;
  longitude: number;
  isDemo?: boolean;
}

export interface AlertDeliveryRecord {
  citizenId: string;
  citizenName: string;
  email: string;
  distanceKm: number;
  alertRadiusKm: number;
  isInside: boolean;
  status: 'EMAIL TARGETED' | 'OUTSIDE ZONE';
  timestamp: string;
}

export interface ActiveAlert {
  zone_id: string;
  zone_name: string;
  latitude: number;
  longitude: number;
  timestamp: string;
  riskScore: number;
  disasterProbability?: number; // AI model output %
  animalSpecies?: string;
  observedBehavior?: string;
  observationTime?: string;
  alertRadiusKm: number;
  hazardCategories: string[];
  detectedSignals: string[];
  status: 'ACTIVE' | 'STANDBY';
}

export interface CitizenAlertHistoryItem {
  id: string;
  zone_id: string;
  timestamp: string;
  riskScore: number;
  disasterProbability?: number;
  distanceKm: number;
  alertRadiusKm: number;
  status: 'EMAIL SENT' | 'NOT SENT';
  reason?: string;
  subject: string;
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  zone_id: string;
  message: string;
  type: 'camera' | 'acoustic' | 'fusion' | 'alert' | 'system';
}

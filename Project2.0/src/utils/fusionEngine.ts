import { FusionResult, RiskLevel, SensorPacket } from '../types/livingLens';

/**
 * Calculates sensor fusion score and simulated event likelihood based on
 * multi-modal wildlife vision and environmental acoustic indicators.
 */
export function evaluateSensorFusion(packet: SensorPacket): FusionResult {
  const { camera_data, audio_data, duration_minutes } = packet;

  // 1. Vision Analysis
  const total = Math.max(1, camera_data.total_observed);
  const reactionRatio = camera_data.count_reacting / total;
  const intensityNorm = Math.min(1, Math.max(0, camera_data.intensity_level / 5));

  // Camera subscore (0 to 100): Weighted reaction ratio + behavioral intensity
  const cameraScore = Math.min(
    100,
    Math.round(reactionRatio * 60 + intensityNorm * 40)
  );

  let cameraStatus: 'NOMINAL' | 'ELEVATED' | 'ANOMALY DETECTED' = 'NOMINAL';
  if (cameraScore >= 70) {
    cameraStatus = 'ANOMALY DETECTED';
  } else if (cameraScore >= 35) {
    cameraStatus = 'ELEVATED';
  }

  // 2. Acoustic Analysis
  // Infrasound range of interest: typically 8 - 18 Hz (anomalous low-frequency seismic/atmospheric rumble)
  const infrasoundHz = audio_data.infrasound_detected_hz;
  let infrasoundScore = 0;
  if (infrasoundHz >= 8 && infrasoundHz <= 20) {
    infrasoundScore = Math.min(100, ((infrasoundHz - 7) / 8) * 100);
  } else if (infrasoundHz > 4) {
    infrasoundScore = 30;
  } else {
    infrasoundScore = 5;
  }

  // Decibel spike (baseline forest 35-45 dB, spike 75-100 dB)
  const dbSpike = audio_data.decibel_spike_db;
  const dbScore = Math.min(100, Math.max(0, ((dbSpike - 40) / 60) * 100));

  // Bird canopy alarm shriek (significant cross-species alarm indicator)
  const birdScore = audio_data.bird_canopy_shriek_detected ? 100 : 0;

  // Composite acoustic subscore (0 to 100)
  const acousticScore = Math.min(
    100,
    Math.round(infrasoundScore * 0.4 + dbScore * 0.35 + birdScore * 0.25)
  );

  let acousticStatus: 'NOMINAL' | 'ELEVATED' | 'ACOUSTIC ANOMALY' = 'NOMINAL';
  if (acousticScore >= 70) {
    acousticStatus = 'ACOUSTIC ANOMALY';
  } else if (acousticScore >= 35) {
    acousticStatus = 'ELEVATED';
  }

  // 3. Multi-Modal Fusion & Temporal Correlation
  // Temporal persistence multiplier: longer continuous anomalous duration increases confidence
  const durationFactor = Math.min(1.2, 0.8 + Math.min(duration_minutes, 15) / 30);

  // Cross-modal correlation: If both vision and acoustics agree, synergy is high
  const modalityDifference = Math.abs(cameraScore - acousticScore);
  let temporalCorrelation: 'LOW' | 'MODERATE' | 'HIGH' = 'LOW';

  if (cameraScore >= 60 && acousticScore >= 60) {
    temporalCorrelation = 'HIGH';
  } else if (cameraScore >= 35 || acousticScore >= 35) {
    temporalCorrelation = 'MODERATE';
  }

  let baseFusionScore = cameraScore * 0.48 + acousticScore * 0.52;

  // Synergy bonus when both modalities spike together
  if (cameraScore >= 65 && acousticScore >= 65) {
    baseFusionScore = Math.min(100, baseFusionScore * 1.15);
  }

  const fusionScore = Math.min(100, Math.round(baseFusionScore * durationFactor));

  let fusionStatus:
    | 'BASELINE NOMINAL'
    | 'CORRELATED SUSPICION'
    | 'MULTI-MODAL SIGNAL MATCH' = 'BASELINE NOMINAL';

  if (fusionScore >= 75 && temporalCorrelation === 'HIGH') {
    fusionStatus = 'MULTI-MODAL SIGNAL MATCH';
  } else if (fusionScore >= 35) {
    fusionStatus = 'CORRELATED SUSPICION';
  }

  // Risk Score (Simulated Event Likelihood: 0 - 100)
  const riskScore = Math.min(100, Math.max(0, fusionScore));

  let riskLevel: RiskLevel = 'LOW';
  if (riskScore >= 80) {
    riskLevel = 'CRITICAL';
  } else if (riskScore >= 60) {
    riskLevel = 'HIGH';
  } else if (riskScore >= 30) {
    riskLevel = 'MODERATE';
  } else {
    riskLevel = 'LOW';
  }

  return {
    reactionRatio,
    cameraScore,
    cameraStatus,
    acousticScore,
    acousticStatus,
    temporalCorrelation,
    fusionScore,
    fusionStatus,
    riskScore,
    riskLevel,
  };
}

/**
 * Pre-calibrated generator for NORMAL EVENT
 */
export function getNormalEventPacket(zoneId = 'MEDINIPUR_ZONE_02'): SensorPacket {
  return {
    zone_id: zoneId,
    timestamp: new Date().toISOString(),
    camera_data: {
      species: 'Spotted Deer & Peafowl',
      total_observed: 20,
      count_reacting: 2,
      intensity_level: 1,
    },
    audio_data: {
      infrasound_detected_hz: 2.4,
      decibel_spike_db: 42.0,
      bird_canopy_shriek_detected: false,
    },
    duration_minutes: 2,
  };
}

/**
 * Pre-calibrated generator for ANOMALY EVENT
 */
export function getAnomalyEventPacket(zoneId = 'MEDINIPUR_ZONE_02'): SensorPacket {
  return {
    zone_id: zoneId,
    timestamp: new Date().toISOString(),
    camera_data: {
      species: 'Elephant & Wild Boar',
      total_observed: 18,
      count_reacting: 11,
      intensity_level: 3,
    },
    audio_data: {
      infrasound_detected_hz: 8.8,
      decibel_spike_db: 74.5,
      bird_canopy_shriek_detected: false,
    },
    duration_minutes: 7,
  };
}

/**
 * Pre-calibrated generator for CRITICAL EVENT (Matches exact sample in brief)
 */
export function getCriticalEventPacket(zoneId = 'MEDINIPUR_ZONE_02'): SensorPacket {
  return {
    zone_id: zoneId,
    timestamp: new Date().toISOString(),
    camera_data: {
      species: 'Elephant',
      total_observed: 15,
      count_reacting: 13,
      intensity_level: 5,
    },
    audio_data: {
      infrasound_detected_hz: 14.2,
      decibel_spike_db: 95.0,
      bird_canopy_shriek_detected: true,
    },
    duration_minutes: 12,
  };
}

/**
 * Random packet generator for AUTO SIMULATION
 */
export function getRandomSimulatedPacket(zoneId: string): SensorPacket {
  const speciesList = [
    'Elephant',
    'Spotted Deer',
    'Rhesus Macaque',
    'Wild Boar',
    'One-Horned Rhino',
    'Peafowl & Hornbill',
  ];
  const species = speciesList[Math.floor(Math.random() * speciesList.length)];
  const total = Math.floor(Math.random() * 16) + 8; // 8 to 24

  // Pick simulation profile: 60% chance normal, 25% moderate, 15% elevated/critical
  const roll = Math.random();
  if (roll < 0.6) {
    const reacting = Math.floor(Math.random() * 3);
    return {
      zone_id: zoneId,
      timestamp: new Date().toISOString(),
      camera_data: {
        species,
        total_observed: total,
        count_reacting: reacting,
        intensity_level: 1,
      },
      audio_data: {
        infrasound_detected_hz: Number((1.2 + Math.random() * 2.5).toFixed(1)),
        decibel_spike_db: Number((38 + Math.random() * 12).toFixed(1)),
        bird_canopy_shriek_detected: false,
      },
      duration_minutes: Math.floor(Math.random() * 4) + 1,
    };
  } else if (roll < 0.85) {
    const reacting = Math.floor(total * (0.35 + Math.random() * 0.25));
    return {
      zone_id: zoneId,
      timestamp: new Date().toISOString(),
      camera_data: {
        species,
        total_observed: total,
        count_reacting: reacting,
        intensity_level: 3,
      },
      audio_data: {
        infrasound_detected_hz: Number((7.0 + Math.random() * 3.5).toFixed(1)),
        decibel_spike_db: Number((65 + Math.random() * 15).toFixed(1)),
        bird_canopy_shriek_detected: Math.random() > 0.6,
      },
      duration_minutes: Math.floor(Math.random() * 6) + 3,
    };
  } else {
    const reacting = Math.floor(total * (0.8 + Math.random() * 0.18));
    return {
      zone_id: zoneId,
      timestamp: new Date().toISOString(),
      camera_data: {
        species: 'Elephant Herd',
        total_observed: total,
        count_reacting: Math.min(total, reacting),
        intensity_level: 5,
      },
      audio_data: {
        infrasound_detected_hz: Number((13.5 + Math.random() * 2.5).toFixed(1)),
        decibel_spike_db: Number((91 + Math.random() * 8).toFixed(1)),
        bird_canopy_shriek_detected: true,
      },
      duration_minutes: 10 + Math.floor(Math.random() * 5),
    };
  }
}

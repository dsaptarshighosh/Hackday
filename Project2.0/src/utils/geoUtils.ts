import { Citizen, ForestNode, SensorPacket } from '../types/livingLens';

/**
 * Calculates the great-circle distance between two points on the Earth's surface
 * using the Haversine formula.
 *
 * @param lat1 Latitude of point 1 in decimal degrees
 * @param lon1 Longitude of point 1 in decimal degrees
 * @param lat2 Latitude of point 2 in decimal degrees
 * @param lon2 Longitude of point 2 in decimal degrees
 * @returns Distance in kilometers
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's mean radius in kilometers
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return Math.round(distance * 10) / 10; // Round to 1 decimal place
}

/**
 * Demo citizens specified in the brief
 */
export const INITIAL_DEMO_CITIZENS: Citizen[] = [
  {
    id: 'citizen-rahul-01',
    name: 'Rahul Sen',
    email: 'rahul.demo@example.com',
    location: 'Near Medinipur',
    latitude: 22.49,
    longitude: 87.39,
    isDemo: true,
  },
  {
    id: 'citizen-arjun-03',
    name: 'Arjun Das',
    email: 'arjun.demo@example.com',
    location: 'Kharagpur',
    latitude: 22.34,
    longitude: 87.32,
    isDemo: true,
  },
  {
    id: 'citizen-ananya-02',
    name: 'Ananya Roy',
    email: 'ananya.demo@example.com',
    location: 'Kolkata',
    latitude: 22.5726,
    longitude: 88.3639,
    isDemo: true,
  },
];

/**
 * Initial forest nodes matching requirements
 */
export const INITIAL_FOREST_NODES: ForestNode[] = [
  {
    id: 'MEDINIPUR_ZONE_02',
    name: 'Medinipur Sal Forest Core',
    region: 'Medinipur West',
    coordinates: { lat: 22.42, lon: 87.32 },
    status: 'ALERT',
    riskScore: 95,
    cameraStatus: 'ANOMALY DETECTED',
    acousticStatus: 'ACOUSTIC ANOMALY',
    lastPacketTime: 'Just now',
    packet: {
      zone_id: 'MEDINIPUR_ZONE_02',
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
    },
  },
  {
    id: 'MEDINIPUR_ZONE_01',
    name: 'Gopali Forest Fringe',
    region: 'Medinipur East',
    coordinates: { lat: 22.45, lon: 87.28 },
    status: 'ONLINE',
    riskScore: 18,
    cameraStatus: 'NOMINAL',
    acousticStatus: 'NOMINAL',
    lastPacketTime: '12s ago',
    packet: {
      zone_id: 'MEDINIPUR_ZONE_01',
      timestamp: new Date().toISOString(),
      camera_data: {
        species: 'Spotted Deer',
        total_observed: 22,
        count_reacting: 2,
        intensity_level: 1,
      },
      audio_data: {
        infrasound_detected_hz: 2.1,
        decibel_spike_db: 41.5,
        bird_canopy_shriek_detected: false,
      },
      duration_minutes: 3,
    },
  },
  {
    id: 'SUNDARBANS_ZONE_04',
    name: 'Mangrove Biosphere Node 04',
    region: 'South 24 Parganas',
    coordinates: { lat: 21.9497, lon: 88.9 },
    status: 'ONLINE',
    riskScore: 32,
    cameraStatus: 'NOMINAL',
    acousticStatus: 'ELEVATED',
    lastPacketTime: '45s ago',
    packet: {
      zone_id: 'SUNDARBANS_ZONE_04',
      timestamp: new Date().toISOString(),
      camera_data: {
        species: 'Rhesus Macaque',
        total_observed: 14,
        count_reacting: 4,
        intensity_level: 2,
      },
      audio_data: {
        infrasound_detected_hz: 5.8,
        decibel_spike_db: 58.2,
        bird_canopy_shriek_detected: false,
      },
      duration_minutes: 5,
    },
  },
  {
    id: 'JALDAPARA_ZONE_01',
    name: 'Jaldapara Rhino Grasslands',
    region: 'Alipurduar',
    coordinates: { lat: 26.6961, lon: 89.2811 },
    status: 'ONLINE',
    riskScore: 11,
    cameraStatus: 'NOMINAL',
    acousticStatus: 'NOMINAL',
    lastPacketTime: '1m ago',
    packet: {
      zone_id: 'JALDAPARA_ZONE_01',
      timestamp: new Date().toISOString(),
      camera_data: {
        species: 'One-Horned Rhino',
        total_observed: 8,
        count_reacting: 1,
        intensity_level: 1,
      },
      audio_data: {
        infrasound_detected_hz: 1.8,
        decibel_spike_db: 38.0,
        bird_canopy_shriek_detected: false,
      },
      duration_minutes: 2,
    },
  },
  {
    id: 'NORTH_BENGAL_ZONE_03',
    name: 'Buxa Foothills Corridor',
    region: 'Jalpaiguri Foothills',
    coordinates: { lat: 26.85, lon: 88.4 },
    status: 'WARNING',
    riskScore: 68,
    cameraStatus: 'ELEVATED',
    acousticStatus: 'ACOUSTIC ANOMALY',
    lastPacketTime: '28s ago',
    packet: {
      zone_id: 'NORTH_BENGAL_ZONE_03',
      timestamp: new Date().toISOString(),
      camera_data: {
        species: 'Wild Boar & Gaur',
        total_observed: 19,
        count_reacting: 12,
        intensity_level: 4,
      },
      audio_data: {
        infrasound_detected_hz: 10.4,
        decibel_spike_db: 78.4,
        bird_canopy_shriek_detected: true,
      },
      duration_minutes: 8,
    },
  },
];

const CITIZENS_STORAGE_KEY = 'living_lens_registered_citizens';

export function loadStoredCitizens(): Citizen[] {
  try {
    const raw = localStorage.getItem(CITIZENS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(CITIZENS_STORAGE_KEY, JSON.stringify(INITIAL_DEMO_CITIZENS));
      return INITIAL_DEMO_CITIZENS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
  } catch (e) {
    console.error('Failed to load citizens from localStorage', e);
  }
  return INITIAL_DEMO_CITIZENS;
}

export function saveCitizens(citizens: Citizen[]): void {
  try {
    localStorage.setItem(CITIZENS_STORAGE_KEY, JSON.stringify(citizens));
  } catch (e) {
    console.error('Failed to save citizens to localStorage', e);
  }
}

import React, { useState, useMemo } from 'react';
import { ActiveAlert, Forest, SensorType } from '../types/livingLens';
import { MapVisualization } from './MapVisualization';
import {
  Trees,
  Search,
  Plus,
  Radio,
  Video,
  Activity,
  CheckCircle2,
  Play,
  SlidersHorizontal,
  X,
  MapPin,
} from 'lucide-react';

interface ForestManagementProps {
  forests: Forest[];
  onAddForest: (newForest: Forest) => void;
  onSelectForDemo: (forest: Forest) => void;
  selectedForestId: string;
  onSelectForest: (forest: Forest) => void;
  disasterProbability: number;
  alertRadiusKm: number;
  lastObservation: { forestId: string; animalSpecies: string; observedBehavior: string; observationTime: string } | null;
  activeAlerts: ActiveAlert[];
}

export const ForestManagement: React.FC<ForestManagementProps> = ({
  forests,
  onAddForest,
  onSelectForDemo,
  selectedForestId,
  onSelectForest,
  disasterProbability,
  alertRadiusKm,
  lastObservation,
  activeAlerts,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedState, setSelectedState] = useState<string>('ALL');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New forest form state
  const [formName, setFormName] = useState('');
  const [formState, setFormState] = useState('West Bengal');
  const [formDistrict, setFormDistrict] = useState('');
  const [formLat, setFormLat] = useState('22.5000');
  const [formLon, setFormLon] = useState('88.3500');

  // Extract unique states for filtering
  const states = useMemo(() => {
    const set = new Set<string>();
    forests.forEach((f) => set.add(f.state));
    return ['ALL', 'West Bengal', ...Array.from(set).filter((s) => s !== 'West Bengal').sort()];
  }, [forests]);

  // Compute aggregate statistics
  const stats = useMemo(() => {
    let totalSensors = 0;
    let wbCount = 0;

    forests.forEach((f) => {
      if (f.state === 'West Bengal') wbCount++;
      f.sensors.forEach((s) => {
        totalSensors++;
      });
    });

    return {
      totalForests: forests.length,
      wbForests: wbCount,
      totalSensors,
    };
  }, [forests]);

  const selectedForest = forests.find((forest) => forest.id === selectedForestId) || forests[0];
  const observationForest = forests.find((forest) => forest.id === lastObservation?.forestId) || selectedForest;
  const mapAlert: ActiveAlert | null = observationForest && disasterProbability > 0 ? {
    zone_id: observationForest.id,
    zone_name: observationForest.name,
    latitude: observationForest.latitude,
    longitude: observationForest.longitude,
    timestamp: lastObservation?.observationTime || '',
    observationTime: lastObservation?.observationTime,
    animalSpecies: lastObservation?.animalSpecies,
    observedBehavior: lastObservation?.observedBehavior,
    riskScore: Math.round(disasterProbability),
    disasterProbability,
    alertRadiusKm,
    hazardCategories: [],
    detectedSignals: [],
    status: 'ACTIVE',
  } : null;

  // Filtered forests
  const filteredForests = useMemo(() => {
    return forests.filter((f) => {
      const matchesSearch =
        f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.district.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.state.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.sensors.some((s) => s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.id.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesState = selectedState === 'ALL' || f.state === selectedState;
      return matchesSearch && matchesState;
    });
  }, [forests, searchQuery, selectedState]);

  const handleCreateForestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formDistrict.trim()) return;

    const newForest: Forest = {
      id: `forest-custom-${Date.now()}`,
      name: formName.trim(),
      state: formState,
      district: formDistrict.trim(),
      latitude: parseFloat(formLat) || 22.5,
      longitude: parseFloat(formLon) || 88.35,
      lastActivity: 'Just now',
      sensors: [],
    };

    onAddForest(newForest);
    setIsAddModalOpen(false);
    // Reset form
    setFormName('');
    setFormDistrict('');
  };

  const getSensorIcon = (type: SensorType) => {
    switch (type) {
      case 'Audio Sensor':
        return <Radio className="w-3.5 h-3.5 text-teal-800" />;
      case 'Video Sensor':
        return <Video className="w-3.5 h-3.5 text-amber-800" />;
      case 'Environmental Sensor':
        return <Activity className="w-3.5 h-3.5 text-emerald-800" />;
    }
  };

  return (
    <div className="space-y-8 animate-screen-in">
      <section className="border-b border-[#d5ded2] pb-6">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#72816f]">Locations</p>
        <h1 className="text-3xl font-semibold tracking-[-0.045em] text-[#203a30] sm:text-[40px]">Forest areas</h1>
        <p className="mt-2 text-sm text-[#68796c]">Manage the locations used to organize wildlife observations.</p>
      </section>
      <p className="-mt-5 text-xs text-[#829084]">Forest locations and device notes shown here are sample records; no field sensors are connected.</p>
      <MapVisualization forests={forests} activeAlert={mapAlert} activeAlerts={activeAlerts} selectedForestId={selectedForestId} onSelectForest={onSelectForest} className="rounded-sm" />
      {/* Top Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-[#f8faf5] border border-[#d4ded2] rounded-xl p-4">
          <div className="text-[11px]  tracking-wider uppercase text-[#6d7c70]">Forest areas listed</div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-[#203a30]">{stats.totalForests}</span>
            <span className="text-xs  text-[#5c753b]">India</span>
          </div>
          <div className="text-[10px]  text-[#6d7c70] mt-1">Across 18+ States & UTs</div>
        </div>

        <div className="bg-[#f8faf5] border border-[#d4ded2] rounded-xl p-4">
          <div className="text-[11px]  tracking-wider uppercase text-[#6d7c70]">West Bengal Forests</div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-[#5c753b]">{stats.wbForests}</span>
            <span className="text-xs  text-emerald-800">Core Network</span>
          </div>
          <div className="text-[10px]  text-[#6d7c70] mt-1">Sundarbans, Buxa, Jaldapara, Neora...</div>
        </div>

        <div className="bg-[#f8faf5] border border-[#d4ded2] rounded-xl p-4">
          <div className="text-[11px]  tracking-wider uppercase text-[#6d7c70]">Sensor records</div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-[#203a30]">{stats.totalSensors}</span>
            <span className="text-xs  text-[#6d7c70]">listed</span>
          </div>
          <div className="text-[10px]  text-[#6d7c70] mt-1">Connection status is not monitored here</div>
        </div>

        <div className="bg-[#f8faf5] border border-[#d4ded2] rounded-xl p-4 flex flex-col justify-between">
          <div>
            <div className="text-[11px]  tracking-wider uppercase text-[#6d7c70]">Quick Registration</div>
            <div className="text-xs text-[#526c60] mt-1">Add a location and optional sensor records</div>
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="mt-2 w-full py-2 px-3 bg-[#dfe9b9] hover:bg-[#d3e0b1] text-[#203a30] rounded-lg  text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Forest</span>
          </button>
        </div>
      </div>

      {/* Search & State Filter Bar */}
      <div className="bg-[#f8faf5] border border-[#d4ded2] rounded-xl p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6d7c70]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by forest, district, or state"
            className="w-full pl-10 pr-4 py-2 bg-[#eef2e9] border border-[#d4ded2] rounded-lg text-sm text-[#203a30] placeholder-slate-400 focus:outline-none focus:border-[#849b64]"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
          <SlidersHorizontal className="w-4 h-4 text-[#6d7c70] shrink-0" />
          <div className="flex items-center gap-1.5 text-xs ">
            {['ALL', 'West Bengal', 'Assam', 'Uttarakhand', 'Madhya Pradesh'].map((stateName) => (
              <button
                key={stateName}
                onClick={() => setSelectedState(stateName)}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition cursor-pointer ${
                  selectedState === stateName
                    ? 'bg-[#dfe9b9] text-[#203a30] font-bold'
                    : 'bg-[#eef2e9] text-[#526c60] hover:text-[#203a30] border border-[#d4ded2]'
                }`}
              >
                {stateName}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Forest Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredForests.map((forest) => {
          const isWestBengal = forest.state === 'West Bengal';
          return (
            <div
              key={forest.id}
              className={`bg-[#f8faf5] border rounded-xl p-4 flex flex-col justify-between transition hover:border-[#849b64]/60 ${
                isWestBengal ? 'border-[#849b64]/40 ' : 'border-[#d4ded2]'
              }`}
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-[#203a30] leading-snug">{forest.name}</h3>
                      {isWestBengal && (
                        <span className="px-1.5 py-0.5 rounded text-[10px]  font-bold bg-[#dfe9b9]/20 text-[#5c753b] border border-[#849b64]/40">
                          WB
                        </span>
                      )}
                    </div>
                    <div className="text-xs  text-[#6d7c70] flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-[#6d7c70]" />
                      <span>{forest.district}, {forest.state}</span>
                    </div>
                  </div>

                </div>

                {/* Coordinates & Sensor Summary */}
                <div className="mt-3 flex items-center justify-between text-[11px]  bg-[#eef2e9] px-3 py-1.5 rounded-lg border border-[#d4ded2]/60">
                  <span className="text-[#6d7c70]">
                    {forest.latitude.toFixed(4)}°N, {forest.longitude.toFixed(4)}°E
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 " />
                    <span className="text-[#526c60] font-semibold">{forest.sensors.length} sensor records</span>
                  </div>
                </div>

                {/* Sensors List */}
                <div className="mt-3 space-y-1.5">
                  <div className="text-[10px]  uppercase tracking-wider text-[#6d7c70]">
                    Sensor records
                  </div>
                  <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
                    {forest.sensors.map((sensor) => (
                      <div
                        key={sensor.id}
                        className="bg-[#eef2e9]/70 border border-[#d4ded2]/50 rounded px-2 py-1 text-xs flex items-center justify-between gap-2"
                      >
                        <div className="flex items-center gap-1.5 min-w-0">
                          {getSensorIcon(sensor.type)}
                          <span className="text-[#3e5b4f] text-[11px] truncate">{sensor.name}</span>
                        </div>
                        <div className="shrink-0 text-[10px] text-[#6d7c70]">
                          {sensor.type.replace(' Sensor', '')}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom Card Actions */}
              <div className="mt-4 pt-3 border-t border-[#d4ded2]/60 flex items-center justify-between">
                <span className="text-[10px]  text-[#6d7c70]">Select this area for an analysis</span>
                <button
                  onClick={() => onSelectForDemo(forest)}
                  className="px-2.5 py-1 bg-[#e3ebe1] hover:bg-[#dfe9b9] hover:text-[#203a30] text-[#5c753b] border border-[#849b64]/40 rounded text-xs  font-bold flex items-center gap-1 transition cursor-pointer"
                >
                  <Play className="w-3 h-3" />
                  <span>Analyze media here</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredForests.length === 0 && (
        <div className="bg-[#f8faf5] border border-[#d4ded2] rounded-xl p-10 text-center text-[#6d7c70]  text-sm">
          No forests found matching "{searchQuery}".
        </div>
      )}

      {/* Add Forest Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#f8faf5] border border-[#849b64]/60 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6  space-y-5">
            <div className="flex items-center justify-between border-b border-[#d4ded2] pb-3">
              <div>
                <h2 className="text-lg font-bold text-[#203a30] flex items-center gap-2">
                  <Trees className="w-5 h-5 text-[#5c753b]" />
                  <span>Add a forest area</span>
                </h2>
                <p className="text-xs  text-[#526c60] mt-0.5">
                  Add the location coordinates used for distance estimates.
                </p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-[#6d7c70] hover:text-[#203a30] p-1 rounded-lg hover:bg-[#eef2e9] transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateForestSubmit} className="space-y-4">
              {/* Forest Basic Information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs  text-[#526c60] mb-1">Forest Name *</label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Mahananda Wildlife Sanctuary"
                    className="w-full px-3 py-2 bg-[#eef2e9] border border-[#d4ded2] rounded-lg text-sm text-[#203a30] placeholder-slate-500 focus:outline-none focus:border-[#849b64]"
                  />
                </div>

                <div>
                  <label className="block text-xs  text-[#526c60] mb-1">State *</label>
                  <select
                    value={formState}
                    onChange={(e) => setFormState(e.target.value)}
                    className="w-full px-3 py-2 bg-[#eef2e9] border border-[#d4ded2] rounded-lg text-sm text-[#203a30] focus:outline-none focus:border-[#849b64]"
                  >
                    <option value="West Bengal">West Bengal</option>
                    <option value="Assam">Assam</option>
                    <option value="Uttarakhand">Uttarakhand</option>
                    <option value="Madhya Pradesh">Madhya Pradesh</option>
                    <option value="Kerala">Kerala</option>
                    <option value="Karnataka">Karnataka</option>
                    <option value="Odisha">Odisha</option>
                    <option value="Tamil Nadu">Tamil Nadu</option>
                    <option value="Maharashtra">Maharashtra</option>
                    <option value="Rajasthan">Rajasthan</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs  text-[#526c60] mb-1">District / Area *</label>
                  <input
                    type="text"
                    required
                    value={formDistrict}
                    onChange={(e) => setFormDistrict(e.target.value)}
                    placeholder="e.g. Darjeeling / Siliguri"
                    className="w-full px-3 py-2 bg-[#eef2e9] border border-[#d4ded2] rounded-lg text-sm text-[#203a30] placeholder-slate-500 focus:outline-none focus:border-[#849b64]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs  text-[#526c60] mb-1">Latitude</label>
                    <input
                      type="number"
                      step="any"
                      required
                      value={formLat}
                      onChange={(e) => setFormLat(e.target.value)}
                      placeholder="26.8"
                      className="w-full px-2 py-2 bg-[#eef2e9] border border-[#d4ded2] rounded-lg text-sm text-[#203a30] focus:outline-none focus:border-[#849b64]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs  text-[#526c60] mb-1">Longitude</label>
                    <input
                      type="number"
                      step="any"
                      required
                      value={formLon}
                      onChange={(e) => setFormLon(e.target.value)}
                      placeholder="88.4"
                      className="w-full px-2 py-2 bg-[#eef2e9] border border-[#d4ded2] rounded-lg text-sm text-[#203a30] focus:outline-none focus:border-[#849b64]"
                    />
                  </div>
                </div>
              </div>
              

              {/* Action Buttons */}
              <div className="border-t border-[#d4ded2] pt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-[#eef2e9] hover:bg-[#e3ebe1] text-[#526c60] rounded-lg text-xs  font-bold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#dfe9b9] hover:bg-[#d3e0b1] text-[#203a30] rounded-lg text-xs  font-bold flex items-center gap-1.5 transition cursor-pointer  shadow-[#C1F865]/10"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Save forest area</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};




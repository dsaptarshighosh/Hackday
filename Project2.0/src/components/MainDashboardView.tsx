import React from 'react';
import { ArrowUpRight, MapPin } from 'lucide-react';
import { Forest, Citizen, ActiveAlert } from '../types/livingLens';
import { calculateDistance } from '../utils/geoUtils';
import { MapVisualization } from './MapVisualization';

interface MainDashboardViewProps {
  forests: Forest[];
  citizens: Citizen[];
  selectedForest: Forest;
  onSelectForest: (forest: Forest) => void;
  disasterProbability: number;
  alertRadiusKm: number;
  onRadiusChange: (radius: number) => void;
  onNavigateTab: (tab: string) => void;
  onSelectCitizen: (citizenId: string) => void;
  lastObservation?: { forestId: string; animalSpecies: string; observedBehavior: string; observationTime: string } | null;
  activeAlerts: ActiveAlert[];
}

export const MainDashboardView: React.FC<MainDashboardViewProps> = ({
  forests,
  citizens,
  selectedForest,
  onSelectForest,
  disasterProbability,
  alertRadiusKm,
  onRadiusChange,
  onNavigateTab,
  onSelectCitizen,
  lastObservation,
  activeAlerts,
}) => {
  const hasEstimate = disasterProbability > 0;
  const isAlert = hasEstimate && disasterProbability > 50;
  const observationForest = forests.find((forest) => forest.id === lastObservation?.forestId) || selectedForest;
  const insideCount = citizens.filter((citizen) =>
    calculateDistance(selectedForest.latitude, selectedForest.longitude, citizen.latitude, citizen.longitude) <= alertRadiusKm
  ).length;

  const alert: ActiveAlert = {
    zone_id: observationForest.id,
    zone_name: observationForest.name,
    latitude: observationForest.latitude,
    longitude: observationForest.longitude,
    timestamp: lastObservation?.observationTime || '',
    riskScore: Math.round(disasterProbability),
    disasterProbability,
    animalSpecies: lastObservation?.animalSpecies,
    observedBehavior: lastObservation?.observedBehavior,
    observationTime: lastObservation?.observationTime,
    alertRadiusKm,
    hazardCategories: [],
    detectedSignals: hasEstimate ? [`Risk estimate: ${disasterProbability.toFixed(1)}%`] : [],
    status: isAlert ? 'ACTIVE' : 'STANDBY',
  };

  const metricItems = [
    { label: 'Forest areas', value: forests.length, detail: 'Saved locations' },
    { label: 'Recipients', value: citizens.length, detail: 'Registered contacts' },
    { label: 'Sensors listed', value: selectedForest.sensors.length, detail: 'For selected area' },
  ];

  return (
    <div className="space-y-8 animate-screen-in">
      <section className="flex flex-col justify-between gap-5 border-b border-[#d5ded2] pb-6 sm:flex-row sm:items-end">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#72816f]">Field monitoring</p>
          <h1 className="text-3xl font-semibold tracking-[-0.045em] text-[#203a30] sm:text-[40px]">Wildlife activity</h1>
          <p className="mt-2 text-sm text-[#68796c]">Review forest locations, analyze a recording, and see the resulting estimate.</p>
        </div>
        <button
          onClick={() => onNavigateTab('media_monitoring')}
          className="inline-flex min-h-11 items-center justify-center gap-2 bg-[#315640] px-5 text-sm font-medium text-white transition-colors hover:bg-[#264734] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#315640]"
        >
          Analyze a recording <ArrowUpRight className="h-4 w-4" />
        </button>
      </section>

      <section aria-label="Saved monitoring setup" className="grid grid-cols-1 divide-y divide-[#d7dfd4] border-y border-[#d7dfd4] sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        {metricItems.map((item) => (
          <div key={item.label} className="flex items-baseline justify-between gap-4 py-4 sm:px-5 first:sm:pl-0 last:sm:pr-0">
            <div>
              <p className="text-sm font-medium text-[#345446]">{item.label}</p>
              <p className="mt-1 text-xs text-[#7a887d]">{item.detail}</p>
            </div>
            <span className="text-2xl font-semibold tabular-nums text-[#243e32]">{item.value}</span>
          </div>
        ))}
      </section>

      <section className="grid grid-cols-1 items-start gap-8 xl:grid-cols-[minmax(0,1.45fr)_minmax(300px,0.55fr)]">
        <div className="min-w-0">
          <div className="mb-3 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <h2 className="text-lg font-semibold tracking-tight text-[#203a30]">Forest locations</h2>
              <p className="mt-1 text-sm text-[#708074]">Map points and recipient distance are based on the saved sample locations.</p>
            </div>
            <label className="flex items-center gap-2 text-xs text-[#647568]">
              Alert radius
              <select
                value={alertRadiusKm}
                onChange={(event) => onRadiusChange(Number(event.target.value))}
                className="h-9 border border-[#cbd6ca] bg-[#f8faf5] px-3 text-sm text-[#294736] focus-visible:outline-2 focus-visible:outline-[#6e874b]"
              >
                {[10, 20, 50, 90].map((radius) => <option key={radius} value={radius}>{radius} km</option>)}
              </select>
            </label>
          </div>

          <MapVisualization
            forests={forests}
            citizens={citizens}
            activeAlert={hasEstimate ? alert : null}
            activeAlerts={activeAlerts}
            selectedForestId={selectedForest.id}
            onSelectForest={onSelectForest}
            onSelectCitizen={(citizen) => { onSelectCitizen(citizen.id); onNavigateTab('citizens'); }}
          />
        </div>

        <aside className="space-y-7 xl:pt-10">
          <div>
            <label htmlFor="overview-forest" className="mb-2 block text-sm font-medium text-[#345446]">Selected forest area</label>
            <select
              id="overview-forest"
              value={selectedForest.id}
              onChange={(event) => {
                const forest = forests.find((item) => item.id === event.target.value);
                if (forest) onSelectForest(forest);
              }}
              className="min-h-11 w-full border border-[#cbd6ca] bg-[#f8faf5] px-3 text-sm text-[#294736] focus-visible:outline-2 focus-visible:outline-[#6e874b]"
            >
              {forests.map((forest) => <option key={forest.id} value={forest.id}>{forest.name} · {forest.state}</option>)}
            </select>
            <p className="mt-2 flex items-center gap-1.5 text-xs text-[#718075]"><MapPin className="h-3.5 w-3.5" />{selectedForest.district}, {selectedForest.state}</p>
          </div>

          <div className="border-t border-[#d7dfd4] pt-5">
            <p className="text-sm font-medium text-[#345446]">Latest risk estimate</p>
            {hasEstimate ? (
              <>
                <p className={`mt-3 text-5xl font-semibold tracking-[-0.06em] tabular-nums ${isAlert ? 'text-[#9c493b]' : 'text-[#486844]'}`}>
                  {disasterProbability.toFixed(1)}<span className="ml-1 text-2xl">%</span>
                </p>
                <p className="mt-2 text-sm text-[#718075]">{isAlert ? 'Above the prototype alert threshold' : 'Below the prototype alert threshold'}</p>
              </>
            ) : (
              <p className="mt-3 text-lg text-[#718075]">No recording analyzed yet</p>
            )}
            <div className="mt-4 h-[3px] bg-[#dce4d8]" aria-hidden="true">
              {hasEstimate && <div className={`h-full transition-[width] duration-500 ${isAlert ? 'bg-[#a85849]' : 'bg-[#718b50]'}`} style={{ width: `${Math.min(100, Math.max(0, disasterProbability))}%` }} />}
            </div>
            <p className="mt-3 text-xs leading-5 text-[#78867a]">An experimental estimate based on an uploaded observation. It is not an official hazard forecast.</p>
          </div>

          <div className="border-t border-[#d7dfd4] pt-5">
            <p className="text-sm font-medium text-[#345446]">Recipients in alert radius</p>
            <p className="mt-2 text-3xl font-semibold tabular-nums text-[#243e32]">{hasEstimate && isAlert ? insideCount : 0}</p>
            <p className="mt-1 text-xs text-[#718075]">of {citizens.length} saved recipients · {alertRadiusKm} km</p>
            <button onClick={() => onNavigateTab('citizens')} className="mt-4 text-sm font-medium text-[#436244] underline decoration-[#b4c2aa] underline-offset-4 hover:text-[#203a30]">
              Manage recipients
            </button>
          </div>
        </aside>
      </section>
    </div>
  );
};


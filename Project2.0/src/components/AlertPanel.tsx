import React from 'react';
import { ActiveAlert } from '../types/livingLens';
import {
  ShieldAlert,
  Check,
  Compass,
  MapPin,
  Flame,
  Wind,
  CloudRain,
  Waves,
  Activity,
  Info,
  Mail,
  Users,
} from 'lucide-react';

interface AlertPanelProps {
  activeAlert: ActiveAlert | null;
  onRadiusChange: (newRadius: number) => void;
  radiusOptions: number[];
  disasterProbability?: number;
  insideCount?: number;
  outsideCount?: number;
  targetedCount?: number;
  threshold?: number;
}

export const AlertPanel: React.FC<AlertPanelProps> = ({
  activeAlert,
  onRadiusChange,
  radiusOptions,
  disasterProbability = 87.4,
  insideCount = 2,
  outsideCount = 1,
  targetedCount = 2,
  threshold = 80,
}) => {
  const isTriggered = activeAlert && activeAlert.status === 'ACTIVE' && disasterProbability >= threshold;

  if (!isTriggered) {
    return (
      <div className="bg-[#eef2e9]/95 border border-[#d4ded2] rounded-xl p-6  text-center">
        <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-300/30 flex items-center justify-center text-emerald-800 mx-auto mb-3">
          <Activity className="w-6 h-6" />
        </div>
        <h3 className="text-sm font-bold uppercase tracking-wider text-[#3e5b4f]">
          MONITORING MODE ACTIVE — NO ALERT TRIGGERED
        </h3>
        <p className="text-xs text-[#6d7c70] mt-1 max-w-lg mx-auto">
          AI Model disaster probability is currently <strong className="text-[#3e5b4f]">{disasterProbability.toFixed(1)}%</strong>, which is below the <strong className="text-emerald-800">{threshold}% alert threshold</strong>. Geographic alert perimeter is inactive; citizens are not alerted.
        </p>
      </div>
    );
  }

  const hazardList = [
    { name: 'Earthquake', icon: Activity, desc: 'P-wave sub-audible infrasound & ground vibration' },
    { name: 'Storm', icon: Wind, desc: 'Barometric plummet & canopy disturbance' },
    { name: 'Cyclone', icon: Waves, desc: 'Long-period swell & pressure anomalies' },
    { name: 'Flood', icon: CloudRain, desc: 'Upstream surge acoustics & evacuation movement' },
    { name: 'Wildfire', icon: Flame, desc: 'Thermal front avoidance & alarm vocalizations' },
  ];

  return (
    <div className="bg-[#140606]/95 border-2 border-rose-500 rounded-xl p-6  shadow-rose-950/70 relative overflow-hidden">
      {/* Background warning pattern */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 mb-5 border-b border-rose-500/30 gap-3">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-lg bg-rose-500/20 border border-rose-500 flex items-center justify-center text-rose-800 ">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px]  tracking-widest uppercase text-rose-800 font-bold bg-rose-100/80 px-2 py-0.5 rounded border border-rose-300/60">
                THRESHOLD TRIGGERED (≥{threshold}%)
              </span>
              <span className="text-[10px]  text-[#6d7c70]">
                Automatic Sensor → AI Model Workflow
              </span>
            </div>
            <h2 className="text-lg font-black uppercase tracking-tight text-[#203a30] mt-0.5 flex items-center gap-2">
              ALERT TRIGGERED — HIGH DISASTER PROBABILITY
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-rose-100 border border-rose-500/80 rounded-lg px-4 py-2 text-right  shadow-rose-950">
            <span className="text-[10px] uppercase  text-rose-800 block font-semibold">
              Disaster Probability
            </span>
            <span className="text-3xl  font-black text-rose-800 tabular-nums">
              {disasterProbability.toFixed(1)}%
            </span>
          </div>
        </div>
      </div>

      {/* SECTION 4 EXACT SUMMARY CARD */}
      <div className="bg-[#eef2e9]/95 border border-[#d4ded2] rounded-lg p-4 mb-5">
        <div className="flex items-center justify-between mb-3 border-b border-[#d4ded2]/60 pb-2">
          <span className="text-xs  font-bold text-rose-800 uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-500 " />
            Alert Decision Summary
          </span>
          <span className="text-[11px]  text-[#6d7c70]">
            Simulated Email Delivery (Browser Prototype)
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 ">
          <div className="bg-[#f8faf5] rounded p-2.5 border border-[#d4ded2]">
            <span className="text-[10px] uppercase text-[#6d7c70] block">Status</span>
            <span className="text-base font-bold text-rose-800 block mt-0.5">Alert Triggered</span>
            <span className="text-[10px] text-[#6d7c70]">Model output ≥ {threshold}%</span>
          </div>

          <div className="bg-[#f8faf5] rounded p-2.5 border border-[#d4ded2]">
            <span className="text-[10px] uppercase text-[#6d7c70] block">Probability</span>
            <span className="text-base font-bold text-rose-800 tabular-nums block mt-0.5">
              {disasterProbability.toFixed(1)}%
            </span>
            <span className="text-[10px] text-[#6d7c70]">From AI model</span>
          </div>

          <div className="bg-[#f8faf5] rounded p-2.5 border border-[#d4ded2]">
            <span className="text-[10px] uppercase text-[#6d7c70] block">Alert Radius</span>
            <span className="text-base font-bold text-[#5c753b] tabular-nums block mt-0.5">
              {activeAlert.alertRadiusKm} km
            </span>
            <span className="text-[10px] text-[#6d7c70]">Configurable (Default 90km)</span>
          </div>

          <div className="bg-[#f8faf5] rounded p-2.5 border border-[#d4ded2]">
            <span className="text-[10px] uppercase text-[#6d7c70] block">Inside Zone</span>
            <span className="text-base font-bold text-[#5c753b] tabular-nums block mt-0.5">
              {insideCount} citizens
            </span>
            <span className="text-[10px] text-[#6d7c70]">Within {activeAlert.alertRadiusKm} km</span>
          </div>

          <div className="bg-[#f8faf5] rounded p-2.5 border border-[#d4ded2]">
            <span className="text-[10px] uppercase text-[#6d7c70] block">Outside Zone</span>
            <span className="text-base font-bold text-[#6d7c70] tabular-nums block mt-0.5">
              {outsideCount} excluded
            </span>
            <span className="text-[10px] text-emerald-800">Emails targeted: {targetedCount}</span>
          </div>
        </div>
      </div>

      {/* Zone & Alert Radius Configuration Bar */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 rounded-lg bg-[#eef2e9]/80 border border-[#d4ded2] mb-5">
        <div>
          <span className="text-[10px] uppercase  text-[#6d7c70] block">Alert Location</span>
          <span className="text-sm font-bold  text-[#5c753b]">{activeAlert.zone_id}</span>
          <span className="text-[11px] text-[#526c60] block truncate">{activeAlert.zone_name}</span>
        </div>

        <div>
          <span className="text-[10px] uppercase  text-[#6d7c70] block">Coordinates</span>
          <span className="text-xs  font-semibold text-[#3e5b4f]">
            {activeAlert.latitude.toFixed(4)}°N, {activeAlert.longitude.toFixed(4)}°E
          </span>
          <span className="text-[11px] text-[#6d7c70] block">Sal Forest Core Reserve</span>
        </div>

        {/* Configurable Alert Radius */}
        <div className="md:col-span-2">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] uppercase  text-[#526c60] flex items-center gap-1">
              <Compass className="w-3 h-3 text-[#5c753b]" />
              Configurable Alert Radius (Default 90 km):
            </span>
            <span className="text-xs  font-bold text-[#5c753b]">
              {activeAlert.alertRadiusKm} km
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {radiusOptions.map((radius) => (
              <button
                key={radius}
                onClick={() => onRadiusChange(radius)}
                className={`flex-1 py-1 px-1.5 text-xs  font-bold rounded transition-colors cursor-pointer ${
                  activeAlert.alertRadiusKm === radius
                    ? 'bg-[#dfe9b9] text-[#203a30] '
                    : 'bg-[#f8faf5] hover:bg-[#d4ded2] text-[#526c60] border border-[#d4ded2]'
                }`}
              >
                {radius}km
              </button>
            ))}
          </div>
          <span className="text-[10px] text-[#6d7c70] mt-1 block">
            Only citizens with distance ≤ {activeAlert.alertRadiusKm} km are targeted
          </span>
        </div>
      </div>

      {/* Possible Hazards & Official Verification Notice */}
      <div className="bg-[#f8faf5]/70 border border-[#d4ded2] rounded-lg p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#3e5b4f]">
            POTENTIAL HAZARD CORRIDORS (INVESTIGATION REQUIRED)
          </h3>
          <span className="px-2.5 py-0.5 rounded text-[10px]  font-bold tracking-wider bg-amber-100 border border-amber-600 text-amber-800">
            STATUS: REQUIRES OFFICIAL VERIFICATION
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {hazardList.map((hazard) => {
            const HIcon = hazard.icon;
            return (
              <div
                key={hazard.name}
                className="bg-[#eef2e9] border border-[#d4ded2]/60 rounded p-2 flex flex-col justify-between"
              >
                <div className="flex items-center gap-1.5 text-amber-800 mb-0.5">
                  <HIcon className="w-3.5 h-3.5 shrink-0" />
                  <span className="text-xs font-bold text-[#3e5b4f]">{hazard.name}</span>
                </div>
                <span className="text-[9px] text-[#6d7c70] leading-tight">
                  {hazard.desc}
                </span>
              </div>
            );
          })}
        </div>

        <p className="text-[11px] text-rose-800/80 mt-3 italic flex items-center gap-1.5 bg-rose-100/40 p-2 rounded border border-rose-900/40">
          <Info className="w-3.5 h-3.5 text-rose-800 shrink-0" />
          Living Lens is an experimental, research-inspired biological early-warning prototype and is NOT an official disaster warning system.
        </p>
      </div>
    </div>
  );
};



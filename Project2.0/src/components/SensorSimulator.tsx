import React from 'react';
import { Play, Pause, Zap, AlertTriangle, ShieldCheck, RefreshCw } from 'lucide-react';

interface SensorSimulatorProps {
  onTriggerNormal: () => void;
  onTriggerAnomaly: () => void;
  onTriggerCritical: () => void;
  autoSimulating: boolean;
  onToggleAutoSimulation: () => void;
  selectedZone: string;
  onSelectZone: (zoneId: string) => void;
  availableZones: { id: string; name: string }[];
  lastPacketTime: string;
}

export const SensorSimulator: React.FC<SensorSimulatorProps> = ({
  onTriggerNormal,
  onTriggerAnomaly,
  onTriggerCritical,
  autoSimulating,
  onToggleAutoSimulation,
  selectedZone,
  onSelectZone,
  availableZones,
  lastPacketTime,
}) => {
  return (
    <div className="bg-[#eef2e9]/95 border border-[#d4ded2] rounded-xl p-5 ">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#d4ded2]/60 pb-3 mb-4">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-[#203a30] flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#dfe9b9] inline-block " />
            SENSOR SIMULATOR
          </h2>
          <p className="text-xs text-[#6d7c70] mt-0.5">
            Inject synthetic multi-modal wildlife and acoustic telemetry into the fusion engine
          </p>
        </div>

        {/* Target Zone Selector */}
        <div className="flex items-center gap-2">
          <label htmlFor="zone-select" className="text-xs  text-[#6d7c70] whitespace-nowrap">
            Target Node:
          </label>
          <select
            id="zone-select"
            value={selectedZone}
            onChange={(e) => onSelectZone(e.target.value)}
            className="bg-[#f8faf5] border border-[#d4ded2] text-[#3e5b4f] text-xs rounded-md px-2.5 py-1.5  focus:outline-none focus:border-[#849b64]"
          >
            {availableZones.map((z) => (
              <option key={z.id} value={z.id}>
                {z.id} ({z.name})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Primary Simulator Control Buttons */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* NORMAL EVENT */}
        <button
          onClick={onTriggerNormal}
          className="group relative flex flex-col items-center justify-center p-3.5 rounded-lg border border-emerald-600/40 bg-emerald-100/20 hover:bg-emerald-100/30 transition-all cursor-pointer active:scale-[0.98]"
        >
          <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-800 mb-2 group-hover:scale-110 transition-transform">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
            NORMAL EVENT
          </span>
          <span className="text-[11px] text-[#6d7c70] text-center mt-1">
            Baseline behavior · Low infrasound · 10–20% risk
          </span>
        </button>

        {/* ANOMALY EVENT */}
        <button
          onClick={onTriggerAnomaly}
          className="group relative flex flex-col items-center justify-center p-3.5 rounded-lg border border-amber-600/40 bg-amber-100/20 hover:bg-amber-100/30 transition-all cursor-pointer active:scale-[0.98]"
        >
          <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-800 mb-2 group-hover:scale-110 transition-transform">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-amber-800">
            ANOMALY EVENT
          </span>
          <span className="text-[11px] text-[#6d7c70] text-center mt-1">
            Heightened reaction · 74 dB spike · 55–65% risk
          </span>
        </button>

        {/* CRITICAL EVENT */}
        <button
          onClick={onTriggerCritical}
          className="group relative flex flex-col items-center justify-center p-3.5 rounded-lg border border-rose-300/60 bg-rose-100/30 hover:bg-rose-100/40 transition-all cursor-pointer active:scale-[0.98]  shadow-rose-950/40"
        >
          <div className="w-8 h-8 rounded-full bg-rose-500/20 flex items-center justify-center text-rose-800 mb-2 group-hover:scale-110 transition-transform ">
            <Zap className="w-4 h-4" />
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-rose-800">
            CRITICAL EVENT
          </span>
          <span className="text-[11px] text-[#526c60] text-center mt-1">
            86.7% reaction · 14.2 Hz · 95 dB · Active Alert
          </span>
        </button>

        {/* AUTO SIMULATION */}
        <button
          onClick={onToggleAutoSimulation}
          className={`group relative flex flex-col items-center justify-center p-3.5 rounded-lg border transition-all cursor-pointer active:scale-[0.98] ${
            autoSimulating
              ? 'border-[#849b64] bg-[#dfe9b9]/10  shadow-[#C1F865]/10'
              : 'border-[#d4ded2] bg-[#f8faf5]/50 hover:bg-[#f8faf5]'
          }`}
        >
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 group-hover:scale-110 transition-transform ${
              autoSimulating
                ? 'bg-[#dfe9b9]/20 text-[#5c753b]'
                : 'bg-slate-700/30 text-[#6d7c70]'
            }`}
          >
            {autoSimulating ? (
              <Pause className="w-4 h-4" />
            ) : (
              <Play className="w-4 h-4 ml-0.5" />
            )}
          </div>
          <span
            className={`text-xs font-bold uppercase tracking-wider ${
              autoSimulating ? 'text-[#5c753b]' : 'text-[#526c60]'
            }`}
          >
            AUTO SIMULATION
          </span>
          <span className="text-[11px] text-[#6d7c70] text-center mt-1 ">
            {autoSimulating ? 'Active (every 4s)' : 'Continuous streaming'}
          </span>
        </button>
      </div>

      {/* Simulator Meta Info */}
      <div className="mt-4 pt-3 border-t border-[#d4ded2]/40 flex flex-wrap items-center justify-between gap-3 text-xs text-[#6d7c70]">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <RefreshCw className={`w-3.5 h-3.5 text-[#6d7c70] ${autoSimulating ? 'animate-spin' : ''}`} />
            <span>Simulation:</span>
            <span className={` font-semibold ${autoSimulating ? 'text-[#5c753b]' : 'text-[#526c60]'}`}>
              {autoSimulating ? 'RUNNING' : 'STANDBY'}
            </span>
          </span>
          <span>·</span>
          <span>Last packet: <span className=" text-[#526c60]">{lastPacketTime}</span></span>
        </div>

        <div className="text-[11px]  text-[#6d7c70]">
          Tip: Trigger <span className="text-rose-800 font-bold">CRITICAL EVENT</span> to test targeted citizen filtering
        </div>
      </div>
    </div>
  );
};



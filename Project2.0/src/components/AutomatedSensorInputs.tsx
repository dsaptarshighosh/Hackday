import React from 'react';
import { AIModelInputs } from '../types/livingLens';
import { Radio, Eye, Clock, Activity, Zap, ShieldCheck, AlertTriangle, Play, Pause, RefreshCw } from 'lucide-react';

interface AutomatedSensorInputsProps {
  inputs: AIModelInputs;
  zoneId: string;
  zoneName: string;
  coordinates: { lat: number; lon: number };
  onSelectPreset: (preset: 'NORMAL' | 'ELEVATED' | 'CRITICAL') => void;
  activePreset: 'NORMAL' | 'ELEVATED' | 'CRITICAL' | 'CUSTOM';
  autoStreaming: boolean;
  onToggleAutoStream: () => void;
  lastPacketTime: string;
  onChangeInput?: (key: keyof AIModelInputs, value: number) => void;
}

export const AutomatedSensorInputs: React.FC<AutomatedSensorInputsProps> = ({
  inputs,
  zoneId,
  zoneName,
  coordinates,
  onSelectPreset,
  activePreset,
  autoStreaming,
  onToggleAutoStream,
  lastPacketTime,
  onChangeInput,
}) => {
  const reactionRatio = inputs.total_animals_detected > 0
    ? ((inputs.animals_reacted / inputs.total_animals_detected) * 100).toFixed(1)
    : '0.0';

  return (
    <div className="bg-[#eef2e9]/95 border border-[#d4ded2] rounded-xl p-6  flex flex-col justify-between h-full">
      <div>
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-4 border-b border-[#d4ded2]/60 gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#dfe9b9] inline-block " />
              <h2 className="text-sm font-bold uppercase tracking-wider text-[#203a30]">
                AUTOMATED WILDLIFE SENSOR INPUTS
              </h2>
            </div>
            <p className="text-xs text-[#6d7c70] mt-0.5">
              Continuous field telemetry feeding directly into your trained AI model
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs  text-[#526c60] bg-[#f8faf5] px-2.5 py-1 rounded border border-[#d4ded2]">
            <Radio className="w-3.5 h-3.5 text-[#5c753b]" />
            <span>{zoneId}</span>
          </div>
        </div>

        {/* The 4 Model Inputs Required by the AI Model */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
          {/* 1. Animals reacted */}
          <div className="bg-[#f8faf5]/80 border border-[#d4ded2] rounded-lg p-3">
            <span className="text-[10px]  uppercase text-[#6d7c70] block flex items-center gap-1">
              <Eye className="w-3 h-3 text-[#5c753b]" />
              Animals Reacted
            </span>
            <div className="text-2xl  font-extrabold text-[#5c753b] tabular-nums mt-1">
              {inputs.animals_reacted}
            </div>
            <span className="text-[10px] text-[#6d7c70] block mt-0.5">
              Distress movement count
            </span>
          </div>

          {/* 2. Total animals detected */}
          <div className="bg-[#f8faf5]/80 border border-[#d4ded2] rounded-lg p-3">
            <span className="text-[10px]  uppercase text-[#6d7c70] block flex items-center gap-1">
              <Activity className="w-3 h-3 text-teal-800" />
              Total Detected
            </span>
            <div className="text-2xl  font-extrabold text-[#203a30] tabular-nums mt-1">
              {inputs.total_animals_detected}
            </div>
            <span className="text-[10px]  text-[#5c753b] block mt-0.5">
              Ratio: {reactionRatio}%
            </span>
          </div>

          {/* 3. Reaction duration */}
          <div className="bg-[#f8faf5]/80 border border-[#d4ded2] rounded-lg p-3">
            <span className="text-[10px]  uppercase text-[#6d7c70] block flex items-center gap-1">
              <Clock className="w-3 h-3 text-amber-800" />
              Reaction Duration
            </span>
            <div className="text-2xl  font-extrabold text-amber-800 tabular-nums mt-1">
              {inputs.reaction_duration}{' '}
              <span className="text-xs font-normal text-[#6d7c70]">min</span>
            </div>
            <span className="text-[10px] text-[#6d7c70] block mt-0.5">
              Continuous observation
            </span>
          </div>

          {/* 4. Reaction intensity */}
          <div className="bg-[#f8faf5]/80 border border-[#d4ded2] rounded-lg p-3">
            <span className="text-[10px]  uppercase text-[#6d7c70] block flex items-center gap-1">
              <Zap className="w-3 h-3 text-rose-800" />
              Reaction Intensity
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl  font-extrabold text-rose-800 tabular-nums">
                {inputs.reaction_intensity}
              </span>
              <span className="text-xs  text-[#6d7c70]">/ 5</span>
            </div>
            <div className="flex gap-1 mt-1">
              {[1, 2, 3, 4, 5].map((lvl) => (
                <div
                  key={lvl}
                  className={`h-1.5 flex-1 rounded-xs ${
                    lvl <= inputs.reaction_intensity
                      ? inputs.reaction_intensity >= 4
                        ? 'bg-rose-500'
                        : inputs.reaction_intensity >= 3
                        ? 'bg-amber-400'
                        : 'bg-emerald-400'
                      : 'bg-slate-700'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Automated Field Telemetry Presets */}
        <div>
          <span className="text-[11px]  uppercase text-[#6d7c70] block mb-2 font-semibold">
            Automated Field Sensor Presets (Sends 4 inputs to model):
          </span>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {/* NORMAL */}
            <button
              onClick={() => onSelectPreset('NORMAL')}
              className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                activePreset === 'NORMAL'
                  ? 'bg-emerald-100/70 border-emerald-300 text-emerald-800 ring-1 ring-emerald-500/50'
                  : 'bg-[#f8faf5] hover:bg-[#e3ebe1] border-[#d4ded2] text-[#526c60]'
              }`}
            >
              <div className="flex items-center gap-1.5 text-xs font-bold mb-0.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-800" />
                <span>NORMAL</span>
              </div>
              <span className="text-[10px] text-[#6d7c70] block">
                2/20 reacted · Prob: 42%
              </span>
            </button>

            {/* ELEVATED */}
            <button
              onClick={() => onSelectPreset('ELEVATED')}
              className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                activePreset === 'ELEVATED'
                  ? 'bg-amber-100/70 border-amber-300 text-amber-800 ring-1 ring-amber-500/50'
                  : 'bg-[#f8faf5] hover:bg-[#e3ebe1] border-[#d4ded2] text-[#526c60]'
              }`}
            >
              <div className="flex items-center gap-1.5 text-xs font-bold mb-0.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-800" />
                <span>ELEVATED</span>
              </div>
              <span className="text-[10px] text-[#6d7c70] block">
                11/18 reacted · Prob: 67%
              </span>
            </button>

            {/* CRITICAL */}
            <button
              onClick={() => onSelectPreset('CRITICAL')}
              className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                activePreset === 'CRITICAL'
                  ? 'bg-rose-100/80 border-rose-500 text-rose-800 ring-1 ring-rose-500/50  shadow-rose-950/60'
                  : 'bg-[#f8faf5] hover:bg-[#e3ebe1] border-[#d4ded2] text-[#526c60]'
              }`}
            >
              <div className="flex items-center gap-1.5 text-xs font-bold mb-0.5">
                <Zap className="w-3.5 h-3.5 text-rose-800 " />
                <span>CRITICAL</span>
              </div>
              <span className="text-[10px] text-rose-800 block font-semibold">
                13/15 reacted · Prob: 87.4%
              </span>
            </button>

            {/* AUTO STREAM */}
            <button
              onClick={onToggleAutoStream}
              className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                autoStreaming
                  ? 'bg-[#dfe9b9]/15 border-[#849b64] text-[#5c753b]  shadow-[#C1F865]/20'
                  : 'bg-[#f8faf5] hover:bg-[#e3ebe1] border-[#d4ded2] text-[#526c60]'
              }`}
            >
              <div className="flex items-center gap-1.5 text-xs font-bold mb-0.5">
                {autoStreaming ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                <span>AUTO STREAM</span>
              </div>
              <span className="text-[10px] text-[#6d7c70] block">
                {autoStreaming ? 'Live every 4s' : 'Cycle telemetry'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Footer Meta */}
      <div className="mt-4 pt-3 border-t border-[#d4ded2]/40 flex flex-wrap items-center justify-between gap-3 text-xs text-[#6d7c70] ">
        <div>
          <span>Location: </span>
          <span className="text-[#3e5b4f]">{zoneName}</span>{' '}
          <span className="text-[#6d7c70]">({coordinates.lat.toFixed(4)}°N, {coordinates.lon.toFixed(4)}°E)</span>
        </div>
        <div>
          <span>Last telemetry packet: </span>
          <span className="text-[#3e5b4f]">{lastPacketTime}</span>
        </div>
      </div>
    </div>
  );
};



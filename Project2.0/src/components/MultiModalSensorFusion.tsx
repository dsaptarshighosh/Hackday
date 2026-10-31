import React from 'react';
import { SensorPacket, FusionResult } from '../types/livingLens';
import { Eye, Radio, GitMerge, Check, AlertCircle, ArrowRight } from 'lucide-react';

interface MultiModalSensorFusionProps {
  packet: SensorPacket;
  fusion: FusionResult;
}

export const MultiModalSensorFusion: React.FC<MultiModalSensorFusionProps> = ({
  packet,
  fusion,
}) => {
  const { camera_data, audio_data } = packet;
  const reactionRatioPercent = (fusion.reactionRatio * 100).toFixed(1);

  // Status badges styling
  const getCameraBadgeStyle = () => {
    if (fusion.cameraStatus === 'ANOMALY DETECTED')
      return 'bg-rose-100/50 border-rose-300/60 text-rose-800';
    if (fusion.cameraStatus === 'ELEVATED')
      return 'bg-amber-100/50 border-amber-600/60 text-amber-800';
    return 'bg-emerald-100/50 border-emerald-600/60 text-emerald-800';
  };

  const getAcousticBadgeStyle = () => {
    if (fusion.acousticStatus === 'ACOUSTIC ANOMALY')
      return 'bg-rose-100/50 border-rose-300/60 text-rose-800';
    if (fusion.acousticStatus === 'ELEVATED')
      return 'bg-amber-100/50 border-amber-600/60 text-amber-800';
    return 'bg-emerald-100/50 border-emerald-600/60 text-emerald-800';
  };

  const getFusionBadgeStyle = () => {
    if (fusion.fusionStatus === 'MULTI-MODAL SIGNAL MATCH')
      return 'bg-rose-100/60 border-rose-500 text-rose-800  shadow-rose-950/50';
    if (fusion.fusionStatus === 'CORRELATED SUSPICION')
      return 'bg-amber-100/60 border-amber-300 text-amber-800';
    return 'bg-emerald-100/60 border-emerald-300 text-emerald-800';
  };

  const isCritical = fusion.riskScore >= 80;

  return (
    <div className="bg-[#eef2e9]/95 border border-[#d4ded2] rounded-xl p-6  relative overflow-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-6 border-b border-[#d4ded2]/60 gap-2">
        <div>
          <div className="flex items-center gap-2">
            <GitMerge className="w-4 h-4 text-[#5c753b]" />
            <h2 className="text-base font-bold uppercase tracking-wider text-[#203a30]">
              MULTI-MODAL SENSOR FUSION
            </h2>
          </div>
          <p className="text-xs text-[#6d7c70] mt-0.5">
            Cross-layer correlation engine fusing optical wildlife ethology with sub-audible infrasonic sensors
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs  text-[#526c60] bg-[#f8faf5] px-3 py-1.5 rounded border border-[#d4ded2]">
          <span className="text-[#6d7c70]">Node:</span>
          <span className="text-[#5c753b] font-semibold">{packet.zone_id}</span>
        </div>
      </div>

      {/* 3-Stage Pipeline Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative">
        {/* Subtle connector indicators on desktop */}
        <div className="hidden lg:flex absolute top-1/2 left-[31.5%] -translate-y-1/2 z-10 text-[#6d7c70]">
          <ArrowRight className="w-5 h-5 opacity-70  text-[#5c753b]" />
        </div>
        <div className="hidden lg:flex absolute top-1/2 left-[64.5%] -translate-y-1/2 z-10 text-[#6d7c70]">
          <ArrowRight className="w-5 h-5 opacity-70  text-[#5c753b]" />
        </div>

        {/* ----------------- STAGE 01: VISION ----------------- */}
        <div className="bg-[#f8faf5]/80 border border-[#d4ded2] rounded-lg p-5 flex flex-col justify-between hover:border-[#7b897b] transition-all">
          <div>
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#d4ded2]/40">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-md bg-emerald-500/10 flex items-center justify-center text-[#5c753b]">
                  <Eye className="w-4 h-4" />
                </div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#3e5b4f]">
                  01 — VISION
                </h3>
              </div>
              <span className="text-[11px]  text-[#6d7c70]">Optical Cam</span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[#6d7c70]">Species observed:</span>
                <span className="font-semibold text-[#3e5b4f]">{camera_data.species}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#6d7c70]">Animals observed:</span>
                <span className=" text-[#203a30] font-bold tabular-nums">
                  {camera_data.total_observed}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#6d7c70]">Reacting:</span>
                <span className=" text-[#203a30] font-bold tabular-nums">
                  {camera_data.count_reacting}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#6d7c70]">Reaction ratio:</span>
                <span className=" font-bold text-[#5c753b] tabular-nums">
                  {reactionRatioPercent}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#6d7c70]">Intensity:</span>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((lvl) => (
                    <span
                      key={lvl}
                      className={`w-3 h-3 rounded-xs  text-[9px] flex items-center justify-center ${
                        lvl <= camera_data.intensity_level
                          ? camera_data.intensity_level >= 4
                            ? 'bg-rose-500 text-[#203a30]'
                            : 'bg-[#dfe9b9] text-[#203a30] font-bold'
                          : 'bg-slate-700/50 text-[#839084]'
                      }`}
                    >
                      {lvl}
                    </span>
                  ))}
                  <span className=" text-[#526c60] ml-1 font-semibold">
                    {camera_data.intensity_level} / 5
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#d4ded2]/60 flex items-center justify-between">
            <span className="text-[11px] text-[#6d7c70]">Status:</span>
            <span
              className={`px-2.5 py-1 rounded text-[11px]  font-bold tracking-wide border ${getCameraBadgeStyle()}`}
            >
              {fusion.cameraStatus}
            </span>
          </div>
        </div>

        {/* ----------------- STAGE 02: ACOUSTICS ----------------- */}
        <div className="bg-[#f8faf5]/80 border border-[#d4ded2] rounded-lg p-5 flex flex-col justify-between hover:border-[#7b897b] transition-all">
          <div>
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#d4ded2]/40">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-md bg-cyan-500/10 flex items-center justify-center text-teal-800">
                  <Radio className="w-4 h-4" />
                </div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#3e5b4f]">
                  02 — ACOUSTICS
                </h3>
              </div>
              <span className="text-[11px]  text-[#6d7c70]">Infrasonic Array</span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[#6d7c70]">Infrasound:</span>
                <span className=" text-[#203a30] font-bold tabular-nums">
                  {audio_data.infrasound_detected_hz.toFixed(1)}{' '}
                  <span className="text-[#6d7c70] font-normal">Hz</span>
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#6d7c70]">Decibel spike:</span>
                <span className=" text-[#203a30] font-bold tabular-nums">
                  {audio_data.decibel_spike_db.toFixed(1)}{' '}
                  <span className="text-[#6d7c70] font-normal">dB</span>
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#6d7c70]">Bird canopy alarm:</span>
                <span
                  className={` font-bold text-xs ${
                    audio_data.bird_canopy_shriek_detected
                      ? 'text-rose-800 flex items-center gap-1'
                      : 'text-[#6d7c70]'
                  }`}
                >
                  {audio_data.bird_canopy_shriek_detected ? (
                    <>
                      <AlertCircle className="w-3.5 h-3.5" />
                      DETECTED
                    </>
                  ) : (
                    'NONE'
                  )}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#6d7c70]">Observation duration:</span>
                <span className=" text-[#526c60]">
                  {packet.duration_minutes} min sustained
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#6d7c70]">Spectral band:</span>
                <span className=" text-[#526c60]">
                  {audio_data.infrasound_detected_hz >= 10 ? 'Sub-audible (0.1–20Hz)' : 'Standard ambient'}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#d4ded2]/60 flex items-center justify-between">
            <span className="text-[11px] text-[#6d7c70]">Status:</span>
            <span
              className={`px-2.5 py-1 rounded text-[11px]  font-bold tracking-wide border ${getAcousticBadgeStyle()}`}
            >
              {fusion.acousticStatus}
            </span>
          </div>
        </div>

        {/* ----------------- STAGE 03: FUSION ----------------- */}
        <div
          className={`border rounded-lg p-5 flex flex-col justify-between transition-all ${
            isCritical
              ? 'bg-gradient-to-b from-[#f8faf5] to-[#122A23] border-[#849b64]/80  shadow-emerald-950/60'
              : 'bg-[#f8faf5]/80 border-[#d4ded2]'
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-[#d4ded2]/40">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-md bg-[#dfe9b9]/20 flex items-center justify-center text-[#5c753b]">
                  <GitMerge className="w-4 h-4" />
                </div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#203a30]">
                  03 — FUSION
                </h3>
              </div>
              <span className="text-[11px]  text-[#5c753b]">Cross-Modal Match</span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[#6d7c70]">Vision signal:</span>
                <span
                  className={` font-semibold flex items-center gap-1 ${
                    fusion.cameraStatus !== 'NOMINAL' ? 'text-emerald-800' : 'text-[#6d7c70]'
                  }`}
                >
                  <Check className="w-3.5 h-3.5 text-[#5c753b]" />
                  {fusion.cameraStatus !== 'NOMINAL' ? 'CONFIRMED' : 'BASELINE'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#6d7c70]">Acoustic signal:</span>
                <span
                  className={` font-semibold flex items-center gap-1 ${
                    fusion.acousticStatus !== 'NOMINAL' ? 'text-emerald-800' : 'text-[#6d7c70]'
                  }`}
                >
                  <Check className="w-3.5 h-3.5 text-[#5c753b]" />
                  {fusion.acousticStatus !== 'NOMINAL' ? 'CONFIRMED' : 'BASELINE'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#6d7c70]">Temporal correlation:</span>
                <span
                  className={` font-bold ${
                    fusion.temporalCorrelation === 'HIGH'
                      ? 'text-rose-800'
                      : fusion.temporalCorrelation === 'MODERATE'
                      ? 'text-amber-800'
                      : 'text-[#6d7c70]'
                  }`}
                >
                  {fusion.temporalCorrelation}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#6d7c70]">Fusion score:</span>
                <span className=" text-base font-extrabold text-[#5c753b] tabular-nums">
                  {fusion.fusionScore}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#6d7c70]">Correlation algorithm:</span>
                <span className=" text-[#526c60] text-[11px]">
                  Bimodal Coincidence Matrix
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#d4ded2]/60 flex items-center justify-between">
            <span className="text-[11px] text-[#6d7c70]">Status:</span>
            <span
              className={`px-2.5 py-1 rounded text-[11px]  font-bold tracking-wide border ${getFusionBadgeStyle()}`}
            >
              {fusion.fusionStatus}
            </span>
          </div>
        </div>
      </div>

      {/* Convergence Visual Bar */}
      <div className="mt-6 pt-4 border-t border-[#d4ded2]/40 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#6d7c70]">
        <div className="flex items-center gap-2">
          <span className="text-[#526c60] font-semibold">Sensor Fusion Pipeline:</span>
          <span className=" text-[#6d7c70]">
            Optical Reactivity ({reactionRatioPercent}%) ⊕ Acoustic Decibel Spike ({audio_data.decibel_spike_db}dB) → Fusion ({fusion.fusionScore}%)
          </span>
        </div>
        <div className=" text-[11px] text-[#5c753b] bg-[#f8faf5] px-2.5 py-1 rounded border border-[#d4ded2]">
          {isCritical ? 'ALERT TRIGGER THRESHOLD REACHED (≥80%)' : 'MONITORING FOR MULTI-MODAL ANOMALY'}
        </div>
      </div>
    </div>
  );
};



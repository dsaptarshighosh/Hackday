import React from 'react';
import { ModelAlertStatus } from '../types/livingLens';
import { ShieldAlert, AlertTriangle, CheckCircle, Flame, Cpu } from 'lucide-react';

interface RiskGaugeProps {
  disasterProbability: number;
  status: ModelAlertStatus;
  threshold?: number;
  zoneId?: string;
  isSimulatedPlaceholder?: boolean;
}

export const RiskGauge: React.FC<RiskGaugeProps> = ({
  disasterProbability,
  status,
  threshold = 80,
  zoneId = 'MEDINIPUR_ZONE_02',
  isSimulatedPlaceholder = true,
}) => {
  // SVG gauge constants
  const size = 300;
  const strokeWidth = 22;
  const radius = (size - strokeWidth) / 2;
  const center = size / 2;
  // Arc from 135deg to 405deg (270 degrees sweep)
  const sweepAngle = 270;
  const startAngle = 135;
  const circumference = 2 * Math.PI * radius;
  const arcLength = (sweepAngle / 360) * circumference;
  const progressOffset = arcLength - (Math.min(100, disasterProbability) / 100) * arcLength;

  // Threshold marker angle
  const thresholdAngleDeg = startAngle + (threshold / 100) * sweepAngle;
  const thresholdAngleRad = (thresholdAngleDeg * Math.PI) / 180;
  const markerInnerR = radius - 14;
  const markerOuterR = radius + 14;
  const tx1 = center + markerInnerR * Math.cos(thresholdAngleRad);
  const ty1 = center + markerInnerR * Math.sin(thresholdAngleRad);
  const tx2 = center + markerOuterR * Math.cos(thresholdAngleRad);
  const ty2 = center + markerOuterR * Math.sin(thresholdAngleRad);

  // Determine color theme based on model alert status
  let primaryColor = '#10B981'; // Green
  let accentBg = 'bg-emerald-100/80 border-emerald-300/50 text-emerald-800';
  let badgeText = 'NORMAL / MONITORING';
  let Icon = CheckCircle;

  if (disasterProbability >= threshold) {
    primaryColor = '#EF4444'; // Red
    accentBg = 'bg-rose-100/90 border-rose-500 text-rose-800  shadow-rose-950/60 ';
    badgeText = 'ALERT TRIGGERED';
    Icon = Flame;
  } else if (disasterProbability >= 60) {
    primaryColor = '#F59E0B'; // Amber
    accentBg = 'bg-amber-100/80 border-amber-300/60 text-amber-800';
    badgeText = 'ELEVATED MONITORING';
    Icon = AlertTriangle;
  }

  return (
    <div className="bg-[#eef2e9]/95 border border-[#d4ded2] rounded-xl p-6 flex flex-col items-center justify-between  relative overflow-hidden h-full">
      {/* Background radial glow */}
      <div
        className="absolute -top-24 -right-24 w-64 h-64 rounded-full blur-3xl pointer-events-none opacity-25 transition-all duration-700"
        style={{ backgroundColor: primaryColor }}
      />

      {/* Top Header */}
      <div className="w-full flex items-center justify-between text-xs text-[#6d7c70] border-b border-[#d4ded2]/60 pb-3 mb-2">
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-[#5c753b]" />
          <span className="font-semibold uppercase tracking-wider text-[#3e5b4f]">
            AI MODEL PREDICTION OUTPUT
          </span>
        </div>
        <div className="flex items-center gap-2  text-[11px]">
          <span className="text-[#6d7c70]">Node:</span>
          <span className="text-[#5c753b] font-bold">{zoneId}</span>
        </div>
      </div>

      {/* Central Big Visual Gauge */}
      <div className="relative flex items-center justify-center my-3">
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          className="transform rotate-0"
        >
          <defs>
            <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10B981" />
              <stop offset="50%" stopColor="#F59E0B" />
              <stop offset="80%" stopColor="#EF4444" />
            </linearGradient>
            <filter id="gaugeGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Background track arc */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="#f8faf5"
            strokeWidth={strokeWidth}
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeDashoffset={0}
            strokeLinecap="round"
            transform={`rotate(${startAngle} ${center} ${center})`}
          />

          {/* Active progress arc */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={primaryColor}
            strokeWidth={strokeWidth}
            strokeDasharray={`${arcLength} ${circumference}`}
            strokeDashoffset={progressOffset}
            strokeLinecap="round"
            transform={`rotate(${startAngle} ${center} ${center})`}
            filter="url(#gaugeGlow)"
            className="transition-all duration-700 ease-out"
          />

          {/* 80% Alert Threshold Line Marker */}
          <line
            x1={tx1}
            y1={ty1}
            x2={tx2}
            y2={ty2}
            stroke="#EF4444"
            strokeWidth={3}
            strokeLinecap="round"
          />

          {/* Scale tick marks */}
          {[0, 25, 50, 75, 100].map((tick) => {
            const angleDeg = startAngle + (tick / 100) * sweepAngle;
            const angleRad = (angleDeg * Math.PI) / 180;
            const tickInnerR = radius - 18;
            const tickOuterR = radius - 10;
            const x1 = center + tickInnerR * Math.cos(angleRad);
            const y1 = center + tickInnerR * Math.sin(angleRad);
            const x2 = center + tickOuterR * Math.cos(angleRad);
            const y2 = center + tickOuterR * Math.sin(angleRad);

            return (
              <line
                key={tick}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="#7b897b"
                strokeWidth={1.5}
                strokeLinecap="round"
              />
            );
          })}
        </svg>

        {/* Center readouts: DISASTER PROBABILITY % AS BIGGEST VISUAL RESULT */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 pointer-events-none">
          <span className="text-[11px]  tracking-widest uppercase text-[#6d7c70] mb-0.5">
            Disaster Probability
          </span>
          <div className="flex items-baseline justify-center">
            <span
              className="text-6xl font-black tracking-tight  tabular-nums transition-colors duration-500 drop-"
              style={{ color: primaryColor }}
            >
              {disasterProbability.toFixed(1)}
            </span>
            <span className="text-3xl font-extrabold ml-1  text-[#526c60]">%</span>
          </div>

          <div
            className={`mt-3 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border text-xs font-bold tracking-wider uppercase transition-all duration-300 ${accentBg}`}
          >
            <Icon className="w-4 h-4" />
            <span>{badgeText}</span>
          </div>
        </div>
      </div>

      {/* Threshold and Model Status strip */}
      <div className="w-full text-center mt-2 pt-3 border-t border-[#d4ded2]/60">
        <h3 className="text-sm font-bold tracking-wider uppercase text-[#203a30]">
          DISASTER PROBABILITY (%)
        </h3>
        <p className="text-[11px] text-[#6d7c70] mt-0.5 max-w-sm mx-auto">
          Generated from 4 automated wildlife sensor inputs. Alert activates exclusively at ≥{threshold}%.
        </p>

        {/* Decision Threshold Range Indicators */}
        <div className="grid grid-cols-3 gap-1.5 mt-3 text-[10px] ">
          <div
            className={`p-1.5 rounded text-center border ${
              disasterProbability < 60
                ? 'bg-emerald-100/80 border-emerald-300 text-emerald-800 font-bold'
                : 'bg-[#f8faf5]/40 border-[#d4ded2]/40 text-[#6d7c70]'
            }`}
          >
            &lt; 60% NORMAL
          </div>
          <div
            className={`p-1.5 rounded text-center border ${
              disasterProbability >= 60 && disasterProbability < threshold
                ? 'bg-amber-100/80 border-amber-300 text-amber-800 font-bold'
                : 'bg-[#f8faf5]/40 border-[#d4ded2]/40 text-[#6d7c70]'
            }`}
          >
            60–{threshold - 1}% ELEVATED
          </div>
          <div
            className={`p-1.5 rounded text-center border ${
              disasterProbability >= threshold
                ? 'bg-rose-100/90 border-rose-500 text-rose-800 font-bold  shadow-rose-950/50'
                : 'bg-[#f8faf5]/40 border-[#d4ded2]/40 text-[#6d7c70]'
            }`}
          >
            ≥ {threshold}% ALERT
          </div>
        </div>

        {isSimulatedPlaceholder && (
          <div className="mt-2.5 text-[10px]  text-[#6d7c70]">
            [Sample Simulated Output • Ready for Trained AI Model in <code className="text-[#5c753b]">src/ai/modelIntegration.ts</code>]
          </div>
        )}
      </div>
    </div>
  );
};



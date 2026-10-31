import React, { useState } from 'react';
import {
  CheckCircle,
  Play,
  ArrowRight,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Award,
  Zap,
} from 'lucide-react';

interface JudgeDemoGuideProps {
  onTriggerCritical: () => void;
  onTriggerNormal: () => void;
  onNavigateTab: (tab: string) => void;
  onSelectCitizen: (citizenId: string) => void;
  activeZoneId: string;
  disasterProbability: number;
  alertRadius: number;
}

export const JudgeDemoGuide: React.FC<JudgeDemoGuideProps> = ({
  onTriggerCritical,
  onTriggerNormal,
  onNavigateTab,
  onSelectCitizen,
  activeZoneId,
  disasterProbability,
  alertRadius,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const steps = [
    {
      num: 1,
      title: 'Open Primary Dashboard',
      desc: 'View automated 4-step workflow: Sensors → AI Model → Disaster Probability → Citizens.',
      actionLabel: 'Go to Dashboard',
      action: () => onNavigateTab('command_center'),
    },
    {
      num: 2,
      title: 'Automated Sensor Input',
      desc: 'Field nodes gather: 13 reacted, 15 detected, 12 min duration, 5/5 intensity.',
      actionLabel: 'Click: CRITICAL EVENT',
      action: () => onTriggerCritical(),
      highlight: true,
    },
    {
      num: 3,
      title: 'AI Model Integration',
      desc: 'The 4 automated sensor inputs feed into your teammate\'s trained model interface.',
      actionLabel: 'View Model Interface',
      action: () => onNavigateTab('command_center'),
    },
    {
      num: 4,
      title: 'Disaster Probability (87.4%)',
      desc: 'Model returns 87.4%, crossing the 80% threshold → ALERT TRIGGERED.',
      actionLabel: 'View Disaster Gauge',
      action: () => onNavigateTab('command_center'),
    },
    {
      num: 5,
      title: 'Alert Zone Activation (90km)',
      desc: 'Active alert generated at MEDINIPUR_ZONE_02 with default 90 km radius.',
      actionLabel: 'Inspect Alert Summary',
      action: () => onNavigateTab('command_center'),
    },
    {
      num: 6,
      title: 'Haversine Distance Check',
      desc: 'Calculates spherical distance from alert coordinates to registered citizens.',
      actionLabel: 'View Radar Map',
      action: () => onNavigateTab('alerts'),
    },
    {
      num: 7,
      title: 'Targeted Citizen Filtering',
      desc: 'Inside 90km: TARGETED (Rahul & Arjun). Outside 90km: EXCLUDED (Ananya).',
      actionLabel: 'View Targeting Table',
      action: () => onNavigateTab('alerts'),
    },
    {
      num: 8,
      title: 'Alert Summary Counters',
      desc: 'Alert Triggered · Prob: 87.4% · Radius: 90km · Inside: 2 · Outside: 1 · Targeted: 2.',
      actionLabel: 'Verify Live Counters',
      action: () => onNavigateTab('command_center'),
    },
    {
      num: 9,
      title: 'Inside Citizen: Rahul Sen',
      desc: 'Distance 10.5 km ≤ 90 km → Receives Living Lens Alert banner & simulated email.',
      actionLabel: 'Open Rahul Sen (Inside)',
      action: () => {
        onSelectCitizen('citizen-rahul-01');
        onNavigateTab('citizen');
      },
      highlight: true,
    },
    {
      num: 10,
      title: 'Outside Citizen: Ananya Roy',
      desc: 'Distance 108.5 km > 90 km → Outside active alert zone; zero alarm spam.',
      actionLabel: 'Open Ananya Roy (Outside)',
      action: () => {
        onSelectCitizen('citizen-ananya-02');
        onNavigateTab('citizen');
      },
      highlight: true,
    },
  ];

  return (
    <div className="bg-[#041a16] border border-[#849b64]/40 rounded-xl overflow-hidden  mb-6">
      {/* Collapsible Header */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="p-3.5 bg-gradient-to-r from-[#eef2e9] via-[#f8faf5] to-[#eef2e9] flex items-center justify-between cursor-pointer hover:bg-[#0F4D42] transition-colors"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-6 h-6 rounded bg-[#dfe9b9] flex items-center justify-center text-[#203a30] font-bold text-xs">
            <Award className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#203a30] flex items-center gap-2">
              HACKATHON DEMONSTRATION WORKFLOW
              <span className="text-[10px]  px-2 py-0.5 rounded bg-[#dfe9b9]/20 text-[#5c753b] font-semibold">
                Wildlife Sensors → AI Model → Disaster Probability → Citizens
              </span>
            </span>
            <span className="text-[11px] text-[#526c60] hidden sm:inline">
              Follow this sequence to test automated sensor ingestion, model threshold crossover, and targeted notifications
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onTriggerCritical();
              onNavigateTab('command_center');
            }}
            className="hidden md:flex items-center gap-1.5 px-3 py-1 rounded bg-[#dfe9b9] hover:bg-[#d3e0b1] text-[#203a30] text-xs  font-bold transition-transform active:scale-95 cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>1-Click Alert Test</span>
          </button>

          <span className="text-[#6d7c70] text-xs flex items-center gap-1">
            {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </span>
        </div>
      </div>

      {/* Expanded Step-by-Step Card Flow */}
      {isOpen && (
        <div className="p-4 bg-[#e6ece4] border-t border-[#d4ded2]/60">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-2.5">
            {steps.map((s) => (
              <div
                key={s.num}
                className={`p-3 rounded-lg border text-left flex flex-col justify-between ${
                  s.highlight
                    ? 'bg-[#f8faf5] border-[#849b64]/60'
                    : 'bg-[#eef2e9] border-[#d4ded2]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px]  font-bold text-[#5c753b]">
                      STEP {s.num}
                    </span>
                    {s.num === 2 && disasterProbability >= 80 && (
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-800" />
                    )}
                  </div>
                  <h4 className="text-xs font-bold text-[#203a30] leading-snug">
                    {s.title}
                  </h4>
                  <p className="text-[11px] text-[#6d7c70] mt-1 leading-normal">
                    {s.desc}
                  </p>
                </div>

                <button
                  onClick={s.action}
                  className={`mt-3 w-full py-1.5 px-2 rounded text-[11px]  font-bold transition-all flex items-center justify-center gap-1 cursor-pointer ${
                    s.highlight
                      ? 'bg-[#dfe9b9] text-[#203a30] hover:bg-[#d3e0b1]'
                      : 'bg-[#f8faf5] hover:bg-[#d4ded2] text-[#3e5b4f] border border-[#d4ded2]'
                  }`}
                >
                  <span>{s.actionLabel}</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>

          <div className="mt-3 pt-3 border-t border-[#d4ded2]/40 flex flex-wrap items-center justify-between gap-3 text-xs text-[#6d7c70] ">
            <span>
              Target Node: <strong className="text-[#203a30]">{activeZoneId}</strong> · AI Disaster Probability:{' '}
              <strong className="text-[#5c753b]">{disasterProbability.toFixed(1)}%</strong> · Alert Radius:{' '}
              <strong className="text-[#203a30]">{alertRadius} km</strong>
            </span>
            <button
              onClick={() => onTriggerNormal()}
              className="text-xs text-[#6d7c70] hover:text-[#3e5b4f] underline cursor-pointer"
            >
              Reset to Normal Baseline (42% - No Alert)
            </button>
          </div>
        </div>
      )}
    </div>
  );
};



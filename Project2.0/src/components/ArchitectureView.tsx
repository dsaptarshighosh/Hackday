import React from 'react';
import {
  Server,
  Cpu,
  Radio,
  Eye,
  GitMerge,
  ShieldAlert,
  Mail,
  HardDrive,
  Cloud,
  Layers,
  ArrowRight,
  ArrowDown,
  CheckCircle,
  Activity,
  Zap,
} from 'lucide-react';

export const ArchitectureView: React.FC = () => {
  const pipelineSteps = [
    { label: 'FOREST NODE', icon: Radio, sub: 'Bio-corridor outpost' },
    { label: 'CAMERA + MICROPHONE', icon: Eye, sub: 'Optical & Infrasonic' },
    { label: 'EDGE PROCESSING', icon: Cpu, sub: 'Local feature extraction' },
    { label: 'SENSOR FUSION', icon: GitMerge, sub: 'Cross-modal correlation' },
    { label: 'ANOMALY SCORE', icon: Activity, sub: 'Bimodal deviation' },
    { label: 'EVENT LIKELIHOOD', icon: Zap, sub: 'Simulated 0-100%' },
    { label: 'ALERT ZONE', icon: ShieldAlert, sub: 'Geographic perimeter' },
    { label: 'DISTANCE CALCULATION', icon: Layers, sub: 'Haversine spherical' },
    { label: 'TARGETED CITIZENS', icon: CheckCircle, sub: 'Inside perimeter' },
    { label: 'EMAIL ALERT', icon: Mail, sub: 'Simulated targeted dispatch' },
  ];

  return (
    <div className="bg-[#eef2e9]/95 border border-[#d4ded2] rounded-xl p-6  space-y-8">
      {/* SECTION 28: SYSTEM HEALTH METRICS */}
      <div>
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#d4ded2]/60">
          <div className="flex items-center gap-2">
            <Server className="w-5 h-5 text-[#5c753b]" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#203a30]">
              SYSTEM HEALTH & TELEMETRY STATUS
            </h2>
          </div>
          <span className="text-xs  text-emerald-800 flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 " />
            OPERATIONAL
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="bg-[#f8faf5] border border-[#d4ded2] rounded-lg p-3">
            <span className="text-[10px]  uppercase text-[#6d7c70] block">Sensor network</span>
            <span className="text-xl  font-extrabold text-[#5c753b] tabular-nums mt-0.5 block">
              98%
            </span>
            <span className="text-[10px] text-[#6d7c70]">Node availability</span>
          </div>

          <div className="bg-[#f8faf5] border border-[#d4ded2] rounded-lg p-3">
            <span className="text-[10px]  uppercase text-[#6d7c70] block">Packet delivery</span>
            <span className="text-xl  font-extrabold text-[#5c753b] tabular-nums mt-0.5 block">
              99.2%
            </span>
            <span className="text-[10px] text-[#6d7c70]">Low loss rate</span>
          </div>

          <div className="bg-[#f8faf5] border border-[#d4ded2] rounded-lg p-3">
            <span className="text-[10px]  uppercase text-[#6d7c70] block">Edge nodes</span>
            <span className="text-xl  font-extrabold text-[#203a30] tabular-nums mt-0.5 block">
              12 / 12
            </span>
            <span className="text-[10px] text-[#6d7c70]">Online in grid</span>
          </div>

          <div className="bg-[#f8faf5] border border-[#d4ded2] rounded-lg p-3">
            <span className="text-[10px]  uppercase text-[#6d7c70] block">Fusion engine</span>
            <span className="text-xl  font-extrabold text-emerald-800 mt-0.5 block">
              ACTIVE
            </span>
            <span className="text-[10px] text-[#6d7c70]">Bimodal matrix</span>
          </div>

          <div className="bg-[#f8faf5] border border-[#d4ded2] rounded-lg p-3">
            <span className="text-[10px]  uppercase text-[#6d7c70] block">Citizen alert engine</span>
            <span className="text-xl  font-extrabold text-emerald-800 mt-0.5 block">
              ACTIVE
            </span>
            <span className="text-[10px] text-[#6d7c70]">Haversine dispatch</span>
          </div>

          <div className="bg-[#f8faf5] border border-[#d4ded2] rounded-lg p-3">
            <span className="text-[10px]  uppercase text-[#6d7c70] block">Simulation</span>
            <span className="text-xl  font-extrabold text-[#5c753b] mt-0.5 block">
              RUNNING
            </span>
            <span className="text-[10px] text-[#6d7c70]">Last packet: 2s ago</span>
          </div>
        </div>
      </div>

      {/* SECTION 26: SENSOR PIPELINE ANIMATED FLOW */}
      <div>
        <div className="pb-3 mb-4 border-b border-[#d4ded2]/60">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#3e5b4f]">
            CENTRAL LIVING LENS WORKFLOW PIPELINE
          </h3>
          <p className="text-xs text-[#6d7c70] mt-0.5">
            End-to-end biological anomaly transduction from forest ethology to geographic citizen notification
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-2">
          {pipelineSteps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={step.label}
                className="bg-[#f8faf5]/80 border border-[#d4ded2] rounded-lg p-2.5 flex flex-col items-center text-center relative group hover:border-[#849b64] transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-[#eef2e9] border border-[#d4ded2] flex items-center justify-center text-[#5c753b] mb-2 group-hover:scale-110 transition-transform">
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-[10px]  font-bold text-[#3e5b4f] leading-tight">
                  {step.label}
                </span>
                <span className="text-[9px] text-[#6d7c70] mt-1">
                  {step.sub}
                </span>

                {idx < pipelineSteps.length - 1 && (
                  <div className="hidden lg:block absolute -right-2 top-1/2 -translate-y-1/2 z-10 text-[#5c753b]/60 pointer-events-none">
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 30: CURRENT PROTOTYPE VS FUTURE PRODUCTION ARCHITECTURE */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CURRENT PROTOTYPE */}
        <div className="bg-[#f8faf5]/70 border border-[#d4ded2] rounded-lg p-5">
          <div className="flex items-center justify-between pb-2 mb-3 border-b border-[#d4ded2]/60">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#5c753b]">
              CURRENT PROTOTYPE ARCHITECTURE
            </h3>
            <span className="px-2 py-0.5 rounded text-[10px]  bg-[#eef2e9] border border-[#d4ded2] text-[#526c60]">
              In-Browser Execution
            </span>
          </div>

          <div className="space-y-2 text-xs  text-[#3e5b4f]">
            <div className="p-2 bg-[#eef2e9] rounded border border-[#d4ded2]/60 flex items-center justify-between">
              <span>React 19 SPA + Vite + Tailwind CSS</span>
              <span className="text-[#5c753b]">Presentation Layer</span>
            </div>
            <div className="text-center text-[#5c753b]">↓</div>
            <div className="p-2 bg-[#eef2e9] rounded border border-[#d4ded2]/60 flex items-center justify-between">
              <span>LocalStorage State Persistence</span>
              <span className="text-[#6d7c70]">Citizen DB</span>
            </div>
            <div className="text-center text-[#5c753b]">↓</div>
            <div className="p-2 bg-[#eef2e9] rounded border border-[#d4ded2]/60 flex items-center justify-between">
              <span>Sensor Simulator Engine (3 Presets + Auto)</span>
              <span className="text-[#6d7c70]">Telemetry Ingest</span>
            </div>
            <div className="text-center text-[#5c753b]">↓</div>
            <div className="p-2 bg-[#eef2e9] rounded border border-[#d4ded2]/60 flex items-center justify-between">
              <span>Fusion Algorithm (Vision ⊕ Infrasound)</span>
              <span className="text-[#5c753b]">Simulated Likelihood</span>
            </div>
            <div className="text-center text-[#5c753b]">↓</div>
            <div className="p-2 bg-[#eef2e9] rounded border border-[#d4ded2]/60 flex items-center justify-between">
              <span>Haversine Spherical Distance Calculation</span>
              <span className="text-[#6d7c70]">WGS84 R=6371km</span>
            </div>
            <div className="text-center text-[#5c753b]">↓</div>
            <div className="p-2 bg-[#eef2e9] rounded border border-[#d4ded2]/60 flex items-center justify-between">
              <span>Simulated Email Delivery Dispatch</span>
              <span className="text-emerald-800">Targeted Queue</span>
            </div>
          </div>
        </div>

        {/* FUTURE PRODUCTION SYSTEM */}
        <div className="bg-[#f8faf5]/70 border border-[#d4ded2] rounded-lg p-5">
          <div className="flex items-center justify-between pb-2 mb-3 border-b border-[#d4ded2]/60">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#3e5b4f]">
              FUTURE PRODUCTION ARCHITECTURE
            </h3>
            <span className="px-2 py-0.5 rounded text-[10px]  bg-amber-100/80 border border-amber-600/60 text-amber-800">
              Proposed Scaled Model
            </span>
          </div>

          <div className="space-y-2 text-xs  text-[#3e5b4f]">
            <div className="p-2 bg-[#eef2e9] rounded border border-[#d4ded2]/60 flex items-center justify-between">
              <span>Forest Edge Nodes (NVIDIA Jetson + Solar)</span>
              <span className="text-[#6d7c70]">Ruggedized Field</span>
            </div>
            <div className="text-center text-[#839084]">↓</div>
            <div className="p-2 bg-[#eef2e9] rounded border border-[#d4ded2]/60 flex items-center justify-between">
              <span>Secure Telemetry (MQTT over 4G/5G/Satellite)</span>
              <span className="text-[#6d7c70]">TLS Encrypted</span>
            </div>
            <div className="text-center text-[#839084]">↓</div>
            <div className="p-2 bg-[#eef2e9] rounded border border-[#d4ded2]/60 flex items-center justify-between">
              <span>Cloud IoT Backend (Kubernetes / PubSub)</span>
              <span className="text-[#6d7c70]">Event Streaming</span>
            </div>
            <div className="text-center text-[#839084]">↓</div>
            <div className="p-2 bg-[#eef2e9] rounded border border-[#d4ded2]/60 flex items-center justify-between">
              <span>Geospatial Database (PostGIS / Spanner)</span>
              <span className="text-[#6d7c70]">Spatial Indexing</span>
            </div>
            <div className="text-center text-[#839084]">↓</div>
            <div className="p-2 bg-[#eef2e9] rounded border border-[#d4ded2]/60 flex items-center justify-between">
              <span>Alert Engine + ML Anomaly Classification</span>
              <span className="text-[#6d7c70]">Multi-Node Fusion</span>
            </div>
            <div className="text-center text-[#839084]">↓</div>
            <div className="p-2 bg-[#eef2e9] rounded border border-[#d4ded2]/60 flex items-center justify-between">
              <span>Email / SMS / Cell Broadcast Emergency API</span>
              <span className="text-teal-800">Mass Public Safety</span>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 27: PROPOSED DEPLOYMENT HARDWARE & ARCHITECTURE */}
      <div className="bg-[#f8faf5]/60 border border-[#d4ded2] rounded-lg p-5">
        <div className="flex items-center justify-between pb-2 mb-3 border-b border-[#d4ded2]/60">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#3e5b4f]">
            PROPOSED DEPLOYMENT ARCHITECTURE & HARDWARE SPECIFICATIONS
          </h3>
          <span className="px-2 py-0.5 rounded text-[10px]  font-bold bg-[#eef2e9] border border-amber-600/40 text-amber-800">
            PROPOSED FUTURE ARCHITECTURE
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
          <div className="bg-[#eef2e9] border border-[#d4ded2]/60 rounded p-3">
            <span className="font-bold text-[#5c753b] block mb-1">NVIDIA Jetson Edge</span>
            <p className="text-[11px] text-[#526c60]">
              Low-power on-device computer vision models executing real-time herd tracking without streaming raw video.
            </p>
          </div>

          <div className="bg-[#eef2e9] border border-[#d4ded2]/60 rounded p-3">
            <span className="font-bold text-[#5c753b] block mb-1">Thermal & IR Cameras</span>
            <p className="text-[11px] text-[#526c60]">
              Dual-spectrum optical sensors enabling uninterrupted night-time biological observation in dense forest canopies.
            </p>
          </div>

          <div className="bg-[#eef2e9] border border-[#d4ded2]/60 rounded p-3">
            <span className="font-bold text-[#5c753b] block mb-1">Infrasound Microphones</span>
            <p className="text-[11px] text-[#526c60]">
              Sub-audible differential pressure transducers tuned to 0.1–20 Hz range for seismic and atmospheric microbaroms.
            </p>
          </div>

          <div className="bg-[#eef2e9] border border-[#d4ded2]/60 rounded p-3">
            <span className="font-bold text-[#5c753b] block mb-1">Industrial Cellular</span>
            <p className="text-[11px] text-[#526c60]">
              IP67 rated ruggedized 4G/5G gateways with solar micro-harvesters and LiFePO4 battery banks.
            </p>
          </div>

          <div className="bg-[#eef2e9] border border-[#d4ded2]/60 rounded p-3">
            <span className="font-bold text-[#5c753b] block mb-1">Satellite Backhaul</span>
            <p className="text-[11px] text-[#526c60]">
              Iridium / LEO satellite failover for deep forest corridors where terrestrial cellular connectivity is absent.
            </p>
          </div>
        </div>

        <p className="text-[11px] text-[#6d7c70] mt-4 italic">
          * Notice: The components listed above are part of the proposed physical architecture roadmap and are simulated through in-browser mathematical telemetry for this hackathon demonstration.
        </p>
      </div>
    </div>
  );
};



import React from 'react';
import { Activity, AudioLines, Camera, Cpu, Radio, Waves, Wifi } from 'lucide-react';

const sensorItems = [
  { icon: Camera, heading: 'THE SIGHT — THERMAL & INFRARED CAMERAS', tags: ['Thermal', 'Infrared', '24/7'] },
  { icon: AudioLines, heading: 'THE SOUND — AUTONOMOUS RECORDING UNITS (ARUs)', bands: [{ label: 'LOW', text: '<20 Hz · growls' }, { label: 'HIGH', text: '2–8 kHz · bird calls' }] },
  { icon: Waves, heading: 'THE GROUND — FIBER DAS', tags: ['Existing fiber optic cable', 'Laser sensing', 'Vibration'] },
  { icon: Cpu, heading: 'THE BRAIN ON THE TREE — NVIDIA JETSON', tags: ['Edge AI', 'Local processing', 'Less cloud use'] },
  { icon: Wifi, heading: 'THE ANTENNA — 4G/5G & SATELLITE CONNECTIVITY', tags: ['4G / 5G', 'Satellite', 'Cloud link'] },
];

export const SensorNetworkPanel: React.FC = () => (
  <aside className="min-w-0 border border-[#d4ded2] bg-[#f8faf5] p-4" aria-labelledby="sensor-network-title">
    <div className="border-b border-[#d4ded2] pb-3">
      <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#718075]">Field hardware</p>
      <h2 id="sensor-network-title" className="mt-1 text-lg font-semibold tracking-tight text-[#203a30]">SENSOR NETWORK</h2>
      <p className="mt-2 border-l-2 border-[#ad792c] pl-2 text-[10px] leading-4 text-[#805d27]">Proposed hardware · not connected</p>
    </div>
    <div className="divide-y divide-[#d4ded2]">
      {sensorItems.map(({ icon: Icon, heading, tags, bands }, index) => (
        <article key={heading} className="py-2.5 first:pt-3 last:pb-1">
          <div className="flex items-start gap-2">
            <Icon aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-[#557246]" strokeWidth={1.8} />
            <div className="min-w-0">
              <h3 className="text-[11px] font-bold leading-[1.4] text-[#294736]">{index + 1}. {heading}</h3>
              {bands && <div className="mt-1 flex flex-wrap gap-x-2 gap-y-0.5">{bands.map((band) => <span key={band.label} className="text-[9px] text-[#557246]"><strong>{band.label}</strong> {band.text}</span>)}</div>}
              {tags && <p className="mt-1 text-[9px] font-medium leading-4 text-[#718075]">{tags.join(' · ')}</p>}
            </div>
          </div>
        </article>
      ))}
    </div>
    <p className="mt-2 border-t border-[#d4ded2] pt-2 text-[9px] leading-4 text-[#77857a]">ARUs capture sound · Fiber DAS senses vibration through existing fiber cable</p>
  </aside>
);

function BoundingBoxes() {
  return <svg viewBox="0 0 220 78" className="h-[72px] w-full" role="img" aria-label="Illustrative bounding boxes around animals"><rect width="220" height="78" fill="#e8eee4"/><path d="M0 59Q45 42 93 56T220 48V78H0Z" fill="#d4dfce"/><g fill="#718765"><ellipse cx="64" cy="44" rx="17" ry="9"/><circle cx="78" cy="41" r="6"/><path d="M50 49v11m22-11v11M82 44l5 5" stroke="#718765" strokeWidth="3"/><ellipse cx="144" cy="49" rx="16" ry="8"/><circle cx="158" cy="46" r="5"/><path d="M133 54v8m20-8v8" stroke="#718765" strokeWidth="3"/></g><rect x="42" y="27" width="48" height="40" fill="none" stroke="#557246" strokeDasharray="4 3" strokeWidth="2"/><rect x="124" y="33" width="46" height="34" fill="none" stroke="#ad792c" strokeDasharray="4 3" strokeWidth="2"/><text x="44" y="22" fill="#45613d" fontSize="8">animal 01</text><text x="126" y="28" fill="#8c6324" fontSize="8">animal 02</text></svg>;
}

function OpticalFlow() {
  const vectors = [[54, 37, 29, -15], [92, 35, 24, 12], [129, 40, -27, -14], [164, 39, 28, 15], [77, 67, -22, 13], [143, 68, 22, -15]];
  return <svg viewBox="0 0 220 88" className="h-[82px] w-full" role="img" aria-label="Illustrative optical flow vectors in multiple directions"><rect width="220" height="88" fill="#e8eee4"/>{vectors.map(([x, y, dx, dy], index) => <g key={index}><circle cx={x} cy={y} r="3" fill="#557246"/><path d={`M${x} ${y} l${dx} ${dy}`} stroke="#ad792c" strokeWidth="1.8"/><path d={`M${x + dx} ${y + dy} l${-Math.sign(dx) * 5} ${-Math.sign(dy) * 3} l${Math.sign(dy) * 3} ${Math.sign(dx) * 5}`} fill="none" stroke="#ad792c" strokeWidth="1.8"/></g>)}</svg>;
}

function Spectrogram() {
  const bars = Array.from({ length: 36 }, (_, index) => ({ x: 7 + index * 5.7, h: 10 + ((index * 19 + index * index * 7) % 44), opacity: 0.35 + ((index * 13) % 55) / 100 }));
  return <svg viewBox="0 0 220 70" className="h-[66px] w-full" role="img" aria-label="Illustrative spectrogram showing acoustic activity over time"><rect width="220" height="70" fill="#142b23"/>{[16, 34, 52].map((y) => <line key={y} x1="5" y1={y} x2="215" y2={y} stroke="#66786e" strokeOpacity=".35"/>)}{bars.map((bar, index) => <rect key={index} x={bar.x} y={62 - bar.h} width="3.5" height={bar.h} fill={bar.h > 36 ? '#d19447' : '#82a873'} opacity={bar.opacity}/>)}</svg>;
}

export const ExtractionPanel: React.FC = () => (
  <aside className="min-w-0 border border-[#d4ded2] bg-[#f8faf5] p-4" aria-labelledby="extraction-title">
    <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#718075]">Feature extraction</p>
    <h2 id="extraction-title" className="mt-1 text-base font-semibold leading-6 tracking-tight text-[#203a30]">STEP 1: PIXEL &amp; AUDIO CONVERSION (DATA EXTRACTION)</h2>
    <p className="mt-2 text-xs leading-5 text-[#526c60]">The chip inside the tree box turns raw streams into tiny numbers instantly:</p>
    <article className="mt-4 border-t border-[#d4ded2] pt-3">
      <h3 className="text-xs font-bold text-[#294736]">1. YOLO BOUNDING BOXES</h3>
      <p className="mt-1 text-[11px] leading-4 text-[#526c60]">Counts the shapes (Total Elephants = 15).</p>
      <BoundingBoxes />
      <p className="mt-1 inline-flex bg-[#e5eddb] px-2 py-1 text-[10px] font-bold text-[#45613d]">TOTAL ELEPHANTS = 15 <span className="ml-1 font-medium">· SAMPLE DATA</span></p>
    </article>
    <article className="mt-3 border-t border-[#d4ded2] pt-3">
      <h3 className="text-xs font-bold text-[#294736]">2. OPTICAL FLOW VECTORS</h3>
      <p className="mt-1 text-[11px] leading-4 text-[#526c60]">Measures pixel acceleration (Reacting Count = 14, Direction = 360° Scatter).</p>
      <OpticalFlow />
      <div className="flex flex-wrap gap-1.5"><p className="bg-[#f0e8d7] px-2 py-1 text-[10px] font-bold text-[#805d27]">REACTING COUNT = 14 <span className="font-medium">· SAMPLE</span></p><p className="bg-[#f0e8d7] px-2 py-1 text-[10px] font-bold text-[#805d27]">DIRECTION = 360° SCATTER <span className="font-medium">· SAMPLE</span></p></div>
    </article>
    <article className="mt-3 border-t border-[#d4ded2] pt-3">
      <h3 className="text-xs font-bold text-[#294736]">3. FAST FOURIER TRANSFORM (FFT)</h3>
      <p className="mt-1 text-[11px] leading-4 text-[#526c60]">Converts sound into a visual fingerprint (Spectrogram) to log volume decibels and audio chaos.</p>
      <Spectrogram />
      <div className="mt-1 flex flex-wrap gap-x-2 gap-y-1 text-[9px] font-semibold text-[#557246]"><span>FFT</span><span>SPECTROGRAM</span><span>VOLUME (dB)</span><span>ACOUSTIC ACTIVITY</span></div>
    </article>
    <p className="mt-3 border-t border-[#d4ded2] pt-2 text-[10px] leading-4 text-[#77857a]">Illustrative diagrams and sample values only. The current media analysis pipeline returns its own model outputs; it does not provide YOLO boxes, optical-flow vectors, or a spectrogram.</p>
  </aside>
);

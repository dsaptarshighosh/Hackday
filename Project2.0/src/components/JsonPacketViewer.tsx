import React, { useState } from 'react';
import { SensorPacket } from '../types/livingLens';
import { Code, Copy, Check, Terminal } from 'lucide-react';

interface JsonPacketViewerProps {
  packet: SensorPacket;
}

export const JsonPacketViewer: React.FC<JsonPacketViewerProps> = ({ packet }) => {
  const [copied, setCopied] = useState(false);

  const formattedJson = JSON.stringify(packet, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(formattedJson);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-[#eef2e9]/95 border border-[#d4ded2] rounded-xl p-5  flex flex-col h-full">
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#d4ded2]/60">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-[#5c753b]" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#3e5b4f]">
            RAW SENSOR PACKET TELEMETRY
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[11px]  text-[#6d7c70]">
            Node: <span className="text-[#5c753b]">{packet.zone_id}</span>
          </span>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#f8faf5] hover:bg-[#e3ebe1] border border-[#d4ded2] text-[#526c60] hover:text-[#203a30] text-xs  transition-colors cursor-pointer"
            title="Copy JSON Payload"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-800" />
                <span className="text-emerald-800">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-[#6d7c70]" />
                <span>Copy JSON</span>
              </>
            )}
          </button>
        </div>
      </div>

      <div className="relative flex-1 bg-[#e6ece4] border border-[#d4ded2]/60 rounded-lg p-3.5 overflow-auto max-h-[340px]">
        <pre className="text-xs  leading-relaxed text-[#3e5b4f]">
          <code>
            {formattedJson.split('\n').map((line, idx) => {
              // Syntax colorizing for key lines
              const isKey = line.includes('":');
              const isZone = line.includes('"zone_id"');
              const isReacting = line.includes('"count_reacting"');
              const isInfrasound = line.includes('"infrasound_detected_hz"');
              const isBird = line.includes('"bird_canopy_shriek_detected"');

              let lineClass = 'text-[#526c60]';
              if (isZone) lineClass = 'text-teal-800 font-semibold';
              else if (isReacting) lineClass = 'text-[#5c753b] font-semibold';
              else if (isInfrasound) lineClass = 'text-amber-800 font-semibold';
              else if (isBird) lineClass = 'text-rose-800 font-semibold';

              return (
                <div key={idx} className={`hover:bg-[#f8faf5]/30 px-1 rounded ${lineClass}`}>
                  {line}
                </div>
              );
            })}
          </code>
        </pre>
      </div>

      <div className="mt-3 pt-2 border-t border-[#d4ded2]/40 flex items-center justify-between text-[11px]  text-[#6d7c70]">
        <span>Protocol: Standard IEEE 1451.4 Smart Transducer</span>
        <span className="text-emerald-800">Payload: Ingested & Verified</span>
      </div>
    </div>
  );
};



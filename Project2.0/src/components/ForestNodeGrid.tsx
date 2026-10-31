import React from 'react';
import { ForestNode } from '../types/livingLens';
import { Radio, Eye, Activity, ShieldAlert, CheckCircle, AlertTriangle } from 'lucide-react';

interface ForestNodeGridProps {
  nodes: ForestNode[];
  activeZoneId: string;
  onSelectNode: (nodeId: string) => void;
}

export const ForestNodeGrid: React.FC<ForestNodeGridProps> = ({
  nodes,
  activeZoneId,
  onSelectNode,
}) => {
  return (
    <div className="bg-[#eef2e9]/95 border border-[#d4ded2] rounded-xl p-5 ">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-4 border-b border-[#d4ded2]/60 gap-2">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-[#203a30] flex items-center gap-2">
            <Radio className="w-4 h-4 text-[#5c753b]" />
            FOREST SENSOR NETWORK
          </h2>
          <p className="text-xs text-[#6d7c70] mt-0.5">
            Distributed environmental edge nodes deployed across biological corridors
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs  text-[#6d7c70]">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>{nodes.filter((n) => n.status === 'ONLINE').length} Online</span>
          <span>·</span>
          <span className="w-2 h-2 rounded-full bg-amber-400" />
          <span>{nodes.filter((n) => n.status === 'WARNING').length} Warning</span>
          <span>·</span>
          <span className="w-2 h-2 rounded-full bg-rose-500 " />
          <span className="text-rose-800 font-bold">{nodes.filter((n) => n.status === 'ALERT').length} Alert</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3.5">
        {nodes.map((node) => {
          const isSelected = node.id === activeZoneId;

          // Status colors
          let statusBadgeClass = 'bg-emerald-100/60 border-emerald-600/60 text-emerald-800';
          let StatusIcon = CheckCircle;
          let riskColor = 'text-emerald-800';

          if (node.status === 'ALERT') {
            statusBadgeClass = 'bg-rose-100/60 border-rose-500 text-rose-800  shadow-rose-900';
            StatusIcon = ShieldAlert;
            riskColor = 'text-rose-800';
          } else if (node.status === 'WARNING') {
            statusBadgeClass = 'bg-amber-100/60 border-amber-600/60 text-amber-800';
            StatusIcon = AlertTriangle;
            riskColor = 'text-amber-800';
          }

          return (
            <div
              key={node.id}
              onClick={() => onSelectNode(node.id)}
              className={`rounded-lg p-4 border transition-all cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'bg-[#0F4D42]/80 border-[#849b64] ring-2 ring-[#C1F865]/30 '
                  : 'bg-[#f8faf5]/70 border-[#d4ded2] hover:border-[#7b897b] hover:bg-[#f8faf5]'
              }`}
            >
              <div>
                {/* Node ID & Status Header */}
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#d4ded2]/40">
                  <span className="text-xs  font-bold text-[#203a30] truncate">
                    {node.id}
                  </span>
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px]  font-bold tracking-wider border ${statusBadgeClass}`}
                  >
                    <StatusIcon className="w-2.5 h-2.5" />
                    {node.status}
                  </span>
                </div>

                <div className="text-[11px] text-[#6d7c70] mb-3 truncate">
                  {node.name}
                </div>

                {/* Risk score metric */}
                <div className="bg-[#eef2e9]/80 rounded p-2.5 mb-3 border border-[#d4ded2]/60 flex items-center justify-between">
                  <span className="text-xs text-[#6d7c70]">Risk Score:</span>
                  <span className={`text-lg  font-extrabold tabular-nums ${riskColor}`}>
                    {node.riskScore}%
                  </span>
                </div>

                {/* Sensors substatus */}
                <div className="space-y-1.5 text-[11px]">
                  <div className="flex items-center justify-between">
                    <span className="text-[#6d7c70] flex items-center gap-1">
                      <Eye className="w-3 h-3 text-[#6d7c70]" />
                      Camera:
                    </span>
                    <span
                      className={` text-[10px] font-medium truncate max-w-[90px] ${
                        node.cameraStatus.includes('ANOMALY')
                          ? 'text-rose-800'
                          : node.cameraStatus.includes('ELEVATED')
                          ? 'text-amber-800'
                          : 'text-[#526c60]'
                      }`}
                    >
                      {node.cameraStatus}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-[#6d7c70] flex items-center gap-1">
                      <Activity className="w-3 h-3 text-[#6d7c70]" />
                      Acoustic:
                    </span>
                    <span
                      className={` text-[10px] font-medium truncate max-w-[90px] ${
                        node.acousticStatus.includes('ANOMALY')
                          ? 'text-rose-800'
                          : node.acousticStatus.includes('ELEVATED')
                          ? 'text-amber-800'
                          : 'text-[#526c60]'
                      }`}
                    >
                      {node.acousticStatus}
                    </span>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="mt-3 pt-2 border-t border-[#d4ded2]/40 flex items-center justify-between text-[10px] text-[#6d7c70]">
                <span className="">
                  {node.coordinates.lat.toFixed(2)}°N, {node.coordinates.lon.toFixed(2)}°E
                </span>
                <span className=" text-[#6d7c70]">{node.lastPacketTime}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};



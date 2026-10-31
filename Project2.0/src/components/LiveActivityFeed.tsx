import React, { useRef, useEffect } from 'react';
import { ActivityLog } from '../types/livingLens';
import { Activity, ShieldAlert, Radio, Eye, GitMerge, Bell } from 'lucide-react';

interface LiveActivityFeedProps {
  logs: ActivityLog[];
  onClearLogs?: () => void;
}

export const LiveActivityFeed: React.FC<LiveActivityFeedProps> = ({ logs, onClearLogs }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [logs]);

  const getLogIcon = (type: ActivityLog['type']) => {
    switch (type) {
      case 'camera':
        return <Eye className="w-3.5 h-3.5 text-[#5c753b]" />;
      case 'acoustic':
        return <Radio className="w-3.5 h-3.5 text-teal-800" />;
      case 'fusion':
        return <GitMerge className="w-3.5 h-3.5 text-amber-800" />;
      case 'alert':
        return <Bell className="w-3.5 h-3.5 text-rose-800" />;
      default:
        return <Activity className="w-3.5 h-3.5 text-[#6d7c70]" />;
    }
  };

  const getLogColor = (type: ActivityLog['type']) => {
    switch (type) {
      case 'camera':
        return 'text-emerald-800';
      case 'acoustic':
        return 'text-teal-800';
      case 'fusion':
        return 'text-amber-800';
      case 'alert':
        return 'text-rose-800 font-semibold';
      default:
        return 'text-[#526c60]';
    }
  };

  return (
    <div className="bg-[#eef2e9]/95 border border-[#d4ded2] rounded-xl p-5  flex flex-col h-full">
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#d4ded2]/60">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-[#5c753b] " />
          <h2 className="text-xs font-bold uppercase tracking-wider text-[#203a30]">
            LIVE SENSOR STREAM
          </h2>
        </div>

        <div className="flex items-center gap-3 text-xs ">
          <span className="text-[11px] text-emerald-800 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 " />
            RECEIVING TELEMETRY
          </span>
          {onClearLogs && (
            <button
              onClick={onClearLogs}
              className="text-[11px] text-[#6d7c70] hover:text-[#3e5b4f] transition-colors"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      <div
        ref={containerRef}
        className="flex-1 bg-[#e6ece4] border border-[#d4ded2]/60 rounded-lg p-3 space-y-1.5 overflow-y-auto max-h-[340px]  text-xs"
      >
        {logs.length === 0 ? (
          <div className="text-center py-8 text-[#6d7c70] italic">
            Awaiting incoming telemetry packets...
          </div>
        ) : (
          logs.map((log) => (
            <div
              key={log.id}
              className="flex items-start gap-2 py-1 px-1.5 rounded hover:bg-[#f8faf5]/40 transition-colors border-b border-[#d4ded2]/20 last:border-b-0"
            >
              <span className="text-[#6d7c70] text-[11px] whitespace-nowrap tabular-nums">
                {log.timestamp}
              </span>
              <span className="mt-0.5 shrink-0">{getLogIcon(log.type)}</span>
              <span className="text-teal-800 font-semibold whitespace-nowrap">
                {log.zone_id}
              </span>
              <span className={`flex-1 break-words ${getLogColor(log.type)}`}>
                {log.message}
              </span>
            </div>
          ))
        )}
      </div>

      <div className="mt-3 pt-2 border-t border-[#d4ded2]/40 flex items-center justify-between text-[11px] text-[#6d7c70] ">
        <span>Channel: Encrypted Forest Edge Stream</span>
        <span className="text-[#526c60] tabular-nums">{logs.length} events logged</span>
      </div>
    </div>
  );
};



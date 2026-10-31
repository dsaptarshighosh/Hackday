import React, { useState } from 'react';
import { Citizen, ActiveAlert, AlertDeliveryRecord } from '../types/livingLens';
import { calculateDistance } from '../utils/geoUtils';
import {
  Mail,
  Send,
  ShieldCheck,
  Ban,
  CheckCircle2,
  Users,
  Compass,
  FileText,
  ExternalLink,
  ChevronRight,
} from 'lucide-react';

interface TargetedAlertDeliveryProps {
  citizens: Citizen[];
  activeAlert: ActiveAlert | null;
  onOpenCitizenPortal?: (citizenId: string) => void;
}

export const TargetedAlertDelivery: React.FC<TargetedAlertDeliveryProps> = ({
  citizens,
  activeAlert,
  onOpenCitizenPortal,
}) => {
  const [selectedPreviewCitizen, setSelectedPreviewCitizen] = useState<Citizen | null>(null);

  const alertLat = activeAlert?.latitude ?? 22.42;
  const alertLon = activeAlert?.longitude ?? 87.32;
  const alertRadius = activeAlert?.alertRadiusKm ?? 90;
  const isAlertActive = activeAlert?.status === 'ACTIVE';

  // Calculate dynamic delivery status for all registered citizens
  const deliveryRecords: (AlertDeliveryRecord & { citizen: Citizen })[] = citizens.map((c) => {
    const distanceKm = calculateDistance(c.latitude, c.longitude, alertLat, alertLon);
    const isInside = isAlertActive && distanceKm <= alertRadius;

    return {
      citizenId: c.id,
      citizenName: c.name,
      email: c.email,
      distanceKm,
      alertRadiusKm: alertRadius,
      isInside,
      status: isInside ? 'EMAIL TARGETED' : 'OUTSIDE ZONE',
      timestamp: activeAlert?.timestamp ?? new Date().toISOString(),
      citizen: c,
    };
  });

  // Dynamic counter metrics required per section 22
  const totalMonitored = citizens.length;
  const insideZone = deliveryRecords.filter((r) => r.isInside).length;
  const targetedEmails = isAlertActive ? insideZone : 0;
  const outsideZone = totalMonitored - insideZone;
  const excludedEmails = isAlertActive ? outsideZone : totalMonitored;

  return (
    <div className="bg-[#eef2e9]/95 border border-[#d4ded2] rounded-xl p-5 ">
      {/* Section Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-4 border-b border-[#d4ded2]/60 gap-2">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-[#203a30] flex items-center gap-2">
            <Mail className="w-4 h-4 text-[#5c753b]" />
            TARGETED ALERT DELIVERY
          </h2>
          <p className="text-xs text-[#6d7c70] mt-0.5">
            Geographic targeting dispatch: Emails are sent strictly to citizens within the active alert radius
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs ">
          <span className="text-[#6d7c70]">Active Alert:</span>
          <span className="text-[#5c753b] font-bold">
            {activeAlert?.zone_id ?? 'MEDINIPUR_ZONE_02'}
          </span>
          <span className="text-[#6d7c70]">·</span>
          <span className="text-[#6d7c70]">Radius:</span>
          <span className="text-[#5c753b] font-bold">{alertRadius} km</span>
        </div>
      </div>

      {/* Dynamic Summary Cards (Section 22 exact format) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
        <div className="bg-[#f8faf5] border border-[#d4ded2] rounded-lg p-3">
          <span className="text-[10px] uppercase  text-[#6d7c70] block">
            Citizens Monitored
          </span>
          <span className="text-2xl  font-extrabold text-[#203a30] tabular-nums">
            {totalMonitored}
          </span>
          <span className="text-[10px] text-[#6d7c70] block mt-0.5">Registered in radius index</span>
        </div>

        <div className="bg-[#f8faf5] border border-[#d4ded2] rounded-lg p-3">
          <span className="text-[10px] uppercase  text-[#6d7c70] block">
            Citizens Inside Zone
          </span>
          <span className="text-2xl  font-extrabold text-[#5c753b] tabular-nums">
            {insideZone}
          </span>
          <span className="text-[10px] text-[#6d7c70] block mt-0.5">≤ {alertRadius} km distance</span>
        </div>

        <div className="bg-emerald-100/40 border border-emerald-600/50 rounded-lg p-3">
          <span className="text-[10px] uppercase  text-emerald-800 block">
            Emails Targeted
          </span>
          <span className="text-2xl  font-extrabold text-emerald-800 tabular-nums">
            {targetedEmails}
          </span>
          <span className="text-[10px] text-emerald-800/80 block mt-0.5">Dispatched to queue</span>
        </div>

        <div className="bg-[#f8faf5] border border-[#d4ded2] rounded-lg p-3">
          <span className="text-[10px] uppercase  text-[#6d7c70] block">
            Citizens Outside Zone
          </span>
          <span className="text-2xl  font-extrabold text-[#526c60] tabular-nums">
            {outsideZone}
          </span>
          <span className="text-[10px] text-[#6d7c70] block mt-0.5">&gt; {alertRadius} km away</span>
        </div>

        <div className="bg-[#dde5db]/40 border border-[#cbd6ca]/60 rounded-lg p-3">
          <span className="text-[10px] uppercase  text-[#6d7c70] block">
            Emails Excluded
          </span>
          <span className="text-2xl  font-extrabold text-[#6d7c70] tabular-nums">
            {excludedEmails}
          </span>
          <span className="text-[10px] text-[#6d7c70] block mt-0.5">Never broadcast globally</span>
        </div>
      </div>

      {/* Recipient Table (Section 23 exact table format) */}
      <div className="border border-[#d4ded2] rounded-lg overflow-hidden bg-[#e6ece4]">
        <div className="p-3 bg-[#f8faf5]/80 border-b border-[#d4ded2] flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#3e5b4f]">
            DISPATCH VERIFICATION TABLE
          </h3>
          <span className="text-[11px]  text-[#6d7c70]">
            Individual citizen privacy preserved
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs ">
            <thead>
              <tr className="border-b border-[#d4ded2] bg-[#eef2e9]/60 text-[#6d7c70]">
                <th className="py-2.5 px-4 font-semibold">Citizen</th>
                <th className="py-2.5 px-4 font-semibold text-right">Distance</th>
                <th className="py-2.5 px-4 font-semibold text-right">Alert Radius</th>
                <th className="py-2.5 px-4 font-semibold text-center">Status</th>
                <th className="py-2.5 px-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#d4ded2]/40 text-[#3e5b4f]">
              {deliveryRecords.map((record) => {
                const isTargeted = record.status === 'EMAIL TARGETED';
                return (
                  <tr
                    key={record.citizenId}
                    className="hover:bg-[#f8faf5]/40 transition-colors"
                  >
                    <td className="py-3 px-4 font-sans font-medium text-[#203a30]">
                      <div className="flex items-center gap-2">
                        <span>{record.citizenName}</span>
                        {record.citizen.isDemo && (
                          <span className="text-[9px]  uppercase bg-[#f8faf5] text-[#526c60] px-1.5 py-0.2 rounded border border-[#d4ded2]">
                            DEMO
                          </span>
                        )}
                        <span className="text-[11px] text-[#6d7c70] font-sans">
                          ({record.citizen.location})
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right tabular-nums font-bold">
                      <span className={isTargeted ? 'text-[#5c753b]' : 'text-[#6d7c70]'}>
                        {record.distanceKm} km
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right tabular-nums text-[#526c60]">
                      {record.alertRadiusKm} km
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-[11px] font-bold border ${
                          isTargeted
                            ? 'bg-emerald-100/80 border-emerald-300 text-emerald-800'
                            : 'bg-[#dde5db] border-[#cbd6ca] text-[#6d7c70]'
                        }`}
                      >
                        {isTargeted ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 text-emerald-800" />
                            EMAIL TARGETED
                          </>
                        ) : (
                          <>
                            <Ban className="w-3 h-3 text-[#839084]" />
                            OUTSIDE ZONE
                          </>
                        )}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedPreviewCitizen(record.citizen)}
                          className="px-2 py-1 rounded bg-[#f8faf5] hover:bg-[#d4ded2] text-[11px] font-sans text-[#526c60] hover:text-[#203a30] transition-colors cursor-pointer border border-[#d4ded2]"
                        >
                          View Simulated Email
                        </button>
                        {onOpenCitizenPortal && (
                          <button
                            onClick={() => onOpenCitizenPortal(record.citizenId)}
                            className="text-[#5c753b] hover:underline text-[11px] font-sans flex items-center gap-0.5 cursor-pointer"
                          >
                            Portal <ChevronRight className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Simulated Email Modal / Drawer (Section 19 exact format) */}
      {selectedPreviewCitizen && (
        <EmailModalContent
          citizen={selectedPreviewCitizen}
          alertLat={alertLat}
          alertLon={alertLon}
          alertRadius={alertRadius}
          isAlertActive={isAlertActive}
          activeAlert={activeAlert}
          onClose={() => setSelectedPreviewCitizen(null)}
        />
      )}
    </div>
  );
};

interface EmailModalProps {
  citizen: Citizen;
  alertLat: number;
  alertLon: number;
  alertRadius: number;
  isAlertActive: boolean;
  activeAlert: ActiveAlert | null;
  onClose: () => void;
}

function EmailModalContent({
  citizen,
  alertLat,
  alertLon,
  alertRadius,
  isAlertActive,
  activeAlert,
  onClose,
}: EmailModalProps) {
  const dist = calculateDistance(citizen.latitude, citizen.longitude, alertLat, alertLon);
  const isEligible = isAlertActive && dist <= alertRadius;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-[#eef2e9] border-2 border-[#d4ded2] rounded-xl max-w-lg w-full p-6  relative text-left">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#d4ded2]">
          <div className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-[#5c753b]" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#203a30]">
              SIMULATED EMAIL DISPATCH INSPECTOR
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-[#6d7c70] hover:text-[#203a30] text-xs  px-2 py-1 rounded bg-[#f8faf5] cursor-pointer"
          >
            Close ✕
          </button>
        </div>

        {isEligible ? (
          <div className="space-y-4">
            <div className="p-3 bg-emerald-100/40 border border-emerald-300/50 rounded-lg">
              <div className="flex items-center justify-between text-xs  mb-2">
                <span className="text-emerald-800 font-bold">
                  ### TARGETED EMAIL ALERT
                </span>
                <span className="px-2 py-0.5 rounded bg-emerald-100/80 text-emerald-200 text-[10px] font-bold">
                  EMAIL ALERT QUEUED
                </span>
              </div>
              <div className="space-y-1 text-xs  text-[#526c60]">
                <div>
                  <span className="text-[#6d7c70]">Recipient:</span>{' '}
                  <span className="text-[#203a30] font-semibold">{citizen.email}</span>
                </div>
                <div>
                  <span className="text-[#6d7c70]">Citizen:</span>{' '}
                  <span>{citizen.name} ({citizen.location})</span>
                </div>
                <div>
                  <span className="text-[#6d7c70]">Distance:</span>{' '}
                  <span className="text-[#5c753b] font-bold">{dist} km</span>
                </div>
                <div>
                  <span className="text-[#6d7c70]">Alert radius:</span>{' '}
                  <span>{alertRadius} km</span>
                </div>
                <div>
                  <span className="text-[#6d7c70]">Status:</span>{' '}
                  <span className="text-emerald-800 font-bold">EMAIL ALERT QUEUED</span>
                </div>
              </div>
            </div>

            {/* Email preview body */}
            <div className="bg-[#e6ece4] border border-[#d4ded2] rounded-lg p-4 font-sans text-xs text-[#3e5b4f] space-y-2.5">
              <div className="font-bold text-sm text-rose-800 flex items-center gap-1.5 border-b border-[#d4ded2] pb-2">
                ⚠️ LIVING LENS ALERT — Environmental Anomaly
              </div>
              <p>Dear {citizen.name},</p>
              <p>
                A high-correlation biological anomaly has been detected in{' '}
                <strong>{activeAlert?.zone_id || 'MEDINIPUR_ZONE_02'}</strong> (
                {dist} km from your registered location in {citizen.location}).
              </p>
              <div className="p-2 bg-[#f8faf5] rounded text-[11px]  text-[#5c753b]">
                AI Disaster Probability: {(activeAlert?.disasterProbability ?? activeAlert?.riskScore ?? 87.4).toFixed(1)}% · Status: ALERT TRIGGERED
              </div>
              <p className="text-[11px] text-[#6d7c70] italic">
                Disclaimer: Living Lens is an experimental/research-inspired biological early-warning system and is NOT an official disaster warning system.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-3 bg-[#dde5db]/80 border border-[#cbd6ca] rounded-lg">
              <div className="flex items-center justify-between text-xs  mb-2">
                <span className="text-[#526c60] font-bold">### ALERT NOT SENT</span>
                <span className="px-2 py-0.5 rounded bg-slate-800 text-[#6d7c70] text-[10px] font-bold">
                  EXCLUDED
                </span>
              </div>
              <div className="space-y-1 text-xs  text-[#526c60]">
                <div>
                  <span className="text-[#6d7c70]">Recipient:</span>{' '}
                  <span>{citizen.email}</span>
                </div>
                <div>
                  <span className="text-[#6d7c70]">Distance:</span>{' '}
                  <span className="text-[#3e5b4f]">{dist} km</span>
                </div>
                <div>
                  <span className="text-[#6d7c70]">Alert radius:</span>{' '}
                  <span>{alertRadius} km</span>
                </div>
                <div>
                  <span className="text-[#6d7c70]">Reason:</span>{' '}
                  <span className="text-amber-800 font-bold">OUTSIDE ACTIVE ALERT ZONE</span>
                </div>
              </div>
            </div>

            <div className="bg-[#e6ece4] border border-[#d4ded2] rounded-lg p-4 text-xs text-[#526c60]">
              <p>
                Citizen <strong>{citizen.name}</strong> is situated {dist} km from the event, which exceeds the active {alertRadius} km perimeter.
              </p>
              <p className="mt-2 text-[#6d7c70]">
                Targeted filtering ensures citizens outside the risk zone are not disturbed with irrelevant emergency notifications.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}



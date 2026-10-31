import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ActiveAlert, Citizen, Forest } from '../types/livingLens';
import { calculateDistance } from '../utils/geoUtils';
import { MapPin, Minus, Plus, RotateCcw } from 'lucide-react';

interface MapVisualizationProps {
  forests: Forest[];
  citizens?: Citizen[];
  activeAlert: ActiveAlert | null;
  activeAlerts?: ActiveAlert[];
  selectedForestId?: string;
  onSelectForest?: (forest: Forest) => void;
  onSelectCitizen?: (citizen: Citizen) => void;
  className?: string;
}

type MapPoint = { lat: number; lng: number };
type SelectedMarker = { kind: 'forest'; id: string } | { kind: 'citizen'; id: string };

const TILE_SIZE = 256;
const MIN_ZOOM = 3;
const MAX_ZOOM = 13;

function project({ lat, lng }: MapPoint, zoom: number) {
  const boundedLat = Math.max(-85.05112878, Math.min(85.05112878, lat));
  const scale = TILE_SIZE * 2 ** zoom;
  const sin = Math.sin((boundedLat * Math.PI) / 180);
  return {
    x: ((lng + 180) / 360) * scale,
    y: (0.5 - Math.log((1 + sin) / (1 - sin)) / (4 * Math.PI)) * scale,
  };
}

function unproject(x: number, y: number, zoom: number): MapPoint {
  const scale = TILE_SIZE * 2 ** zoom;
  const lng = (x / scale) * 360 - 180;
  const n = Math.PI - (2 * Math.PI * y) / scale;
  const lat = (180 / Math.PI) * Math.atan(Math.sinh(n));
  return { lat, lng };
}

export const MapVisualization: React.FC<MapVisualizationProps> = ({
  forests,
  citizens = [],
  activeAlert,
  activeAlerts = [],
  selectedForestId,
  onSelectForest,
  onSelectCitizen,
  className = '',
}) => {
  const mapElementRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ pointerX: number; pointerY: number; center: MapPoint } | null>(null);
  const [center, setCenter] = useState<MapPoint>({ lat: 22.5, lng: 82 });
  const [zoom, setZoom] = useState(4);
  const [dimensions, setDimensions] = useState({ width: 900, height: 420 });
  const [selectedMarker, setSelectedMarker] = useState<SelectedMarker | null>(null);
  const [tileFailures, setTileFailures] = useState(0);

  const forestById = useMemo(() => new Map(forests.map((forest) => [forest.id, forest])), [forests]);
  const citizenById = useMemo(() => new Map(citizens.map((citizen) => [citizen.id, citizen])), [citizens]);
  const centerWorld = useMemo(() => project(center, zoom), [center, zoom]);
  const leftWorld = centerWorld.x - dimensions.width / 2;
  const topWorld = centerWorld.y - dimensions.height / 2;

  const tiles = useMemo(() => {
    const worldSize = TILE_SIZE * 2 ** zoom;
    const firstX = Math.floor(leftWorld / TILE_SIZE) - 1;
    const lastX = Math.ceil((leftWorld + dimensions.width) / TILE_SIZE) + 1;
    const firstY = Math.max(0, Math.floor(topWorld / TILE_SIZE) - 1);
    const lastY = Math.min(2 ** zoom - 1, Math.ceil((topWorld + dimensions.height) / TILE_SIZE) + 1);
    const result: Array<{ key: string; urlX: number; y: number; left: number; top: number }> = [];
    for (let x = firstX; x <= lastX; x++) {
      for (let y = firstY; y <= lastY; y++) {
        const urlX = ((x % 2 ** zoom) + 2 ** zoom) % 2 ** zoom;
        result.push({ key: `${zoom}/${x}/${y}`, urlX, y, left: x * TILE_SIZE - leftWorld, top: y * TILE_SIZE - topWorld });
      }
    }
    if (worldSize <= 0) return [];
    return result;
  }, [zoom, leftWorld, topWorld, dimensions.width, dimensions.height]);

  useEffect(() => {
    if (!mapElementRef.current) return;
    const element = mapElementRef.current;
    const resize = () => setDimensions({ width: element.clientWidth, height: element.clientHeight });
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const selected = selectedForestId ? forestById.get(selectedForestId) : undefined;
    if (selected) setCenter({ lat: selected.latitude, lng: selected.longitude });
  }, [selectedForestId, forestById]);

  useEffect(() => {
    const latestAlert = activeAlerts[activeAlerts.length - 1];
    if (latestAlert) setCenter({ lat: latestAlert.latitude, lng: latestAlert.longitude });
  }, [activeAlerts]);

  useEffect(() => setTileFailures(0), [center, zoom]);

  const toScreen = (point: MapPoint) => {
    const world = project(point, zoom);
    return { x: dimensions.width / 2 + world.x - centerWorld.x, y: dimensions.height / 2 + world.y - centerWorld.y };
  };

  const locationContext = activeAlerts[activeAlerts.length - 1] || activeAlert ||
    (selectedForestId ? forestById.get(selectedForestId) : undefined);
  const isAlertContext = Boolean(activeAlerts.length || activeAlert?.status === 'ACTIVE');

  const setZoomWithinRange = (nextZoom: number) => setZoom(Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, nextZoom)));

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if ((event.target as HTMLElement).closest('button, a')) return;
    dragRef.current = { pointerX: event.clientX, pointerY: event.clientY, center };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current) return;
    const origin = project(dragRef.current.center, zoom);
    const dx = event.clientX - dragRef.current.pointerX;
    const dy = event.clientY - dragRef.current.pointerY;
    setCenter(unproject(origin.x - dx, origin.y - dy, zoom));
  };

  const onPointerUp = () => { dragRef.current = null; };

  const selectedForest = selectedMarker?.kind === 'forest' ? forestById.get(selectedMarker.id) : undefined;
  const selectedCitizen = selectedMarker?.kind === 'citizen' ? citizenById.get(selectedMarker.id) : undefined;
  const selectedAlert = selectedForest ? activeAlerts.find((alert) => alert.zone_id === selectedForest.id) : undefined;

  return (
    <section className={`overflow-hidden border border-[#d4ded2] bg-[#f8faf5] ${className}`} aria-label="Geographic forest map">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#d4ded2] px-4 py-3">
        <div>
          <h2 className="flex items-center gap-2 text-sm font-semibold text-[#203a30]"><MapPin className="h-4 w-4 text-[#5c753b]" />Forest locations</h2>
          <p className="mt-1 text-xs text-[#6d7c70]">OpenStreetMap · saved coordinates · no live field sensors connected</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-[#6d7c70]">
          <button type="button" onClick={() => setCenter({ lat: 22.5, lng: 82 })} className="inline-flex items-center gap-1 rounded border border-[#d4ded2] px-2 py-1 hover:bg-[#eef2e9]" title="Show India" aria-label="Reset map to India"><RotateCcw className="h-3.5 w-3.5" />India</button>
          <button type="button" onClick={() => setZoomWithinRange(zoom - 1)} disabled={zoom <= MIN_ZOOM} className="rounded border border-[#d4ded2] p-1.5 hover:bg-[#eef2e9] disabled:opacity-40" aria-label="Zoom out"><Minus className="h-4 w-4" /></button>
          <span className="min-w-8 text-center tabular-nums">{zoom}×</span>
          <button type="button" onClick={() => setZoomWithinRange(zoom + 1)} disabled={zoom >= MAX_ZOOM} className="rounded border border-[#d4ded2] p-1.5 hover:bg-[#eef2e9] disabled:opacity-40" aria-label="Zoom in"><Plus className="h-4 w-4" /></button>
        </div>
      </div>
      <div
        ref={mapElementRef}
        className="relative min-h-[420px] w-full touch-none select-none overflow-hidden bg-[#e5e9e1] cursor-grab active:cursor-grabbing"
        role="application"
        aria-label="Interactive OpenStreetMap. Drag to pan; use plus and minus buttons to zoom."
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onWheel={(event) => { event.preventDefault(); setZoomWithinRange(zoom + (event.deltaY < 0 ? 1 : -1)); }}
      >
        {tiles.map((tile) => (
          <img
            key={tile.key}
            src={`https://tile.openstreetmap.org/${zoom}/${tile.urlX}/${tile.y}.png`}
            alt=""
            draggable={false}
            loading="lazy"
            onError={() => setTileFailures((count) => count + 1)}
            className="pointer-events-none absolute h-64 w-64 max-w-none"
            style={{ left: tile.left, top: tile.top }}
          />
        ))}

        {forests.map((forest) => {
          const point = toScreen({ lat: forest.latitude, lng: forest.longitude });
          if (point.x < -30 || point.x > dimensions.width + 30 || point.y < -30 || point.y > dimensions.height + 30) return null;
          const alert = activeAlerts.find((entry) => entry.zone_id === forest.id);
          const elevated = !alert && activeAlert?.zone_id === forest.id && activeAlert.status === 'STANDBY' && (activeAlert.disasterProbability ?? 0) >= 30;
          const normalEstimate = !alert && activeAlert?.zone_id === forest.id && activeAlert.status === 'STANDBY' && (activeAlert.disasterProbability ?? 0) < 30 && (activeAlert.disasterProbability ?? 0) > 0;
          const color = alert ? '#b94136' : elevated ? '#ad792c' : normalEstimate ? '#567747' : '#7b8980';
          const radiusPx = alert ? (alert.alertRadiusKm * 1000) / (156543.03392 * Math.cos((forest.latitude * Math.PI) / 180) / 2 ** zoom) : 0;
          return <React.Fragment key={forest.id}>
            {alert && <div className="pointer-events-none absolute rounded-full border-2 border-[#b94136]/85 bg-[#c45045]/10" style={{ left: point.x - radiusPx, top: point.y - radiusPx, width: radiusPx * 2, height: radiusPx * 2 }} aria-label={`${alert.alertRadiusKm} km alert radius`} />}
            <button
              type="button"
              title={`${forest.name} · ${forest.district}, ${forest.state}`}
              aria-label={`${alert ? 'Active alert' : elevated ? 'Elevated observation' : 'Forest location'}: ${forest.name}`}
              onClick={(event) => { event.stopPropagation(); setSelectedMarker({ kind: 'forest', id: forest.id }); onSelectForest?.(forest); }}
              className="absolute z-10 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#203a30]"
              style={{ left: point.x, top: point.y, backgroundColor: color, boxShadow: alert ? `0 0 0 5px ${color}30` : undefined }}
            />
          </React.Fragment>;
        })}

        {citizens.map((citizen) => {
          const point = toScreen({ lat: citizen.latitude, lng: citizen.longitude });
          if (point.x < -20 || point.x > dimensions.width + 20 || point.y < -20 || point.y > dimensions.height + 20) return null;
          const distance = locationContext ? calculateDistance(locationContext.latitude, locationContext.longitude, citizen.latitude, citizen.longitude) : null;
          const inside = isAlertContext && distance !== null && distance <= (locationContext as ActiveAlert).alertRadiusKm;
          return <button
            key={citizen.id}
            type="button"
            title={`Recipient location · ${citizen.location}`}
            aria-label={`Recipient ${citizen.name}, ${citizen.location}`}
            onClick={(event) => { event.stopPropagation(); setSelectedMarker({ kind: 'citizen', id: citizen.id }); onSelectCitizen?.(citizen); }}
            className="absolute z-[8] h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#203a30]"
            style={{ left: point.x, top: point.y, backgroundColor: inside ? '#567747' : '#456e83' }}
          />;
        })}

        {tileFailures > 0 && <div role="status" className="absolute left-3 top-3 z-20 max-w-xs border border-[#d4ded2] bg-[#f8faf5]/95 px-3 py-2 text-xs text-[#805d27]">Some map tiles could not load. Check your internet connection.</div>}

        {(selectedForest || selectedCitizen) && <div className="absolute left-3 top-3 z-20 max-w-[min(340px,calc(100%-24px))] border border-[#d4ded2] bg-[#f8faf5] p-3 text-xs leading-5 text-[#526c60] shadow-sm" onPointerDown={(event) => event.stopPropagation()}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <strong className="text-sm text-[#203a30]">{selectedForest?.name || selectedCitizen?.name}</strong><br />
              {selectedForest ? <>{selectedForest.district}, {selectedForest.state}<br />{selectedForest.latitude.toFixed(4)}° N, {selectedForest.longitude.toFixed(4)}° E</> : <>{selectedCitizen?.location}<br />{locationContext ? `${calculateDistance(locationContext.latitude, locationContext.longitude, selectedCitizen!.latitude, selectedCitizen!.longitude).toFixed(1)} km from alert area` : 'Distance unavailable'}</>}
            </div>
            <button type="button" onClick={() => setSelectedMarker(null)} className="px-1 text-[#6d7c70] hover:text-[#203a30]" aria-label="Close map details">×</button>
          </div>
          {selectedAlert && <div className="mt-2 border-t border-[#d4ded2] pt-2">
            <strong className="text-[#9c493b]">Model estimate · unverified</strong><br />
            Severity: {(selectedAlert.disasterProbability ?? 0) >= 80 ? 'High' : (selectedAlert.disasterProbability ?? 0) >= 60 ? 'Moderate' : 'Elevated'}<br />
            Animal: {selectedAlert.animalSpecies || 'Not provided'}<br />
            Behaviour: {selectedAlert.observedBehavior || 'Not provided'}<br />
            Likelihood: {(selectedAlert.disasterProbability ?? 0).toFixed(1)}%<br />
            Observed: {selectedAlert.observationTime ? new Date(selectedAlert.observationTime).toLocaleString() : 'Time unavailable'}<br />
            Alert radius: {selectedAlert.alertRadiusKm} km · Active estimate
          </div>}
        </div>}

        <div className="pointer-events-auto absolute bottom-2 right-2 z-10 bg-white/90 px-1.5 py-0.5 text-[10px] text-[#526c60]">
          <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer" onPointerDown={(event) => event.stopPropagation()} className="underline">© OpenStreetMap contributors</a>
        </div>
      </div>
      <div className="flex flex-wrap gap-x-5 gap-y-2 border-t border-[#d4ded2] px-4 py-3 text-xs text-[#526c60]">
        <span className="inline-flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-full bg-[#567747]" />Normal monitoring location · low model estimate</span>
        <span className="inline-flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-full bg-[#ad792c]" />Elevated observation</span>
        <span className="inline-flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-full bg-[#b94136]" />Active alert zone</span>
        <span className="inline-flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-full bg-[#7b8980]" />Inactive / unavailable location</span>
        {citizens.length > 0 && <span className="inline-flex items-center gap-1.5"><i className="h-2.5 w-2.5 rounded-full bg-[#456e83]" />Recipient location</span>}
      </div>
      <p className="border-t border-[#d4ded2] px-4 py-2 text-[11px] text-[#77857a]">Alert zones update from analyses in this browser session. Saved locations and alert estimates are not connected to live field sensors or a real-time backend.</p>
    </section>
  );
};

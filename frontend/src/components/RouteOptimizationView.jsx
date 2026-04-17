import { useEffect, useState, useRef, useCallback } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
    Ship, Zap, Fuel, Wind, RefreshCw, Navigation,
    AlertTriangle, Clock, Package, DollarSign, TrendingDown, Activity
} from 'lucide-react';

import { CONFIG } from '../config';

const AI_SERVICE = CONFIG.AI_ORCHESTRATOR;
const UNIFIED_API_URL = `${CONFIG.CORE_API}/unified`;

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

function createShipIcon(color, heading, isHovered) {
    const size = isHovered ? 44 : 34;
    const pulse = isHovered ? `<circle cx="20" cy="20" r="17" fill="none" stroke="${color}" stroke-width="1.5" stroke-dasharray="5,3" opacity="0.7"/>` : '';
    const glow = isHovered ? `filter="url(#glow)"` : '';
    const svg = `<svg width="${size}" height="${size}" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"
        style="transform:rotate(${heading}deg);transform-origin:center;transition:transform 0.5s">
      <defs>
        <filter id="glow"><feGaussianBlur stdDeviation="2.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      </defs>
      ${pulse}
      <polygon points="20,4 29,36 20,29 11,36" fill="${color}" stroke="rgba(255,255,255,0.9)"
        stroke-width="${isHovered ? 2 : 1.5}" ${glow} opacity="1"/>
    </svg>`;
    return L.divIcon({ html: svg, className: '', iconSize: [size, size], iconAnchor: [size / 2, size / 2] });
}

// ─── Floating Tooltip (React Portal, mouse-tracked) ───────────────────────────
function FloatingTooltip({ vessel, mousePos }) {
    const v = vessel;
    if (!v || !mousePos) return null;
    const fuelPct = Math.round((v.fuelConsumed / v.fuelTotal) * 100);

    // Smart positioning — flip left/up near screen edges
    const W = window.innerWidth, H = window.innerHeight;
    const tipW = 330, tipH = 560;
    let left = mousePos.x + 18;
    let top = mousePos.y - 20;
    if (left + tipW > W - 20) left = mousePos.x - tipW - 18;
    if (top + tipH > H - 20) top = H - tipH - 20;
    if (top < 10) top = 10;

    return (
        <div
            style={{
                position: 'fixed', left, top, width: tipW, zIndex: 9999,
                pointerEvents: 'none',
                boxShadow: `0 8px 40px rgba(0,0,0,0.6), 0 0 30px ${v.color}33`,
                fontFamily: 'inherit',
            }}
            className="bg-[#0f1117] border border-white/15 rounded-xl overflow-hidden text-white"
        >
            {/* Header */}
            <div style={{ background: `linear-gradient(135deg, ${v.color}22, ${v.color}08)`, borderBottom: `2px solid ${v.color}` }}
                className="px-4 pt-3.5 pb-2.5">
                <div className="flex items-center gap-2.5">
                    <div style={{ backgroundColor: v.color }} className="w-3 h-3 rounded-full shadow-lg flex-shrink-0"></div>
                    <span className="text-[14px] font-black tracking-tight">{v.name}</span>
                    <span className="ml-auto px-2 py-0.5 rounded text-[8px] font-black uppercase bg-white/10 text-white/80 whitespace-nowrap">{v.flag} {v.type}</span>
                </div>
                <div className="mt-1 text-[10px] text-white/50 font-mono">{v.origin?.name} → {v.destination?.name}</div>
            </div>

            <div className="px-4 py-3 space-y-3">
                {/* Route Progress */}
                <div>
                    <div className="flex justify-between text-[9px] font-black text-gray-500 uppercase mb-1.5">
                        <span>Route Progress</span><span className="text-white">{v.progress || 0}%</span>
                    </div>
                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div style={{ width: `${v.progress || 0}%`, backgroundColor: v.color }}
                            className="h-full rounded-full transition-all duration-500"></div>
                    </div>
                </div>

                {/* Vitals Grid */}
                <div className="grid grid-cols-2 gap-2">
                    <div className="bg-white/5 rounded-lg p-2.5">
                        <div className="flex items-center gap-1.5 mb-1">
                            <Navigation className="w-3 h-3 text-cyan-400" />
                            <span className="text-[8px] text-gray-500 uppercase">Speed</span>
                        </div>
                        <div className="text-[14px] font-black">{v.speed} <span className="text-[10px] text-gray-400">kn</span></div>
                    </div>
                    <div className="bg-white/5 rounded-lg p-2.5">
                        <div className="flex items-center gap-1.5 mb-1">
                            <Clock className="w-3 h-3 text-yellow-400" />
                            <span className="text-[8px] text-gray-500 uppercase">ETA</span>
                        </div>
                        <div className="text-[11px] font-black leading-tight">{v.etaFormatted}</div>
                        <div className="text-[9px] text-gray-500">{v.etaTime}</div>
                    </div>
                    <div className="bg-white/5 rounded-lg p-2.5 col-span-2">
                        <div className="flex items-center gap-1.5 mb-1">
                            <Package className="w-3 h-3 text-purple-400" />
                            <span className="text-[8px] text-gray-500 uppercase">Cargo</span>
                        </div>
                        <div className="text-[11px] font-black">{v.cargo}</div>
                        <div className="text-[9px] text-gray-500">{v.cargoTonnage?.toLocaleString()} MT capacity</div>
                    </div>
                </div>

                {/* Fuel */}
                <div className="bg-white/5 rounded-lg p-2.5">
                    <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                            <Fuel className="w-3 h-3 text-orange-400" />
                            <span className="text-[8px] text-gray-500 uppercase">Fuel Consumption</span>
                        </div>
                        <span className="text-[9px] text-gray-400">{v.fuelConsumed?.toLocaleString()} / {v.fuelTotal?.toLocaleString()} MT</span>
                    </div>
                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden mb-1">
                        <div style={{ width: `${fuelPct}%` }}
                            className={`h-full rounded-full ${fuelPct > 70 ? 'bg-red-500' : fuelPct > 40 ? 'bg-yellow-400' : 'bg-green-500'}`}></div>
                    </div>
                    <div className="text-[9px] text-gray-500">{v.fuelRate} MT/day · {fuelPct}% consumed</div>
                </div>

                {/* AI Savings */}
                <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/5 border border-green-500/20 rounded-lg p-2.5">
                    <div className="flex items-center gap-1.5 mb-2">
                        <TrendingDown className="w-3 h-3 text-green-400" />
                        <span className="text-[9px] font-black text-green-400 uppercase">AI Route Savings</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                        <div className="text-center">
                            <div className="flex items-center justify-center gap-0.5">
                                <DollarSign className="w-3 h-3 text-green-400" />
                                <span className="text-[12px] font-black text-green-400">
                                    ${v.costSaved ? (v.costSaved / 1000).toFixed(0) + 'K' : '—'}
                                </span>
                            </div>
                            <div className="text-[8px] text-gray-500 mt-0.5">Cost Saved</div>
                        </div>
                        <div className="text-center border-x border-white/10">
                            <div className="text-[12px] font-black text-green-400">
                                {v.fuelSavedMT ? v.fuelSavedMT + ' MT' : '—'}
                            </div>
                            <div className="text-[8px] text-gray-500 mt-0.5">Fuel Saved</div>
                        </div>
                        <div className="text-center">
                            <div className="text-[12px] font-black text-cyan-400">
                                {v.timeSavedHours ? v.timeSavedHours + 'h' : '—'}
                            </div>
                            <div className="text-[8px] text-gray-500 mt-0.5">Time Saved</div>
                        </div>
                    </div>
                </div>

                {/* Traffic & Rerouting */}
                {v.trafficZone && (
                    <div className="bg-white/5 rounded-lg p-2.5">
                        <div className="flex items-center gap-1.5 mb-1">
                            <Activity className="w-3 h-3 text-blue-400" />
                            <span className="text-[8px] text-gray-500 uppercase">Traffic Zone</span>
                        </div>
                        <div className="text-[9px] text-blue-300">{v.trafficZone}</div>
                        {v.nearbyHotspots && v.nearbyHotspots !== 'Clear' && (
                            <div className="text-[8px] text-gray-500 mt-0.5">{v.nearbyHotspots}</div>
                        )}
                    </div>
                )}

                {v.reroutingStatus !== 'None' && (
                    <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-2.5">
                        <div className="flex items-start gap-2">
                            <AlertTriangle className="w-3 h-3 text-amber-400 shrink-0 mt-0.5" />
                            <div>
                                <div className="text-[9px] font-black text-amber-300 uppercase">AI Rerouting Active</div>
                                <div className="text-[9px] text-amber-400/80">{v.reroutingReason}</div>
                                {v.reroutingDetour && (
                                    <div className="text-[8px] text-amber-500/60 mt-0.5">{v.reroutingDetour}</div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                <div className="flex items-center justify-between text-[8px] text-gray-600 border-t border-white/5 pt-2 font-mono">
                    <span className="flex items-center gap-1">
                        <span className={`w-1.5 h-1.5 rounded-full ${v.dataSource === 'AIS_LIVE' ? 'bg-green-400' : 'bg-yellow-400'}`}></span>
                        {v.dataSource === 'AIS_LIVE' ? 'AISStream Live' : 'Simulation Mode'}
                    </span>
                    <span>{v.weatherAdvisory}</span>
                </div>
            </div>
        </div>
    );
}

// ─── Proximity-aware mouse tracker ───────────────────────────────────────────
function ProximityTracker({ onMove, vessels, onClearHover }) {
    const map = useMap();
    useMapEvents({
        mousemove(e) {
            const { clientX: mx, clientY: my } = e.originalEvent;
            onMove({ x: mx, y: my });

            // Project each vessel to screen coords; clear tooltip if none are nearby
            const THRESHOLD = 48;
            const rect = map.getContainer().getBoundingClientRect();
            const isNear = vessels.some(v => {
                try {
                    const pt = map.latLngToContainerPoint([v.lat, v.lng]);
                    return Math.hypot((pt.x + rect.left) - mx, (pt.y + rect.top) - my) < THRESHOLD;
                } catch { return false; }
            });
            if (!isNear) onClearHover();
        },
        mouseout() { onClearHover(); },
    });
    return null;
}


// ─── Map FlyTo ────────────────────────────────────────────────────────────────
function MapFlyTo({ vessel }) {
    const map = useMap();
    useEffect(() => {
        if (vessel) map.flyTo([vessel.lat, vessel.lng], 5, { duration: 1.2 });
    }, [vessel?.mmsi]);
    return null;
}

// ─── Full vertical sidebar (Standalone Mode) ──────────────────────────────────
function RouteOptimizationSidebar({ vessels }) {
    const avgSpeed = vessels.length ? (vessels.reduce((s, v) => s + parseFloat(v.speed || 0), 0) / vessels.length).toFixed(1) : '--';
    const totalCostSaved = vessels.reduce((s, v) => s + (v.costSaved || 0), 0);
    const totalFuelSaved = vessels.reduce((s, v) => s + (v.fuelSavedMT || 0), 0);
    const reroutingCount = vessels.filter(v => v.reroutingStatus !== 'None').length;

    return (
        <div className="w-64 bg-white border-l border-gray-100 flex flex-col h-full shrink-0 z-20 overflow-y-auto shadow-[-4px_0_24px_rgba(0,0,0,0.02)]">
            <div className="p-5 pt-6">
                <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 border-b border-gray-100 pb-2">Fleet Overview</h3>
                <div className="grid grid-cols-2 gap-3 mb-8">
                    <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
                        <div className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Active Fleet</div>
                        <div className="text-[24px] font-black text-shell-darkText leading-none flex items-end gap-1">
                            {vessels.length} <span className="text-[10px] text-green-500 font-mono mb-1 uppercase tracking-widest">Ships</span>
                        </div>
                    </div>
                    <div className="bg-gray-50 border border-gray-100 rounded-xl p-4">
                        <div className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Avg Speed</div>
                        <div className="text-[24px] font-black text-cyan-600 leading-none flex items-end gap-1">
                            {avgSpeed} <span className="text-[10px] text-gray-400 font-mono mb-1 uppercase tracking-widest">Kn</span>
                        </div>
                    </div>
                </div>
                
                <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 border-b border-gray-100 pb-2">AI Performance</h3>
                <div className="bg-green-50/30 border border-green-100/50 rounded-xl p-5 mb-4 shadow-sm">
                    <div className="flex items-center gap-2 mb-5">
                        <TrendingDown className="w-4 h-4 text-green-600" />
                        <span className="text-[12px] font-black text-green-700 uppercase tracking-tight">Global Savings</span>
                    </div>
                    
                    <div className="space-y-4">
                        <div className="flex justify-between items-end border-b border-green-100/30 pb-3">
                             <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Cost Diverted</div>
                             <div className="text-[20px] font-black text-green-600 leading-none">${(totalCostSaved / 1000).toFixed(0)}K</div>
                        </div>
                        <div className="flex justify-between items-end border-b border-green-100/30 pb-3">
                             <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Fuel Diverted</div>
                             <div className="text-[20px] font-black text-orange-500 leading-none">{totalFuelSaved} <span className="text-[12px]">MT</span></div>
                        </div>
                        <div className="flex justify-between items-end">
                             <div className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Active Diversions</div>
                             <div className="text-[20px] font-black text-amber-500 leading-none">{reroutingCount}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ─── Compact horizontal stats bar (Embedded Mode replace sidebar) ─────────────
function RouteStatsBar({ vessels }) {
    const avgSpeed = vessels.length
        ? (vessels.reduce((s, v) => s + parseFloat(v.speed || 0), 0) / vessels.length).toFixed(1)
        : '--';
    const totalCostSaved = vessels.reduce((s, v) => s + (v.costSaved || 0), 0);
    const totalFuelSaved = vessels.reduce((s, v) => s + (v.fuelSavedMT || 0), 0);
    const reroutingCount = vessels.filter(v => v.reroutingStatus !== 'None').length;

    return (
        <div className="flex items-center gap-3 px-3 py-2 bg-white border-b border-gray-100 shrink-0">
            <div className="flex items-center gap-1.5 border-r border-gray-200 pr-3">
                <Ship className="w-3 h-3 text-shell-blue" />
                <div>
                    <div className="text-[8px] font-mono text-gray-500 uppercase leading-none">Fleet</div>
                    <div className="text-[14px] font-black text-shell-darkText leading-none">{vessels.length}</div>
                </div>
            </div>
            <div className="flex items-center gap-1.5 border-r border-gray-200 pr-3">
                <Navigation className="w-3 h-3 text-cyan-500" />
                <div>
                    <div className="text-[8px] font-mono text-gray-500 uppercase leading-none">Avg Speed</div>
                    <div className="text-[14px] font-black text-shell-darkText leading-none">{avgSpeed}<span className="text-[9px] text-gray-400 ml-0.5">kn</span></div>
                </div>
            </div>
            <div className="flex items-center gap-1.5 border-r border-gray-200 pr-3">
                <DollarSign className="w-3 h-3 text-green-500" />
                <div>
                    <div className="text-[8px] font-mono text-gray-500 uppercase leading-none">Cost Saved</div>
                    <div className="text-[14px] font-black text-green-600 leading-none">${(totalCostSaved / 1000).toFixed(0)}K</div>
                </div>
            </div>
            <div className="flex items-center gap-1.5 border-r border-gray-200 pr-3">
                <Fuel className="w-3 h-3 text-orange-500" />
                <div>
                    <div className="text-[8px] font-mono text-gray-500 uppercase leading-none">Fuel Saved</div>
                    <div className="text-[14px] font-black text-orange-600 leading-none">{totalFuelSaved}<span className="text-[9px] text-gray-400 ml-0.5">MT</span></div>
                </div>
            </div>
            <div className="flex items-center gap-1.5">
                <Zap className="w-3 h-3 text-amber-500" />
                <div>
                    <div className="text-[8px] font-mono text-gray-500 uppercase leading-none">AI Diversions</div>
                    <div className="text-[14px] font-black text-amber-600 leading-none">{reroutingCount}</div>
                </div>
            </div>
        </div>
    );
}

// ─── Legend (compact) ────────────────────────────────────────────────────────
function MapLegend({ vessels, selectedVesselMmsi, setSelectedVesselMmsi }) {
    return (
        <div className="absolute bottom-3 left-3 z-[1000] bg-white/90 backdrop-blur-md border border-gray-200 rounded-lg p-2 shadow-md pointer-events-auto">
            <div className="flex justify-between items-center mb-1">
                 <div className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Vessels</div>
                 {selectedVesselMmsi && (
                     <button onClick={() => setSelectedVesselMmsi(null)} className="text-[8px] text-blue-600 hover:underline font-bold uppercase ml-2">All</button>
                 )}
            </div>
            <div className="max-h-[120px] overflow-y-auto space-y-1">
                {vessels.map(v => (
                    <div 
                        key={v.mmsi} 
                        onClick={() => setSelectedVesselMmsi(selectedVesselMmsi === v.mmsi ? null : v.mmsi)}
                        className={`flex items-center gap-1.5 p-1 rounded cursor-pointer transition-colors ${selectedVesselMmsi === v.mmsi ? 'bg-blue-50' : 'hover:bg-gray-100'}`}
                    >
                        <div style={{ backgroundColor: v.color }} className="w-2 h-2 rounded-full shrink-0"></div>
                        <span className="text-[9px] truncate font-bold text-gray-700 max-w-[90px]">{v.name}</span>
                        {v.reroutingStatus !== 'None' && <AlertTriangle className="w-2.5 h-2.5 text-amber-500 shrink-0 ml-auto" />}
                    </div>
                ))}
            </div>
            <div className="border-t border-gray-200 mt-1.5 pt-1.5 flex gap-3">
                <div className="flex items-center gap-1"><div className="w-4 h-px bg-gray-400"></div><span className="text-[7px] font-bold text-gray-500 uppercase">Route</span></div>
                <div className="flex items-center gap-1"><div className="w-4 border-t border-dotted border-shell-blue"></div><span className="text-[7px] font-bold text-gray-500 uppercase">AI</span></div>
            </div>
        </div>
    );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function RouteOptimizationView({ embedded = false }) {
    const [vessels, setVessels] = useState([]);
    const [hoveredVessel, setHoveredVessel] = useState(null);
    const [selectedVesselMmsi, setSelectedVesselMmsi] = useState(null);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const [loading, setLoading] = useState(true);
    const intervalRef = useRef(null);

    const fetchVessels = useCallback(async () => {
        try {
            const res = await fetch(`${CONFIG.AI_ORCHESTRATOR}/api/routes/vessels`);
            if (res.ok) {
                const data = await res.json();
                setVessels(data);
                setLoading(false);
            }
        } catch { /* ignore */ }
    }, []);

    useEffect(() => {
        fetchVessels();
        intervalRef.current = setInterval(fetchVessels, 5000);
        return () => clearInterval(intervalRef.current);
    }, [fetchVessels]);

    const handleMouseMove = useCallback((pos) => setMousePos(pos), []);
    const handleMarkerEnter = useCallback((v) => setHoveredVessel(v), []);
    const handleClearHover = useCallback(() => setHoveredVessel(null), []);

    if (loading) return (
        <div className="flex-1 flex items-center justify-center bg-[#0a0c10] text-white h-full">
            <div className="text-center">
                <Ship className="w-10 h-10 text-yellow-400 mx-auto mb-3 animate-bounce" />
                <div className="text-[11px] font-mono text-gray-500 uppercase tracking-widest">Initializing Route Intelligence...</div>
            </div>
        </div>
    );

    return (
        <div className={`flex ${embedded ? 'flex-col' : 'flex-row'} h-full bg-gray-50 w-full`}>
            {/* Horizontal stats bar (ONLY in embedded mode) */}
            {embedded && <RouteStatsBar vessels={vessels} />}

            {/* Map fills remaining space */}
            <div className="flex-1 relative z-10" style={{ minWidth: 0, height: '100%' }}>
                <MapContainer
                    center={[20, 20]}
                    zoom={3}
                    style={{ width: '100%', height: '100%' }}
                    zoomControl={false}
                    attributionControl={false}
                    preferCanvas={true}
                >
                    <TileLayer
                        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
                        attribution="© CartoDB"
                        maxZoom={18}
                    />

                    <ProximityTracker onMove={handleMouseMove} vessels={vessels} onClearHover={handleClearHover} />
                    <MapFlyTo vessel={selectedVesselMmsi ? vessels.find(v => v.mmsi === selectedVesselMmsi) : hoveredVessel} />

                    {vessels.map(v => {
                        const showRoutes = !selectedVesselMmsi || selectedVesselMmsi === v.mmsi;
                        const isHighlighted = hoveredVessel?.mmsi === v.mmsi || selectedVesselMmsi === v.mmsi;
                        return (
                        <div key={v.mmsi}>
                            {showRoutes && v.plannedWaypoints?.length > 1 && (
                                <Polyline positions={v.plannedWaypoints}
                                    pathOptions={{ color: v.color, weight: 2.5, opacity: 0.5 }} />
                            )}
                            {showRoutes && v.optimizedWaypoints?.length > 1 && (
                                <Polyline positions={v.optimizedWaypoints}
                                    pathOptions={{ color: v.color, weight: 3, opacity: 0.9, dashArray: '6, 8' }} />
                            )}
                            <Marker
                                position={[v.lat, v.lng]}
                                icon={createShipIcon(v.color, v.heading, isHighlighted)}
                                eventHandlers={{
                                    mouseover: () => handleMarkerEnter(v),
                                    click: () => setSelectedVesselMmsi(selectedVesselMmsi === v.mmsi ? null : v.mmsi),
                                }}
                            />
                        </div>
                    )})}
                </MapContainer>

                {/* MapLegend always visible when expected (bottom left of map) */}
                <MapLegend vessels={vessels} selectedVesselMmsi={selectedVesselMmsi} setSelectedVesselMmsi={setSelectedVesselMmsi} />
            </div>

            {/* Full vertical sidebar (Standalone Mode) goes on the RIGHT */}
            {!embedded && (
                <RouteOptimizationSidebar 
                    vessels={vessels} 
                    selectedVesselMmsi={selectedVesselMmsi} 
                    setSelectedVesselMmsi={setSelectedVesselMmsi} 
                />
            )}

            {/* Floating tooltip */}
            {hoveredVessel && (
                <FloatingTooltip vessel={hoveredVessel} mousePos={mousePos} />
            )}
        </div>
    );
}
